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
_img_src_w = 160
_img_src_h =  120
_canvas_x = 0
_canvas_y = 0



canvas = image.Image(640, 480, bg=image.COLOR_BLACK)
_canvas_x, _canvas_y = 0,0
img_src = image.Image(160, 120, bg=image.COLOR_BLACK)
img_src.draw_rect(0,0, 160, 120, color=image.Color.from_rgb(32,32,96), thickness=-1)
img_src.draw_rect(0,0, 40, 30, color=image.Color.from_rgb(255,0,0), thickness=-1)
img_src.draw_rect(120,90, 40, 30, color=image.Color.from_rgb(0,255,0), thickness=-1)
img_src.draw_string(56,24, "F", scale = 4, color = image.Color.from_rgb(255,255,255) , thickness = 1)
img_src.save("/root/_media_test.jpg")
while True:
    canvas.clear()
    canvas.draw_string(20,34, "source", scale = 1.2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    canvas.draw_image(20,60,img_src)

    canvas.draw_string(220,34, "open (from file)", scale = 1.2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    canvas.draw_image(220,60,(image.load("/root/_media_test.jpg")))

    canvas.draw_string(420,34, "flip vertical", scale = 1.2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    canvas.draw_image(420,60,(img_src.flip(image.FlipDir.X)))

    canvas.draw_string(20,274, "rotate 90 CW", scale = 1.2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    canvas.draw_image(20,300,(img_src.rotate(-90)))

    canvas.draw_string(200,274, "resize 80x60", scale = 1.2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    canvas.draw_image(200,300,(img_src.resize(80, 60)))

    canvas.draw_string(320,274, "crop 40,30 80x60", scale = 1.2, color = image.Color.from_rgb(255,255,0) , thickness = 1)
    canvas.draw_image(320,300,(img_src.crop(40,30,80, 60)))

    v831_display_show_canvas(canvas)
