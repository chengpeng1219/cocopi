from maix import camera
from maix import image
from maix import app
import os
from maix import display
from maix import nn
import sys as _maixSys
if "/maixapp/apps/human_pose_classifier" not in _maixSys.path:
    _maixSys.path.insert(0, "/maixapp/apps/human_pose_classifier")
from PoseEstimation import PoseEstimation as _MaixPoseEstimation
import base64
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()

poseDetector = nn.YOLO11(model="/root/models/yolo11s_pose.mud")
poses = []

_poseClassifier = _MaixPoseEstimation()

# 輸出的語言由裝置設定決定（/boot/configs 的 maix_language_locale，實測是 en）。
# i18n 沒有改 locale 的 API，所以在這裡轉。對不到的原樣放行——
# 裝置設成 zh 時輸出本來就是中文，會直接通過這張表。
_poseNames = {
    "Lying Down": "躺下", "Standing Up": "直立", "Sitting Down": "坐下",
    "Reclining": "斜躺", "To Left 1": "向左伸手", "To Right 1": "向右伸手",
    "Both Hands Raised Horizontally": "雙手平舉", "Left Hand Raised": "舉左手",
    "Right Hand Raised": "舉右手", "Both Hands Raised Up": "舉雙手",
    "Both Hands Forming a Heart": "雙手比心", "Big 'T' Shape": "大字型",
}

def _maixPoseCls(obj):
    # evaluate_pose 吃 17 個關節的座標，obj.points 正好是那 34 個數字。
    # 內部會對最近 5 幀取平均再判斷，所以動作要停穩一下才會跳過去。
    # 可能一次回傳多行（例如「直立」加「舉雙手」），用換行接。
    raw = _poseClassifier.evaluate_pose(obj.points)
    return "\n".join(_poseNames.get(s, s) for s in raw.split("\n") if s)

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
_img_pose_w = 640
_img_pose_h =  480
_img_pose_x = 0
_img_pose_y = 0



img_pose = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_pose_x, _img_pose_y = 0,0
while True:
    img_pose = getLcdRotation(cam.read())
    poses = poseDetector.detect(img_pose, conf_th = 0.5, iou_th = 0.45, keypoint_th = 0.5)
    img_pose.draw_string(10,10, (str("people: ") + str(len(poses))), scale = 1.5, color = image.Color.from_rgb(255,255,255) , thickness = 1)
    for i in (poses):
        poseDetector.draw_pose(img_pose, i.points, 4, image.Color.from_rgb(0,255,255))
        img_pose.draw_string(i.x,i.y, (str(_maixPoseCls(i)) + str(" ")), scale = 2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    v831_display_show_img_pose(img_pose)
