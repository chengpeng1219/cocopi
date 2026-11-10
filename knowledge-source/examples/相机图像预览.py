from maix import display
from maix import image
from maix import camera
from maix import app
import os
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

def v831_display_show_img_cam(displayShow):
    global _img_cam_y,_img_cam_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_cam_x, _img_cam_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

ScreenOrientation = False
CAM_W = 640
CAM_H = 480
_img_cam_w = 640
_img_cam_h =  480
SETVFLIP = False
SETHMIRROT = False
cam = camera.Camera(CAM_W, CAM_H)
_img_cam_x = 0
_img_cam_y = 0



img_cam = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_cam_x, _img_cam_y = 0,0
cam.set_resolution(640, 480)
CAM_W, CAM_H = 640, 480
while True:
    img_cam = getLcdRotation(cam.read())
    img_cam.draw_string(20,440, "640x480  vflip on", scale = 1.5, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    v831_display_show_img_cam(img_cam)
