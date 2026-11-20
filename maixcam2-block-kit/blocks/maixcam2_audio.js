/*
 * 麥克風與喇叭分類的積木。
 *
 * 2026-08-17 從 ai.js 原樣搬過來，一個字都沒改（產碼零差異）。
 *
 * 這一整批**建立在 pyaudio ＋ wave 上**，那是 V831 時代的寫法。
 * pyaudio 0.2.14 在 pi2 上還裝著（實測），所以不見得跑不動——
 * 但 v4 有自己的 `maix.audio.Recorder`／`Player`，麥克風和喇叭硬體
 * 也都認得到（48 kHz 單聲道）。哪條路對要驗過才知道。
 */


/*
     _    ___   __  __ _                      _                      
    / \  |_ _| |  \/  (_) ___ _ __ ___  _ __ | |__   ___  _ __   ___ 
   / _ \  | |  | |\/| | |/ __| '__/ _ \| '_ \| '_ \ / _ \| '_ \ / _ \
  / ___ \ | |  | |  | | | (__| | | (_) | |_) | | | | (_) | | | |  __/
 /_/   \_\___| |_|  |_|_|\___|_|  \___/| .__/|_| |_|\___/|_| |_|\___|
                                       |_|                           
 */




Blockly.Blocks['ai_mphone_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/microphone_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_microphone_init);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.ai_mphone_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_mphone_init = function (block) {
    Blockly.Python.definitions_.import_all_mphone = "" +
        "from Maix import GPIO, I2S, FFT\n" +
        "from board import board_info\n" +
        "from fpioa_manager import fm\n" +
        "\n" +
        "sample_rate = 38640\n" +
        "sample_points = 1024\n" +
        "fft_points = 512\n" +
        "hist_x_num = 50\n" +
        "\n" +
        "fm.register(20,fm.fpioa.I2S0_IN_D0, force=True)\n" +
        "fm.register(19,fm.fpioa.I2S0_WS, force=True)\n" +
        "fm.register(18,fm.fpioa.I2S0_SCLK, force=True)\n" +
        "\n" +
        "_recorder_rx = I2S(I2S.DEVICE_0)\n" +
        "_recorder_rx.channel_config(_recorder_rx.CHANNEL_0, _recorder_rx.RECEIVER, align_mode = I2S.STANDARD_MODE)\n" +
        "_recorder_rx.set_sample_rate(sample_rate)\n" +
        "def _microphone_read_average(lst): \n" +
        "    return int((sum(lst)/len(lst))*100)\n" +
        "";

    // Blockly.Python.addVariable('sample_rate', "sample_rate = 38640", true);
    // Blockly.Python.addVariable('sample_points', "sample_points = 1024", true);
    // Blockly.Python.addVariable('fft_points', "fft_points = 512", true);
    // Blockly.Python.addVariable('hist_x_num', "hist_x_num = 50", true);
    // Blockly.Python.addVariable('_recorder_rx', "_recorder_rx = None", true);
    // Blockly.Python.addVariable('fft_res', "fft_res = None", true);
    // Blockly.Python.addVariable('fft_amp', "fft_amp = None", true);
    Blockly.Python.addVariable('read_all_channel', "read_all_channel = [0, 0, 0, 0, 0, 0, 0, 0]", true);
    // Blockly.Python.addVariable('_recorder_rx', "", true);

    var _code = "" +
        "";
    return _code;
}


Blockly.Blocks['ai_mphone_Record_audio_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/microphone_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_mphone_Record_audio_init);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.ai_mphone_Record_audio_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_mphone_Record_audio_init = function (block) {
    Blockly.Python.definitions_.import_ai_mphone_Record_audio_init = "" +
        "from Maix import GPIO, I2S\n" +
        "from fpioa_manager import fm\n" +
        'import audio\n' +
        "\n" +
        '# user setting\n' +
        "sample_rate = 16000\n" +
        "# default seting\n" +
        "sample_points = 2048\n" +
        "wav_ch = 2\n" +
        "\n" +
        'fm.register(8,  fm.fpioa.GPIO0, force=True)\n' +
        'wifi_en = GPIO(GPIO.GPIO0, GPIO.OUT)\n' +
        'wifi_en.value(0)\n' +
        "\n" +
        "fm.register(20,fm.fpioa.I2S0_IN_D0, force=True)\n" +
        "fm.register(19,fm.fpioa.I2S0_WS, force=True)\n" +
        "fm.register(18,fm.fpioa.I2S0_SCLK, force=True)\n" +
        "\n" +
        "rx = I2S(I2S.DEVICE_0)\n" +
        "rx.channel_config(rx.CHANNEL_0, rx.RECEIVER, align_mode=I2S.STANDARD_MODE)\n" +
        "rx.set_sample_rate(sample_rate)\n" +
        "print(rx)\n" +
        "";

    var _code = "" +
        "";
    return _code;
}

// 麥克風的共用輔助函式。**用到 micStride／micRead 的生成器都要先呼叫這個**——
// definitions_ 照插入順序輸出，先呼叫才能保證定義排在使用之前。
function maixMicReadDef() {
    Blockly.Python.definitions_['v831_mic_read'] = `import numpy as _micNp


MIC_STRIDE = 1


def micStride(stream, ch):
    """量這條串流是不是被補零升頻過，回傳 1 或 2。

    這台的擷取驅動把真正的資料**每隔一格插一組 0**——實測奇數格 100% 是 0，
    8k／16k／48k、單聲道立體聲都一樣，而且相位不會跑掉（連續 20 段都在同一邊）。

    後果有三個，全部指向同一個原因：
      取樣點數變兩倍  → 照拿到的數量寫檔頭，聲音會慢一半、低八度
      音量少 √2       → 一半的樣本是 0（實測 RMS 3.42 → 2.42）
      高頻嘶聲        → 補零在頻譜上緣產生一份鏡像

    所以開始之前先看一眼，是補零的就之後每一塊都只取偶數格。
    韌體修好了會量到 1，不必回來改。
    """
    stream.read(CHUNK, exception_on_overflow=False)          # 暖機
    _a = _micNp.frombuffer(stream.read(CHUNK * 4, exception_on_overflow=False),
                           dtype=_micNp.int16).reshape(-1, ch)
    if _micNp.all(_a[1::2] == 0):
        print("麥克風資料每隔一格是 0（驅動補零升頻），已自動略過")
        return 2
    return 1


def micRead(stream, ch, frames):
    """讀 frames 幀真正的資料，補零的部分不算在內。"""
    _a = _micNp.frombuffer(stream.read(frames * MIC_STRIDE, exception_on_overflow=False),
                           dtype=_micNp.int16)
    if MIC_STRIDE == 1:
        return _a.tobytes()
    return _a.reshape(-1, ch)[0::2].tobytes()
`
}

