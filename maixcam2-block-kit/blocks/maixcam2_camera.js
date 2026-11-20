/*
 * 相機分類的積木。
 *
 * 2026-08-17 從 ai.js 原樣搬過來，一個字都沒改（產碼零差異）。
 *
 * 這裡面**有一半沒掛進工具箱**——`ai_camera_vflip`、`hmirror`、
 * `auto_whitebal`、`auto_gain`、`auto_exposure`、`fit_to_screen_size`
 * 在 editor.js 裡是註解掉的。當初關掉是因為 V831 上沒有對應能力，
 * 但 **v4 的 camera.Camera 全都有**（實測 dir() 有 vflip／hmirror／
 * exposure／gain／awb_mode／set_resolution／set_fps…，見 probe-camera-audio.py），
 * 所以那幾塊是可以復活的。
 */





/*
     _    ___    ____                               
    / \  |_ _|  / ___|__ _ _ __ ___   ___ _ __ __ _ 
   / _ \  | |  | |   / _` | '_ ` _ \ / _ \ '__/ _` |
  / ___ \ | |  | |__| (_| | | | | | |  __/ | | (_| |
 /_/   \_\___|  \____\__,_|_| |_| |_|\___|_|  \__,_|

*/


Blockly.Blocks.ai_camera_wh = {
    init: function () {
        var _input = this.appendDummyInput();
        this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
        this.setColour("#60c1bb");
        this.setOutput(!0, "Boolean");
        _input.appendField(Blockly.Msg.W);
        this.appendValueInput("A").setCheck("Number");
        _input = this.appendDummyInput();
        _input.appendField(Blockly.Msg.H)
        this.appendValueInput("B").setCheck("Number");
        this.setInputsInline(!0);
    }
};

Blockly.Python.ai_camera_wh = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _y = Blockly.Python.valueToCode(block, "B", Blockly.Python.ORDER_ATOMIC);
    var code = "" + _x + ", " + _y + "";
    return [code, Blockly.Python.ORDER_ATOMIC];
};


Blockly.Blocks['ai_camera_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/camera_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_camera_init);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_camera_camera_set_size)
        //     .appendField(new Blockly.FieldDropdown([
        //         ["QVGA (320*240)", "QVGA"],
        //         ["QQVGA (160*120)", "QQVGA"]
        //     ]), "DEGREE");
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_camera_camera_color_mode)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.ai_camera_camera_color_mode_rgb, "RGB565"],
        //         [Blockly.Msg.ai_camera_camera_color_mode_bw, "GRAYSCALE"]
        //     ]), "DEGREE1");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_camera_init_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_init = function (block) {

    Blockly.Python.definitions_['v831_import_camera'] = `from maix import camera`
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`
    Blockly.Python.definitions_['v831_import_app'] = `from maix import app`
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    // MaixPy v4：字型改用 load_font + set_default_font（舊為 image.load_freetype）
    Blockly.Python.definitions_['v831_font_set'] = `image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")
