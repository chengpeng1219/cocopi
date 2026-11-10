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

faceLmModel = nn.FaceLandmarks(model="")
emotionClassifier = nn.Classifier(model="/root/models/face_emotion.mud")
emotionResults = []

def maixEmotionDetect(img):
    global emotionResults
    emotionResults = []
    objs = faceDetector.detect(img, conf_th = 0.5, iou_th = 0.45, sort = 1)
    for obj in objs:
        img_std = faceLmModel.crop_image(img, obj.x, obj.y, obj.w, obj.h, obj.points,
                                         emotionClassifier.input_width(),
                                         emotionClassifier.input_height(), 0.9)
        if img_std:
            res = emotionClassifier.classify(img_std.to_format(image.Format.FMT_GRAYSCALE), softmax=True)
            emotionResults.append((obj, res))

def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture

def v831_display_show_img_emotion(displayShow):
    global _img_emotion_y,_img_emotion_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_emotion_x, _img_emotion_y, displayShow)
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
_img_emotion_w = 320
_img_emotion_h =  240
_img_emotion_x = 0
_img_emotion_y = 0



img_emotion = image.Image(320, 240, bg=image.COLOR_BLACK)
_img_emotion_x, _img_emotion_y = 0,0
while True:
    img_emotion = getLcdRotation(cam.read())
    maixEmotionDetect(img_emotion)
    for i in (emotionResults):
        img_emotion.draw_rect(i[0].x,i[0].y, i[0].w, i[0].h, color=image.Color.from_rgb(255,0,0), thickness=2)
        img_emotion.draw_string(i[0].x,i[0].y, ("".join([str(x) for x in [emotionClassifier.labels[i[1][0][0]], " ", round((i[1][0][1] * 100), 0), "%"]])), scale = 1, color = image.Color.from_rgb(0,255,0) , thickness = 1)
    v831_display_show_img_emotion(img_emotion)
