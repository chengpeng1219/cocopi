/*
 * AI 聽覺——Maix-Speech（`maix.nn.Speech`）的三個解碼器。
 *
 *   關鍵詞識別      kws     聽到指定的詞就觸發
 *   連續數字識別    digit   把念出來的中文數字轉成阿拉伯數字
 *   語音實時識別    lvcsr   連續中文語音轉文字
 *
 * 依據：examples/audio/asr/maix_speech/asr_{kws,digit,lvcsr}.py
 * **官方沒有文件頁**，真正的規格在 pybind11 的 docstring 裡。
 * 完整實測見 tools/e2e/probe-speech.py 的檔頭。
 *
 * ⚠ 跟 LLM 大模型那批的 SenseVoice **完全是兩套東西**：
 *   SenseVoice   244 MB 大模型、走 systemd 服務、錄一段辨識一段
 *   這一套       14 MB 小模型、常駐在行程裡、**逐幀串流**
 * 兩者可以並存但沒必要，用途也不同。
 *
 *
 * ## 一、`run(1)` 會阻塞 0.77 秒，這是形狀的來源
 *
 * `frame_time()` 回 768（毫秒），實測每幀 784～799 ms。所以積木做成
 * 「處理一幀語音」放進使用者的主迴圈——**主迴圈就變成 1.3 Hz**。
 *
 * 這是刻意的。另一種做法是初始化積木自己開背景執行緒、主迴圈只取結果，
 * 畫面會順很多，但那條執行緒藏在產碼裡，使用者把它跟相機積木混用出事時
 * 根本無從查起。照官方範例的形狀，慢是看得見的，而且解釋得通。
 *
 *
 * ## 二、callback 每幀都叫，所以邊緣偵測寫在我們這邊
 *
 * `kws` 的 docstring：「輸出最新一幀中**所有**已註冊關鍵詞的機率列表，
 * 使用者自己設喚醒門檻」。實測命中「你好」時 13 幀裡有 2 幀超過 0.5——
 * **如果直接把 callback 當觸發，使用者的「如果聽到…」每秒會跑一次多**。
 * 所以 `_maixSpeechRun()` 每幀算一次「低→高」，只有那一瞬間才回 True。
 *
 * 順帶一提 `kw_gate` **不是輸出濾網**：gate 設 0.1 的時候，0.037 照樣被
 * 報上來。所以門檻只能自己比，gate 固定用官方範例的 0.1。
 *
 *
 * ## 三、關鍵詞為什麼是下拉選單而不是文字框
 *
 * 跟 yolo-world 那組同一個理由（maixcam2_nn.js:2485）：
 * **打字輸入會讓人以為隨便打什麼都行，那是騙人的。**
 *
 * 2026-08-19 實測：同一個人、同一支麥克風、同一輪測試——
 *
 *     念「你好」      ni3 hao3               → 0.947   認得極好
 *     念「小愛同學」  xiao3 ai4 tong2 xue2   → 0.037   等於沒認出來
 *     講無關的話                             → 0.000   零誤觸發
 *
 * 認不認得出來**跟念法有關**，不是詞表寫對就會動。所以下拉選單給的是
 * 幾組常用的短指令，另外開一塊「相似度」值積木讓使用者看得到真實數值、
 * 自己調靈敏度——這比給一個會讓人受挫的文字框誠實。
 *
 *
 * ## 四、麥克風佔 79 MB CMM，一定要正常釋放
 *
 * 實測 CMM 508 → 429（開麥克風）→ 508（釋放）。但頁面按「停止」送的是
 * **SIGHUP**，Python 預設直接被砍，`atexit` 完全不會跑（見
 * maixcam2_llm.js 的同一段）。所以這裡也裝 signal handler 把它轉成
 * SystemExit，讓解構有機會跑完。
 */


/** 下拉選單裡的關鍵詞。值就是要餵給 `kws()` 的拼音（帶聲調數字）。
 *
 *  挑的原則：**兩個音節、常用、彼此不像**。實測四音節的「小愛同學」
 *  只有 0.037，兩音節的「你好」有 0.947——音節越少越穩。
 */
