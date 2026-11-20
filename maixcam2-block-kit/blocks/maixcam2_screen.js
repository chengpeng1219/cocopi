/*
 * Screen 分類的積木：畫布、繪圖、文字、旋轉。
 *
 * 2026-08-17 從 ai.js 原樣搬過來，**一個字都沒改**——驗收條件是
 * `tools/codegen-snapshot/run.js --check` 報 0 變動。搬家和改邏輯分成
 * 兩次 commit，改壞了才看得出是哪一步造成的。
 *
 * 為什麼搬：ai.js 一萬兩千行，裡面混著螢幕、相機、音訊、模型、網路。
 * 這些積木共用 `Blockly.Python.definitions_` 的 key，混在一起時改一個
 * 可能默默影響另一個（`v831_font_set` 就被兩處寫入過）。
 *
 * 留在 ai.js 的：`lcd_set_position`／`lcd_set_width_height`／`lcd_set_color`
 * 那幾塊「兩個數值」的積木。它們被相機、AI、觸控各分類共用，不屬於任何一個。
 */


Blockly.Python.ai_lcd_screeninit = function (block) {
    var isScreen = block.getFieldValue('isScreen');
    Blockly.Python.definitions_['v831_import_display'] = `from maix import display`;
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`;
    Blockly.Python.definitions_['v831_import_camera'] = `from maix import camera`;
    Blockly.Python.definitions_['v831_import_app'] = `from maix import app`;
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    // 字型與相機初始化共用同一個 key，避免與 ai_camera_init 重複輸出
    Blockly.Python.definitions_['v831_font_set'] = `image.load_font("cocopi", "/maixapp/share/font/SourceHanSansCN-Regular.otf", size = 20)
image.set_default_font("cocopi")
`
    Blockly.Python.definitions_['v831_display_init'] = `disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()
`
    Blockly.Python.addVariable("ScreenOrientation", `ScreenOrientation = ${isScreen}`, true)
    // 相機解析度改由 ai_camera_init 於建立 camera.Camera() 時決定（MaixPy v4 無 camera.config）
    //
    // 邏輯畫面尺寸從裝置讀，不寫死——2026-08-11 改。
    //
    // 原本是寫死的 320x240（橫）／240x320（豎），那是 V831 的面板尺寸。
    // 在舊機上畫布 = 面板，1:1 沒有縮放；搬到 pi2（面板 640x480）之後還沿用
    // 320x240，就變成每一幀都被 disp.show() 放大兩倍——細線糊掉、顏色褪色，
    // 每一張驗證卡都看得到（診斷過程見 tools/e2e/probe-scale.py）。
    // 而且相機的原生預設也是 640x480，寫死等於把相機也一起降級成一半。
    //
    // 用 DISP_W/DISP_H 而不是寫死 640/480：換一塊面板不同的板子也自動對。
    // 豎屏把長寬對調，跟原本的 240x320 是同一個意思。
    Blockly.Python.addVariable("CAM_W", `CAM_W = ${isScreen === 'True' ? 'DISP_H' : 'DISP_W'}`, true)
    Blockly.Python.addVariable("CAM_H", `CAM_H = ${isScreen === 'True' ? 'DISP_W' : 'DISP_H'}`, true)
    return '';
}


Blockly.Blocks['ai_lcd_rotation'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.LCD_CANVAS)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_set_lcd_rotation)
            .appendField(new Blockly.FieldDropdown([
                ["0°", "0"],
                ["90°", "90"],
                ["180°", "180"],
                ["270°", "270"]
            ]), "DEGREE")
            .appendField(Blockly.Msg.CATEGORY_SHOW)
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_rotation_TOOLTIP);
        this.setHelpUrl('');
    }
}

Blockly.Python.ai_lcd_rotation = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_name = block.getFieldValue('DEGREE');
    Blockly.Python.definitions_['v831_rotation_fun'] = `
def screenShow(inputImg,rotationAngle):
    #global img_drop

    if rotationAngle==90 or rotationAngle == 270:
        screenCapture=inputImg.crop(0,0,DISP_H,DISP_W)
    else:
        screenCapture=inputImg.crop(0,0,DISP_W,DISP_H)
    ${variable_name}_screenShow = screenCapture.rotate(rotationAngle)
    disp.show(${variable_name}_screenShow)
`
    let w = ''
    let h = ''
    if (dropdown_name == 90 || dropdown_name == 270) {
        w = 240
        h = 320
    } else {
        w = 320
        h = 240
    }
    var _code = `screenShow(${variable_name},${dropdown_name})
`;
    return _code;;
}


Blockly.Blocks['ai_lcd_font'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.image_lcd_set_font)
        this.appendValueInput("save_path")
            .setCheck(null)
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.image_lcd_set_font);
        this.setHelpUrl('');
    }
}

Blockly.Python.ai_lcd_font = function (block) {
    // var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var font_path = Blockly.Python.valueToCode(block, 'save_path', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['ai_lcd_font'] = `image.load_font("user_font", ${font_path}, size = 20)
image.set_default_font("user_font")
`
    var _code = "";
    return _code;;
}



Blockly.Blocks['ai_lcd_filp'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_set_lcd_mirror_flip)
            .appendField(new Blockly.FieldCheckbox('TRUE'), 'TextCheckBox');
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_filp_TOOLTIP);
        this.setHelpUrl('');
    }
}

Blockly.Python.ai_lcd_filp = function (block) {
    var _tf = block.getFieldValue('TextCheckBox') == 'TRUE' ? "True" : "False";
    var _code = "lcd.mirror(" + _tf + ")\n";
    return _code;
}


Blockly.Blocks['ai_lcd_screen'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_set_filled_screen_color)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_set_filled_screen_color_red, "RED"],
                [Blockly.Msg.image_process_set_filled_screen_color_green, "GREEN"],
                [Blockly.Msg.image_process_set_filled_screen_color_blue, "BLUE"],
                [Blockly.Msg.image_process_set_filled_screen_color_purple, "PURPLE"],
                [Blockly.Msg.image_process_set_filled_screen_color_cyan, "CYAN"],
                [Blockly.Msg.image_process_set_filled_screen_color_orange, "ORANGE"],
                [Blockly.Msg.image_process_set_filled_screen_color_yellow, "YELLOW"],
                [Blockly.Msg.image_process_set_filled_screen_color_black, "BLACK"],
                [Blockly.Msg.image_process_set_filled_screen_color_white, "WHITE"]
            ]), "COLOR");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('COLOR');
            var TOOLTIPS = {
                'RED': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_red),
                'GREEN': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_green),
                'BLUE': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_blue),
                'PURPLE': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_purple),
                'CYAN': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_cyan),
                'ORANGE': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_orange),
                'YELLOW': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_yellow),
                'BLACK': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_black),
                'WHITE': Blockly.Msg.ai_lcd_screen_TOOLTIP.replace('%1', Blockly.Msg.image_process_set_filled_screen_color_white)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_screen = function (block) {
    var colour_name = block.getFieldValue('COLOR');
    var _code = "lcd.clear(lcd." + colour_name + ")\n";
    return _code;
}


Blockly.Blocks['ai_lcd_fill_screen_with_rgb'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_let_canvas_filled_with_color);
        this.appendValueInput("rgb_value")
            .setCheck(null)
            .appendField("");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_fill_screen_with_rgb_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lcd_fill_screen_with_rgb'] = function (block) {
    var value_name = Blockly.Python.valueToCode(block, 'rgb_value', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    if (value_name.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == value_name.length && (d = parseInt(value_name.substring(1, 3), 16),
                e = parseInt(value_name.substring(3, 5), 16),
                f = parseInt(value_name.substring(5, 7), 16))
        } catch (g) { }
        // TODO: Assemble Python into code variable.
        value_name = "(" + d + "," + e + "," + f + ")";
    }
    var code = `${variable_name} = image.Image(_${variable_name}_w, _${variable_name}_h, bg=image.Color.from_rgb(*${value_name}))
`;
    return code;
};


Blockly.Blocks['ai_lcd_clear'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_clear_lcd);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_clear_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_clear = function (block) {
    var _code = "lcd.clear(lcd.BLACK)\n";
    return _code;
}


Blockly.Blocks['ai_lcd_rgb_value_input'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_rgb_r);
        this.appendValueInput("rgb_value_r")
            .setCheck(null)
            .appendField("");
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_rgb_g);
        this.appendValueInput("rgb_value_g")
            .setCheck(null)
            .appendField("");
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_rgb_b);
        this.appendValueInput("rgb_value_b")
            .setCheck(null)
            .appendField("");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_rgb_value_input_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lcd_rgb_value_input'] = function (block) {
    var value_rgb_value_r = Blockly.Python.valueToCode(block, 'rgb_value_r', Blockly.Python.ORDER_ATOMIC);
    var value_rgb_value_g = Blockly.Python.valueToCode(block, 'rgb_value_g', Blockly.Python.ORDER_ATOMIC);
    var value_rgb_value_b = Blockly.Python.valueToCode(block, 'rgb_value_b', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = '' + value_rgb_value_r + ',' + value_rgb_value_g + ',' + value_rgb_value_b + '';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks.ai_lcd_XY = {
    init: function () {
        var _input = this.appendDummyInput();
        this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
        this.setTooltip(Blockly.Msg.ai_lcd_XY_TOOLTIP);
        this.setColour("#5bb2d6");
        this.setOutput(!0, "Boolean");
        _input.appendField(Blockly.Msg.image_process_xy_x);
        this.appendValueInput("A").setCheck("Number");
        _input = this.appendDummyInput();
        _input.appendField(Blockly.Msg.image_process_xy_y)
        this.appendValueInput("B").setCheck("Number");
        this.setInputsInline(!0);
    }
};

Blockly.Python.ai_lcd_XY = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _y = Blockly.Python.valueToCode(block, "B", Blockly.Python.ORDER_ATOMIC);
    var code = "" + _x + ", " + _y + "";
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.ai_lcd_WH = {
    init: function () {
        var _input = this.appendDummyInput();
        this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
        this.setTooltip(Blockly.Msg.ai_lcd_WH_TOOLTIP);
        this.setColour("#5bb2d6");
        this.setOutput(!0, "Boolean");
        _input.appendField(Blockly.Msg.image_process_wh_width);
        this.appendValueInput("A").setCheck("Number");
        _input = this.appendDummyInput();
        _input.appendField(Blockly.Msg.image_process_wh_height)
        this.appendValueInput("B").setCheck("Number");
        this.setInputsInline(!0);
    }
};

Blockly.Python.ai_lcd_WH = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _y = Blockly.Python.valueToCode(block, "B", Blockly.Python.ORDER_ATOMIC);
    var code = "" + _x + ", " + _y + "";
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['ai_lcd_colortext'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_text.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_lcd_show_text);
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_lcd_show_text_color)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_lcd_show_text_color_white, "WHITE"],
                [Blockly.Msg.image_process_lcd_show_text_color_black, "BLACK"],
                [Blockly.Msg.image_process_lcd_show_text_color_red, "RED"],
                [Blockly.Msg.image_process_lcd_show_text_color_green, "GREEN"],
                [Blockly.Msg.image_process_lcd_show_text_color_blue, "BLUE"],
                [Blockly.Msg.image_process_lcd_show_text_color_purple, "PURPLE"],
                [Blockly.Msg.image_process_lcd_show_text_color_cyan, "CYAN"],
                [Blockly.Msg.image_process_lcd_show_text_color_orange, "ORANGE"],
                [Blockly.Msg.image_process_lcd_show_text_color_yellow, "YELLOW"]
            ]), "COLOR");
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_lcd_show_text_bg_color)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_lcd_show_text_color_black, "BLACK"],
                [Blockly.Msg.image_process_lcd_show_text_color_white, "WHITE"],
                [Blockly.Msg.image_process_lcd_show_text_color_red, "RED"],
                [Blockly.Msg.image_process_lcd_show_text_color_green, "GREEN"],
                [Blockly.Msg.image_process_lcd_show_text_color_blue, "BLUE"],
                [Blockly.Msg.image_process_lcd_show_text_color_purple, "PURPLE"],
                [Blockly.Msg.image_process_lcd_show_text_color_cyan, "CYAN"],
                [Blockly.Msg.image_process_lcd_show_text_color_orange, "ORANGE"],
                [Blockly.Msg.image_process_lcd_show_text_color_yellow, "YELLOW"]
            ]), "BCOLOR");
        this.appendValueInput("CONTENT")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_content);
        /* this.appendDummyInput()
            .appendField(Blockly.Msg.LCDDT); */
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['ai_lcd_colortext'] = function (block) {
    var color = block.getFieldValue("COLOR");
    var bcolor = block.getFieldValue("BCOLOR");
    var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
    var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    //var size = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
    var _code = "lcd_draw_string(lcd," + xy + ", " + content + ", color=" + color + ")\n"; //, scale=" + size + "
    // return [_code, Blockly.Python.ORDER_ATOMIC]
    return _code;
};

Blockly.Python.ai_lcd_createnonecarvas = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    let wh = value_wh.split(',');
    Blockly.Python.addVariable("_" + variable_name + "_w", `_${variable_name}_w = ${wh[0]}`, true);
    Blockly.Python.addVariable("_" + variable_name + "_h", `_${variable_name}_h = ${wh[1]}`, true);
    // MaixPy v4：image.new(size=(w,h)) → image.Image(w, h)
    // bg 不可省：image.Image() 配置的是未初始化記憶體，畫面會出現雜訊，
    // 違反合約 3.1「創建空白畫布」。舊的 image.new() 會清零。
    var _code = variable_name + " = image.Image(" + value_wh + ", bg=image.COLOR_BLACK)\n";
    return _code;
}

Blockly.Python.ai_lcd_fillcanvas = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_color = Blockly.Python.valueToCode(block, 'color', Blockly.Python.ORDER_ATOMIC);

    var _code = variable_name + '.draw_rectangle(0,0, ' + variable_name + '.width(),' + variable_name + '.height(), color=' + value_color + ', thickness=1, fill=True)\n';
    return _code;
}

Blockly.Python.ai_lcd_createcarvas = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // var checkbox_name = block.getFieldValue('check') == 'TRUE' ? "True" : "False";
    var text_name = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    var _code = variable_name + " = image.open(" + text_name + ")\n";
    return _code;
}



Blockly.Blocks['ai_lcd_showcarvas_set_cord'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_set_canvas_setup)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_start_coord_as);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5cb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_showcarvas_set_cord_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python.ai_lcd_showcarvas_set_cord = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_name = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = "_" + variable_name + "_x, _" + variable_name + "_y = " + value_name + "\n";
    return code;
};


Blockly.Blocks['ai_lcd_showcarvas_set_display'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_show_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5cb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_showcarvas_set_display_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_lcd_showcarvas_set_display = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.addVariable(`_${variable_name}_x`, `_${variable_name}_x = 0`, true)
    Blockly.Python.addVariable(`_${variable_name}_y`, `_${variable_name}_y = 0`, true)
    // MaixPy v4：image.new → image.Image、draw_rectangle → draw_rect、
    //            draw_image 參數順序由 (img, x, y) 改為 (x, y, img)、display.show → disp.show
    //
    // 旋轉：v4 的 rotate() 沒有 expand 參數。原本 MaixPy3 的 adjust=1（旋轉後放大到
    // 不裁切）在 v4 是預設行為——角度為 90 或 270 且 width/height 留 -1 時會自動交換
    // 長寬。角度必須寫 90 或 270，寫 -90 不會觸發交換，會拋 exception。
    //
    // 合成畫布用 CAM_W x CAM_H（邏輯畫面），不是 DISP_W x DISP_H（實體面板）。
    // 遷移前原本就是這樣：豎屏 image.new(size=(240,320))、橫屏 (320,240)，兩者正好
    // 等於 CAM_W x CAM_H。V831 面板剛好也是 320x240，兩者相等所以看不出差別；pi2
    // 面板較大，改用面板尺寸的話使用者的 320x240 內容只鋪滿左上角——2026-08-07
    // 實機確認相機畫面只佔左上 1/4，就是這個原因。
    //
    // 放大到滿版交給 disp.show()：其預設 fit=FIT_CONTAIN 會保持比例縮放並補黑邊。
    // 邏輯畫面現在等於面板尺寸（CAM_W = DISP_W），所以預設路徑根本不縮放。
    //
    // 曾經在這裡插過一層自己用 NEAREST 縮放的 v831_show_fit()，2026-08-11 移除：
    // 當初以為它能修「矩形四條邊粗細不一致」，實測證明那是面板特性（緩衝區四邊
    // 等寬、顏色純正，見 tools/e2e/probe-pixels.py）。它真正能修的是「放大時混色」，
    // 但那只影響細線，而細線的問題已由線寬改成 2 獨立解決；留著等於拿 CPU 時間
    // （每幀一次全畫面軟體 resize）去換一個預設路徑用不到的效果。
    // CAM_W/CAM_H 的橫豎對調已由 ai_lcd_screeninit 決定，所以這裡不必再對調。
    Blockly.Python.definitions_[`v831_display_show_${variable_name}`] = `def v831_display_show_${variable_name}(displayShow):
    global _${variable_name}_y,_${variable_name}_x,ScreenOrientation
    displayShowCanvas = image.Image(CAM_W, CAM_H, bg=image.COLOR_BLACK)
    displayShowCanvas.draw_image(_${variable_name}_x, _${variable_name}_y, displayShow)
    if ScreenOrientation:
        disp.show(displayShowCanvas.rotate(90))
    else:
        disp.show(displayShowCanvas)
`
    var code = `v831_display_show_${variable_name}(${variable_name})
`;
    return code;
};






Blockly.Blocks['ai_lcd_showcarvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_show_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5cb2d6");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_lcd_showcarvas = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_name = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = "lcd.display(" + variable_name + ", oft=(" + value_name + "))\n";
    return code;
};


Blockly.Blocks['ai_lcd_clearcanvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_clear_canvas_1)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_clear_canvas_2);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_clearcanvas_TOOLTIP);
        this.setHelpUrl('');
    }
}

Blockly.Python.ai_lcd_clearcanvas = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = variable_name + ".clear()\n";
    return _code;;
}
// ai_lcd_textcarvas_new_line
Blockly.Blocks['ai_lcd_textcarvas_new_line'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_text.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw + Blockly.Msg.image_process_draw_text);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("CONTENT")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_content);
        this.appendValueInput("dispalyStr")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_dispalyStr);
        // 「上翻／下翻按鈕」那兩個插槽 2026-08-17 拿掉了：捲動改成手指滑動，
        // 不再由使用者接按鈕。當時只從工具箱的預設拿掉、忘了拆這裡，
        // 結果盤面上還留著兩個接了也沒用的插槽（生成器根本沒讀它們）。
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        this.appendValueInput("Scale")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_draw_text_font_size);
        this.appendValueInput("LineNum")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_line_heigit);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.image_process_draw_text_if_monospace)
        //     .appendField(new Blockly.FieldCheckbox("FALSE"), "bool");
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_textcarvas_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_textcarvas_new_line = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
    var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var scale = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
    var LineNum = Blockly.Python.valueToCode(block, 'LineNum', Blockly.Python.ORDER_ATOMIC);
    var dispalyStr = Blockly.Python.valueToCode(block, 'dispalyStr', Blockly.Python.ORDER_ATOMIC);
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = ""

    // 2026-08-17 改寫。原本三個問題，前兩個在 pi2 上是致命的：
    //   1. 靠 CocoPi 的 GPIO 按鍵翻頁（`BUTTON(14)`），pi2 沒有那些腳位
    //   2. `lineHeight = 240-posay` 寫死 V831 的解析度
    //   3. 防彈跳用 `time.sleep(0.1)`，把整個迴圈卡住 100 毫秒
    //
    // 現在改成手指捲動，可捲的高度改問畫布。**這塊積木留下來的價值是
    // 自動切行**——吃一整串長文字、按每行字數切開，使用者不必自己拉迴圈
    // 算每一行畫在哪。捲動只是配套，所以不再由使用者接線決定。
    maixScrollSetup();
    Blockly.Python.definitions_["ai_lcd_textcarvas_new_line"] = `def textCanvasNewLine(canvasName, posax, posay, text, Num, Scale, Color, LineNum):
    # 按「每行 Num 個字」把一整串切開。空字串也要有一行，否則下面會少算。
    lines = [text[i:i + Num] for i in range(0, len(text), Num)] or [""]
    # 可捲的距離＝內容總高減掉放得下的高度。裝得下就是 0，捲不動。
    limit = max(0, len(lines) * LineNum - (canvasName.height() - posay))
    _maixScrollUpdate(limit)
    for i, line in enumerate(lines):
        y = posay + i * LineNum - _maixScroll
        # 畫面外的跳過。文字畫在外面不會出事（實測只差 6%），
        # 但這裡行數可能上百，順手省掉。
        if -LineNum < y < canvasName.height():
            canvasName.draw_string(posax, y, line, scale=Scale, color=Color, thickness=1)
`
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        var bool = "False";
        // var bool = block.getFieldValue('bool') == "TRUE" ? "True" : "False";
        // var bool = Blockly.Python.valueToCode(block, 'POSC', Blockly.Python.ORDER_ATOMIC) == "TRUE" ? "True" : "False";

        // color=(" + d + "," + e + "," + f + ")" + ", font_size=" + size + ")\n"
        _code = `textCanvasNewLine(${variable_name},${xy},${content},${dispalyStr},${scale},image.Color.from_rgb(${d} ,${e}, ${f}),${LineNum})\n`
        // _code = variable_name + '.draw_string(' + xy + ', ' + content + ', scale = ' + scale + ', color = (' + d + ',' + e + ',' + f + ') , thickness = 1)\n'; // #在红色画布上写下hello world
    } else if (color.charAt(0) != '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        _code = `textCanvasNewLine(${variable_name},${xy},${content},${dispalyStr},${scale},image.Color.from_rgb(*${color}),${LineNum})\n`
        // _code = variable_name + '.draw_string(' + xy + ', ' + content + ', scale = ' + scale + ', color = ' + color + ', thickness = 1)\n' + // #在红色画布上写下hello world
        //     '';
    }
    return _code;
}

Blockly.Blocks['ai_lcd_textcarvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_text.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw + Blockly.Msg.image_process_draw_text);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("CONTENT")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_content);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        this.appendValueInput("Scale")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_draw_text_font_size);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.image_process_draw_text_if_monospace)
        //     .appendField(new Blockly.FieldCheckbox("FALSE"), "bool");
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_textcarvas_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_textcarvas = function (block) {

    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    var _code = ""
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        var bool = "False";
        // var bool = block.getFieldValue('bool') == "TRUE" ? "True" : "False";
        // var bool = Blockly.Python.valueToCode(block, 'POSC', Blockly.Python.ORDER_ATOMIC) == "TRUE" ? "True" : "False";
        var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var scale = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        // color=(" + d + "," + e + "," + f + ")" + ", font_size=" + size + ")\n"
        _code = variable_name + '.draw_string(' + xy + ', ' + content + ', scale = ' + scale + ', color = image.Color.from_rgb(' + d + ',' + e + ',' + f + ') , thickness = 1)\n'; // #在红色画布上写下hello world
    } else if (color.charAt(0) != '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        var bool = "False";
        // var bool = block.getFieldValue('bool') == "TRUE" ? "True" : "False";
        // var bool = Blockly.Python.valueToCode(block, 'POSC', Blockly.Python.ORDER_ATOMIC) == "TRUE" ? "True" : "False";
        var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var scale = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        _code = variable_name + '.draw_string(' + xy + ', ' + content + ', scale = ' + scale + ', color = image.Color.from_rgb(*' + color + '), thickness = 1)\n' + // #在红色画布上写下hello world
            '';
    }
    return _code;
}

Blockly.Blocks['ai_lcd_characterscarvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_hanzi_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw + Blockly.Msg.image_process_draw_characters);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("CONTENT")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_content);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_draw_text_font_size + "：")
            // .setCheck(null)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.SMALL, "1"],
                [Blockly.Msg.MIDDLE, "2"],
                [Blockly.Msg.LARGE, "3"]
            ]), "fonts");
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.Set_Auto_Wrap + "：")
        //     // .setCheck(null)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.LED_SCROLL_YES, "True"],
        //         [Blockly.Msg.LED_SCROLL_NO, "False"]
        //     ]), "wraps");
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_characterscarvas_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_characterscarvas = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    var _code = ''
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }

        // var bool = Blockly.Python.valueToCode(block, 'POSC', Blockly.Python.ORDER_ATOMIC) == "TRUE" ? "True" : "False";
        var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var size = block.getFieldValue('fonts');;
        // var wraps = block.getFieldValue('wraps');
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        _code = "lcd_draw_string(" + variable_name + ", " + xy + ", " + content + ", color=(" + d + "," + e + "," + f + ")" + ", font_size=" + size + ")\n";
    } else if (color.charAt(0) != '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }

        // var bool = Blockly.Python.valueToCode(block, 'POSC', Blockly.Python.ORDER_ATOMIC) == "TRUE" ? "True" : "False";
        var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var size = block.getFieldValue('fonts');;
        // var wraps = block.getFieldValue('wraps');
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        _code = "lcd_draw_string(" + variable_name + ", " + xy + ", " + content + ", color=" + color + ", font_size=" + size + ")\n";
    }
    return _code;
}

Blockly.Blocks['ai_lcd_linecarvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_line.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw + Blockly.Msg.image_process_draw_line);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("POSB")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_end_coord);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        this.appendValueInput("Scale")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_thick);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_linecarvas_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_linecarvas = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }

        var size = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var xy2 = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        // v4 的 color 只吃 image.Color，不吃 tuple。樣板同已驗過的 ai_lcd_ractanglecarvas。
        var _code = variable_name + ".draw_line(" + xy + ", " + xy2 + ", color=image.Color.from_rgb(" + d + "," + e + "," + f + "), thickness=" + size + ")\n";
    } else if (color.charAt(0) != '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }

        var size = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var xy2 = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        // color 是 ai_lcd_rgb_value_input 產的 "(r,g,b)"，星號解包成三個參數。
        var _code = variable_name + ".draw_line(" + xy + ", " + xy2 + ", color=image.Color.from_rgb(*" + color + "), thickness=" + size + ")\n";
    }
    return _code;
}

Blockly.Blocks['ai_lcd_draw_rectangle'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/line.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_rectangle.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_text_filled, "fillrect"],
                [Blockly.Msg.image_process_text_stroked, "rect"]
            ]), "rect_type")
            .appendField(Blockly.Msg.image_process_draw_rectangle_text);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("POSB")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_size);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        // this.appendValueInput("Scale")
        //     .setCheck("Number")
        //     .appendField(Blockly.Msg.image_process_text_thick);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('rect_type');
            var TOOLTIPS = {
                'fillrect': Blockly.Msg.ai_lcd_ractanglecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_filled),
                'rect': Blockly.Msg.ai_lcd_ractanglecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_stroked)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_draw_rectangle = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);

    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // 空心線寬用 2 而不是 1——2026-08-11 實機決定。
    // 1 會畫出「1 個實體像素」的線，這塊面板呈現單像素線時右邊和下邊會發灰；
    // 填 2 實際畫出來是 3 像素（線寬以邊界為中心往兩側長，見 probe-pixels.py），
    // 灰邊就消失了。四條邊看起來仍不完全一致，那是面板特性，程式碼改不掉
    // （緩衝區已驗證四邊等寬、顏色純正）。
    var type = block.getFieldValue('rect_type') == "fillrect" ? "-1" : "2";
    var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var size = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
    // console.log(xy.split(','),size.split(','))
    let a = xy.split(',')
    let b = size.split(',')
    let w = Number(a[0]) + Number(b[0])
    let h = Number(a[1]) + Number(b[1])
    var _code = ''
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        // var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        // var type = block.getFieldValue('rect_type') == "fillrect" ? "-1" : "1";
        // var th = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        // var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        // var size = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
        _code = `${variable_name}.draw_rect(${xy}, ${size}, color=image.Color.from_rgb(${d},${e},${f}), thickness=${type})
`
    } else if (color.charAt(0) != '#') {
        _code = `${variable_name}.draw_rect(${xy}, ${size}, color=image.Color.from_rgb(*${color}), thickness=${type})
`
    }
    return _code;
}


Blockly.Blocks['ai_lcd_ractanglecarvas'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/line.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_rectangle.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_text_filled, "fillrect"],
                [Blockly.Msg.image_process_text_stroked, "rect"]
            ]), "rect_type")
            .appendField(Blockly.Msg.image_process_draw_rectangle_text);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("POSB")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_end_coord);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        // this.appendValueInput("Scale")
        //     .setCheck("Number")
        //     .appendField(Blockly.Msg.image_process_text_thick);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('rect_type');
            var TOOLTIPS = {
                'fillrect': Blockly.Msg.ai_lcd_ractanglecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_filled),
                'rect': Blockly.Msg.ai_lcd_ractanglecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_stroked)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_ractanglecarvas = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);

    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // 空心線寬用 2 而不是 1——2026-08-11 實機決定。
    // 1 會畫出「1 個實體像素」的線，這塊面板呈現單像素線時右邊和下邊會發灰；
    // 填 2 實際畫出來是 3 像素（線寬以邊界為中心往兩側長，見 probe-pixels.py），
    // 灰邊就消失了。四條邊看起來仍不完全一致，那是面板特性，程式碼改不掉
    // （緩衝區已驗證四邊等寬、顏色純正）。
    var type = block.getFieldValue('rect_type') == "fillrect" ? "-1" : "2";
    var th = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
    var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var size = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
    // 這個積木收的是**兩個角**（標籤：起始點座標 / 結束點座標），MaixPy3 的
    // draw_rectangle 也收兩個角，所以舊碼直接把四個數字送進去。
    // v4 的 draw_rect(x, y, w, h) 收的是寬高，**必須換算**，否則結束點會被
    // 當成寬高——例如 (154,114)-(164,124) 這個 10×10 的框會變成 164×124。
    //
    // 換算不在產碼期做字串切割：真實專案裡 POSX 會塞 int(RGB[0]) 這類含括號
    // 的運算式，切逗號遲早切錯。交給 Python 在執行期算。
    Blockly.Python.definitions_['v831_draw_rect_corners'] = `
def v831_draw_rect_corners(img, x1, y1, x2, y2, color, thickness):
    img.draw_rect(x1, y1, x2 - x1, y2 - y1, color=color, thickness=thickness)
`
    // console.log(size,"111111111111")
    // // console.log(xy.split(','),size.split(','))
    // let a = xy.split(',')
    // let b = size.split(',')
    // let w = Number(a[0])+Number(b[0])
    // let h = Number(a[1])+Number(b[1])
    // let wh = `${w},${h}`
    // console.log('wh',wh)
    var _code = ''
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        // var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        // var type = block.getFieldValue('rect_type') == "fillrect" ? "-1" : "1";
        // var th = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        // var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        // var size = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
        // MaixPy v4：draw_rectangle → draw_rect，color 需為 image.Color 物件
        _code = `v831_draw_rect_corners(${variable_name}, ${xy}, ${size}, image.Color.from_rgb(${d},${e},${f}), ${type})
`
    } else if (color.charAt(0) != '#') {
        _code = `v831_draw_rect_corners(${variable_name}, ${xy}, ${size}, image.Color.from_rgb(*${color}), ${type})
`
    }
    return _code;
}


Blockly.Blocks['ai_lcd_drawcirclecarvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_circle.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/line.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_text_filled, "fillrect"],
                [Blockly.Msg.image_process_text_stroked, "rect"]
            ]), "rect_type")
            .appendField(Blockly.Msg.image_process_draw_circle_text);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_draw_circle_text_start);
        this.appendValueInput("Scale")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_radius);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        this.appendValueInput("Scale_0")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_thick);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('rect_type');
            var TOOLTIPS = {
                'fillrect': Blockly.Msg.ai_lcd_drawcirclecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_filled),
                'rect': Blockly.Msg.ai_lcd_drawcirclecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_stroked)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_drawcirclecarvas = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        // 空心線寬用 2 而不是 1——2026-08-11 實機決定。
    // 1 會畫出「1 個實體像素」的線，這塊面板呈現單像素線時右邊和下邊會發灰；
    // 填 2 實際畫出來是 3 像素（線寬以邊界為中心往兩側長，見 probe-pixels.py），
    // 灰邊就消失了。四條邊看起來仍不完全一致，那是面板特性，程式碼改不掉
    // （緩衝區已驗證四邊等寬、顏色純正）。
    var type = block.getFieldValue('rect_type') == "fillrect" ? "-1" : "2";
        var th = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var th0 = Blockly.Python.valueToCode(block, 'Scale_0', Blockly.Python.ORDER_ATOMIC);
        var _code = variable_name + ".draw_circle(" + xy + ", " + th + ", color=image.Color.from_rgb(" + d + ", " + e + ", " + f + "), thickness=" + type + ")\n";
    } else if (color.charAt(0) != '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        // 空心線寬用 2 而不是 1——2026-08-11 實機決定。
    // 1 會畫出「1 個實體像素」的線，這塊面板呈現單像素線時右邊和下邊會發灰；
    // 填 2 實際畫出來是 3 像素（線寬以邊界為中心往兩側長，見 probe-pixels.py），
    // 灰邊就消失了。四條邊看起來仍不完全一致，那是面板特性，程式碼改不掉
    // （緩衝區已驗證四邊等寬、顏色純正）。
    var type = block.getFieldValue('rect_type') == "fillrect" ? "-1" : "2";
        var th = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var th0 = Blockly.Python.valueToCode(block, 'Scale_0', Blockly.Python.ORDER_ATOMIC);
        var _code = variable_name + ".draw_circle(" + xy + ", " + th + ", color=image.Color.from_rgb(*" + color + "), thickness=" + type + ")\n";
    }
    return _code;
}


// 椭圆，暂无具体位置参数
Blockly.Blocks['ai_lcd_drawcir_ellipse'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_circle.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/line.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_text_filled, "fillrect"],
                [Blockly.Msg.image_process_text_stroked, "rect"]
            ]), "rect_type")
            .appendField(Blockly.Msg.image_process_draw_ellipse_text);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_draw_circle_text_start);
        this.appendValueInput("Scale")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_radius);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_color);
        this.appendValueInput("Scale_0")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_text_thick);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('rect_type');
            var TOOLTIPS = {
                'fillrect': Blockly.Msg.ai_lcd_drawcirclecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_filled),
                'rect': Blockly.Msg.ai_lcd_drawcirclecarvas_TOOLTIP.replace('%1', Blockly.Msg.image_process_text_stroked)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_drawcir_ellipse = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    if (color.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        var type = block.getFieldValue('rect_type') == "fillrect" ? "1" : "-1";
        var th = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var th0 = Blockly.Python.valueToCode(block, 'Scale_0', Blockly.Python.ORDER_ATOMIC);
        var _code = variable_name + ".draw_circle(" + xy + ", " + th + ", color=(" + d + ", " + e + ", " + f + "), thickness=" + type + ")\n";
    } else if (color.charAt(0) != '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        var type = block.getFieldValue('rect_type') == "fillrect" ? "1" : "-1";
        var th = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
        var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
        var th0 = Blockly.Python.valueToCode(block, 'Scale_0', Blockly.Python.ORDER_ATOMIC);
        var _code = variable_name + ".draw_circle(" + xy + ", " + th + ", color=" + color + ", thickness=" + type + ")\n";
    }
    return _code;;
}


Blockly.Blocks['ai_lcd_draw_cross_sign'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_cross.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_draw_cross_title);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_cross_centerpos);
        this.appendValueInput("size")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_cross_length);
        this.appendValueInput("thickness")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_cross_thick);
        this.appendValueInput("color")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_cross_color);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_draw_cross_sign_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lcd_draw_cross_sign'] = function (block) {

    var color = Blockly.Python.valueToCode(block, 'color', Blockly.Python.ORDER_ATOMIC);
    if (color.charAt(0) == '#') {
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        var value_xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
        var value_size = Blockly.Python.valueToCode(block, 'size', Blockly.Python.ORDER_ATOMIC);
        var value_thickness = Blockly.Python.valueToCode(block, 'thickness', Blockly.Python.ORDER_ATOMIC);
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        // TODO: Assemble Python into code variable.
        var code = variable_name + '.draw_cross(' + value_xy + ', color=(' + d + ', ' + e + ', ' + f + '), size=' + value_size + ', thickness=' + value_thickness + ')\n';
    } else if (color.charAt(0) != '#') {
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        var value_xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
        var value_size = Blockly.Python.valueToCode(block, 'size', Blockly.Python.ORDER_ATOMIC);
        var value_thickness = Blockly.Python.valueToCode(block, 'thickness', Blockly.Python.ORDER_ATOMIC);
        // TODO: Assemble Python into code variable.
        var code = variable_name + '.draw_cross(' + value_xy + ', color=' + color + ', size=' + value_size + ', thickness=' + value_thickness + ')\n';
    }

    return code;
};


Blockly.Blocks['ai_lcd_draw_arrow_sign'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_arrow.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_draw_arrow_title);
        this.appendValueInput("xy1")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_arrow_start);
        this.appendValueInput("xy2")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_arrow_end);
        this.appendValueInput("color")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_arrow_color);
        this.appendValueInput("thickness")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_arrow_thick);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_draw_arrow_sign_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_lcd_draw_arrow_sign'] = function (block) {
    // TODO: Assemble Python into code variable.


    var color = Blockly.Python.valueToCode(block, 'color', Blockly.Python.ORDER_ATOMIC);
    if (color.charAt(0) == '#') {
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        var value_xy1 = Blockly.Python.valueToCode(block, 'xy1', Blockly.Python.ORDER_ATOMIC);
        var value_xy2 = Blockly.Python.valueToCode(block, 'xy2', Blockly.Python.ORDER_ATOMIC);
        var value_thickness = Blockly.Python.valueToCode(block, 'thickness', Blockly.Python.ORDER_ATOMIC);
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }
        // TODO: Assemble Python into code variable.
        var code = variable_name + '.draw_arrow(' + value_xy1 + ',' + value_xy2 + ', color=(' + d + ', ' + e + ', ' + f + '), thickness=' + value_thickness + ')\n';
    } else if (color.charAt(0) != '#') {
        var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
        var value_xy1 = Blockly.Python.valueToCode(block, 'xy1', Blockly.Python.ORDER_ATOMIC);
        var value_xy2 = Blockly.Python.valueToCode(block, 'xy2', Blockly.Python.ORDER_ATOMIC);
        var value_thickness = Blockly.Python.valueToCode(block, 'thickness', Blockly.Python.ORDER_ATOMIC);
        // TODO: Assemble Python into code variable.
        var code = variable_name + '.draw_arrow(' + value_xy1 + ',' + value_xy2 + ', color=(' + color + '), thickness=' + value_thickness + ')\n';
    }
    return code;
};

Blockly.Blocks['ai_lcd_draw_image_on_canvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_image.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_draw_image_title);
        this.appendValueInput("image_path")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_sensor_image_path);
        // this.appendValueInput("alpha")
        //     .setCheck(null)
        //     .appendField('图片透明度（范围0~1）');
        this.appendValueInput("scale_y")
            .setCheck(null)
            .appendField(Blockly.Msg.OLCD_COORDINATE);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_draw_image_on_canvas_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_lcd_draw_image_on_canvas'] = function (block) {
    // TODO: Assemble Python into code variable.

    // nav_up = image.Image("/sd/preset/images/arrow_up_filled.jpg")
    // splash.draw_image(nav_up, 5, 5)
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_image_path = Blockly.Python.valueToCode(block, 'image_path', Blockly.Python.ORDER_ATOMIC);
    var value_xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var value_scale_x = Blockly.Python.valueToCode(block, 'scale_x', Blockly.Python.ORDER_ATOMIC);
    var value_scale_y = Blockly.Python.valueToCode(block, 'scale_y', Blockly.Python.ORDER_ATOMIC);
    // let alpha = Blockly.Python.valueToCode(block, 'alpha', Blockly.Python.ORDER_ATOMIC)
    // TODO: Assemble Python into code variable.
    var code = '' +
        variable_name + '.draw_image(' + value_scale_y + ',' + value_image_path + ')\n' +
        '\n';

    return code;
};

Blockly.Blocks['ai_lcd_draw_image_sensor_on_canvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_image.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_draw_sensor_image_title);
        this.appendValueInput("image_path")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_draw_sensor_image_path);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_start_coord);
        // this.appendValueInput("scale_x")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.image_process_draw_image_scale_x);
        // this.appendValueInput("scale_y")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.image_process_draw_image_scale_y);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_draw_sensor_image_on_canvas_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_lcd_draw_image_sensor_on_canvas'] = function (block) {
    // TODO: Assemble Python into code variable.

    // nav_up = image.Image("/sd/preset/images/arrow_up_filled.jpg")
    // splash.draw_image(nav_up, 5, 5)
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_image_path = Blockly.Python.valueToCode(block, 'image_path', Blockly.Python.ORDER_ATOMIC);
    var value_xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    // var value_scale_x = Blockly.Python.valueToCode(block, 'scale_x', Blockly.Python.ORDER_ATOMIC);
    // var value_scale_y = Blockly.Python.valueToCode(block, 'scale_y', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = '' +
        variable_name + ' = ' + value_image_path + '\n' +
        '_photo_x, _photo_y = ' + value_xy +
        '\n';

    return code;
};


Blockly.Blocks['ai_lcd_qrcode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_qrcode_.png", 35, 35, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_on_draw + Blockly.Msg.image_process_draw_qrcode);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_start_coord);
        this.appendValueInput("CONTENT")
            .setCheck("String")
            .appendField(Blockly.Msg.image_process_text_content);
        this.appendValueInput("Scale")
            .setCheck("Number")
            .appendField(Blockly.Msg.image_process_draw_qr_code_size);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_qrcode_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_lcd_qrcode = function (block) {
    // var bool = Blockly.Python.valueToCode(block, 'POSC', Blockly.Python.ORDER_ATOMIC) == "TRUE" ? "True" : "False";
    var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
    var xy = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var size = Blockly.Python.valueToCode(block, 'Scale', Blockly.Python.ORDER_ATOMIC);
    // var wraps = block.getFieldValue('wraps');
    Blockly.Python.definitions_.import_qrcode = "from uQR import QRCode";

    Blockly.Python.definitions_['import_define_x_ai_lcd_qrcode'] = '' +
        'def draw_qr_code(canvas, x, y, text, scale):\n' +
        '    qr = QRCode()\n' +
        '    qr.add_data(str(text))\n' +
        '    matrix = qr.get_matrix()\n' +
        '    for row in matrix:\n' +
        '        for col in row:\n' +
        '            value = (not col) * 255\n' +
        '            a = canvas.draw_rectangle(x, y, scale, scale, color=(value, value, value), thickness=1, fill=True)\n' +
        '            x += scale\n' +
        '        y += scale\n' +
        '        x = 0\n' +
        '    del qr, matrix\n' +
        '\n';

    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = "draw_qr_code(" + variable_name + ", " + xy + ", " + content + ", scale=" + size + ")\n";
    return _code;
};

Blockly.Blocks['ai_lcd_invert_color'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_color_invert);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_lcd_invert_color_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lcd_invert_color'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.invert()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_lcd_color_scheme'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_color_scheme_convert)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_color_scheme_bw, "to_grayscale(1)"],
                [Blockly.Msg.image_process_color_scheme_rgb, "to_rgb565(1)"]
            ]), "color_scheme");
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('color_scheme');
            var TOOLTIPS = {
                'to_grayscale(1)': Blockly.Msg.ai_lcd_color_scheme_TOOLTIP.replace('%1', Blockly.Msg.image_process_color_scheme_bw),
                'to_rgb565(1)': Blockly.Msg.ai_lcd_color_scheme_TOOLTIP.replace('%1', Blockly.Msg.image_process_color_scheme_rgb)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lcd_color_scheme'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_vari = block.getFieldValue('color_scheme');
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.' + dropdown_vari;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_lcd_ai_pix'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_pixtovec_text_first)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_pixtovec_v2p, ".ai_to_pix()"],
                [Blockly.Msg.image_process_pixtovec_p2v, ".pix_to_ai()"]
            ]), "ai_pix_type")
            .appendField(Blockly.Msg.image_process_pixtovec_conversion);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#f0983e");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lcd_ai_pix'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_vari = block.getFieldValue('ai_pix_type');
    // TODO: Assemble Python into code variable.
    var code = 'a = ' + variable_name + dropdown_vari + '\n';
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};



/*
     _    ___  __     ___     _             
    / \  |_ _| \ \   / (_)___(_) ___  _ __  
   / _ \  | |   \ \ / /| / __| |/ _ \| '_ \ 
  / ___ \ | |    \ V / | \__ \ | (_) | | | |
 /_/   \_\___|    \_/  |_|___/_|\___/|_| |_|
                                            
*/

Blockly.Blocks.ai_lcd_XY_vision = {
    init: function () {
        var _input = this.appendDummyInput();
        this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
        this.setColour("#f0983e");
        this.setOutput(!0, "Boolean");
        _input.appendField(Blockly.Msg.X);
        this.appendValueInput("A").setCheck("Number");
        _input = this.appendDummyInput();
        _input.appendField(Blockly.Msg.Y)
        this.appendValueInput("B").setCheck("Number");
        this.setInputsInline(!0);
    }
};

Blockly.Python.ai_lcd_XY_vision = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _y = Blockly.Python.valueToCode(block, "B", Blockly.Python.ORDER_ATOMIC);
    var code = "" + _x + ", " + _y + "";
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks.ai_lcd_WH_vision = {
    init: function () {
        var _input = this.appendDummyInput();
        this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
        this.setColour("#f0983e");
        this.setOutput(!0, "Boolean");
        _input.appendField(Blockly.Msg.W);
        this.appendValueInput("A").setCheck("Number");
        _input = this.appendDummyInput();
        _input.appendField(Blockly.Msg.H)
        this.appendValueInput("B").setCheck("Number");
        this.setInputsInline(!0);
    }
};

Blockly.Python.ai_lcd_WH_vision = function (block) {
    var _x = Blockly.Python.valueToCode(block, "A", Blockly.Python.ORDER_ATOMIC);
    var _y = Blockly.Python.valueToCode(block, "B", Blockly.Python.ORDER_ATOMIC);
    var code = "" + _x + ", " + _y + "";
    return [code, Blockly.Python.ORDER_ATOMIC];
};
