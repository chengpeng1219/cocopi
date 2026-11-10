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

faceDetector = nn.YOLO11(model="/root/models/yolo11s_face.mud")
faces = []

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_display_show_img_face(displayShow):
    global _img_face_y,_img_face_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_face_x, _img_face_y, displayShow)
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
_img_face_w = 320
_img_face_h =  240
_img_face_x = 0
_img_face_y = 0



img_face = image.Image(320, 240, bg=image.COLOR_BLACK)
_img_face_x, _img_face_y = 0,0
while True:
    img_face = getLcdRotation(cam.read())
    faces = faceDetector.detect(img_face, conf_th = 0.4, iou_th = 0.45)
    if len(faces):
        for i in (faces):
            img_face.draw_rect(i.x,i.y, i.w, i.h, color=image.Color.from_rgb(255,0,0), thickness=2)
            img_face.draw_string(i.x,i.y, "Face", scale = 1, color = image.Color.from_rgb(*(0,255,0)), thickness = 1)
    v831_display_show_img_face(img_face)
