export const MAIXPY_PROGRAMS = [
  {
    id: 'cocopi_text_display',
    title: '案例 1：屏幕显示中英文文字 (官方参考源码)',
    filename: 'user_latest_code.py',
    badge: '屏幕显示 · 官方标准源码',
    desc: '100% 采用您提供的屏幕显示文字参考程序：加载 /maixapp/share/font/SourceHanSansCN-Regular.otf 中文字体，通过 display.Display() 与 v831_display_show_canvas 渲染多色中英文文本。',
    blocks: [
      { category: '字体', color: '#2563eb', text: '加载中文字体 "cocopi" (/maixapp/share/font/SourceHanSansCN-Regular.otf, 字号 20)' },
      { category: '屏幕', color: '#0891b2', text: '初始化屏幕 disp = display.Display() 并创建 640×480 黑色画布 canvas' },
      { category: '循环', color: '#d97706', text: '当重复执行 (while True):' },
      { category: '绘图', color: '#059669', text: '在画布 (20, 20) 绘制 "ABC abc 123" 大小:1 颜色:RGB(255, 0, 0)' },
      { category: '绘图', color: '#059669', text: '在画布 (20, 120) 绘制 "中文字型測試" 大小:2 颜色:RGB(0, 255, 0)' },
      { category: '绘图', color: '#059669', text: '在画布 (20, 280) 绘制 "Wg" 大小:3 颜色:RGB(0, 170, 255)' },
      { category: '屏幕', color: '#2563eb', text: '调用 v831_display_show_canvas(canvas) 刷新屏幕显示' }
    ],
    python: `from maix import display
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

def v831_display_show_canvas(displayShow):
    global _canvas_y,_canvas_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_canvas_x, _canvas_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

ScreenOrientation = False
CAM_W = DISP_W
CAM_H = DISP_H
_canvas_w = 640
_canvas_h = 480
_canvas_x = 0
_canvas_y = 0

canvas = image.Image(640, 480, bg=image.COLOR_BLACK)
print("[CocoPi] 屏幕文字渲染程序已启动！正在向屏幕输出中英文内容...")
while True:
    canvas.draw_string(20, 20, "ABC abc 123", scale = 1, color = image.Color.from_rgb(255,0,0), thickness = 1)
    canvas.draw_string(20, 120, "中文字型測試", scale = 2, color = image.Color.from_rgb(*(0,255,0)), thickness = 1)
    canvas.draw_string(20, 280, "Wg", scale = 3, color = image.Color.from_rgb(0,170,255), thickness = 1)
    v831_display_show_canvas(canvas)
    time.sleep(0.05)
`
  },
  {
    id: 'cocopi_cam_preview',
    title: '案例 2：摄像头实时图像预览 (官方参考源码)',
    filename: 'user_latest_code.py',
    badge: '相机预览 · 官方标准源码',
    desc: '100% 采用您提供的摄像头图像预览参考程序：通过 camera.Camera(640, 480) 与 cam.read() 持续读取画面，叠加黄色状态文字并实时推送到屏幕。',
    blocks: [
      { category: '相机', color: '#7c3aed', text: '初始化摄像头 cam = camera.Camera(640, 480) 并设置分辨率 640×480' },
      { category: '画布', color: '#0891b2', text: '创建相机画布 img_cam = image.Image(640, 480, bg=image.COLOR_BLACK)' },
      { category: '循环', color: '#d97706', text: '当重复执行 (while True):' },
      { category: '相机', color: '#7c3aed', text: '捕获当前帧并处理镜像旋转 img_cam = getLcdRotation(cam.read())' },
      { category: '绘图', color: '#059669', text: '在 (20, 440) 绘制文字 "640x480 vflip on" 大小:1.5 颜色:RGB(255, 255, 0)' },
      { category: '屏幕', color: '#2563eb', text: '调用 v831_display_show_img_cam(img_cam) 实时显示画面' }
    ],
    python: `from maix import display
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
_img_cam_h = 480
SETVFLIP = False
SETHMIRROT = False
cam = camera.Camera(CAM_W, CAM_H)
_img_cam_x = 0
_img_cam_y = 0

img_cam = image.Image(640, 480, bg=image.COLOR_BLACK)
_img_cam_x, _img_cam_y = 0, 0
cam.set_resolution(640, 480)
CAM_W, CAM_H = 640, 480
print("[CocoPi] 摄像头 640x480 实时预览已启动！请观察设备屏幕。")
while True:
    img_cam = getLcdRotation(cam.read())
    img_cam.draw_string(20, 440, "640x480  vflip on", scale = 1.5, color = image.Color.from_rgb(255,255,0), thickness = 1)
    v831_display_show_img_cam(img_cam)
`
  },
  {
    id: 'cocopi_cam_osd_time',
    title: '案例 3：摄像头实时取景 + 中文时间水印叠加',
    filename: 'user_latest_code.py',
    badge: '综合实训 · 视觉+中文OSD',
    desc: '结合您的两份参考程序：在 640×480 摄像头实时画面上叠加思源黑体中文标题与动态系统时钟。',
    blocks: [
      { category: '字体', color: '#2563eb', text: '加载思源黑体 "/maixapp/share/font/SourceHanSansCN-Regular.otf"' },
      { category: '相机', color: '#7c3aed', text: '启动 cam = camera.Camera(640, 480) 实时读取图像' },
      { category: '绘图', color: '#059669', text: '在画面顶部绘制中文 "CocoPi AI 视觉监控中" 与实时时间' },
      { category: '屏幕', color: '#2563eb', text: '调用 v831_display_show_img_cam(img_cam) 实时刷新至屏幕' }
    ],
    python: `from maix import display
from maix import image
from maix import camera
from maix import app
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
CAM_W, CAM_H = 640, 480
ScreenOrientation = False
_img_cam_x, _img_cam_y = 0, 0

def v831_display_show_img_cam(displayShow):
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_img_cam_x, _img_cam_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

cam = camera.Camera(CAM_W, CAM_H)
cam.set_resolution(640, 480)
print("[CocoPi] 摄像头中文时间 OSD 叠加程序已启动！")

while True:
    img_cam = cam.read()
    now_str = time.strftime("%Y-%m-%d %H:%M:%S")
    img_cam.draw_string(20, 20, "CocoPi 智能视觉终端", scale = 2, color = image.Color.from_rgb(0, 255, 128), thickness = 1)
    img_cam.draw_string(20, 430, "时间: " + now_str, scale = 1.5, color = image.Color.from_rgb(255, 255, 0), thickness = 1)
    v831_display_show_img_cam(img_cam)
`
  }
];
