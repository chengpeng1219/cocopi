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

def v831_draw_rect_corners(img, x1, y1, x2, y2, color, thickness):
    img.draw_rect(x1, y1, x2 - x1, y2 - y1, color=color, thickness=thickness)

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
_canvas_h =  480
_canvas_x = 0
_canvas_y = 0



canvas = image.Image(640, 480, bg=image.COLOR_BLACK)
while True:
    canvas.draw_rect(40,40, 240,160, color=image.Color.from_rgb(255,0,0), thickness=2)
    v831_draw_rect_corners(canvas, 360,40, 600,200, image.Color.from_rgb(*(0,255,0)), 2)
    canvas.draw_rect(40,280, 240,120, color=image.Color.from_rgb(*(255,255,0)), thickness=-1)
    v831_display_show_canvas(canvas)