// 音量的共用定義。**「设置音量」和「播放」兩塊都要呼叫**——
// 前者設值、後者用值，用同一個 definitions_ key，誰先用誰插入，順序不會出問題。
function maixAudioVolumeDef() {
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_numpy_as_np'] = `import numpy as np`
    Blockly.Python.definitions_['v831_voice_volume'] = `VOICEVOLUME = 100
VOICE_MIXER_MAX = 54


def setSystemVolume(value):
    """設定播放音量 0～100。

    **混音器那兩顆是增益，不是音量。** \`RX LEFT/RIGHT ANA GAIN\` 的刻度寫得很明白：
    dBscale-min=0.00dB、step=0.50dB、mute=0——最小值 0 等於「原音量」而不是靜音，
    最大值 54 等於 +27 dB。也就是它只能往上加，降不下來：積木填 0，音樂照樣大聲。
    （2026-08-18 實測，填 20 跟填 100 聽起來差不多就是這個原因。）

    所以混音器固定開到最大，真正的音量在 voiceVolume() 裡乘進波形。
    這樣 0 才是真的靜音，而且不依賴特定板子的控制項名字。
    """
    global VOICEVOLUME
    VOICEVOLUME = 0 if value < 0 else (100 if value > 100 else int(value))
    for _side in ("RX LEFT ANA GAIN", "RX RIGHT ANA GAIN"):
        os.system("amixer -q cset name='" + _side + "' " + str(VOICE_MIXER_MAX))


def voiceVolume(data):
    # 平方是為了聽感：線性乘的話填 50 只小 6 dB，聽起來幾乎沒變；
    # 平方之後 50 是 -12 dB、25 是 -24 dB，轉起來才像音量鈕。
    if VOICEVOLUME >= 100 or not data:
        return data
    if VOICEVOLUME <= 0:
        return b"\\x00" * len(data)
    return (np.frombuffer(data, dtype=np.int16)
            * (VOICEVOLUME / 100.0) ** 2).astype(np.int16).tobytes()
`
}

Blockly.Blocks['ai_mphone_record_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_microphone_init);
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.ai_microphone_init);
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_mphone_record_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_pyaudio'] = `import pyaudio`
    Blockly.Python.definitions_['v831_import_wave'] = `import wave`
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    let code = ''
    return code;
}

Blockly.Blocks['ai_mphone_record_setting'] = {
    init: function () {

        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_mphone_Record_audio_start_path);
        this.appendValueInput("record_time").setCheck(null)
            .appendField(Blockly.Msg.ai_mphone_Record_audio_start_time)
        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.ai_microphone_init);
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_mphone_record_setting'] = function (block) {

    var value_path = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    var record_time = Blockly.Python.valueToCode(block, 'record_time', Blockly.Python.ORDER_ATOMIC);
    let code = `if(os.path.exists(${value_path})):
    os.system("rm ${value_path.slice(1, value_path.length - 1)}")
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = ${Number(record_time) + 1}
WAVE_OUTPUT_FILENAME = ${value_path}
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,channels=CHANNELS,rate=RATE,input=True,frames_per_buffer=CHUNK)
`
    return code;
}

Blockly.Blocks['ai_mphone_Record_audio_start'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_mphone_Record_audio_start);

        this.setPreviousStatement(true);
        this.setNextStatement(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.ai_mphone_Record_audio_start_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_mphone_Record_audio_start'] = function (block) {
    // **這台的擷取裝置跑在要求值的兩倍。** 不是 pyaudio 的問題——ALSA 自己的
    // `arecord -D hw:0,0 -r 16000 -d 3` 只花 1.56 秒就結束，48000 也一樣是 2 倍。
    //
    // 照要求值寫進 wav 檔頭的話：錄 4 秒只錄到 2 秒的聲音，檔頭卻寫 4 秒份，
    // 放出來慢一半、低八度（2026-08-18 驗 C3 聽出來的）。
    //
    // 所以開始錄之前先量一次真實速率，用量到的值決定要讀幾塊、也用它寫檔頭。
    // snap 到最近的標準值是為了不讓量測誤差寫出 31987 Hz 這種檔頭。
    // 韌體哪天修好了，這段自己會量到 1 倍，不必回來改。
    maixMicReadDef();
    var code = `
print("* recording")

MIC_STRIDE = micStride(stream, CHANNELS)
frames = []

for i in range(0, int(RATE / CHUNK * RECORD_SECONDS)):
    frames.append(micRead(stream, CHANNELS, CHUNK))

print("* done recording")

stream.stop_stream()
stream.close()
p.terminate()

wf = wave.open(WAVE_OUTPUT_FILENAME, "wb")
wf.setnchannels(CHANNELS)
wf.setsampwidth(p.get_sample_size(FORMAT))
wf.setframerate(RATE)
wf.writeframes(b"".join(frames))
wf.close()
`;
    return code;
};


