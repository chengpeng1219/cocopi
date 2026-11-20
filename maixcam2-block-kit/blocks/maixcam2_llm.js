/*
 * MaixCAM2（pi2）專屬的大模型積木：看圖說話、語音轉文字、文字轉語音。
 *
 * 這一批是 pi2 才有的能力，舊機（V831）上沒有對應的東西，所以不是「遷移」，
 * 是照 v4 官方提供的功能新開一個分類。
 *
 * 依據：
 *   examples/mllm/vlm/vlm_smolvlm.py
 *   examples/audio/asr/sensevoice/asr_sensevoice.py
 *   examples/audio/tts/mellotts/tts_melotts.py
 *   docs/doc/zh/mllm/basic.md
 *
 * ⚠ 三個前提，缺一個就跑不起來——見 tools/e2e/probe-mllm4.py 的完整實測：
 *
 * 一、**AI ISP 必須關掉。** 那個設定讓 NPU 分一半算力去做影像處理（換相機畫質），
 *     而 MeloTTS 和 SenseVoice 要完整的 NPU。積木裡沒辦法自動處理——它是系統設定，
 *     所以初始化積木會在關著的時候直接報錯告訴使用者怎麼改。
 *
 * 二、**一個程式只能放一個大模型。** 實測把三個依序載入同一個行程，第三個就
 *     `Failed to start model`（Linux RAM 剩 108 MB）。這是 1G 板的硬限制。
 *
 * 三、**模型要先在機器上。** 找不到時給出可以直接照做的錯誤訊息，不要讓使用者
 *     對著 `load model failed` 猜。
 *
 * Whisper 需要把 CMM 調大才跑得動。預設切法（CMM 512 / Linux 512）不夠——
 * 它三顆 axmodel 各開一套引擎上下文，載到第三顆時 CMM 只剩 4.8 MB。
 * 2026-08-20 實測出唯一可行的那一格：
 *
 *     maix_memory_cmm    CMM      Linux    結果
 *     -1（預設）         512 MB   446 MB   ❌ CMM 不夠（Free=4936KB）
 *     768（原廠建議）    768 MB   191 MB   ❌ Linux 不夠（std::bad_alloc，
 *                                             最大那顆模型檔 129.4 MB 讀不進堆積）
 *     640                640 MB   318 MB   ✅ 載入 1910 ms，轉錄正確
 *
 * 所以 Whisper 積木會先檢查 CMM 分區大小，不夠就直接講清楚怎麼改，
 * 不讓使用者對著 load model failed 猜。
 */


// 三個模型共用的前置檢查。放同一個 definitions_ key，誰先用誰插入，只會出現一次。
function maixLlmGuard() {
    Blockly.Python.definitions_['maixcam2_import_llm'] = `import os as _maixOs
import atexit as _maixAtexit
import signal as _maixSignal
from maix import app as _maixApp`;
    Blockly.Python.definitions_['maixcam2_llm_guard'] = `def _maixLlmCheck(path, what):
    """跑之前把兩個最常見的坑先擋掉，並給出照著做就能修的訊息。"""
    if _maixApp.get_sys_config_kv("npu", "ai_isp", "0") != "0":
        raise RuntimeError(
            what + "需要完整的 NPU，但 AI ISP 正開著（它會佔掉一半算力）。\\n"
            "關掉的指令在 tools/e2e/probe-mllm4.py 的檔頭，不必重開機。\\n"
            "要點是：app.set_sys_config_kv('npu', 'ai_isp', '0')")
    if not _maixOs.path.exists(path):
        raise FileNotFoundError(
            "找不到模型 " + path + "。\\n"
            "這台機器上要先有模型檔，下載方式見 docs/doc/zh/mllm/basic.md")
`;
    // 收尾。**這段真正防的是 CMM 洩漏，不是背景服務。**
    //
    // 頁面按「停止」= 關掉 adb socket，板子上收到的是 SIGHUP，Python 預設直接死。
    // 行程沒走正常關閉流程，NPU 驅動就來不及釋放，CMM 會留下一堆 npu_m_llama_*
    // 殘塊（實測 block 數從 29 衝到 227、可用 CMM 只剩 329 MB），下一次載入模型
    // 就會 `Allocate input{N} fail`，而且**只有重開機能清**。
    //
    // 背景服務（llm-tokenizer / sensevoice）的回收不在這裡，在 index.js 的執行與
    // 返回桌面路徑上——那是執行環境的職責，而且放那邊每支程式都受惠，不只大模型。
    // 這裡順手停 tokenizer 只是讓記憶體早一點還回去，不是保證。
    Blockly.Python.definitions_['maixcam2_llm_cleanup'] = `def _maixLlmRelease():
    """程式結束時釋放資源：NPU 驅動走正常路徑（關鍵），順便收掉 tokenizer。"""
    _asr = globals().get("_maixAsr")
    if _asr is not None:
        try:
            _asr.stop()   # 官方 API，內含 systemctl stop sensevoice.service
        except Exception:
            pass
        globals()["_maixAsr"] = None
    _maixOs.system("systemctl stop llm-tokenizer.service >/dev/null 2>&1")


def _maixLlmOnSignal(_sig, _frame):
    # 頁面按「停止」= 關掉 adb socket，板子上實際收到的是 SIGHUP；SIGHUP 和
    # SIGTERM 的預設動作都是直接砍掉行程，atexit 根本不會跑（實測驗過）。
    # 轉成 SystemExit 才能讓上面的清理跑到。
    # SIGINT 不用接：未捕捉的 KeyboardInterrupt 走的是正常關閉流程，atexit 會跑。
    raise SystemExit(0)


_maixAtexit.register(_maixLlmRelease)
for _maixLlmSig in ("SIGHUP", "SIGTERM"):
    try:
        _maixSignal.signal(getattr(_maixSignal, _maixLlmSig), _maixLlmOnSignal)
    except (AttributeError, ValueError, OSError):
        pass
`;
}