`
    Blockly.Python.addVariable("SETVFLIP", "SETVFLIP = False", true)
    Blockly.Python.addVariable("SETHMIRROT", "SETHMIRROT = False", true)
    // 解析度沿用 ai_lcd_screeninit 設定的 CAM_W / CAM_H；未放螢幕初始化積木時用預設值。
    // 這裡沒有 disp 可問（專案可能只有相機沒有螢幕），所以只能寫字面值——
    // 640x480 是這台相機不帶參數時的原生預設，2026-08-11 實測 camera.Camera() 得到的值。
    Blockly.Python.addVariable("CAM_W", "CAM_W = 640", false)
    Blockly.Python.addVariable("CAM_H", "CAM_H = 480", false)
    // 用 addVariable 而非 definitions_：definitions_ 區塊排在變數宣告之前，
    // 放那裡會產生 cam = camera.Camera(CAM_W, CAM_H) 在 CAM_W 定義前的 NameError
    Blockly.Python.addVariable("cam", "cam = camera.Camera(CAM_W, CAM_H)", true)
    var _code = ``;
    return _code;
}


// 預設 640x480 ＝ 這台相機的原生解析度。
//
// 原本是 240x320——V831 直立面板的殘留，這台相機是橫的。曾經改成 320x240
// （這樣一拉進來就看得出積木有生效），但那等於學生一拉就把解析度砍一半，
// 預設值不該偷偷降級。要示範這塊積木的效果，在專案裡明著填小尺寸就好
// （見 tools/e2e/projects/camera/c1-camera.xml）。
Blockly.Blocks['ai_camera_windows'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_windowing_resize);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_windowing_w)
            .appendField(new Blockly.FieldNumber(640), "window_w")
            .appendField(Blockly.Msg.ai_camera_windowing_h)
            .appendField(new Blockly.FieldNumber(480), "window_h")
        // .appendField(Blockly.Msg.ai_camera_windowing_unit);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_camera_windows_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_camera_windows'] = function (block) {
    var w = block.getFieldValue('window_w');
    var h = block.getFieldValue('window_h');
    // MaixPy v4：`camera.camera.config(size=(w,h))` 是 V831 的寫法，v4 沒有這個模組層。
    // 對應的是 `cam.set_resolution(w, h)`——實測 320x240／224x224／640x480 都換得過去，
    // 換完 cam.read() 讀到的就是新尺寸。
    //
    // **CAM_W／CAM_H 要一起改。** 這是這塊積木遷移時最容易漏掉的一半：
    // 顯示那條路每一幀都拿 CAM_W x CAM_H 開一張合成畫布，再把相機影像貼上去
    // （見 maixcam2_screen.js 的 v831_display_show_*）。只改相機不改這兩個，
    // 320x240 的畫面就貼在 640x480 畫布的左上角，其餘留黑。
    //
    // V831 時代看不出來：面板本來就是 320x240，兩者永遠相等。pi2 換成原生
    // 640x480 之後才露出來——2026-08-18 驗 C1 時看到的「畫面只剩左上角一小塊」
    // 就是這個。
    //
    // 兩個都改之後，合成畫布跟著變小，`disp.show()` 預設的 FIT_CONTAIN 會等比
    // 放大到滿版：使用者感覺到的是「畫質變粗但還是滿版」，這才是「調解析度」該有的樣子。
    return 'cam.set_resolution(' + w + ', ' + h + ')\n'
        + 'CAM_W, CAM_H = ' + w + ', ' + h + '\n';
};

Blockly.Blocks['ai_camera_fit_to_screen_size'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_camera_fit_set);
        this.appendDummyInput()
            .appendField(new Blockly.FieldVariable("camera"), "varitem");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_camera_fit_to)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_camera_fit_2, "224"]
            ]), "size");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_camera_fit_to_screen_size_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_camera_fit_to_screen_size'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_size = block.getFieldValue('size');
    // TODO: Assemble Python into code variable.
    if (dropdown_size == "224") {
        var code = variable_name + ' = ' + variable_name + '.resize(224,224)\n';
    }
    return code;
};


Blockly.Blocks['ai_camera_snapshot'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_snapshot);
        this.setOutput(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_camera_snapshot_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_snapshot = function (block) {
    // MaixPy v4：camera.capture() → cam.read()。
    //
    // **列舉名在 v4 改了**：`image.FlipDir` 只有 `X`／`Y`／`XY`，
    // 沒有 `X_FLIP`／`Y_FLIP`（實測 dir(image.FlipDir)）。舊名字照抄過來
    // 一直沒炸，是因為只有「翻轉」積木會把旗標打開，而那塊從沒被測過——
    // 一旦有人開啟垂直翻轉就是 AttributeError。
    //
    // **而且 X／Y 的意思跟直覺相反**（2026-08-18 用角落記號實測）：
    //   原圖記號在「上左」
    //   flip(FlipDir.X) → 「下左」   沿 X 軸翻 ＝ 上下顛倒 ＝ 垂直翻轉
    //   flip(FlipDir.Y) → 「上右」   沿 Y 軸翻 ＝ 左右鏡像 ＝ 水平翻轉
    // 第一次改的時候照字面把 VFLIP 接到 Y、HMIRROT 接到 X，兩個都反了。
    //
    // 相機本身也有硬體的 vflip()／hmirror()，但**開機值就是 1**（感測器
    // 本來就裝反了，韌體先翻回來）。用硬體的話「啟用翻轉」＝設成 1
    // ＝畫面不變，跟積木字面意思相反。所以維持軟體翻轉：`啟用` 就是
    // 「跟不啟用時上下相反」，跟使用者的直覺一致。實測代價 2%（60.1 → 59.8 fps）。
    Blockly.Python.definitions_['v831_camera_capture'] = `def getLcdRotation(cameraCapture):
    global SETVFLIP, SETHMIRROT
    if SETVFLIP:
        cameraCapture = cameraCapture.flip(image.FlipDir.X)
    if SETHMIRROT:
        cameraCapture = cameraCapture.flip(image.FlipDir.Y)
    return cameraCapture
