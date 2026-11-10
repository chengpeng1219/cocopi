from maix import display
from maix import image
from maix import camera
from maix import app
import os
import pyaudio
import wave
import numpy as np
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

import base64
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

CHUNK = 1024
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

def v831_display_show_img_cam(displayShow):
    global _img_cam_y,_img_cam_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_cam_x, _img_cam_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

def get_frequency_analysis():
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

def get_sound_loudness():
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

ScreenOrientation = False
CAM_W = DISP_W
CAM_H = DISP_H
_img_cam_w = 640
_img_cam_h =  480
_img_cam_x = 0
_img_cam_y = 0



img_cam = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_cam_x, _img_cam_y = 0,0
while True:
    img_cam.clear()
    FEEQUENCYANALYSISVALUE = get_frequency_analysis().tolist()
    img_cam.draw_string(20,20, (str("loudness ") + str(get_sound_loudness())), scale = 2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    img_cam.draw_rect(30,(460 - (int(FEEQUENCYANALYSISVALUE[0]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[0]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_rect(106,(460 - (int(FEEQUENCYANALYSISVALUE[1]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[1]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_rect(182,(460 - (int(FEEQUENCYANALYSISVALUE[2]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[2]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_rect(258,(460 - (int(FEEQUENCYANALYSISVALUE[3]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[3]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_rect(334,(460 - (int(FEEQUENCYANALYSISVALUE[4]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[4]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_rect(410,(460 - (int(FEEQUENCYANALYSISVALUE[5]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[5]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_rect(486,(460 - (int(FEEQUENCYANALYSISVALUE[6]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[6]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_rect(562,(460 - (int(FEEQUENCYANALYSISVALUE[7]/500)) * 2), 60, ((int(FEEQUENCYANALYSISVALUE[7]/500)) * 2), color=image.Color.from_rgb(0,255,255), thickness=-1)
    img_cam.draw_string(20,60, ("".join([str(x) for x in ["b0 ", int(FEEQUENCYANALYSISVALUE[0]/500), "   b7 ", int(FEEQUENCYANALYSISVALUE[7]/500)]])), scale = 1.5, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    img_cam.draw_string(20,430, "low                                    high", scale = 1.2, color = image.Color.from_rgb(128,128,128) , thickness = 1)
    v831_display_show_img_cam(img_cam)