Blockly.Blocks['ai_mphone_Record_audio_sound_loudness_analysis'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.get_sound_loudness_value);

        // this.setPreviousStatement(true);
        // this.setNextStatement(true, null);
        this.setOutput(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.get_sound_loudness_value);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_mphone_Record_audio_sound_loudness_analysis'] = function (block) {
    Blockly.Python.definitions_['v831_import_numpy_as_np'] = `import numpy as np`
    // **音量分析和頻譜分析共用同一條麥克風串流。**
    // 原本兩塊各自宣告一組 `CHUNK/FORMAT/CHANNELS/RATE/p/stream`，key 不同、
    // 內容衝突（一個單聲道一個立體聲），同一個專案裡兩塊都放的話，
    // 後產生的那組會蓋掉前一組——誰贏取決於積木在盤面上的先後，很難查。
    // 改成同一個 definitions_ key、同一份內容，就沒有順序問題了。
    //
    // 取樣率 16000：語音的標準值，八段 FFT 各 1 kHz，涵蓋 0～8 kHz——
    // 母音落在 1～4 段、氣音落在 5～8 段，分得開。
    // （44100 這台開不起來，22050 也是——`OSError -9999`。那是 V831 的殘留。）
    //
    // 開完串流馬上量一次 MIC_STRIDE：驅動會補零升頻，之後每次讀都要把補進去的
    // 0 丟掉，否則頻譜上緣會多一份鏡像、音量也少 √2（詳見 micStride 的說明）。
    maixMicReadDef();
    Blockly.Python.definitions_['v831_mic_stream_init'] = `CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 2
RATE = 16000
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)
MIC_STRIDE = micStride(stream, CHANNELS)
`
    Blockly.Python.addFunction("get_sound_loudness", `def get_sound_loudness():
    global CHUNK,stream
    stream.start_stream()
    str_data = micRead(stream, CHANNELS, CHUNK)   # 从麦克风获取一帧音频数据（已丢掉补零）
    stream.stop_stream()
    # 将音频数据转换为NumPy数组
    arr = np.frombuffer(str_data, dtype=np.int16)
    # 计算音频数据的绝对值之和，即为声音强度
    # 1024个16位的wav采样点(-32768~32767)的绝对值之和，需要将其映射到0~1023
    # 串流是立體聲，樣本數是單聲道的兩倍——除回去，刻度才跟舊機一樣
    intensity = int(np.abs(arr).sum() / 32768 / CHANNELS)
    return intensity
`)
    var code = `get_sound_loudness()`;
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['mphone_audio_spectrum_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_audio_spectrum.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_microphone_start_spectrum_analyze);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.mphone_audio_spectrum_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['mphone_audio_spectrum_init'] = function (block) {
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_numpy_as_np'] = `import numpy as np`
    // **音量分析和頻譜分析共用同一條麥克風串流。**
    // 原本兩塊各自宣告一組 `CHUNK/FORMAT/CHANNELS/RATE/p/stream`，key 不同、
    // 內容衝突（一個單聲道一個立體聲），同一個專案裡兩塊都放的話，
    // 後產生的那組會蓋掉前一組——誰贏取決於積木在盤面上的先後，很難查。
    // 改成同一個 definitions_ key、同一份內容，就沒有順序問題了。
    //
    // 取樣率 16000：語音的標準值，八段 FFT 各 1 kHz，涵蓋 0～8 kHz——
    // 母音落在 1～4 段、氣音落在 5～8 段，分得開。
    // （44100 這台開不起來，22050 也是——`OSError -9999`。那是 V831 的殘留。）
    //
    // 開完串流馬上量一次 MIC_STRIDE：驅動會補零升頻，之後每次讀都要把補進去的
    // 0 丟掉，否則頻譜上緣會多一份鏡像、音量也少 √2（詳見 micStride 的說明）。
    maixMicReadDef();
    Blockly.Python.definitions_['v831_mic_stream_init'] = `CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 2
RATE = 16000
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK)
MIC_STRIDE = micStride(stream, CHANNELS)
`
    Blockly.Python.addFunction("get_frequency_analysis", `def get_frequency_analysis():
    global CHUNK,stream
    stream.start_stream()
    str_data = micRead(stream, CHANNELS, CHUNK)   # 从麦克风获取一帧音频数据（已丢掉补零）
    stream.stop_stream()
    # 将音频数据转换为NumPy数组
    arr = np.frombuffer(str_data, dtype=np.int16)    
    arr.shape = -1,2
    # 将数组转置
    arr = arr.T
    f_signal = np.fft.fft(arr[0])
    fft_data = f_signal[:512]
    fft_data = np.split(fft_data, 8)
    avg_data = np.abs(fft_data).mean(axis=1)
    return avg_data
`)
    var code = `FEEQUENCYANALYSISVALUE = get_frequency_analysis().tolist()\n`;
    return code;
};

Blockly.Blocks['ai_mphone_read_sound_sensitivity'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_microphone_get_spectrum_analyze_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_1, "0"],
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_2, "1"],
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_3, "2"],
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_4, "3"],
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_5, "4"],
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_6, "5"],
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_7, "6"],
                [Blockly.Msg.ai_microphone_get_spectrum_analyze_result_8, "7"]
            ]), "level");
        this.setOutput(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.ai_mphone_read_sound_sensitivity_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_mphone_read_sound_sensitivity'] = function (block) {
    var dropdown_level = block.getFieldValue('level');
    // TODO: Assemble Python into code variable.

    var code = `int(FEEQUENCYANALYSISVALUE[${dropdown_level}]/500)`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_audio_start_recording'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_play_music_file);
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_file_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.ai_audio_stop_recording_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_audio_start_recording'] = function (block) {
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_pyaudio'] = `import pyaudio`
    Blockly.Python.definitions_['v831_import_wave'] = `import wave`
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    var code = `
CHUNK = 1024
wf = wave.open(r"test.wav", "rb")#(sys.argv[1], "rb"
p = pyaudio.PyAudio()
    
stream = p.open(format=p.get_format_from_width(wf.getsampwidth()),
                channels=wf.getnchannels(),
                rate=wf.getframerate(),
                output=True)
    
data = wf.readframes(CHUNK)
    
while len(data) > 0:
    stream.write(data)
    data = wf.readframes(CHUNK)
    
stream.stop_stream()
stream.close()
    
p.terminate()
`;
    return code;
};

/*
     _    ___      _             _ _       
    / \  |_ _|    / \  _   _  __| (_) ___  
   / _ \  | |    / _ \| | | |/ _` | |/ _ \ 
  / ___ \ | |   / ___ \ |_| | (_| | | (_) |
 /_/   \_\___| /_/   \_\__,_|\__,_|_|\___/
*/

