from maix import display
from maix import image
from maix import camera
from maix import app
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

def v831_display_show_canvas(displayShow):
    global _canvas_y,_canvas_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_canvas_x, _canvas_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

ScreenOrientation = False
CAM_W = DISP_W
CAM_H = DISP_H
_canvas_w = 640
_canvas_h =  480
_canvas_x = 0
_canvas_y = 0



canvas = image.Image(640, 480, bg=image.COLOR_BLACK)
_canvas_x, _canvas_y = 0,0
downs = 0
clicks = 0
while True:
    canvas.clear()
    if _maixTouchJustDown():
        downs = downs + 1
    if _maixTouchJustUp():
        clicks = clicks + 1
    canvas.draw_string(20,20, ("".join([str(x) for x in ["downs ", downs, "   clicks ", clicks]])), scale = 2, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    canvas.draw_string(20,90, (str("pressed now ") + str(_maixTouchPoint()[2])), scale = 1.5, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    canvas.draw_string(20,140, ("".join([str(x) for x in ["drag x ", _maixTouchDrag(0), "  y ", _maixTouchDrag(1)]])), scale = 1.5, color = image.Color.from_rgb(0,255,255) , thickness = 1)
    if _maixTouchHold(1):
        canvas.draw_circle(_maixTouchPoint()[0],_maixTouchPoint()[1], 40, color=image.Color.from_rgb(255, 0, 0), thickness=-1)
    v831_display_show_canvas(canvas)
