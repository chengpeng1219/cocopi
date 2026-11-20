/*
 * 4G 版 MaixCAM2 才跑得動的大模型積木。
 *
 * 為什麼另開一個分類、不塞進「LLM 大模型」：那一類整類在 1G 板上跑得動，
 * 這一類整類跑不動。兩塊板子會並存，老師看分類名就知道手上這台能不能用，
 * 不必逐塊試。所以分類名自己講清楚（需 4G），積木上不再重複標。
 *
 * ⚠ 前提沿用 1G 那一套（AI ISP 要關、模型要先在機器上、結束要收乾淨），
 *   實作就是直接叫 maixLlmGuard()——同一份程式碼，不另外抄一遍。
 *   多加的只有一條：**開頭先量板子的實體記憶體**，1G 板直接報錯，
 *   不讓使用者對著 `Allocate fail` 猜。
 *
 * 2026-09-19 在 4G 板（MaixPy 4.12.5、mem=1024M、CMM 3072MB）實測：
 *
 *   Qwen2.5-1.5B 載入 13.9 秒，首字 2.3 秒，整句 6.0～21.3 秒
 *   SenseVoice   載入 10.6 秒
 *   兩個一起載   CMM 2.01 GiB / 3 GB，Linux 469 MB / 955 MB   ← 塞得下
 *
 * **1G 板「一個程式只能放一個大模型」的限制，在這塊板子上不成立。**
 * 語音問答（聽 → 想 → 答）因此做得出來，那正是這一批的第一張卡。
 *
 * 依據：
 *   docs/superpowers/specs/2026-09-17-4g-llm-cards.md    決定
 *   docs/superpowers/specs/2026-09-19-4g-quality-gate.md  品質判定
 *   MaixPy/docs/doc/zh/mllm/llm_qwen.md                  官方用法
 */


// 「顏色」插槽（lcd_set_color）回傳的是 "#rrggbb" 字串，**每塊用到顏色的積木
// 自己負責轉成 image.Color.from_rgb(...)**——現成的畫字積木就是這樣做的
// （maixcam2_screen.js 的 ai_lcd_textcarvas）。照做，不要自己發明格式。
function maix4gColor(hex) {
    if (typeof hex === 'string' && hex.charAt(0) === '#' && hex.length === 7) {
        var r = parseInt(hex.substring(1, 3), 16);
        var g = parseInt(hex.substring(3, 5), 16);
        var b = parseInt(hex.substring(5, 7), 16);
        return `image.Color.from_rgb(${r},${g},${b})`;
    }
    return hex || 'image.Color.from_rgb(255,255,255)';
}


// 4G 專屬的前置檢查。1G 那三項沿用，這裡只加「板子夠不夠大」。
function maix4gGuard() {
    maixLlmGuard();
    Blockly.Python.definitions_['maixcam2_import_4g'] = `from maix import sys as _maix4gSys`;
    // hw_total 是板子的實體記憶體總量，跟 Linux／CMM 怎麼切無關——
    // 切分會變（出廠是 cmm=-1，兩邊各 1G／3G），總量不會。
    Blockly.Python.definitions_['maixcam2_4g_guard'] = `def _maix4gCheck():
    """這一類積木要 4G 板。1G 板上直接講清楚，不要讓人對著 Allocate fail 猜。"""
    _hw = _maix4gSys.memory_info().get("hw_total", 0)
    if _hw < 3 * 1024 * 1024 * 1024:
        raise RuntimeError(
            "這塊積木需要 4G 版的 MaixCAM2，這台板子只有 "
            + _maix4gSys.bytes_to_human(_hw) + "。\\n"
            "「大模型（需 4G）」分類裡的積木在 1G 板上載不起來，請換一塊板子。")
`;
}


/*
   ___
  / _ \\__      _____ _ __
 | | | \\ \\ /\\ / / _ \\ '_ \\
 | |_| |\\ V  V /  __/ | | |
  \\__\\_\\ \\_/\\_/ \\___|_| |_|

  文字聊天（Qwen2.5-1.5B）。中文好、會用繁體，但答得慢。

  為什麼不給 0.5B／1.5B 的下拉：2026-09-19 的品質關實測，0.5B 會講到一半
  跳英文、六題裡有一題整段答非所問（`2026-09-19-4g-quality-gate.md`），
  使用者判定不及格。下拉只剩一個選項就不是下拉。
*/

