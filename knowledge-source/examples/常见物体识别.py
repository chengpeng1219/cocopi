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

objectDetector = nn.YOLOv5(model="/root/models/yolov5s.mud")
objs = []

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_display_show_img_object(displayShow):
    global _img_object_y,_img_object_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_object_x, _img_object_y, displayShow)
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
_img_object_w = 320
_img_object_h =  240
_img_object_x = 0
_img_object_y = 0



img_object = image.Image(320, 240, bg=image.COLOR_BLACK)
_img_object_x, _img_object_y = 0,0
while True:
    img_object = getLcdRotation(cam.read())
    objs = objectDetector.detect(img_object, conf_th = 0.5, iou_th = 0.45)
    if len(objs):
        for i in (objs):
            img_object.draw_rect(i.x,i.y, i.w, i.h, color=image.Color.from_rgb(255,0,0), thickness=2)
            img_object.draw_string(i.x,i.y, objectDetector.labels[i.class_id], scale = 1, color = image.Color.from_rgb(*(0,255,0)), thickness = 1)
    v831_display_show_img_object(img_object)