/*
  ____                 ___     ___     __  __
 / ___| _ __ ___   ___ \\ \\   / / |    |  \\/  |
 \\___ \\| '_ ` _ \\ / _ \\ \\ \\ / /| |    | |\\/| |
  ___) | | | | | | (_) | \\ V / | |___ | |  | |
 |____/|_| |_| |_|\\___/   \\_/  |_____||_|  |_|

  看圖說話。只會英文（官方模型就是英文的），問中文會得到英文答案或亂答。
*/

Blockly.Blocks['maixcam2_vlm_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_vlm_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_vlm_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_vlm_init'] = function (block) {
    maixLlmGuard();
    Blockly.Python.definitions_['maixcam2_import_nn'] = `from maix import nn as _maixNn
from maix import image as _maixLlmImage`;
    // 載入要五秒，所以放在初始化、不要每次提問都做。
    // set_reply_callback 是串流回呼：模型一個字一個字吐，這裡累積起來，
    // send() 回來之後 _maixVlmAnswer 就是完整的一句。
    Blockly.Python.definitions_['maixcam2_vlm'] = `_MAIX_VLM_MODEL = "/root/models/smolvlm-256m-instruct-maixcam2/model.mud"
_maixVlmAnswer = ""


def _maixVlmOnReply(obj, resp):
    global _maixVlmAnswer
    _maixVlmAnswer += resp.msg_new


def _maixVlmInit():
    global _maixVlm
    _maixLlmCheck(_MAIX_VLM_MODEL, "視覺語言模型")
    _maixVlm = _maixNn.SmolVLM(_MAIX_VLM_MODEL)
    _maixVlm.set_system_prompt("You are a helpful assistant.")
    _maixVlm.set_reply_callback(_maixVlmOnReply)


def _maixVlmAsk(img, question):
    global _maixVlmAnswer
    _maixVlmAnswer = ""
    # 相機給的通常已經就是模型要的 RGB888。to_format() 遇到「格式已經一樣」
    # 不是安靜跳過，是直接丟 RuntimeError: convert format failed, already the
    # format——所以一定要先比對再轉。官方範例是載圖時就指定 format，碰不到這關。
    _fmt = _maixVlm.input_format()
    _in = img if img.format() == _fmt else img.to_format(_fmt)
    # fit=FIT_CONTAIN：尺寸不合會自動縮放並保持比例，不必自己算
    _maixVlm.set_image(_in, fit=_maixLlmImage.Fit.FIT_CONTAIN)
    _maixVlm.send(question)
    return _maixVlmAnswer
`;
    return '_maixVlmInit()\n';
};


Blockly.Blocks['maixcam2_vlm_ask'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_vlm_ask_look)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("QUESTION").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_vlm_ask_question);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_vlm_ask_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_vlm_ask'] = function (block) {
    var img = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var q = Blockly.Python.valueToCode(block, 'QUESTION', Blockly.Python.ORDER_ATOMIC) || '""';
    return `_maixVlmAsk(${img}, ${q})\n`;
};


Blockly.Blocks['maixcam2_vlm_answer'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_vlm_answer);
        this.setOutput(true, "String");
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_vlm_answer_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_vlm_answer'] = function (block) {
    return ['_maixVlmAnswer', Blockly.Python.ORDER_ATOMIC];
};


