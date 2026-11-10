from maix import display
from maix import image
from maix import camera
from maix import app
import os
import pyaudio
import wave
import time
import sys
sys.path.append("/root/")
import numpy as np
import base64
import numpy as _micNp

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

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

VOICEVOLUME = 100
VOICE_MIXER_MAX = 54

def setSystemVolume(value):
    """設定播放音量 0～100。

    **混音器那兩顆是增益，不是音量。** `RX LEFT/RIGHT ANA GAIN` 的刻度寫得很明白：
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
        return b"\x00" * len(data)
    return (np.frombuffer(data, dtype=np.int16)
            * (VOICEVOLUME / 100.0) ** 2).astype(np.int16).tobytes()

def v831_display_show_img_cam(displayShow):
    global _img_cam_y,_img_cam_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_cam_x, _img_cam_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

VOICE_HW_RATES = (8000, 16000, 32000, 48000)
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

ScreenOrientation = False
CAM_W = DISP_W
CAM_H = DISP_H
_img_cam_w = 640
_img_cam_h =  480
VOICESTATE = 0

VOICESTREAM = ""
VOICEPYAUDIO = pyaudio.PyAudio()
CHUNK = 1024

VOICEPLAYSTATE = True
VOICEWF = ""
_img_cam_x = 0
_img_cam_y = 0



img_cam = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_cam_x, _img_cam_y = 0,0
setSystemVolume(40)
img_cam.clear()
img_cam.draw_string(20,40, "SAY SOMETHING", scale = 2.5, color = image.Color.from_rgb(255,64,64) , thickness = 1)
img_cam.draw_string(20,140, "recording 3 sec...", scale = 1.5, color = image.Color.from_rgb(255,255,255) , thickness = 1)
v831_display_show_img_cam(img_cam)
if(os.path.exists("/root/_rec.wav")):
    os.system("rm /root/_rec.wav")
CHUNK = 1024
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
RECORD_SECONDS = 4
WAVE_OUTPUT_FILENAME = "/root/_rec.wav"
p = pyaudio.PyAudio()
stream = p.open(format=FORMAT,channels=CHANNELS,rate=RATE,input=True,frames_per_buffer=CHUNK)

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
VOICEPLAYSTATE = True
VOICEPPATH = "/root/_rec.wav"
while True:
    img_cam.clear()
    img_cam.draw_string(20,40, "playing back", scale = 2, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    img_cam.draw_string(20,120, (str("status ") + str(VOICEPLAYSTATE)), scale = 1.5, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    VOICEPLAYSTATE = VoicePlayState()
    v831_display_show_img_cam(img_cam)