Blockly.Blocks['maixcam2_qwen_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_qwen_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_qwen_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_qwen_init'] = function (block) {
    maix4gGuard();
    // 跟 maixcam2_vlm_init 用同一個 definitions_ key、**同一份內容**。
    // definitions_ 是共用命名空間，誰後寫誰贏——同 key 不同內容會默默改壞對方，
    // 所以這裡一個字都不能改（見 README-cocopi2.md 的兩個雷）。
    Blockly.Python.definitions_['maixcam2_import_nn'] = `from maix import nn as _maixNn
from maix import image as _maixLlmImage`;
    Blockly.Python.definitions_['maixcam2_import_err4g'] = `from maix import err as _maixErr`;
    // 載入要 14 秒，所以放初始化、不要每次提問都做。
    // set_reply_callback 是串流回呼：模型一個字一個字吐，這裡累積起來，
    // send() 回來之後 _maixQwenAnswer 就是完整的一句。
    Blockly.Python.definitions_['maixcam2_qwen'] = `_MAIX_QWEN_MODEL = "/root/models/Qwen2.5-1.5B-Instruct/model.mud"
_MAIX_QWEN_ROLE = "你是一個親切的小學課堂助教，回答要簡短、口語、用繁體中文。"
_maixQwenAnswer = ""


def _maixQwenOnReply(obj, resp):
    global _maixQwenAnswer
    _maixQwenAnswer += resp.msg_new


def _maixQwenInit():
    global _maixQwen
    _maix4gCheck()
    _maixLlmCheck(_MAIX_QWEN_MODEL, "文字聊天模型")
    _maixQwen = _maixNn.Qwen(_MAIX_QWEN_MODEL)
    _maixQwen.set_system_prompt(_MAIX_QWEN_ROLE)
    _maixQwen.set_reply_callback(_maixQwenOnReply)


def _maixQwenNeed():
    if "_maixQwen" not in globals():
        raise RuntimeError("要先放「初始化文字聊天模型」那塊積木。")
`;
    return '_maixQwenInit()\n';
};


/*
  逐字顯示。**這塊積木的存在理由是等待時間。**

  1.5B 答一句最短的題目要 6 秒、長的要 21 秒（2026-09-19 實測）。
  一次把整段吐出來的話，學生要對著不動的畫面等 6～21 秒，會以為當掉了。
  spec 訂的門檻是 5 秒，超過就要做這塊——實測超過了。
*/