/*
     _    ____  ____
    / \\  / ___||  _ \\
   / _ \\ \\___ \\| |_) |
  / ___ \\ ___) |  _ <
 /_/   \\_\\____/|_| \\_\\

  語音轉文字（SenseVoice）。中英都行。
*/

Blockly.Blocks['maixcam2_asr_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_asr_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_asr_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_asr_init'] = function (block) {
    maixLlmGuard();
    Blockly.Python.definitions_['maixcam2_import_asr'] = `from maix import sensevoice as _maixSensevoice
from maix import audio as _maixLlmAudio`;
    // **錄音用 maix.audio.Recorder，不是 pyaudio。** 實測 Recorder 給的是乾淨的
    // 16 kHz（1 秒剛好 16000 點、RMS 668），而 pyaudio 那條路會被驅動補零
    // （每隔一格插一組 0，訊號少 √2，見 maixcam2_audio.js 的 micStride）。
    // 語音辨識吃的就是波形品質，這裡不能將就。
    Blockly.Python.definitions_['maixcam2_asr'] = `_MAIX_ASR_MODEL = "/root/models/sensevoice-maixcam2/model.mud"
_maixAsrText = ""


def _maixAsrInit():
    global _maixAsr
    _maixLlmCheck(_MAIX_ASR_MODEL, "語音辨識模型")
    _maixAsr = _maixSensevoice.Sensevoice(model=_MAIX_ASR_MODEL, stream=False)
    _maixAsr.start()
    if _maixAsr.is_ready(block=True) is False:
        raise RuntimeError(
            "語音辨識的背景服務起不來。最常見的原因是記憶體不夠——"
            "這台 1G 板一個程式只能放一個大模型，確認盤面上沒有別的模型積木。")


def _maixAsrListen(seconds):
    global _maixAsrText
    _rec = _maixLlmAudio.Recorder(sample_rate=16000, channel=1)
    _rec.volume(100)
    _pcm = _rec.record(int(seconds * 1000))
    del _rec
    _maixAsrText = _maixAsr.refer(audio_data=_pcm) or ""
    return _maixAsrText
`;
    return '_maixAsrInit()\n';
};


Blockly.Blocks['maixcam2_asr_listen'] = {
    init: function () {
        this.appendValueInput("SEC").setCheck("Number")
            .appendField(Blockly.Msg.maixcam2_asr_listen);
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_asr_listen_unit);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_asr_listen_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_asr_listen'] = function (block) {
    var sec = Blockly.Python.valueToCode(block, 'SEC', Blockly.Python.ORDER_ATOMIC) || '3';
    return `_maixAsrListen(${sec})\n`;
};


Blockly.Blocks['maixcam2_asr_text'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_asr_text);
        this.setOutput(true, "String");
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_asr_text_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_asr_text'] = function (block) {
    return ['_maixAsrText', Blockly.Python.ORDER_ATOMIC];
};


// 上一代的「在線語音識別加載」吃的是一個語音檔路徑（訊飛雲端）。本地做得到，
// 而且是官方原生用法——SenseVoice 的 refer(path=) 和 Whisper 的 transcribe(path)
// 範例裡預設走的就是檔案那條路，我們現有的「錄音 N 秒」反而是包出來的。
Blockly.Blocks['maixcam2_asr_file'] = {
    init: function () {
        this.appendValueInput("PATH").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_asr_file);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_asr_file_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_asr_file'] = function (block) {
    // 借初始化那塊的定義（_maixAsr、_maixAsrText），回傳的那行丟掉不用。
    Blockly.Python['maixcam2_asr_init'](block);
    Blockly.Python.definitions_['maixcam2_asr_file'] = `def _maixAsrFile(path):
    global _maixAsrText
    if "_maixAsr" not in globals():
        raise RuntimeError("要先放「初始化 SenseVoice 語音辨識模型」那塊積木。")
    if not _maixOs.path.exists(str(path)):
        raise FileNotFoundError(
            "找不到語音檔 " + str(path) + "。\\n"
            "這是板子上的路徑，不是電腦上的。用「播放音訊檔案」那批積木\\n"
            "錄出來的檔就在板子上，路徑照抄即可。")
    # 官方限制：只吃 wav，而且要 16000 Hz、單聲道、16 位元。
    # 格式不對不會報錯，只會辨識得亂七八糟——所以 tooltip 要寫清楚。
    _maixAsrText = _maixAsr.refer(path=str(path)) or ""
    return _maixAsrText
`;
    var path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC) || '""';
    return `_maixAsrFile(${path})\n`;
};