Blockly.Blocks['ai_audio_play_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.AUDIO_S);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#603ea0");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_audio_play_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_pyaudio'] = `import pyaudio`
    Blockly.Python.definitions_['v831_import_wave'] = `import wave`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.addVariable("VOICESTATE", "VOICESTATE = 0", true)
    Blockly.Python.addVariable("VOICEDATA", "", true)
    Blockly.Python.addVariable("VOICESTREAM", 'VOICESTREAM = ""', true)
    Blockly.Python.addVariable("VOICEPYAUDIO", "VOICEPYAUDIO = pyaudio.PyAudio()", true)
    Blockly.Python.addVariable("CHUNK", "CHUNK = 1024", true)
    Blockly.Python.addVariable("VOICEPPATH", "", true)
    Blockly.Python.addVariable("VOICEPLAYSTATE", 'VOICEPLAYSTATE = True', true)
    Blockly.Python.addVariable("VOICEWF", 'VOICEWF = ""', true)
    var _code = ``;

    return _code;
};

Blockly.Blocks['ai_audio_play_volume'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_vol)
            .appendField(new Blockly.FieldNumber(25, 0, 100), "play_vol")
            .appendField("(0~100)");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#603ea0");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_audio_play_volume'] = function (block) {
    var number_play_vol = block.getFieldValue('play_vol');
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    // 舊碼下的是 `numid=8,iface=MIXER,name="LINEOUT volume"`（V831 的，0～31），
    // 而這台 numid=8 是 `ALC GATE THRESHOLD`——麥克風的噪音閘門。
    // 也就是說調「喇叭音量」實際上在動麥克風。
    //
    // 這台的輸出增益是 `RX LEFT/RIGHT ANA GAIN`，但那顆**只能往上加、降不下來**
    // （最小值＝0 dB＝原音量，不是靜音），所以音量改在軟體做，見 setSystemVolume。
    maixAudioVolumeDef();
    return `setSystemVolume(${number_play_vol})\n`;
};

Blockly.Blocks['ai_audio_play_song'] = {
    init: function () {
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_file_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#603ea0");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_audio_play_song'] = function (block) {
    var value_name = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    // Blockly.Python.addVariable("VOICEPPATH","",false)
    var _code = `VOICEPLAYSTATE = True
VOICEPPATH = ${value_name}
`;

    return _code;
};

Blockly.Blocks['ai_audio_play_start'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_start_play);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#603ea0");
        this.setTooltip(Blockly.Msg.ai_audio_start_play);
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_audio_play_start'] = function (block) {
    // **這台只吃 8k／16k／32k／48k。** 舊碼照 wav 檔自己的取樣率開串流
    // （`rate=VOICEWF.getframerate()`），碰到最常見的 44.1k 就是
    // `OSError: [Errno -9999]`——等於大部分音樂檔都放不出來。
    //
    // 選擇：不換成 `maix.audio.Player`（它 44.1k 播得動），因為它的 `play()`
    // 是阻塞的（1 秒的檔卡 933 ms），而這組積木的設計是「迴圈裡餵一小塊、
    // 隨時能問播完沒」。換過去等於把非阻塞這個特性丟掉。
    //
    // 所以留著 pyaudio，開檔時判斷取樣率，不支援就用 48000 開串流，
    // 每一塊在寫出去之前線性內插。實測 44.1k 立體聲 1 秒的檔轉完 42 ms。
    maixAudioVolumeDef();
    Blockly.Python.definitions_["VoicePlayState"] = `VOICE_HW_RATES = (8000, 16000, 32000, 48000)
VOICERESAMPLE = None


def voiceResample(data):
    # VOICERESAMPLE 是 None 表示這個檔的取樣率硬體本來就收，原封不動送出去。
    global VOICERESAMPLE, VOICEWF
    if VOICERESAMPLE is None or not data:
        return data
    src, dst = VOICERESAMPLE
    ch = VOICEWF.getnchannels()
    a = np.frombuffer(data, dtype=np.int16).reshape(-1, ch)
    m = max(1, round(len(a) * dst / src))
    idx = np.arange(m) * (len(a) - 1) / max(m - 1, 1)
    lo = idx.astype(np.int32)
    hi = np.minimum(lo + 1, len(a) - 1)
    f = (idx - lo)[:, None]
    return (a[lo] * (1 - f) + a[hi] * f).astype(np.int16).tobytes()


def VoicePlayState():
    global VOICESTATE,VOICEDATA,CHUNK,VOICESTREAM,VOICEPYAUDIO,VOICEWF,VOICEPPATH,VOICERESAMPLE
    if VOICESTATE == 0:
        VOICEWF = wave.open(VOICEPPATH, "rb")
        _rate = VOICEWF.getframerate()
        # 16 bit 以外的位元深度不做內插（np.int16 會解錯），照原樣送，
        # 硬體收不了的話讓它報錯，不要偷偷放出雜音。
        if _rate in VOICE_HW_RATES or VOICEWF.getsampwidth() != 2:
            VOICERESAMPLE = None
            _out = _rate
        else:
            VOICERESAMPLE = (_rate, 48000)
            _out = 48000
            print("音檔是 %d Hz，這台只收 %s，播放時轉成 48000 Hz" % (_rate, VOICE_HW_RATES))
        VOICEPYAUDIO = pyaudio.PyAudio()
        VOICESTREAM = VOICEPYAUDIO.open(format=VOICEPYAUDIO.get_format_from_width(VOICEWF.getsampwidth()),channels=VOICEWF.getnchannels(),rate=_out,output=True)
        VOICEDATA = VOICEWF.readframes(CHUNK)
        VOICESTATE = 1
        return True
    else:
        if len(VOICEDATA) > 0:
            try:
                VOICESTREAM.write(voiceVolume(voiceResample(VOICEDATA)))
                VOICEDATA = VOICEWF.readframes(CHUNK)
                return True
            except:
                VOICESTATE = 0
        else:
            VOICESTREAM.stop_stream()
            VOICESTREAM.close()
            VOICEPYAUDIO.terminate()
            VOICESTATE = 0
            return False
`
    let code = `VOICEPLAYSTATE = VoicePlayState()
`
    return code;

}
Blockly.Blocks['ai_audio_play_finish'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_end_play);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#603ea0");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_audio_play_finish'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = `try:
    VOICESTREAM.stop_stream()
    VOICESTREAM.close()
    VOICEPYAUDIO.terminate()
    VOICESTATE = 0