function maixKwsWords() {
    return [
        [Blockly.Msg.maixcam2_kws_w_nihao, "ni3 hao3"],
        [Blockly.Msg.maixcam2_kws_w_kaideng, "kai1 deng1"],
        [Blockly.Msg.maixcam2_kws_w_guandeng, "guan1 deng1"],
        [Blockly.Msg.maixcam2_kws_w_kaishi, "kai1 shi3"],
        [Blockly.Msg.maixcam2_kws_w_tingzhi, "ting2 zhi3"],
        [Blockly.Msg.maixcam2_kws_w_qianjin, "qian2 jin4"],
        [Blockly.Msg.maixcam2_kws_w_houtui, "hou4 tui4"],
        [Blockly.Msg.maixcam2_kws_w_zuozhuan, "zuo3 zhuan3"],
        [Blockly.Msg.maixcam2_kws_w_youzhuan, "you4 zhuan3"]
    ];
}


/** 三個解碼器共用的底座：載入聲學模型、開麥克風、收尾。
 *
 *  放同一個 definitions_ key，誰先用誰插入，只會出現一次。
 */
function maixSpeechBase() {
    Blockly.Python.definitions_['maixcam2_import_speech'] = `import os as _maixOs
import atexit as _maixAtexit
import signal as _maixSignal
from maix import nn as _maixSpeechNn`;

    Blockly.Python.definitions_['maixcam2_speech_base'] = `_MAIX_SPEECH_AM = "/root/models/am_3332_192_int8.mud"
_maixSpeech = None


def _maixSpeechOpen():
    """載入聲學模型並開麥克風。三個解碼器共用，只做一次。

    init(MIC) 要**兩秒**——它會先囤 1.9 秒的音訊才回來。這不是當掉。
    """
    global _maixSpeech
    if _maixSpeech is not None:
        return _maixSpeech
    if not _maixOs.path.exists(_MAIX_SPEECH_AM):
        raise FileNotFoundError(
            "找不到語音模型 " + _MAIX_SPEECH_AM + "。\\n"
            "AI 聽覺這一批需要 am_3332_192_int8.mud 和 lmS/，韌體裡沒有，"
            "要另外放到 /root/models/。")
    _maixSpeech = _maixSpeechNn.Speech(_MAIX_SPEECH_AM)
    _maixSpeech.init(_maixSpeechNn.SpeechDevice.DEVICE_MIC)
    return _maixSpeech
`;

    // 收尾。麥克風佔 79 MB CMM，不放掉下一支程式就開不起來。
    // 頁面按「停止」送的是 SIGHUP，預設動作直接砍行程、atexit 不會跑，
    // 所以要轉成 SystemExit 才有機會解構（跟 maixcam2_llm.js 同一招）。
    Blockly.Python.definitions_['maixcam2_speech_cleanup'] = `def _maixSpeechRelease():
    """放掉麥克風和 NPU。實測 CMM 508 → 429（開麥克風）→ 508（釋放）。"""
    global _maixSpeech
    _maixSpeech = None


def _maixSpeechOnSignal(_sig, _frame):
    raise SystemExit(0)


_maixAtexit.register(_maixSpeechRelease)
for _maixSpeechSig in ("SIGHUP", "SIGTERM"):
    try:
        _maixSignal.signal(getattr(_maixSignal, _maixSpeechSig), _maixSpeechOnSignal)
    except (AttributeError, ValueError, OSError):
        pass
`;
}


/** 「處理一幀語音」的實作。放在共用區，因為三個解碼器都靠它推進。 */
function maixSpeechRunner() {
    maixSpeechBase();
    Blockly.Python.definitions_['maixcam2_speech_run'] = `_maixKwsTbl = []
_maixKwsScore = []
_maixKwsPrev = []
_maixKwsEdge = []
_maixKwsGate = 0.5
_maixDigitRaw = ""
_maixLvcsrText = ""
_maixLvcsrPny = ""


def _maixSpeechRun():
    """推進一幀。**會停住約 0.77 秒**，這是 API 的節奏，不是寫慢了。

    順便把 kws 的「低→高」邊緣算出來：callback 每幀都叫，命中時會連續
    好幾幀都超過門檻，直接拿來當觸發的話「如果聽到…」每秒會跑一次多。
    """
    _sp = _maixSpeechOpen()
    _n = _sp.run(1)
    for _i in range(len(_maixKwsEdge)):
        _now = _i < len(_maixKwsScore) and _maixKwsScore[_i] >= _maixKwsGate
        _maixKwsEdge[_i] = _now and not _maixKwsPrev[_i]
        _maixKwsPrev[_i] = _now
    return _n
`;
}