/*
 __        ___     _
 \\ \\      / / |__ (_)___ _ __   ___ _ __
  \\ \\ /\\ / /| '_ \\| / __| '_ \\ / _ \\ '__|
   \\ V  V / | | | | \\__ \\ |_) |  __/ |
    \\_/\\_/  |_| |_|_|___/ .__/ \\___|_|
                        |_|

  語音轉文字（Whisper base）。中英文都行，可以選語言。

  跟 SenseVoice 的差別：Whisper 要三顆模型、吃掉 640 MB 裡的一大半，
  但初始化只要 1.9 秒（SenseVoice 要起背景服務，約 9 秒）。
  兩者做同一件事，一個程式裡只放一個。
*/

Blockly.Blocks['maixcam2_whisper_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_whisper_init)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.maixcam2_whisper_lang_zh, "zh"],
                [Blockly.Msg.maixcam2_whisper_lang_en, "en"]
            ]), "LANG");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_whisper_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_whisper_init'] = function (block) {
    maixLlmGuard();
    Blockly.Python.definitions_['maixcam2_import_whisper'] = `import re as _maixRe
from maix import nn as _maixNn
from maix import audio as _maixLlmAudio`;
    var lang = block.getFieldValue('LANG');
    // **錄音走 maix.audio.Recorder**，跟 SenseVoice 同一條路。pyaudio 那條會被
    // 驅動補零升頻（見 maixcam2_audio.js 的 micStride），語音辨識吃波形品質，
    // 這裡不能將就。
    Blockly.Python.definitions_['maixcam2_whisper'] = `_MAIX_WHISPER_MODEL = "/root/models/whisper-base/whisper-base.mud"
_maixWhisperText = ""


def _maixWhisperCheckCmm():
    """Whisper 要比預設更大的 CMM，先擋下來並講清楚怎麼改。

    讀的是**實際的分區大小**而不是 /boot/configs 的設定值——設定改了但沒重開機
    的話，檔案會說 640、實際還是 512，那種情況最難查。
    """
    try:
        with open("/proc/ax_proc/mem_cmm_info") as _f:
            _m = _maixRe.search(r"Size=\\d+KB\\((\\d+)MB\\)", _f.read())
        _mb = int(_m.group(1)) if _m else 0
    except Exception:
        return          # 讀不到就別擋，讓它自己去撞真正的錯誤
    # 門檻分三段，**只在有實測證據的地方擋**。
    #
    # 先前這裡寫死「< 600 就報錯」，那個 600 是從「640 可以、512 不行」推的
    # 中間值猜測。結果是：使用者想試 576 的時候，積木直接把實驗擋掉了——
    # 把沒驗證過的數字寫進防護，等於拿猜測冒充事實。
    if _mb and _mb <= 512:
        raise RuntimeError(
            "Whisper 需要更大的 CMM：目前分區只有 " + str(_mb) + " MB，實測 512 MB 一定失敗。\\n"
            "改法：把 /boot/configs 裡的 maix_memory_cmm 設成 576，然後重開機。\\n"
            "（/boot 是 vfat，sed -i 改不動，要 adb pull → 改 → adb push。）\\n"
            "576 是實測唯一兩全的值：CMM 576／Linux 382 MB，Whisper 和 SmolVLM 都能跑。\\n"
            "設 640 的話 SmolVLM 會被 OOM 殺掉；設 768 連 Whisper 自己都載不進去。")
    if _mb and _mb < 576:
        print("[Whisper] CMM 只有 " + str(_mb) + " MB。實測 576 可以、512 不行，"
              "中間這段沒驗過——失敗的話請設 576。", flush=True)


def _maixWhisperInit(lang):
    global _maixWhisper
    _maixWhisperCheckCmm()
    _maixLlmCheck(_MAIX_WHISPER_MODEL, "Whisper 語音辨識模型")
    _maixWhisper = _maixNn.Whisper(model=_MAIX_WHISPER_MODEL, language=lang)


def _maixWhisperListen(seconds):
    global _maixWhisperText
    _rec = _maixLlmAudio.Recorder(sample_rate=16000, channel=1)
    _rec.volume(100)
    _pcm = _rec.record(int(seconds * 1000))
    del _rec
    # transcribe_raw 直接吃 PCM，不必先寫成 wav 檔再讀回來。
    _maixWhisperText = _maixWhisper.transcribe_raw(_pcm) or ""
    return _maixWhisperText
`;
    return `_maixWhisperInit("${lang}")\n`;
};