`
    var _code = `getLcdRotation(cam.read())`;
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

//   图传
Blockly.Blocks['v831_camera_graph_transmission'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_transmission_setup_show);
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_transmission_init_setup_source)
            .appendField(new Blockly.FieldVariable("img_graphTransmission"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.v831_transmission_setup_show);
        this.setHelpUrl('');
    }
};
Blockly.Python.v831_camera_graph_transmission = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    // 這塊把一張圖編成 JPEG，用 base64 印到 stdout；index.js:1818 認得
    // `data:image/jpg;base64,` 開頭，把它畫進頁面上那塊 300x150 的小畫布。
    // **輸出格式一個字都不能改**，頁面那邊是字串比對。
    //
    // v4 沒有 `maix.utils.rgb2jpg`，而 **`img.to_jpeg()` 在這台韌體（4.12.5）上是
    // SIGBUS**——`to_format(FMT_JPEG)`、`compress()` 一樣，任何尺寸任何格式都炸。
    // 唯一還活著的 JPEG 路徑是 `img.save("x.jpg")`，實測 640x480 有 60 fps，
    // 而且 /tmp 是 tmpfs（224M，在 RAM 裡），不會磨快閃記憶體。
    //
    // 縮到寬 320 再編碼：目的地是 300x150 的畫布，送原尺寸只是把 43KB 的
    // base64 塞進序列埠。V831 時代相機原生就是 320x240，所以這也是回到原本的量。
    Blockly.Python.definitions_['v831_graph_transmission'] = `_GRAPH_TX_JPG = "/tmp/_cocopi_graph_tx.jpg"