/*
  _  ____        ______
 | |/ /\\ \\      / / ___|
 | ' /  \\ \\ /\\ / /\\___ \\
 | . \\   \\ V  V /  ___) |
 |_|\\_\\   \\_/\\_/  |____/

  關鍵詞識別。先用「加入關鍵詞」把詞排好，再「開始聽關鍵詞」。
*/

Blockly.Blocks['maixcam2_kws_add'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_kws_add)
            .appendField(new Blockly.FieldDropdown(maixKwsWords()), "KW");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_kws_add_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_kws_add'] = function (block) {
    maixKwsHelpers();
    var kw = block.getFieldValue('KW');
    // 只是往清單裡塞，真正註冊在「開始聽關鍵詞」——`kws()` 要的是整張表，
    // 不能一個一個加。所以這塊一定要放在「開始聽關鍵詞」上面。
    return `_maixKwsTbl.append(${JSON.stringify(kw)})\n`;
};


// 上一代的「設定拼音識別參數」讓學生自己填最多 7 組拼音（V831 板載 ASR）。
// 現有的「加入關鍵詞」是下拉選預設詞，填不進自己的字，所以補這一塊。
// 下拉那塊留著不動——想用現成詞的，下拉還是最好用。
Blockly.Blocks['maixcam2_kws_add_custom'] = {
    init: function () {
        this.appendValueInput("KW").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_kws_add_custom);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_kws_add_custom_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_kws_add_custom'] = function (block) {
    maixKwsHelpers();
    Blockly.Python.definitions_['maixcam2_kws_add_custom'] = `def _maixKwsAddCustom(kw):
    _s = str(kw).strip()
    if not _s:
        return
    # 這裡要的是**拼音**，不是漢字。打漢字進去，kws() 會回錯誤碼、整張詞表失效
    # （2026-09-21 實測）。「開始聽關鍵詞」會檢查那個錯誤碼，但到那裡只知道
    # 「有個詞不對」，說不出是哪個；漢字在這裡就擋得下來，還能指名道姓。
    if any(ord(_c) > 127 for _c in _s):
        raise ValueError(
            "「加入自訂關鍵詞」要填的是拼音，不是漢字。\\n"
            "一個字一組小寫拼音，後面接聲調數字（1234），中間用空格分開：\\n"
            "    你好      → ni3 hao3\\n"
            "    小愛同學  → xiao3 ai4 tong2 xue2\\n"
            "收到的是：" + _s)
    _maixKwsTbl.append(_s)
`;
    var kw = Blockly.Python.valueToCode(block, 'KW', Blockly.Python.ORDER_ATOMIC) || '""';
    return `_maixKwsAddCustom(${kw})\n`;
};