Blockly.Blocks['maixcam2_qwen_stream'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_qwen_stream)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("QUESTION").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_qwen_stream_question);
        // 下面四個插槽跟「畫布上顯示文字（自動換行）」逐一對應、順序也一樣，
        // 老師不用重學。訊息鍵也直接沿用那塊的，不另外翻譯一份。
        //
        // ⚠ 只有插槽沿用，**切行的實作不要照抄**。那塊的 textCanvasNewLine
        //   按字數硬切、不量寬度，滿行的中文會超出畫布、被 draw_string 自己
        //   折下來壓在下一行上（2026-09-20 實測，見 _maixQwenWrap）。
        //   那是既有積木的問題，不在這次範圍，但別把它複製過來。
        this.appendValueInput("POSA").setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("dispalyStr").setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_dispalyStr);
        this.appendValueInput("COLOR").setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        this.appendValueInput("Scale").setCheck("Number")
            .appendField(Blockly.Msg.image_process_draw_text_font_size);
        this.appendValueInput("LineNum").setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_line_heigit);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_qwen_stream_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_qwen_stream'] = function (block) {
    maix4gGuard();
    // 借初始化那塊的定義：切行要量字寬（_maixLlmImage.string_size），
    // 那個 import 掛在初始化那邊。回傳的那行丟掉不用。
    Blockly.Python['maixcam2_qwen_init'](block);
    var img = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var q = Blockly.Python.valueToCode(block, 'QUESTION', Blockly.Python.ORDER_ATOMIC) || '""';
    var pos = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC) || '0,0';
    var num = Blockly.Python.valueToCode(block, 'dispalyStr', Blockly.Python.ORDER_ATOMIC) || '20';
    var color = maix4gColor(Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC));
    var scale = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC) || '1.2';
    var lineh = Blockly.Python.valueToCode(block, 'LineNum', Blockly.Python.ORDER_ATOMIC) || '26';
    Blockly.Python.definitions_['maixcam2_qwen_stream'] = `def _maixQwenShow(img):
    """把畫布送上螢幕。優先走畫布積木那條路，它會處理旋轉與置中。"""
    _g = globals()
    if "v831_display_show_canvas" in _g:
        _g["v831_display_show_canvas"](img)
    elif "disp" in _g:
        _g["disp"].show(img)
    else:
        raise RuntimeError("逐字顯示需要先放「初始化螢幕」和「建立畫布」兩塊積木。")


def _maixQwenWrap(text, x, w, num, scale):
    """把一段回答切成畫得下的幾行。

    **只按字數切會疊字。** draw_string 碰到畫布右緣會自己折行，折下來那一列
    壓在下一行上面——2026-09-20 實測：20 個中文字在 scale 1.2 要 649 px，
    畫布只剩 630 px，折下來的列落在 y=144，而下一行畫在 y=146，撞在一起。
    夾數字和英文的行比較窄不會超，所以看起來是「有些行」疊在一起。

    所以字數只當上限，切完還要量實際寬度，太寬就再切短。
    模型列點的時候回答裡有 \\n，順便拿它當斷行——不然它會被畫成一個怪字元。
    """
    _lines = []
    for _para in text.split("\\n"):
        _para = _para.strip()
        if not _para:
            continue
        while _para:
            _take = min(num, len(_para))
            while _take > 1 and _maixLlmImage.string_size(_para[:_take], scale=scale).width() > w:
                _take -= 1
            _lines.append(_para[:_take])
            _para = _para[_take:]
    return _lines or [""]


def _maixQwenDraw(img, base, text, x, y, num, color, scale, line_h):
    """把 text 重畫在乾淨的底圖上。

    **重畫之前要先把底圖蓋回去**——畫布上的字是疊上去的，不蓋回去，
    新舊兩段會糊在一起。所以底圖要在開始之前先 copy() 一份。
    """
    img.draw_image(0, 0, base)
    for _i, _line in enumerate(_maixQwenWrap(text, x, img.width() - x, num, scale)):
        _y = y + _i * line_h
        if -line_h < _y < img.height():      # 畫面外的就別畫了，回答可能很長
            img.draw_string(x, _y, _line, scale=scale, color=color, thickness=1)
    _maixQwenShow(img)


def _maixQwenStream(question, img, x, y, num, color, scale, line_h):
    """問一題，字一個一個浮出來，整句說完才往下走。"""
    global _maixQwenAnswer
    _maixQwenNeed()
    _maixQwenAnswer = ""
    _base = img.copy()

    def _onStream(obj, resp):
        global _maixQwenAnswer
        _maixQwenAnswer += resp.msg_new
        _maixQwenDraw(img, _base, _maixQwenAnswer, x, y, num, color, scale, line_h)

    _maixQwen.set_reply_callback(_onStream)
    try:
        _resp = _maixQwen.send(question)
    finally:
        # 還原成只累積、不畫畫面的那個回呼。不還原的話，之後用「問模型」
        # 那塊積木也會偷偷去畫這張畫布——使用者會看到莫名其妙的字。
        _maixQwen.set_reply_callback(_maixQwenOnReply)

    if _resp.err_code != _maixErr.Err.ERR_NONE:
        # send() 失敗**不會丟例外**，只是 0.1 秒就回來、一個字都不答（2026-09-19 實測）。
        # 不檢查的話，畫面上看起來就是「壞了」——那正是 MaixPy 自己的坑，別跟著踩。
        # 兩種原因的 err_code 一模一樣（記憶滿了／這一題太長），所以訊息一句涵蓋兩者。
        _maixQwenAnswer = ""
        _maixQwenDraw(img, _base, "這一題答不出來，換句短一點的再問一次。",
                      x, y, num, color, scale, line_h)
        print("[Qwen] 模型答不出來：對話記憶滿了，或這一題太長。\\n"
              "       這塊板子的對話記憶只有 1023 個 token，一般長度的對話大約八、九輪就滿。\\n"
              "       在「問模型」前面放一塊「清除對話記憶」積木，每一輪都會重新開始。",
              flush=True)
    return _maixQwenAnswer
`;
    return `_maixQwenStream(${q}, ${img}, ${pos}, ${num}, ${color}, ${scale}, ${lineh})\n`;
};