def graphTransmission(img):
    if img.width() > 320:
        img = img.resize(320, img.height() * 320 // img.width())
    img.save(_GRAPH_TX_JPG, 80)
    with open(_GRAPH_TX_JPG, "rb") as f:
        print("data:image/jpg;base64," + base64.b64encode(f.read()).decode())
    time.sleep(0.1)
`
    return `graphTransmission(${variable_name})\n`
}
Blockly.Blocks['v831_camera_internet_transmission'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_internet_transmission_setup_show);
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_transmission_init_setup_source)
            .appendField(new Blockly.FieldVariable("img_graphTransmission"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.v831_transmission_setup_show);
        this.setHelpUrl('');
    }
};
Blockly.Python.v831_camera_internet_transmission = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // 舊實作用 `maix.mjpg`（V831 專屬），v4 沒有這個模組。
    //
    // v4 **有**官方的 `maix.http.JpegStreamer`，但在這台上用不了：它的
    // `write()` 只吃 JPEG 格式的 Image，而唯一能產生那種 Image 的
    // `to_jpeg()` 在韌體 4.12.5 上是 SIGBUS（見圖傳那塊的註解）。
    // 傳 RGB 進去它會自己轉——一樣炸。
    //
    // 所以自己開一台。只用標準函式庫，跟圖傳共用 `save()` 這條唯一活著的
    // JPEG 路徑。實測 640x480 跑 25 秒 1486 幀＝59.4 fps，串流沒有拖慢主迴圈。
    //
    // 埠沿用舊積木的 18811。伺服器跑在背景執行緒（daemon），主程式結束就跟著走。
    Blockly.Python.definitions_['v831_import_mjpg_server'] = `import socket
import socketserver
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer`
    Blockly.Python.definitions_['v831_mjpg_server'] = `_MJPG_PORT = 18811
_MJPG_JPG = "/tmp/_cocopi_stream.jpg"
_mjpgFrame = [b"", 0]
_mjpgCond = threading.Condition()
_MJPG_HTML = (b'<!DOCTYPE html><html><head><meta charset="utf-8"><title>CocoPi</title>'
              b'</head><body style="margin:0;background:#111;text-align:center">'
              b'<img src="/stream" style="max-width:100%"></body></html>')


class _MjpgHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.0"

    def do_GET(self):
        if self.path != "/stream":
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.send_header("Content-Length", str(len(_MJPG_HTML)))
            self.end_headers()
            self.wfile.write(_MJPG_HTML)
            return
        self.send_response(200)
        self.send_header("Content-Type", "multipart/x-mixed-replace; boundary=cocopi")
        self.end_headers()
        seen = -1
        try:
            while True:
                # 等新的一幀。逾時是為了讓瀏覽器關掉之後這條執行緒能發現對面走了。
                with _mjpgCond:
                    _mjpgCond.wait_for(lambda: _mjpgFrame[1] != seen, timeout=2)
                    jpg, seen = _mjpgFrame[0], _mjpgFrame[1]
                if jpg:
                    self.wfile.write(b"--cocopi\\r\\nContent-Type: image/jpeg\\r\\n"
                                     b"Content-Length: " + str(len(jpg)).encode()
                                     + b"\\r\\n\\r\\n" + jpg + b"\\r\\n")
        except Exception:
            pass

    def log_message(self, *a):
        # 預設每收一個請求就往 stderr 印一行，會把 REPL 洗版。
        pass


def internetTransmission(img):
    img.save(_MJPG_JPG, 80)
    with open(_MJPG_JPG, "rb") as f:
        data = f.read()
    with _mjpgCond:
        _mjpgFrame[0] = data
        _mjpgFrame[1] += 1
        _mjpgCond.notify_all()


class _MjpgServer(ThreadingHTTPServer):
    # HTTPServer.server_bind() 會呼叫 socket.getfqdn("0.0.0.0") 反查主機名，
    # 板子上這個查詢要等 DNS 逾時，實測卡 20 秒。名稱只用在 CGI 環境變數，這裡用不到，跳過。
    def server_bind(self):
        socketserver.TCPServer.server_bind(self)
        self.server_name = "cocopi"
        self.server_port = self.server_address[1]


_mjpgServer = _MjpgServer(("0.0.0.0", _MJPG_PORT), _MjpgHandler)
_mjpgServer.daemon_threads = True
threading.Thread(target=_mjpgServer.serve_forever, daemon=True).start()
_mjpgSock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
try:
    _mjpgSock.connect(("8.8.8.8", 80))
    print("用瀏覽器打開 http://%s:%d" % (_mjpgSock.getsockname()[0], _MJPG_PORT))
except Exception:
    print("用瀏覽器打開 http://<裝置的IP>:%d" % _MJPG_PORT)
_mjpgSock.close()
`
    return `internetTransmission(${variable_name})\n`
}
Blockly.Blocks['ai_camera_lens_corr'] = {
    init: function () {
        this.appendValueInput("lens_corr")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_camera_set_lens_corr);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_camera_lens_corr_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_camera_lens_corr'] = function (block) {
    var value_lens_corr = Blockly.Python.valueToCode(block, 'lens_corr', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = value_lens_corr + '.lens_corr(strength = 1.8, zoom = 1.0)';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};





Blockly.Blocks['ai_camera_image_property_change'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_bcs_set_text_2)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_bcs_vflip, "set_vflip"],
                [Blockly.Msg.ai_camera_bcs_hmirror, "set_hmirror"],
                // [Blockly.Msg.ai_camera_bcs_wb, "set_auto_whitebal"],
                // [Blockly.Msg.ai_camera_bcs_g, "set_auto_gain"],
                // [Blockly.Msg.ai_camera_bcs_e, "set_auto_exposure"]
            ]), "image_property")
            .appendField(Blockly.Msg.ai_camera_bcs_as_2)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_enable + Blockly.Msg.ai_camera_bcs_status, "True"],
                [Blockly.Msg.ai_camera_disable + Blockly.Msg.ai_camera_bcs_status, "False"]
            ]), "DEGREE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('image_property');
            var TOOLTIPS = {
                'set_vflip': Blockly.Msg.ai_camera_image_property_change_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_vflip),
                'set_hmirror': Blockly.Msg.ai_camera_image_property_change_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_hmirror),
                'set_auto_whitebal': Blockly.Msg.ai_camera_image_property_change_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_wb),
                'set_auto_gain': Blockly.Msg.ai_camera_image_property_change_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_g),
                'set_auto_exposure': Blockly.Msg.ai_camera_image_property_change_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_e)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_image_property_change = function (block) {
    var degee = block.getFieldValue('DEGREE');
    var dropdown_image_property = block.getFieldValue('image_property');

    var _code = ``;
    if (dropdown_image_property == "set_vflip") {
        _code = `SETVFLIP = ${degee}
`
    } else if (dropdown_image_property == "set_hmirror") {
        _code = `SETHMIRROT = ${degee}
`
    }
    return _code;
}







Blockly.Blocks['ai_camera_vflip'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_vflip)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_enable, "True"],
                [Blockly.Msg.ai_camera_disable, "False"]
            ]), "DEGREE")
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_vflip = function (block) {
    var degee = block.getFieldValue('DEGREE');
    var _code = "sensor.set_vflip(" + degee + ")\n";
    return _code;
}

Blockly.Blocks['ai_camera_hmirror'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_hmirror)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_enable, "True"],
                [Blockly.Msg.ai_camera_disable, "False"]
            ]), "DEGREE")
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_hmirror = function (block) {
    var degee = block.getFieldValue('DEGREE');
    var _code = "sensor.set_hmirror(" + degee + ")\n"
    return _code;
}

Blockly.Blocks['ai_camera_auto_whitebal'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_auto_whitebal)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_enable, "True"],
                [Blockly.Msg.ai_camera_disable, "False"]
            ]), "DEGREE")
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_auto_whitebal = function (block) {
    var degee = block.getFieldValue('DEGREE');
    var _code = "sensor.set_auto_whitebal(" + degee + ")\n"
    return _code;
}

Blockly.Blocks['ai_camera_auto_gain'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_auto_gain)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_enable, "True"],
                [Blockly.Msg.ai_camera_disable, "False"]
            ]), "DEGREE")
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_auto_gain = function (block) {
    var degee = block.getFieldValue('DEGREE');
    var _code = "sensor.set_auto_gain(" + degee + ")\n"
    return _code;
}

Blockly.Blocks['ai_camera_auto_exposure'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_auto_exposure)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_enable, "True"],
                [Blockly.Msg.ai_camera_disable, "False"]
            ]), "DEGREE")
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_auto_exposure = function (block) {
    var degee = block.getFieldValue('DEGREE');
    var _code = "sensor.set_auto_exposure(" + degee + ")\n"
    return _code;
}






Blockly.Blocks['ai_camera_bcs_operation'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_bcs_set_text)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_camera_bcs_contrast, "contrast"],
                [Blockly.Msg.ai_camera_bcs_brightness, "brightness"],
                [Blockly.Msg.ai_camera_bcs_saturation, "saturation"]
            ]), "image_property")
            .appendField(Blockly.Msg.ai_camera_bcs_as);
        this.appendValueInput("A").setCheck("Number");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_range);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(!0);
        this.setColour("#60c1bb");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('image_property');
            var TOOLTIPS = {
                'contrast': Blockly.Msg.ai_camera_bcs_operation_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_contrast),
                'brightness': Blockly.Msg.ai_camera_bcs_operation_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_brightness),
                'saturation': Blockly.Msg.ai_camera_bcs_operation_TOOLTIP.replace('%1', Blockly.Msg.ai_camera_bcs_saturation)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_bcs_operation = function (block) {
    var dropdown_image_property = block.getFieldValue('image_property');
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);

    var _code = "sensor.set_" + dropdown_image_property + "(" + _x + ")\n"
    return _code;
}







Blockly.Blocks['ai_camera_contrast'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_contrast_to_value);
        this.appendValueInput("A").setCheck("Number");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_range);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(!0);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_contrast = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _code = "sensor.set_contrast(" + _x + ")\n"
    return _code;
}

Blockly.Blocks['ai_camera_brightness'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_brightness_to_value);
        this.appendValueInput("A").setCheck("Number");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_range);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(!0);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_brightness = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _code = "sensor.set_brightness(" + _x + ")\n"
    return _code;
}

Blockly.Blocks['ai_camera_saturation'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_saturation_value);
        this.appendValueInput("A").setCheck("Number");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_camera_set_range);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(!0);
        this.setColour("#60c1bb");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_camera_saturation = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _code = "sensor.set_saturation(" + _x + ")\n"
    return _code;
}