except:
    pass
`;
    return code;
};

Blockly.Blocks['ai_audio_get_play_status'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_get_play_status);
        this.setOutput(true, null);
        this.setColour("#603ea0");
        this.setTooltip(Blockly.Msg.ai_audio_play_state_speaker_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_audio_get_play_status'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'VOICEPLAYSTATE';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_audio_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/speaker_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.Text_to_speech_initialization); //
        this.appendValueInput("A")
            .setCheck(null)
            .appendField('APP ID');
        this.appendValueInput("B")
            .setCheck(null)
            .appendField('API Secret');
        this.appendValueInput("C")
            .setCheck(null)
            .appendField('API Key');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.Text_to_speech_initialization);
        this.setHelpUrl("");
    }
};

// 在线文本转语音初始化
Blockly.Python.ai_audio_init = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['v831_import_wave'] = `import wave`
    Blockly.Python.definitions_['v831_import_urlencode'] = `from urllib.parse import urlencode`
    Blockly.Python.definitions_['v831_import_format_date_time'] = `from wsgiref.handlers import format_date_time`
    Blockly.Python.definitions_['v831_import_from_time_mktime'] = `from time import mktime`
    Blockly.Python.definitions_['v831_import_datetime_datetime'] = `from datetime import datetime`
    // Blockly.Python.definitions_['v831_import_datetime'] = `import datetime`
    Blockly.Python.definitions_['v831_import_websocket'] = `import websocket`
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_hmac'] = `import hmac`
    Blockly.Python.definitions_['v831_import_ssl'] = `import ssl`
    Blockly.Python.definitions_['v831_import_thread_as_thread'] = `import _thread as thread`
    Blockly.Python.definitions_.ai_audio_init_function = ` 
STATUS_FIRST_FRAME = 0  # 第一帧的标识
STATUS_CONTINUE_FRAME = 1  # 中间帧标识
STATUS_LAST_FRAME = 2  # 最后一帧的标识
class Ws_Param_Audio(object):
    # 初始化
    def __init__(self, APPID, APIKey, APISecret, Text):
        self.APPID = APPID
        self.APIKey = APIKey
        self.APISecret = APISecret
        self.Text = Text
    
        # 公共参数(common)
        self.CommonArgs = {"app_id": self.APPID}
        # 业务参数(business)，更多个性化参数可在官网查看
        self.BusinessArgs = {"aue": "raw", "auf": "audio/L16;rate=16000", "vcn": "xiaoyan", "tte": "utf8"}
        self.Data = {"status": 2, "text": str(base64.b64encode(self.Text.encode("utf-8")), "UTF8")}
        #使用小语种须使用以下方式，此处的unicode指的是 utf16小端的编码方式，即"UTF-16LE"”
        #self.Data = {"status": 2, "text": str(base64.b64encode(self.Text.encode('utf-16')), "UTF8")}
    
    # 生成url
    def create_url(self):
        url = "wss://tts-api.xfyun.cn/v2/tts"
        # 生成RFC1123格式的时间戳
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))
    
        # 拼接字符串
        signature_origin = "host: " + "ws-api.xfyun.cn" + "\\n"
        signature_origin += "date: " + date + "\\n"
        signature_origin += "GET " + "/v2/tts " + "HTTP/1.1"
        # 进行hmac-sha256进行加密
        signature_sha = hmac.new(self.APISecret.encode("utf-8"), signature_origin.encode("utf-8"),digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding="utf-8")
    
        authorization_origin = "api_key=\\"%s\\", algorithm=\\"%s\\", headers=\\"%s\\", signature=\\"%s\\"" % (self.APIKey, "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(encoding="utf-8")
        # 将请求的鉴权参数组合为字典
        v = {
            "authorization": authorization,
            "date": date,
            "host": "ws-api.xfyun.cn"
        }
        # 拼接鉴权参数，生成url
        url = url + "?" + urlencode(v)
        # print("date: ",date)
        # print("v: ",v)
        # 此处打印出建立连接时候的url,参考本demo的时候可取消上方打印的注释，比对相同参数时生成的url与自己代码生成的url是否一致
        # print('websocket url :', url)
        return url
APPId_Audio = ${APPId}
APISecret_Audio = ${APISecret}
APIKey_Audio = ${APIKey}
`;
    var _code = "";
    return _code;
}


Blockly.Blocks['ai_audio_play_state'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.text_conversion_voice); //
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.Content_of_text); //
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.Voice_path); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.text_conversion_voice);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_audio_play_state'] = function (block) {
    // TODO: Assemble Python into code variable.
    let text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC)
    let url = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC)
    let path = `${url.slice(1, url.length - 1)}`
    Blockly.Python.definitions_.on_message = `
def on_message(ws, message):
    try:
        message =json.loads(message)
        code = message["code"]
        sid = message["sid"]
        audio = message["data"]["audio"]
        audio = base64.b64decode(audio)
        status = message["data"]["status"]
        #print(message)
        if status == 2:
            print("ws is closed")
            ws.close()
        if code != 0:
            errMsg = message["message"]
            print("sid:%s call error:%s code is:%s" % (sid, errMsg, code))
        else:
            pcm_path = "${path}"
            with open(pcm_path, "ab") as f:
                f.write(audio)
                print("tts")
            
            with open(pcm_path, "rb") as pcmfile:
                pcmdata = pcmfile.read()
            with wave.open(pcm_path + ".wav", "wb") as wavfile:
                wavfile.setparams((1, 2, 16000, 0, "NONE", "NONE"))
                wavfile.writeframes(pcmdata)
    
    except Exception as e:
        print("receive msg,but parse exception:", e)
        
# 收到websocket错误的处理
def on_error(ws, error):
    print("### error:", error)
# 收到websocket关闭的处理
def on_close(ws):
    print("### closed ###")
    
# 收到websocket连接建立的处理
def on_open(ws):
    def run(*args):
        global wsParam_Audio
        d = {"common": wsParam_Audio.CommonArgs,"business": wsParam_Audio.BusinessArgs,"data": wsParam_Audio.Data,}
        d = json.dumps(d)
        print("------>开始发送文本数据")
        ws.send(d)
        if os.path.exists(${url}):
            os.remove(${url})
    
    thread.start_new_thread(run, ())
`
    Blockly.Python.addVariable('wsParam_Audio', 'wsParam_Audio = ""', true);
    let code = `if __name__ == "__main__":
    #with open('word.txt', 'r',encoding="UTF-8")as f:#txt= f.read()
    txt_Audio=${text}
    if os.path.exists(${url}):
        os.remove(${url})
    # 测试时候在此处正确填写相关信息即可运行
    wsParam_Audio = Ws_Param_Audio(APPID=APPId_Audio, APISecret=APISecret_Audio,APIKey=APIKey_Audio,Text=txt_Audio)
    websocket.enableTrace(False)
    wsUrl = wsParam_Audio.create_url()
    ws = websocket.WebSocketApp(wsUrl, on_message=on_message, on_error=on_error, on_close=on_close)
    ws.on_open = on_open
    ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
`
    // TODO: Change ORDER_NONE to the correct strength.
    return code
};

Blockly.Blocks['ai_audio_set'] = {
    init: function () {
        this.appendValueInput("Num")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_set_music_vol);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#603ea0");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_audio_set = function (block) {
    var _num = Blockly.Python.valueToCode(block, 'Num', Blockly.Python.ORDER_ATOMIC);
    var _code = "_player.volume(" + _num + ")\n"
    return _code;
}

/*
             _      ___     ____                   _             
            / \    |_ _|   / ___| _ __   ___  __ _| | _____ _ __ 
           / _ \    | |    \___ \| '_ \ / _ \/ _` | |/ / _ \ '__|
          / ___ \ _ | | _   ___) | |_) |  __/ (_| |   <  __/ |   
         /_/   \_(_)___(_) |____/| .__/ \___|\__,_|_|\_\___|_|   
                                 |_|                            
*/


Blockly.Blocks['ai_audio_init_speaker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/speaker_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_init);
        this.setColour("#5f7fc1");
        this.setTooltip(Blockly.Msg.ai_audio_init_speaker_TOOLTIP);
        this.setHelpUrl("");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
    }
};