Blockly.Blocks['maixcam2_kws_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_kws_init)
            .appendField(new Blockly.FieldNumber(0.5, 0, 1, 0.05), "GATE");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_kws_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

/** kws 的取值輔助。**四塊 kws 積木都要呼叫**——不能只放在初始化那塊。
 *
 *  盤面上少放一塊初始化是很常見的事（尤其是照著範例改的時候）。如果
 *  `_maixKwsHeard` 只由初始化產出，那種盤面產出來的碼會 NameError，
 *  而 NameError 完全看不出「你少放了一塊積木」。放共用區至少會得到
 *  「還沒有加入任何關鍵詞」那種說得清楚的錯誤。
 */
function maixKwsHelpers() {
    maixSpeechRunner();
    Blockly.Python.definitions_['maixcam2_kws_helpers'] = `def _maixKwsOnFrame(_probs, _n):
    global _maixKwsScore
    _maixKwsScore = list(_probs)


def _maixKwsIndex(pny):
    return _maixKwsTbl.index(pny) if pny in _maixKwsTbl else -1


def _maixKwsHeard(pny):
    _i = _maixKwsIndex(pny)
    return bool(_maixKwsEdge[_i]) if 0 <= _i < len(_maixKwsEdge) else False


def _maixKwsScoreOf(pny):
    # 取三位小數。不四捨五入的話畫面上會出現 0.9470000267028809 這種東西，
    # 而這塊積木存在的意義就是讓人一眼看出「認出來」和「沒認出來」差多少。
    _i = _maixKwsIndex(pny)
    return round(float(_maixKwsScore[_i]), 3) if 0 <= _i < len(_maixKwsScore) else 0.0
`;
}


/** 註冊詞表。舊「語音轉拼音」那組（ai.js）也靠 `_maixKwsRegister` 註冊——
 *  一個 Speech 只有一個 kws 解碼器，`kws()` 是整張表換掉，兩邊各註冊各的會互相蓋掉。
 *
 *  兩組的詞分開放：AI 聽覺的在 `_maixKwsTbl`，舊拼音那組的在 `_maixKwsExtra`，
 *  送進解碼器時 AI 聽覺的排前面。「聽到關鍵詞」「剛聽到的關鍵詞」只看前面那段，
 *  所以讀不到舊拼音那組的詞；舊拼音那組照詞去 `_maixKwsAll` 找位置。
 */
function maixKwsStartDef() {
    maixKwsHelpers();
    Blockly.Python.definitions_['maixcam2_import_speech_err'] = `from maix import err as _maixSpeechErr`;
    Blockly.Python.definitions_['maixcam2_kws_start'] = `_maixKwsExtra = []
_maixKwsAll = []
_maixKwsStarted = False


def _maixKwsRegister():
    """把兩組的詞一起送進解碼器；順序就是 callback 機率列表的順序。

    AI 聽覺的詞要等「開始聽關鍵詞」之後才送——只加了、還沒開始聽的不能被
    另一組順手帶起來。兩組都有的詞只送一次，算在 AI 聽覺那邊。
    """
    global _maixKwsAll, _maixKwsScore
    _sp = _maixSpeechOpen()
    _own = list(_maixKwsTbl) if _maixKwsStarted else []
    _was = _maixKwsAll
    _maixKwsAll = _own + [_w for _w in dict.fromkeys(_maixKwsExtra) if _w not in _own]
    _maixKwsScore = [0.0] * len(_maixKwsAll)
    if not _maixKwsAll:
        if _was:
            _sp.dec_deinit(_maixSpeechNn.SpeechDecoder.DECODER_KWS)
        return
    # 第二個參數是 kw_gate。**它不是輸出濾網**——實測 gate=0.1 時 0.037 照樣
    # 被報上來，所以門檻只能我們自己比（見 _maixSpeechRun）。這裡固定用官方範例的 0.1。
    # kws() 註冊失敗**不丟例外，只回錯誤碼**，而且一個詞格式不對，整張詞表一起失效。
    # 不檢查的話程式照跑、什麼都聽不到，也沒有任何訊息（2026-09-21 probe-kws-custom.py 實測）。
    _err = _sp.kws(_maixKwsAll, [0.1] * len(_maixKwsAll), _maixKwsOnFrame, True)
    if _err != _maixSpeechErr.Err.ERR_NONE:
        raise RuntimeError(
            "關鍵詞註冊失敗（" + _maixSpeechErr.to_str(_err) + "），"
            "通常是某個詞的拼音格式不對，整張詞表都會聽不到。\\n"
            "一個字一組小寫拼音、後面接聲調數字（1234），中間用空格分開，例如 ni3 hao3。\\n"
            "這次送進去的詞：" + "、".join(_maixKwsAll))


def _maixKwsStart(gate):
    """AI 聽覺的詞開始聽。使用者調的是積木上那個靈敏度（_maixKwsGate）。"""
    global _maixKwsGate, _maixKwsPrev, _maixKwsEdge, _maixKwsStarted
    if not _maixKwsTbl:
        raise RuntimeError(
            "還沒有加入任何關鍵詞。把「加入關鍵詞」積木放在「開始聽關鍵詞」上面。")
    _maixKwsGate = gate
    _maixKwsPrev = [False] * len(_maixKwsTbl)
    _maixKwsEdge = [False] * len(_maixKwsTbl)
    _maixKwsStarted = True
    _maixKwsRegister()
`;
}

Blockly.Python['maixcam2_kws_init'] = function (block) {
    maixKwsStartDef();
    var gate = Number(block.getFieldValue('GATE'));
    return `_maixKwsStart(${gate})\n`;
};


Blockly.Blocks['maixcam2_kws_heard'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_kws_heard)
            .appendField(new Blockly.FieldDropdown(maixKwsWords()), "KW");
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_kws_heard_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_kws_heard'] = function (block) {
    maixKwsHelpers();
    var kw = block.getFieldValue('KW');
    return [`_maixKwsHeard(${JSON.stringify(kw)})`, Blockly.Python.ORDER_ATOMIC];
};


