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

faceLmModel = nn.FaceLandmarks(model="/root/models/face_landmarks.mud")
faceLandmarks = []

def maixFaceLandmarksDetect(img, maxNum):
    global faceLandmarks
    faceLandmarks = []
    objs = faceDetector.detect(img, conf_th = 0.5, iou_th = 0.45, sort = 1)
    count = 0
    for obj in objs:
        img_std = faceLmModel.crop_image(img, obj.x, obj.y, obj.w, obj.h, obj.points)
        if img_std:
            res = faceLmModel.detect(img_std, 0.5, True, False)
            if res and res.valid:
                faceLandmarks.append(res)
        count += 1
        if maxNum > 0 and count >= maxNum:
            break

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_display_show_img_facelm(displayShow):
    global _img_facelm_y,_img_facelm_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_facelm_x, _img_facelm_y, displayShow)
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
_img_facelm_w = 320
_img_facelm_h =  240
_img_facelm_x = 0
_img_facelm_y = 0



img_facelm = image.Image(320, 240, bg=image.COLOR_BLACK)
_img_facelm_x, _img_facelm_y = 0,0
while True:
    img_facelm = getLcdRotation(cam.read())
    maixFaceLandmarksDetect(img_facelm, 2)
    for i in (faceLandmarks):
        faceLmModel.draw_face(img_facelm, i.points, len(i.points_z), i.points_z)
        img_facelm.draw_circle(i.points[936],i.points[937], 8, color=image.Color.from_rgb(255, 0, 0), thickness=2)
        img_facelm.draw_circle(i.points[946],i.points[947], 8, color=image.Color.from_rgb(0, 255, 0), thickness=2)
        img_facelm.draw_circle(i.points[8],i.points[9], 8, color=image.Color.from_rgb(0, 0, 255), thickness=2)
        img_facelm.draw_circle(i.points[122],i.points[123], 8, color=image.Color.from_rgb(255, 255, 0), thickness=2)
        img_facelm.draw_circle(i.points[582],i.points[583], 8, color=image.Color.from_rgb(255, 0, 255), thickness=2)
    v831_display_show_img_facelm(img_facelm)