Blockly.Blocks['maixcam2_whisper_listen'] = {
    init: function () {
        this.appendValueInput("SEC").setCheck("Number")
            .appendField(Blockly.Msg.maixcam2_whisper_listen);
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_whisper_listen_unit);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_whisper_listen_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_whisper_listen'] = function (block) {
    var sec = Blockly.Python.valueToCode(block, 'SEC', Blockly.Python.ORDER_ATOMIC) || '3';
    return `_maixWhisperListen(${sec})\n`;
};


Blockly.Blocks['maixcam2_whisper_text'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_whisper_text);
        this.setOutput(true, "String");
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_whisper_text_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_whisper_text'] = function (block) {
    return ['_maixWhisperText', Blockly.Python.ORDER_ATOMIC];
};


/*
  _____ _____ ____
 |_   _|_   _/ ___|
   | |   | | \\___ \\
   | |   | |  ___) |
   |_|   |_| |____/

  文字轉語音（MeloTTS）。中文模型，夾雜英文也念得出來。
*/

Blockly.Blocks['maixcam2_tts_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_tts_init)
            .appendField(new Blockly.FieldNumber(80, 10, 200), "SPEED")
            .appendField(Blockly.Msg.maixcam2_tts_init_speed_unit);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_tts_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_tts_init'] = function (block) {
    maixLlmGuard();
    Blockly.Python.definitions_['maixcam2_import_tts'] = `from maix import nn as _maixNn
from maix import audio as _maixLlmAudio`;
    var speed = Number(block.getFieldValue('SPEED')) / 100;
    // 播放的取樣率要跟模型輸出的一致：melotts 出的是 44100 Hz。
    // 這台的編解碼器不吃 44100（只有 8k/16k/32k/48k），但 audio.Player 內部會轉，
    // 實測放得出來——這一點跟走 pyaudio 的喇叭積木不同，那邊得自己重採樣。
    Blockly.Python.definitions_['maixcam2_tts'] = `_MAIX_TTS_MODEL = "/root/models/melotts/melotts-zh.mud"


def _maixTtsInit(speed):
    global _maixTts, _maixTtsPlayer
    _maixLlmCheck(_MAIX_TTS_MODEL, "語音合成模型")
    _maixTts = _maixNn.MeloTTS(model=_MAIX_TTS_MODEL, speed=speed, language="zh")
    _maixTtsPlayer = _maixLlmAudio.Player(sample_rate=44100)
    _maixTtsPlayer.volume(80)


def _maixTtsSay(text):
    if not text:
        return
    _maixTtsPlayer.play(_maixTts.infer(str(text), output_pcm=True))
`;
    return `_maixTtsInit(${speed})\n`;
};


Blockly.Blocks['maixcam2_tts_say'] = {
    init: function () {
        this.appendValueInput("TEXT").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_tts_say);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_tts_say_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_tts_say'] = function (block) {
    var text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_ATOMIC) || '""';
    return `_maixTtsSay(${text})\n`;
};


// 上一代的「將文本內容轉化爲語音文件」會產出一個檔（訊飛雲端，存 .pcm）。
// 現有的「說出」是拿到 PCM 直接丟給播放器，不留檔。這塊補上「留檔」那條路。
Blockly.Blocks['maixcam2_tts_save'] = {
    init: function () {
        this.appendValueInput("TEXT").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_tts_save);
        this.appendValueInput("PATH").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_tts_save_to);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#8e6fd8");
        this.setTooltip(Blockly.Msg.maixcam2_tts_save_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_tts_save'] = function (block) {
    // 借初始化那塊的定義（_maixTts），回傳的那行丟掉不用。
    Blockly.Python['maixcam2_tts_init'](block);
    Blockly.Python.definitions_['maixcam2_import_tts_save'] = `import wave as _maixWave`;
    Blockly.Python.definitions_['maixcam2_tts_save'] = `def _maixTtsSave(text, path):
    if "_maixTts" not in globals():
        raise RuntimeError("要先放「初始化 MeloTTS 語音合成模型」那塊積木。")
    if not text:
        return
    _pcm = _maixTts.infer(str(text), output_pcm=True)
    # **存成 wav，不是裸 PCM。** 上一代存的是 .pcm，那種檔案誰都放不了；
    # wav 才能接「播放音訊檔案」那塊積木，兩塊積木就串得起來。
    # 格式是模型固定的：44100 Hz、單聲道、16 位元（官方文件寫死的）。
    with _maixWave.open(str(path), "wb") as _f:
        _f.setnchannels(1)
        _f.setsampwidth(2)
        _f.setframerate(44100)
        _f.writeframes(bytes(_pcm))
`;
    var text = Blockly.Python.valueToCode(block, 'TEXT', Blockly.Python.ORDER_ATOMIC) || '""';
    var path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC) || '""';
    return `_maixTtsSave(${text}, ${path})\n`;
};