Blockly.Blocks['maixcam2_kws_score'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_kws_score_pre)
            .appendField(new Blockly.FieldDropdown(maixKwsWords()), "KW")
            .appendField(Blockly.Msg.maixcam2_kws_score_post);
        this.setInputsInline(true);
        this.setOutput(true, "Number");
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_kws_score_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_kws_score'] = function (block) {
    maixKwsHelpers();
    var kw = block.getFieldValue('KW');
    return [`_maixKwsScoreOf(${JSON.stringify(kw)})`, Blockly.Python.ORDER_ATOMIC];
};

/** 剛聽到的關鍵詞——對應上一代「獲取語音轉拼音的結果」。
 *
 *  「聽到關鍵詞」「相似度」都是下拉，只能選預設詞；用「加入自訂關鍵詞」加的詞
 *  沒有別的積木讀得到。這塊回傳**詞本身**（拼音文字），學生拿去跟文字比，
 *  預設詞、自訂詞一視同仁——跟上一代「取結果再比對」是同一個用法。
 *
 *  **只在剛聽到的那一幀有值，其他時候是空字串。** 上一代的結果會一直留著，
 *  放進迴圈裡的「如果 結果 = …」會每一圈都成立、同一個動作一直重跑；這裡跟
 *  「聽到關鍵詞」一樣走邊緣（`_maixKwsEdge`），念一次只觸發一次。
 *
 *  定義放自己的 key、不併進 maixKwsHelpers：併進去的話，每一塊 kws 積木的
 *  產碼都會多出這個函式，快照全變，但它們一個都用不到。
 */
Blockly.Blocks['maixcam2_kws_result'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_kws_result);
        this.setOutput(true, "String");
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_kws_result_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_kws_result'] = function (block) {
    maixKwsHelpers();
    Blockly.Python.definitions_['maixcam2_kws_result'] = `def _maixKwsJustHeard():
    # 這一幀剛超過門檻的詞；沒有就回空字串。
    # 同一幀有兩個詞一起過門檻時，回相似度高的那個。
    _best = ""
    _top = -1.0
    for _i in range(len(_maixKwsEdge)):
        if _maixKwsEdge[_i] and _i < len(_maixKwsScore) and _maixKwsScore[_i] > _top:
            _best = _maixKwsTbl[_i]
            _top = _maixKwsScore[_i]
    return _best
`;
    return ['_maixKwsJustHeard()', Blockly.Python.ORDER_ATOMIC];
};


/*
  ____  ___ ____ ___ _____
 |  _ \\|_ _/ ___|_ _|_   _|
 | | | || | |  _ | |  | |
 | |_| || | |_| || |  | |
 |____/___\\____|___| |_|

  連續中文數字。輸出是「最近四秒」的滑動視窗，`_` 代表靜音。
*/

Blockly.Blocks['maixcam2_digit_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_digit_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_digit_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_digit_init'] = function (block) {
    maixSpeechRunner();
    Blockly.Python.definitions_['maixcam2_digit'] = `def _maixDigitOnFrame(_text, _n):
    global _maixDigitRaw
    _maixDigitRaw = str(_text)


def _maixDigitStart():
    # 640 是官方範例的值：靜音超過這個長度就在輸出裡插一個 '_'。
    # 那些 '_' 是斷句用的，取數字的時候要濾掉。
    _maixSpeechOpen().digit(640, _maixDigitOnFrame)


def _maixDigitText():
    return "".join(_c for _c in _maixDigitRaw if _c.isdigit())
`;
    return '_maixDigitStart()\n';
};


Blockly.Blocks['maixcam2_digit_text'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_digit_text);
        this.setOutput(true, "String");
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_digit_text_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_digit_text'] = function (block) {
    maixSpeechRunner();
    return ['_maixDigitText()', Blockly.Python.ORDER_ATOMIC];
};