Blockly.Python.ai_audio_init_speaker = function (block) {
    Blockly.Python.definitions_.import_Maix = "from Maix import I2S, GPIO";
    Blockly.Python.definitions_.import_fpioa_manager = "from fpioa_manager import *";
    Blockly.Python.definitions_.import_audio = "import audio";

    var _code = "";
    return _code;
}

Blockly.Blocks['ai_audio_play_song_speaker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_play_music_file);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_audio_play_music_file_set_vol)
        //     .appendField(new Blockly.FieldNumber(95, 0, 100, 1), "play_vol");
        this.appendValueInput("volume")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_vol);
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_file_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5f7fc1");
        this.setTooltip(Blockly.Msg.ai_audio_play_song_speaker_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_audio_play_song_speaker'] = function (block) {
    // var number_play_vol = block.getFieldValue('play_vol');
    var number_play_vol = Blockly.Python.valueToCode(block, 'volume', Blockly.Python.ORDER_ATOMIC);
    var value_name = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    var _in = "" +
        "_audio_rx = I2S(I2S.DEVICE_1)\n" +
        "\n" +
        "def _speaker_play_song(path, volume):\n" +
        "    global _audio_play_state,_player\n" +
        "    _player = audio.Audio(path = path)\n" +
        "    _player.volume(volume)\n" +
        "    try:\n" +
        "        _wav_info = _player.play_process(_audio_rx)\n" +
        "        _audio_rx.channel_config(_audio_rx.CHANNEL_1, I2S.TRANSMITTER, resolution = I2S.RESOLUTION_16_BIT, align_mode = I2S.STANDARD_MODE)\n" +
        "        _audio_rx.set_sample_rate(_wav_info[1])\n" +
        "        _audio_play_state = 0\n" +
        "\n" +
        "        fm.register(34,fm.fpioa.I2S1_OUT_D1)\n" +
        "        fm.register(35,fm.fpioa.I2S1_SCLK)\n" +
        "        fm.register(33,fm.fpioa.I2S1_WS)\n" +
        "\n" +
        "        while True:\n" +
        "            _audio_play_state = _player.play()\n" +
        "            if (_audio_play_state) == True:\n" +
        "                print(\"Playing.\")\n" +
        "            elif (_audio_play_state) == False:\n" +
        "                print(\"Done.\")\n" +
        "                break\n" +
        "\n" +
        "    except:\n" +
        "        pass\n" +
        "\n";
    // Blockly.Python.definitions_.import_audio = _in;
    Blockly.Python.addVariable('_audio_play_state', _in, true);
    // Blockly.Python.addSetup("ai_audio_read", _in);
    var _code = "_speaker_play_song(path=" + value_name + ", volume=" + number_play_vol + ")\n";
    return _code;
};



