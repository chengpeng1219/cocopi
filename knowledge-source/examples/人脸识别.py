from maix import camera
from maix import image
from maix import app
import os
from maix import display
from maix import nn
import os
from maix import touchscreen
from maix import time as _maixTime
import base64
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

faceRecognizer = nn.FaceRecognizer(detect_model="/root/models/yolov8n_face.mud", feature_model="/root/models/insghtface_webface_r50.mud")
recogFaces = []
faceNameList = ["AAA", "BBB"]
people_name_list = faceNameList

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

_maixTouch = touchscreen.TouchScreen()
_maixTouchCache = [0, 0, False, -1000]   # x, y, pressed, 讀取時刻(ms)
_maixTouchPrev = False                   # 上一圈的按下狀態
_maixTouchDown = False                   # 這一圈剛按下
_maixTouchUp = False                     # 這一圈剛放開
_maixTouchStart = [0, 0]                 # 按下那一刻的座標
_maixTouchTime = 0                       # 按下那一刻的時間

def _maixTouchPoint():
    # ts.read() 回傳的是**實體面板**的座標，但所有繪圖積木用的是**畫布**座標。
    # disp.show() 等比縮放置中顯示，所以要反算回畫布座標。
    #
    # 2026-08-11 之後邏輯畫面改成跟面板一樣大（640x480），兩者相等時
    # s = 1、偏移 = 0，這段算下來是恆等式。但**不能因此拿掉**：豎屏會對調
    # 長寬、使用者也可能自己開別的尺寸，那時候換算還是要的。
    #
    # 尺寸從全域讀而不是寫死：使用者可能把畫布開成別的大小。
    # 沒有螢幕初始化積木時退回預設值，不讓積木單獨使用時 NameError。
    global _maixTouchPrev, _maixTouchDown, _maixTouchUp, _maixTouchTime
    now = _maixTime.ticks_ms()
    if now - _maixTouchCache[3] < 5:
        return _maixTouchCache[0], _maixTouchCache[1], _maixTouchCache[2]
    tx, ty, pressed = _maixTouch.read()
    g = globals()
    pw = g["DISP_W"] if "DISP_W" in g else 640
    ph = g["DISP_H"] if "DISP_H" in g else 480
    cw = g["CAM_W"] if "CAM_W" in g else 640
    ch = g["CAM_H"] if "CAM_H" in g else 480
    s = min(pw / cw, ph / ch)
    x = int((tx - (pw - cw * s) / 2) / s)
    y = int((ty - (ph - ch * s) / 2) / s)
    _maixTouchDown = pressed and not _maixTouchPrev
    _maixTouchUp = _maixTouchPrev and not pressed
    if _maixTouchDown:
        _maixTouchStart[0], _maixTouchStart[1] = x, y
        _maixTouchTime = now
    _maixTouchPrev = pressed
    _maixTouchCache[0], _maixTouchCache[1] = x, y
    _maixTouchCache[2], _maixTouchCache[3] = pressed, now
    return x, y, pressed

def _maixTouchInArea(x, y, w, h):
    tx, ty, pressed = _maixTouchPoint()
    return pressed and x <= tx < x + w and y <= ty < y + h

def _maixTouchJustDown():
    _maixTouchPoint()          # 先讓狀態前進，再讀旗標
    return _maixTouchDown

def _maixTouchJustUp():
    # 手指離開的那一幀。**這才是「點擊」**——按下就觸發的按鈕，
    # 手指滑開也算按到，而且按住不放會一直觸發。
    _maixTouchPoint()
    return _maixTouchUp

def _maixTouchHold(sec):
    _x, _y, pressed = _maixTouchPoint()
    return pressed and _maixTime.ticks_ms() - _maixTouchTime >= sec * 1000

def _maixTouchDrag(axis):
    # 從按下那一刻到現在移動了多少。放開就回 0——沒在拖就沒有位移。
    x, y, pressed = _maixTouchPoint()
    if not pressed:
        return 0
    return x - _maixTouchStart[0] if axis == 0 else y - _maixTouchStart[1]

def v831_display_show_img_face_recog(displayShow):
    global _img_face_recog_y,_img_face_recog_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_face_recog_x, _img_face_recog_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

SETVFLIP = False
SETHMIRROT = False
CAM_W = DISP_W
CAM_H = DISP_H
cam = camera.Camera(CAM_W, CAM_H)
ScreenOrientation = False
_img_face_recog_w = 320
_img_face_recog_h =  240
_img_face_recog_x = 0
_img_face_recog_y = 0



img_face_recog = image.Image(320, 240, bg=image.COLOR_BLACK)
_img_face_recog_x, _img_face_recog_y = 0,0
if os.path.exists("/root/faces.bin"):
    faceRecognizer.load_faces("/root/faces.bin")
while True:
    img_face_recog = getLcdRotation(cam.read())
    recogFaces = faceRecognizer.recognize(img_face_recog, 0.5, 0.45, 0.85, True, True)
    for i in (recogFaces):
        img_face_recog.draw_rect(i.x,i.y, i.w, i.h, color=image.Color.from_rgb(255,0,0), thickness=2)
        img_face_recog.draw_keypoints(i.points, image.COLOR_RED, size = 4)
        img_face_recog.draw_string(i.x,i.y, (str(faceRecognizer.labels[i.class_id]) + str(" ")), scale = 1, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    img_face_recog.draw_rect(10,200, 90, 34, color=image.Color.from_rgb(0,102,204), thickness=-1)
    img_face_recog.draw_string(18,208, "ADD", scale = 1, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    img_face_recog.draw_rect(220,200, 90, 34, color=image.Color.from_rgb(204,102,0), thickness=-1)
    img_face_recog.draw_string(232,208, "CLR", scale = 1, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    if _maixTouchInArea(10,200, 90, 34):
        for i in (recogFaces):
            if len(faceRecognizer.labels) - 1 < len(faceNameList):
                faceRecognizer.add_face(i, faceNameList[len(faceRecognizer.labels) - 1])
                faceRecognizer.save_faces("/root/faces.bin")
    if _maixTouchInArea(220,200, 90, 34):
        if len(faceRecognizer.labels) > 1:
            faceRecognizer.remove_face(len(faceRecognizer.labels) - 2)
            faceRecognizer.save_faces("/root/faces.bin")
    v831_display_show_img_face_recog(img_face_recog)
