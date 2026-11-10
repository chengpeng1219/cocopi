from maix import camera
from maix import image
from maix import app
import os
from maix import display
from maix import nn
import sys as _maixSys
if "/maixapp/apps/gesture_classifier" not in _maixSys.path:
    _maixSys.path.insert(0, "/maixapp/apps/gesture_classifier")
import numpy as _maixNp
from LinearSVC import LinearSVC as _MaixLinearSVC
import base64
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

handDetector = nn.HandLandmarks(model="/root/models/hand_landmarks.mud")
hands = []

_gestureClf = _MaixLinearSVC.load("/maixapp/apps/gesture_classifier/clf_dump.npz")
_gestureNames = ("one", "five", "fist", "ok", "heartSingle", "yearh", "three",
                 "four", "six", "Iloveyou", "gun", "thumbUp", "nine", "pink")
_gestureName = ""
_gestureConf = 0

def _maixGesture(obj, img):
    # 跟官方 app 的 preprocess 完全一致，改一個字預測就全錯：
    #   1. 取 21 點的 x,y（丟掉 z）
    #   2. 全部減去第 0 點（手腕），變成相對向量——手在畫面哪裡就不影響結果
    #   3. 除以畫面寬高正規化——手離鏡頭遠近就不影響結果
    #   4. 右手把 x 取負做鏡像，左右手才能共用同一組特徵
    lm = _maixNp.array(obj.points[8:8 + 21 * 3]).reshape((21, -1))[:, :2]
    v = (lm[1:] - lm[0]).astype("float64") / (img.width(), img.height())
    if obj.class_id != 0:
        v[:, 0] *= -1
    idx, conf = _gestureClf.predict_with_confidence(
        _gestureClf.scaler.transform(_maixNp.array([v.flatten()])))
    return _gestureNames[idx[0]], conf[0] * 100

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_display_show_img_hand(displayShow):
    global _img_hand_y,_img_hand_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_hand_x, _img_hand_y, displayShow)
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
_img_hand_w = 640
_img_hand_h =  480
_img_hand_x = 0
_img_hand_y = 0



img_hand = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_hand_x, _img_hand_y = 0,0
while True:
    img_hand = getLcdRotation(cam.read())
    hands = handDetector.detect(img_hand, conf_th = 0.7, iou_th = 0.45, conf_th2 = 0.8)
    img_hand.draw_string(10,10, (str("hands: ") + str(len(hands))), scale = 1.5, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    for i in (hands):
        handDetector.draw_hand(img_hand, i.class_id, i.points, 4, 10, box=True)
        _gestureName, _gestureConf = _maixGesture(i, img_hand)
        img_hand.draw_string(i.x,i.y, (str(_gestureName) + str(" ")), scale = 1.5, color = image.Color.from_rgb(0,255,0) , thickness = 1)
        img_hand.draw_string(10,50, (str("side: ") + str(handDetector.labels[i.class_id])), scale = 1.5, color = image.Color.from_rgb(0,255,255) , thickness = 1)
        img_hand.draw_string(10,90, (str("conf: ") + str(_gestureConf)), scale = 1.5, color = image.Color.from_rgb(255,0,255) , thickness = 1)
        img_hand.draw_circle((i.points[8]),(i.points[9]), 12, color=image.Color.from_rgb(255, 255, 0), thickness=2)
    v831_display_show_img_hand(img_hand)
