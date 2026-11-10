// AI programming prompt shared by the browser fallback and the server-side proxy.
export const MAIXPY_AI_SYSTEM_PROMPT = `你是一个专业的 CocoPi (V831) Python 编程专家。
请严格按照以下 CocoPi 真机唯一支持的官方模板编写代码（绝不要使用旧版的 image.new 或 display.show() 全局函数）：

【模板 1：屏幕显示文字/图形标准结构】
\`\`\`python
from maix import display, image, camera, app
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()
ScreenOrientation = False
CAM_W, CAM_H = DISP_W, DISP_H
_canvas_x, _canvas_y = 0, 0

def v831_display_show_canvas(displayShow):
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_canvas_x, _canvas_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

canvas = image.Image(640, 480, bg=image.COLOR_BLACK)
while True:
    canvas.draw_string(20, 40, "中文或英文内容", scale = 2, color = image.Color.from_rgb(0, 255, 0), thickness = 1)
    v831_display_show_canvas(canvas)
    time.sleep(0.05)
\`\`\`

【模板 2：摄像头采集预览标准结构】
使用 \`cam = camera.Camera(640, 480)\`，循环内 \`img_cam = cam.read()\`，用 \`img_cam.draw_string(x, y, "text", scale=1.5, color=image.Color.from_rgb(r,g,b), thickness=1)\`，然后显示。
只输出纯 Python 代码。`;

function toPythonString(value) {
  return JSON.stringify(String(value));
}

export function generateLocalMaixPyFallback(promptText) {
  const prompt = String(promptText || '').trim();
  const isCam =
    prompt.includes('相机') ||
    prompt.includes('摄像头') ||
    prompt.includes('拍') ||
    prompt.includes('预览');

  if (isCam) {
    return `from maix import display
from maix import image
from maix import camera
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
print(${toPythonString(`[AI 代码运行] 已启动摄像头实时画面预览: ${prompt}`)})

while True:
    img_cam = cam.read()
    img_cam.draw_string(20, 30, "AI 视觉任务运行中", scale = 2, color = image.Color.from_rgb(0, 255, 128), thickness = 1)
    img_cam.draw_string(20, 440, "640x480 | " + time.strftime("%H:%M:%S"), scale = 1.5, color = image.Color.from_rgb(255, 255, 0), thickness = 1)
    v831_display_show_img_cam(img_cam)
`;
  }

  return `from maix import display
from maix import image
import time

image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")

disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()
ScreenOrientation = False
CAM_W, CAM_H = DISP_W, DISP_H
_canvas_x, _canvas_y = 0, 0

def v831_display_show_canvas(displayShow):
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_canvas_x, _canvas_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)

canvas = image.Image(640, 480, bg=image.COLOR_BLACK)
print(${toPythonString(`[AI 代码运行] 正在屏幕显示: ${prompt}`)})

while True:
    canvas.draw_string(20, 30, "CocoPi AI 编程助手", scale = 2, color = image.Color.from_rgb(0, 170, 255), thickness = 1)
    canvas.draw_string(20, 130, ${toPythonString(prompt.slice(0, 18))}, scale = 2, color = image.Color.from_rgb(0, 255, 0), thickness = 1)
    canvas.draw_string(20, 240, "Time: " + time.strftime("%H:%M:%S"), scale = 1.5, color = image.Color.from_rgb(255, 255, 0), thickness = 1)
    v831_display_show_canvas(canvas)
    time.sleep(0.05)
`;
}