/*
  清除對話記憶。**這塊積木刻意不藏進產碼裡。**

  模型的對話記憶只有 1023 個 token，而且那是量化模型的時候就烘死的
  （`pulsar2 llm_build --kv_cache_len 1023`），runtime 和 model.mud 都改不了；
  更麻煩的是**沒有任何 API 可以查用量**，只能等 send() 失敗才知道撞牆。

  所以這一類積木的用法是「每一輪都是全新的對話」——把這塊放在「問模型」
  前面，就永遠不會滿。**不是放迴圈開頭**：迴圈通常在輪詢觸控，一秒幾十圈。官方自己的語音助理也是這樣做的（app_chat/main.py:296）。

  為什麼不讓「問模型」那塊自己偷偷清：這個 repo 講過三次「不要偷偷 XX」
  （audio.js:644、camera.js:106、本檔案下面那段 finally）。清除對話記憶
  比那幾件事影響更大——學生問「我剛才問了什麼」模型答不出來，那是**行為**，
  不是內部細節，藏起來他永遠學不會這顆模型為什麼會忘記。
*/

Blockly.Blocks['maixcam2_qwen_clear'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_qwen_clear);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_qwen_clear_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_qwen_clear'] = function (block) {
    // 借初始化那塊的定義（_maixQwenNeed、_MAIX_QWEN_ROLE），回傳的那行丟掉不用。
    // 跟「停止錄音並辨識」借「開始錄音」的定義是同一個做法。
    Blockly.Python['maixcam2_qwen_init'](block);
    Blockly.Python.definitions_['maixcam2_qwen_clear'] = `def _maixQwenClear():
    _maixQwenNeed()
    # **不必重設角色。** 2026-09-20 實測：set_system_prompt() 設的角色活得過
    # clear_context()，清完再問「你是誰」，模型還是照角色回答。
    _maixQwen.clear_context()
`;
    return '_maixQwenClear()\n';
};


/*
  ⚠ 這裡原本有一塊「回答時碰螢幕可以打斷」，2026-09-20 做出來、當天拿掉。
    **不要再用 `nn.Qwen.cancel()` 做這件事。**

    症狀：打斷之後**下一題會亂答**——吐出「助手」這個角色標記、吐出
    `<|endoftext|>`、接著講上一題的內容、答不完停不下來。實測 5 次壞 3 次，
    `clear_context()` 救不回來，連清兩次更糟（4 次全壞）。

    原因：對話是有格式的協定（ChatML），模型要自己吐出結束標記才算一個回合
    封口。`cancel()` 在還沒封口的時候掐斷，KV cache 裡就留下一個沒收尾的
    助手回合，下一輪的 user 訊息直接接在它後面——模型看到的是壞掉的協定。
    像是 HTTP response 寫到一半關掉 socket，連線卻留給下一個 request 用。
    `clear_context()` 清的是對話內容，清不掉「這一回合沒結束」這件事。

    MaixPy 沒有給補結束標記、也沒有給截斷 KV cache 的 API，所以在這版韌體上
    `cancel()` 只適合用在「程式要結束了」（官方 app_chat/main.py:237 就是這樣，
    呼叫之後那個模型不再使用）。

    要做打斷的話，正確方向是**別去動模型**：把 send() 放背景執行緒，碰螢幕
    只停止畫面更新、讓模型在背景安靜講完。那樣積木要叫「跳過」不是「打斷」，
    因為模型並沒有停。這條路還沒實作，見 2026-09-17-4g-llm-cards.md 的修訂一節。
*/


/*
     _    ____  ____
    / \\  / ___||  _ \\
   / _ \\ \\___ \\| |_) |
  / ___ \\ ___) |  _ <
 /_/   \\_\\____/|_| \\_\\

  點一下開始錄、再點一下停止。模型用的是現有的 SenseVoice——
  所以要**先放「初始化语音识别模型」那塊積木**（在「LLM 大模型」分類裡），
  辨識結果也是用那一類的「获取识别的文字」取出來，不另外做一塊。

  為什麼不用現有的「錄音 N 秒並辨識」：那塊是固定秒數，程式會停在那裡等。
  小朋友講話有長有短，固定秒數要嘛話沒說完就斷、要嘛講完還乾等。

  錄音期間誰去收音？**積木自己在背景收。** 音訊緩衝區只有幾百毫秒，
  沒人倒就掉資料，但要老師在迴圈裡加一塊「持續收音」太彆扭。
  2026-09-19 實測背景執行緒這條路：錄 5.0 秒收到 4.95 秒、只掉 1.2%（起停那一下），
  主迴圈同時跑了 166 圈沒被卡住。
*/

