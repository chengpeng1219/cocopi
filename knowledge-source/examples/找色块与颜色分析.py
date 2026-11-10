from maix import camera
from maix import image
from maix import app
import os
from maix import display
import numpy as np
import base64
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_find_blob_fun(lane_trackingimg,region1,COLOR):
    IMGBLOB = lane_trackingimg.crop(region1[0],region1[1],region1[2],region1[3])
    blobsCANVAS = IMGBLOB.find_blobs(COLOR, merge=True)
    return blobsCANVAS

def colorAnalyze(img, x, y, w, h):
    _a = np.frombuffer(img.crop(x, y, w, h).to_bytes(), dtype=np.uint8).reshape(-1, 3)
    return tuple(int(v) for v in _a.mean(axis=0))

def v831_display_show_img_v(displayShow):
    global _img_v_y,_img_v_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_v_x, _img_v_y, displayShow)
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
_img_v_w = 640
_img_v_h =  480
_img_v_x = 0
_img_v_y = 0



img_v = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_v_x, _img_v_y = 0,0
while True:
    img_v = getLcdRotation(cam.read())
    for b in (v831_find_blob_fun(img_v,(0, 0,640, 480),([[45, 65, 40, 80, 40, 60]]))
    ):
        img_v.draw_rect((b.x()),(b.y()), (b.w()), (b.h()), color=image.Color.from_rgb(0,255,0), thickness=2)
        img_v.draw_string((b.x()),(b.y()), ("".join([str(x) for x in ["cx ", b.cx(), " px ", b.pixels()]])), scale = 1, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    img_v.draw_rect(280,200, 80, 80, color=image.Color.from_rgb(255,255,255), thickness=2)
    img_v.draw_string(20,20, (str("RGB in box: ") + str(colorAnalyze(img_v, 280, 200, 80, 80))), scale = 1.6, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    img_v.draw_string(20,440, "red blobs boxed in green", scale = 1.2, color = image.Color.from_rgb(128,128,128) , thickness = 1)
    v831_display_show_img_v(img_v)
