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

poseDetector = nn.YOLO11(model="/root/models/yolo11s_pose.mud")
poses = []

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_display_show_img_pose(displayShow):
    global _img_pose_y,_img_pose_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_pose_x, _img_pose_y, displayShow)
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
_img_pose_w = 320
_img_pose_h =  240
_img_pose_x = 0
_img_pose_y = 0



img_pose = image.Image(320, 240, bg=image.COLOR_BLACK)
_img_pose_x, _img_pose_y = 0,0
while True:
    img_pose = getLcdRotation(cam.read())
    poses = poseDetector.detect(img_pose, conf_th = 0.5, iou_th = 0.45, keypoint_th = 0.5)
    for i in (poses):
        img_pose.draw_rect(i.x,i.y, i.w, i.h, color=image.Color.from_rgb(255,0,0), thickness=2)
        poseDetector.draw_pose(img_pose, i.points, 4, image.Color.from_rgb(0,255,255))
        if (i.points[18] != 0 or i.points[19] != 0):
            img_pose.draw_circle(i.points[18],i.points[19], 10, color=image.Color.from_rgb(255, 255, 0), thickness=2)
        img_pose.draw_string(i.x,i.y, (str(poseDetector.labels[i.class_id]) + str(" ")), scale = 1, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    v831_display_show_img_pose(img_pose)