Blockly.Blocks['maixcam2_asr4g_start'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_asr4g_start);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_asr4g_start_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_asr4g_start'] = function (block) {
    maix4gGuard();
    // 跟 maixcam2_asr_init 用同一個 key、同一份內容——理由同上，不能改一個字。
    Blockly.Python.definitions_['maixcam2_import_asr'] = `from maix import sensevoice as _maixSensevoice
from maix import audio as _maixLlmAudio`;
    Blockly.Python.definitions_['maixcam2_import_asr4g'] = `import threading as _maixThreading`;
    Blockly.Python.definitions_['maixcam2_asr4g'] = `_maixAsr4gRec = None
_maixAsr4gChunks = []
_maixAsr4gStop = None
_maixAsr4gThread = None


def _maixAsr4gDrain():
    """背景收音。record() 不帶參數＝立刻把緩衝區倒出來，不阻塞。"""
    while not _maixAsr4gStop.is_set():
        _data = _maixAsr4gRec.record()
        if _data:
            _maixAsr4gChunks.append(bytes(_data))
        _maixTime.sleep_ms(20)


def _maixAsr4gBegin():
    global _maixAsr4gRec, _maixAsr4gChunks, _maixAsr4gStop, _maixAsr4gThread
    if _maixAsr4gThread is not None:
        return                      # 已經在錄了，重複點擊不要疊第二條執行緒
    _maixAsr4gChunks = []
    _maixAsr4gRec = _maixLlmAudio.Recorder(sample_rate=16000, channel=1)
    _maixAsr4gRec.volume(100)
    _maixAsr4gStop = _maixThreading.Event()
    _maixAsr4gThread = _maixThreading.Thread(target=_maixAsr4gDrain, daemon=True)
    _maixAsr4gThread.start()


def _maixAsr4gEnd():
    global _maixAsrText, _maixAsr4gRec, _maixAsr4gThread
    if _maixAsr4gThread is None:
        _maixAsrText = ""
        return ""                   # 沒在錄就按停止：回空字串，不要炸
    _maixAsr4gStop.set()
    _maixAsr4gThread.join(timeout=2)
    _maixAsr4gThread = None
    _maixAsr4gRec = None            # 釋放麥克風，下一輪重新開
    _pcm = b"".join(_maixAsr4gChunks)
    _asr = globals().get("_maixAsr")
    if _asr is None:
        raise RuntimeError(
            "要先放「初始化语音识别模型」那塊積木（在「LLM 大模型」分類裡）。")
    if not _pcm:
        # 開始到停止太快，背景執行緒一段都還沒收到（錄音裝置起步要 40～60 ms，
        # 間隔 20 ms 以下五次全空）。refer() 收到空的會丟
        # ValueError: You need input path or audio_data——2026-09-21 卡 L6 撞到，
        # 多半是觸控彈跳把一次點擊報成兩次。再短但不是空的都沒事
        # （10 ms 回 ''），所以只擋這一種。見 tools/e2e/probe-asr4g-short-tap.py。
        print("[語音辨識] 開始到停止太快，沒錄到聲音，當成沒說話。", flush=True)
        _maixAsrText = ""
        return ""
    _maixAsrText = _asr.refer(audio_data=_pcm) or ""
    return _maixAsrText
`;
    // sleep_ms 來自螢幕／觸控那批積木的 _maixTime；這裡自己也宣告一次，
    // 確保單獨使用這塊積木時不會 NameError。同 key 同內容，不會打架。
    Blockly.Python.definitions_['maixcam2_import_time'] = `from maix import time as _maixTime`;
    return '_maixAsr4gBegin()\n';
};


Blockly.Blocks['maixcam2_asr4g_stop'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_asr4g_stop);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_asr4g_stop_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_asr4g_stop'] = function (block) {
    // 產碼跟「開始錄音」共用同一份定義，所以直接叫它的生成器把定義塞進去。
    Blockly.Python['maixcam2_asr4g_start'](block);
    return '_maixAsr4gEnd()\n';
};