Blockly.Blocks['ai_audio_play_finish_speaker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_end_play);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5f7fc1");
        this.setTooltip(Blockly.Msg.ai_audio_play_finish_speaker_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_audio_play_finish_speaker'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = '_player.finish()\n';
    return code;
};



Blockly.Blocks['ai_audio_set_speaker'] = {
    init: function () {
        this.appendValueInput("Num")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_set_music_vol);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5f7fc1");
        this.setTooltip(Blockly.Msg.ai_audio_set_speaker_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_audio_set_speaker = function (block) {
    var _num = Blockly.Python.valueToCode(block, 'Num', Blockly.Python.ORDER_ATOMIC);
    var _code = "_player.volume(" + _num + ")\n"
    return _code;
}

Blockly.Blocks['ai_audio_files_list'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_files_list);
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_files_list_set_file_path);
        this.setOutput(true, null);
        this.setColour("#5f7fc1");
        this.setTooltip(Blockly.Msg.ai_audio_files_list_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_audio_files_list = function (block) {
    var value_name = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);

    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_.import_ai_audio_files_list = '' +
        'def getRawFileList(path):\n' +
        '    files = []\n' +
        '    for f in os.listdir(path):\n' +
        '        if (not f.endswith("~") or not f == "") and f.split(".")[1] == "wav":\n' +
        '            files.append(path + "/" + f)\n' +
        '    return files\n' +
        '\n';

    var code = 'getRawFileList(' + value_name + ')';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_audio_play_song_list_loop_speaker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_play_music_file_list_loop);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_audio_play_music_file_set_vol)
        //     .appendField(new Blockly.FieldNumber(95, 0, 100, 1), "play_vol");
        this.appendValueInput("volume")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_vol);
        // this.appendValueInput("path")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_audio_play_music_file_set_file_path);
        this.appendValueInput("my_list")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_files_list);
        this.appendValueInput("firstIndex")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_first_index);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5f7fc1");
        this.setTooltip(Blockly.Msg.ai_audio_play_song_speaker_list_loop_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_audio_play_song_list_loop_speaker'] = function (block) {
    // var number_play_vol = block.getFieldValue('play_vol');
    var number_play_vol = Blockly.Python.valueToCode(block, 'volume', Blockly.Python.ORDER_ATOMIC);
    // var value_name = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    var my_list = Blockly.Python.valueToCode(block, 'my_list', Blockly.Python.ORDER_ATOMIC);
    var firstIndex = Blockly.Python.valueToCode(block, 'firstIndex', Blockly.Python.ORDER_ATOMIC);
    var _in = "" +
        "_audio_rx = I2S(I2S.DEVICE_1)\n" +
        "direction = 0\n" +
        "firstIndex = " + firstIndex + "\n" +
        "\n" +
        "# 上一首\n" +
        "def previous_song(index,my_list):\n" +
        "    global direction\n" +
        "    index = index - 1\n" +
        "    direction = 1\n" +
        "    if index == -1:\n" +
        "        index = len(my_list) - 1\n" +
        "    return index\n" +
        "\n" +
        "# 切换上一首\n" +
        "def change_previous_song(index):\n" +
        "    global _audio_play_state,direction,firstIndex,_player\n" +
        "    _player.finish()\n" +
        "    _audio_play_state = 0\n" +
        "    firstIndex = index\n" +
        "    direction = 1\n" +
        "\n" +
        "# 下一首\n" +
        "def next_song(index,my_list):\n" +
        "    global direction\n" +
        "    index = index + 1\n" +
        "    direction = 2\n" +
        "    if index == len(my_list):\n" +
        "        index = 0\n" +
        "    return index\n" +
        "\n" +
        "# 切换下一首\n" +
        "def change_next_song(index):\n" +
        "    global _audio_play_state,direction,firstIndex,_player\n" +
        "    _player.finish()\n" +
        "    _audio_play_state = 0\n" +
        "    firstIndex = index\n" +
        "    direction = 2\n" +
        "\n" +
        "def _speaker_play_song_list_loop(volume, my_list):\n" +
        "    global _audio_play_state,_player,firstIndex,play_again,direction\n" +
        "    _player = audio.Audio(path = my_list[firstIndex])\n" +
        "    _player.volume(volume)\n" +
        "    try:\n" +
        // "        firstIndex = index\n" +
        "        _wav_info = _player.play_process(_audio_rx)\n" +
        "        _audio_rx.channel_config(_audio_rx.CHANNEL_1, I2S.TRANSMITTER, resolution = I2S.RESOLUTION_16_BIT, align_mode = I2S.STANDARD_MODE)\n" +
        "        _audio_rx.set_sample_rate(_wav_info[1])\n" +
        "        _audio_play_state = 0\n" +
        "\n" +
        "        fm.register(34,fm.fpioa.I2S1_OUT_D1)\n" +
        "        fm.register(35,fm.fpioa.I2S1_SCLK)\n" +
        "        fm.register(33,fm.fpioa.I2S1_WS)\n" +
        "\n" +
        "        button_a_state = False\n" +
        "        button_b_state = False\n" +
        "        while True:\n" +
        "            _audio_play_state = _player.play()\n" +
        "            if (_audio_play_state) == True:\n" +
        "                #print(\"Playing.\")\n" +
        "                if (_gp_side_a.value() == 1) and button_a_state == False:\n" +
        "                    index = previous_song(firstIndex,my_list)\n" +
        "                    button_a_state = True\n" +
        "                elif (_gp_side_a.value() == 0) and button_a_state == True:\n" +
        "                    button_a_state = False\n" +
        "                    change_previous_song(index)\n" +
        "                    break\n" +
        "                if (_gp_side_b.value() == 1) and button_b_state == False:\n" +
        "                    index = next_song(firstIndex,my_list)\n" +
        "                    button_b_state = True\n" +
        "                elif (_gp_side_b.value() == 0) and button_b_state == True:\n" +
        "                    button_b_state = False\n" +
        "                    change_next_song(index)\n" +
        "                    break\n" +
        "\n" +
        "            elif (_audio_play_state) == False:\n" +
        "                #print(\"Done.\")\n" +
        "                index = firstIndex + 1\n" +
        "                if index == len(my_list):\n" +
        "                     index = 0\n" +
        "                firstIndex = index\n" +
        "                break\n" +
        "\n" +
        "    except:\n" +
        "        play_again = True\n" +
        "        if direction == 0:\n" +
        "            direction = 3\n" +
        "        return\n" +
        "\n";
    // Blockly.Python.definitions_.import_audio = _in;
    Blockly.Python.addVariable('_audio_play_list_loop_state', _in, true);
    Blockly.Python.definitions_['import_define_x_ai_button'] = '' +
        'from fpioa_manager import *\n' +
        'from Maix import FPIOA, GPIO\n' +
        '\n' +
        '_gp_side_buttons = [9, 10, 11]\n' +
        '\n' +
        'FPIOA().set_function(_gp_side_buttons[0],FPIOA.GPIO0)\n' +
        'FPIOA().set_function(_gp_side_buttons[1],FPIOA.GPIO1)\n' +
        'FPIOA().set_function(_gp_side_buttons[2],FPIOA.GPIO2)\n' +
        '\n' +
        '_gp_side_a = GPIO(GPIO.GPIO0,GPIO.IN,GPIO.PULL_UP)\n' +
        '_gp_side_b = GPIO(GPIO.GPIO1,GPIO.IN,GPIO.PULL_UP)\n' +
        '_gp_side_c = GPIO(GPIO.GPIO2,GPIO.IN,GPIO.PULL_UP)\n' +
        '\n';
    // Blockly.Python.addSetup("ai_audio_read", _in);
    var _code = "_speaker_play_song_list_loop(volume=" + number_play_vol + ", my_list=" + my_list + ")\n";
    return _code;
};

