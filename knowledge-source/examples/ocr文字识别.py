from maix import camera
from maix import image
from maix import app
import os
from maix import display
from maix import nn
import base64
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

ocrModel = nn.PP_OCR("/root/models/pp_ocr.mud")
ocrObjs = []

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_display_show_img_ocr(displayShow):
    global _img_ocr_y,_img_ocr_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_ocr_x, _img_ocr_y, displayShow)
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
_img_ocr_w = 640
_img_ocr_h =  480
_img_ocr_x = 0
_img_ocr_y = 0



img_ocr = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_ocr_x, _img_ocr_y = 0,0
while True:
    img_ocr = getLcdRotation(cam.read())
    ocrObjs = ocrModel.detect(img_ocr.to_format(image.Format.FMT_BGR888))
    img_ocr.draw_string(10,10, (str("blocks: ") + str(len(ocrObjs))), scale = 1.5, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    for i in (ocrObjs):
        img_ocr.draw_keypoints(i.box.to_list(), image.Color.from_rgb(255,0,0), 4, -1, 1)
        img_ocr.draw_string(i.box.x1,i.box.y1, (str(i.char_str()) + str(" ")), scale = 1.2, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    img_ocr.draw_string(10,440, (" ".join([_o.char_str() for _o in ocrObjs])), scale = 1.2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    v831_display_show_img_ocr(img_ocr)
