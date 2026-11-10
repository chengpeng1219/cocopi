from maix import display
from maix import image
from maix import camera
from maix import app
import os
import os as _maixOs
import atexit as _maixAtexit
import signal as _maixSignal
from maix import app as _maixApp
from maix import sensevoice as _maixSensevoice
from maix import audio as _maixLlmAudio
from maix import touchscreen
from maix import time as _maixTime
import base64
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

def _maixLlmCheck(path, what):
    """跑之前把兩個最常見的坑先擋掉，並給出照著做就能修的訊息。"""
    if _maixApp.get_sys_config_kv("npu", "ai_isp", "0") != "0":
        raise RuntimeError(
            what + "需要完整的 NPU，但 AI ISP 正開著（它會佔掉一半算力）。\n"
            "關掉的指令在 tools/e2e/probe-mllm4.py 的檔頭，不必重開機。\n"
            "要點是：app.set_sys_config_kv('npu', 'ai_isp', '0')")
    if not _maixOs.path.exists(path):
        raise FileNotFoundError(
            "找不到模型 " + path + "。\n"
            "這台機器上要先有模型檔，下載方式見 docs/doc/zh/mllm/basic.md")

def _maixLlmRelease():
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

_MAIX_ASR_MODEL = "/root/models/sensevoice-maixcam2/model.mud"
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

_maixScroll = 0
_maixScrollLast = None       # 上一圈的手指 y；None 代表沒在按

def _maixScrollUpdate(limit):
    global _maixScroll, _maixScrollLast
    _x, y, pressed = _maixTouchPoint()
    if pressed:
        if _maixScrollLast is not None:
            # 手指往上滑（y 變小）→ 捲動量變大 → 內容往上跑
            _maixScroll += _maixScrollLast - y
        _maixScrollLast = y
    else:
        _maixScrollLast = None
    # 夾在 0～limit 之間，滑不出內容之外
    if _maixScroll < 0:
        _maixScroll = 0
    elif _maixScroll > limit:
        _maixScroll = limit

def textCanvasNewLine(canvasName, posax, posay, text, Num, Scale, Color, LineNum):
    # 按「每行 Num 個字」把一整串切開。空字串也要有一行，否則下面會少算。
    lines = [text[i:i + Num] for i in range(0, len(text), Num)] or [""]
    # 可捲的距離＝內容總高減掉放得下的高度。裝得下就是 0，捲不動。
    limit = max(0, len(lines) * LineNum - (canvasName.height() - posay))
    _maixScrollUpdate(limit)
    for i, line in enumerate(lines):
        y = posay + i * LineNum - _maixScroll
        # 畫面外的跳過。文字畫在外面不會出事（實測只差 6%），
        # 但這裡行數可能上百，順手省掉。
        if -LineNum < y < canvasName.height():
            canvasName.draw_string(posax, y, line, scale=Scale, color=Color, thickness=1)

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
_maixAsrInit()
while True:
    canvas.clear()
    canvas.draw_string(20,30, "touch, then speak for 3 sec", scale = 1.6, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    textCanvasNewLine(canvas,20,120,(str("→ ") + str(_maixAsrText)),26,2,image.Color.from_rgb(0 ,255, 136),40)
    v831_display_show_canvas(canvas)
    if _maixTouchPoint()[2]:
        canvas.clear()
        canvas.draw_string(20,200, "listening...", scale = 2.5, color = image.Color.from_rgb(255,64,64) , thickness = 1)
        v831_display_show_canvas(canvas)
        _maixAsrListen(3)