Blockly.Blocks['ai_audio_play_song_list_random_speaker'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_audio_play_music_file_list_random);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_audio_play_music_file_set_vol)
        //     .appendField(new Blockly.FieldNumber(95, 0, 100, 1), "play_vol");
        this.appendValueInput("volume")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_vol);
        // this.appendValueInput("path")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_audio_play_music_file_set_file_path);
        this.appendValueInput("my_list")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_files_list);
        this.appendValueInput("firstIndex")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_audio_play_music_file_set_first_index);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5f7fc1");
        this.setTooltip(Blockly.Msg.ai_audio_play_music_file_list_random_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_audio_play_song_list_random_speaker'] = function (block) {
    // var number_play_vol = block.getFieldValue('play_vol');
    var number_play_vol = Blockly.Python.valueToCode(block, 'volume', Blockly.Python.ORDER_ATOMIC);
    // var value_name = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    var my_list = Blockly.Python.valueToCode(block, 'my_list', Blockly.Python.ORDER_ATOMIC);
    var firstIndex = Blockly.Python.valueToCode(block, 'firstIndex', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_random'] = `import random`
    var _in = "" +
        "random.seed(time.ticks_cpu())\n" +
        "\n" +
        "_audio_rx = I2S(I2S.DEVICE_1)\n" +
        "firstIndex = " + firstIndex + "\n" +
        "\n" +
        "# 随机一首\n" +
        "def random_song(index,my_list):\n" +
        "    index = random.randrange(0, len(my_list), 1)\n" +
        "    return index\n" +
        "\n" +
        "# 切换歌曲\n" +
        "def change_random_song(index):\n" +
        "    global _audio_play_state,firstIndex,_player\n" +
        "    _player.finish()\n" +
        "    _audio_play_state = 0\n" +
        "    firstIndex = index\n" +
        "\n" +
        "def _speaker_play_song_list_random(volume, my_list):\n" +
        "    global _audio_play_state,_player,firstIndex,play_again\n" +
        "    _player = audio.Audio(path = my_list[firstIndex])\n" +
        "    _player.volume(volume)\n" +
        "    try:\n" +
        // "        firstIndex = index\n" +
        "        _wav_info = _player.play_process(_audio_rx)\n" +
        "        _audio_rx.channel_config(_audio_rx.CHANNEL_1, I2S.TRANSMITTER, resolution = I2S.RESOLUTION_16_BIT, align_mode = I2S.STANDARD_MODE)\n" +
        "        _audio_rx.set_sample_rate(_wav_info[1])\n" +
        "        _audio_play_state = 0\n" +
        "\n" +
        "        fm.register(34,fm.fpioa.I2S1_OUT_D1)\n" +
        "        fm.register(35,fm.fpioa.I2S1_SCLK)\n" +
        "        fm.register(33,fm.fpioa.I2S1_WS)\n" +
        "\n" +
        "        button_a_state = False\n" +
        "        while True:\n" +
        "            _audio_play_state = _player.play()\n" +
        "            if (_audio_play_state) == True:\n" +
        "                #print(\"Playing.\")\n" +
        "                if (_gp_side_a.value() == 1) and button_a_state == False:\n" +
        "                    index = random_song(firstIndex,my_list)\n" +
        "                    button_a_state = True\n" +
        "                elif (_gp_side_a.value() == 0) and button_a_state == True:\n" +
        "                    button_a_state = False\n" +
        "                    change_random_song(index)\n" +
        "                    break\n" +
        "\n" +
        "            elif (_audio_play_state) == False:\n" +
        "                #print(\"Done.\")\n" +
        "                index = random_song(firstIndex,my_list)\n" +
        "                firstIndex = index\n" +
        "                break\n" +
        "\n" +
        "    except:\n" +
        "        play_again = True\n" +
        "        return\n" +
        "\n";
    // Blockly.Python.definitions_.import_audio = _in;
    Blockly.Python.addVariable('_audio_play_list_random_state', _in, true);
    Blockly.Python.definitions_['import_define_x_ai_button'] = '' +
        'from fpioa_manager import *\n' +
        'from Maix import FPIOA, GPIO\n' +
        '\n' +
        '_gp_side_buttons = [9, 10, 11]\n' +
        '\n' +
        'FPIOA().set_function(_gp_side_buttons[0],FPIOA.GPIO0)\n' +
        'FPIOA().set_function(_gp_side_buttons[1],FPIOA.GPIO1)\n' +
        'FPIOA().set_function(_gp_side_buttons[2],FPIOA.GPIO2)\n' +
        '\n' +
        '_gp_side_a = GPIO(GPIO.GPIO0,GPIO.IN,GPIO.PULL_UP)\n' +
        '_gp_side_b = GPIO(GPIO.GPIO1,GPIO.IN,GPIO.PULL_UP)\n' +
        '_gp_side_c = GPIO(GPIO.GPIO2,GPIO.IN,GPIO.PULL_UP)\n' +
        '\n';
    // Blockly.Python.addSetup("ai_audio_read", _in);
    var _code = "_speaker_play_song_list_random(volume=" + number_play_vol + ", my_list=" + my_list + ")\n";
    return _code;
};
