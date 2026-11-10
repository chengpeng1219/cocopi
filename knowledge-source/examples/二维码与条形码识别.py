from maix import camera
from maix import image
from maix import app
import os
from maix import display
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

_APRILTAG_MAX = 480 * 360
_apriltagScale = 1.0

def findApriltags(img):
    global _apriltagScale
    _apriltagScale = 1.0
    src = img
    if img.width() * img.height() > _APRILTAG_MAX:
        _apriltagScale = (img.width() * img.height() / _APRILTAG_MAX) ** 0.5
        src = img.resize(int(img.width() / _apriltagScale), int(img.height() / _apriltagScale))
    # fx／fy／cx／cy 是相機內參，要跟著實際送進去的那張圖算，不是原圖
    return src.find_apriltags(families=image.ApriltagFamilies.TAG36H11,
                              fx=(6 / 5.76) * src.width(),
                              fy=(6 / 3.24) * src.height(),
                              cx=src.width() // 2,
                              cy=src.height() // 2)

def v831_display_show_img_code(displayShow):
    global _img_code_y,_img_code_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_code_x, _img_code_y, displayShow)
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
_img_code_w = 640
_img_code_h =  480
_img_code_x = 0
_img_code_y = 0



img_code = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_code_x, _img_code_y = 0,0
while True:
    img_code = getLcdRotation(cam.read())
    for qr in (img_code.find_qrcodes()):
        img_code.draw_rect((qr.x()),(qr.y()), (qr.w()), (qr.h()), color=image.Color.from_rgb(0,255,0), thickness=2)
        img_code.draw_string(20,20, (str("QR: ") + str(qr.payload())), scale = 1.6, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    for tag in (findApriltags(img_code)):
        img_code.draw_rect((int(tag.x() * _apriltagScale)),(int(tag.y() * _apriltagScale)), (int(tag.w() * _apriltagScale)), (int(tag.h() * _apriltagScale)), color=image.Color.from_rgb(255,255,0), thickness=2)
        img_code.draw_string(20,60, ("".join([str(x) for x in ["TAG id ", tag.id(), "  dist ", int(((tag.x_translation()**2 + tag.y_translation()**2 + tag.z_translation()**2) ** 0.5) * 3.0649 - 2)]])), scale = 1.6, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    for bar in (img_code.find_barcodes()):
        img_code.draw_rect((bar.x()),(bar.y()), (bar.w()), (bar.h()), color=image.Color.from_rgb(0,255,255), thickness=2)
        img_code.draw_string(20,100, (str("BAR: ") + str(bar.payload())), scale = 1.6, color = image.Color.from_rgb(0,255,255) , thickness = 1)
    v831_display_show_img_code(img_code)