/*
  _ __     ______ ____  ____
 | |\\ \\   / / ___/ ___||  _ \\
 | | \\ \\ / / |   \\___ \\| |_) |
 | |__\\ V /| |___ ___) |  _ <
 |_____\\_/  \\____|____/|_| \\_\\

  連續語音轉文字。結果是**累積**的，用 , 和 . 斷句。
*/

Blockly.Blocks['maixcam2_lvcsr_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_lvcsr_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_lvcsr_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_lvcsr_init'] = function (block) {
    maixSpeechRunner();
    Blockly.Python.definitions_['maixcam2_lvcsr'] = `_MAIX_LVCSR_LM = "/root/models/lmS/"


def _maixLvcsrOnFrame(_res, _n):
    # callback 拿到的是 (漢字, 拼音)，兩個都是**從頭累積**的整串，
    # 例如 ('說.說,說好,你好.一二三 ', 'shuo1.shuo1,shuo1 hao3,ni3 hao3.yi1 er4 san1 ')
    # ',' 是短靜音、'.' 是長靜音，上限 1024 個漢字。
    global _maixLvcsrText, _maixLvcsrPny
    _maixLvcsrText = str(_res[0])
    _maixLvcsrPny = str(_res[1])


def _maixLvcsrStart():
    if not _maixOs.path.isdir(_MAIX_LVCSR_LM):
        raise FileNotFoundError(
            "找不到語言模型目錄 " + _MAIX_LVCSR_LM + "。\\n"
            "語音實時識別需要 lmS/（lg_6m.sfst、lg_6m.sym、phones.bin、words_utf.bin）。")
    _maixSpeechOpen().lvcsr(
        _MAIX_LVCSR_LM + "lg_6m.sfst", _MAIX_LVCSR_LM + "lg_6m.sym",
        _MAIX_LVCSR_LM + "phones.bin", _MAIX_LVCSR_LM + "words_utf.bin",
        _maixLvcsrOnFrame)


def _maixLvcsrLast():
    """只取最後一句。斷句標記是解碼器自己插的 ',' 和 '.'，不用我們判斷靜音。"""
    _parts = [_p.strip() for _p in _maixLvcsrText.replace(".", ",").split(",")]
    _parts = [_p for _p in _parts if _p]
    return _parts[-1] if _parts else ""
`;
    return '_maixLvcsrStart()\n';
};


Blockly.Blocks['maixcam2_lvcsr_text'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_lvcsr_text);
        this.setOutput(true, "String");
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_lvcsr_text_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_lvcsr_text'] = function (block) {
    maixSpeechRunner();
    return ['_maixLvcsrLast()', Blockly.Python.ORDER_ATOMIC];
};


Blockly.Blocks['maixcam2_lvcsr_all'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_lvcsr_all);
        this.setOutput(true, "String");
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_lvcsr_all_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_lvcsr_all'] = function (block) {
    maixSpeechRunner();
    return ['_maixLvcsrText', Blockly.Python.ORDER_ATOMIC];
};


/*
   ____ ___  __  __ __  __  ___  _   _
  / ___/ _ \\|  \\/  |  \\/  |/ _ \\| \\ | |
 | |  | | | | |\\/| | |\\/| | | | |  \\| |
 | |__| |_| | |  | | |  | | |_| | |\\  |
  \\____\\___/|_|  |_|_|  |_|\\___/|_| \\_|

  三個解碼器共用的兩塊。
*/

Blockly.Blocks['maixcam2_speech_run'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_speech_run);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_speech_run_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_speech_run'] = function (block) {
    maixSpeechRunner();
    return '_maixSpeechRun()\n';
};


Blockly.Blocks['maixcam2_speech_clear'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_speech_clear);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d1478c");
        this.setTooltip(Blockly.Msg.maixcam2_speech_clear_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_speech_clear'] = function (block) {
    maixSpeechRunner();
    Blockly.Python.definitions_['maixcam2_speech_clear'] = `def _maixSpeechClear():
    """清掉累積的辨識結果。lvcsr 的結果會一直長（上限 1024 字），要手動清。"""
    global _maixDigitRaw, _maixLvcsrText, _maixLvcsrPny
    if _maixSpeech is not None:
        _maixSpeech.clear()
    _maixDigitRaw = ""
    _maixLvcsrText = ""
    _maixLvcsrPny = ""
`;
    return '_maixSpeechClear()\n';
};
