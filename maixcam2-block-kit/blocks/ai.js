/*
     _    ___   ____            _      
    / \  |_ _| | __ )  __ _ ___(_) ___ 
   / _ \  | |  |  _ \ / _` / __| |/ __|
  / ___ \ | |  | |_) | (_| \__ \ | (__ 
 /_/   \_\___| |____/ \__,_|___/_|\___|
*/

Blockly.Blocks['ai_v831_button_read_pressed'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_button_when)
            .appendField(new Blockly.FieldDropdown([
                ["A", "A"],
                ["B", "B"],
                ["C", "C"],
                ["D", "D"]
            ]), "button_type")
            .appendField(Blockly.Msg.ai_basic_pressed)
        this.setOutput(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('button_type');
            var TOOLTIPS = {
                '0': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "A"),
                '1': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "B"),
                '2': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "C"),
                '3': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "D"),
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_v831_button_read_pressed'] = function (block) {
    var _type = block.getFieldValue('button_type');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_CocoPi_BUTTON'] = `from CocoPi import BUTTON`
    // Blockly.Python.definitions_['v831_import_CocoPi'] = `sys.path.append("/root/")`
    Blockly.Python.definitions_['import_define_x_v831_button'] = `key_A = BUTTON(14)
key_B = BUTTON(8)
key_C = BUTTON(13)
key_D = BUTTON(7)
`

    var code = `key_${_type}.is_pressed()`
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['ai_v831_button_read_released'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_button_when)
            .appendField(new Blockly.FieldDropdown([
                ["A", "A"],
                ["B", "B"],
                ["C", "C"],
                ["D", "D"]
            ]), "button_type_released")
            .appendField(Blockly.Msg.ai_basic_released)
        this.setOutput(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('button_type_released');
            var TOOLTIPS = {
                '0': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "A"),
                '1': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "B"),
                '2': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "C"),
                '3': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "D"),
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_v831_button_read_released'] = function (block) {
    var _type = block.getFieldValue('button_type_released');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_CocoPi_BUTTON'] = `from CocoPi import BUTTON`
    // Blockly.Python.definitions_['v831_import_CocoPi'] = `sys.path.append("/root/")`
    Blockly.Python.definitions_['import_define_x_v831_button'] = `key_A = BUTTON(14)
key_B = BUTTON(8)
key_C = BUTTON(13)
key_D = BUTTON(7)
`

    var code = `key_${_type}.is_pressed() == False`
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['ai_v831_button_del'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_button_when)
            .appendField(new Blockly.FieldDropdown([
                ["A", "A"],
                ["B", "B"],
                ["C", "C"],
                ["D", "D"]
            ]), "button_type_released")
            .appendField(Blockly.Msg.ai_basic_released)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('button_type_released');
            var TOOLTIPS = {
                '0': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "A"),
                '1': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "B"),
                '2': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "C"),
                '3': Blockly.Msg.ai_k210_button_read_pressed_TOOLTIP.replace('%1', "D"),
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_v831_button_del'] = function (block) {
    var _type = block.getFieldValue('button_type_released');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_CocoPi_BUTTON'] = `from CocoPi import BUTTON`
    // Blockly.Python.definitions_['v831_import_CocoPi'] = `sys.path.append("/root/")`
    Blockly.Python.definitions_['import_define_x_v831_button'] = `key_A = BUTTON(14)
key_B = BUTTON(8)
key_C = BUTTON(13)
key_D = BUTTON(7)
`

    var code = `key_${_type}.button.release()
del key_${_type}
`
    return code;
};

Blockly.Blocks['ai_v831_led_light_up'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_led_set)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_basic_led_blue, "blue"],
                // [Blockly.Msg.ai_basic_led_red, "red"]
            ]), "type")
            .appendField(Blockly.Msg.ai_basic_led_on);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'blue': Blockly.Msg.ai_k210_led_light_up_TOOLTIP.replace('%1', Blockly.Msg.ai_basic_led_blue),
                'red': Blockly.Msg.ai_k210_led_light_up_TOOLTIP.replace('%1', Blockly.Msg.ai_basic_led_red)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_v831_led_light_up'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_CocoPi_LED'] = `from CocoPi import LED
LED = LED()
`
    // TODO: Assemble Python into code variable.
    var code = `LED.out(1)
`;
    return code;
};

Blockly.Blocks['ai_v831_led_light_off'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_led_set)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_basic_led_blue, "blue"],
                // [Blockly.Msg.ai_basic_led_red, "red"]
            ]), "type")
            .appendField(Blockly.Msg.ai_basic_led_off);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'blue': Blockly.Msg.ai_k210_led_light_off_TOOLTIP.replace('%1', Blockly.Msg.ai_basic_led_blue),
                'red': Blockly.Msg.ai_k210_led_light_off_TOOLTIP.replace('%1', Blockly.Msg.ai_basic_led_red)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_v831_led_light_off'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_CocoPi_LED'] = `from CocoPi import LED
LED = LED()
`
    // TODO: Assemble Python into code variable.
    var code = `LED.out(0)
`;
    return code;
};

Blockly.Blocks['ai_v831_rgb_light_up'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_rgb_set_on)
        this.appendValueInput("rgb_value")
            .setCheck(null)
            .appendField("");
        this.appendDummyInput()
            .appendField(Blockly.Msg.LED_BRTN).appendField(new Blockly.FieldNumber(50, 0, 255), "uart_bps");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.ai_basic_rgb_set_on);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_v831_rgb_light_up'] = function (block) {
    var value_name = Blockly.Python.valueToCode(block, 'rgb_value', Blockly.Python.ORDER_ATOMIC);
    var content = block.getFieldValue('uart_bps');
    console.log(value_name.slice(1, -1))
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_CocoPi_RGB'] = `from CocoPi import singleRgb
singleRgb=singleRgb()`;

    var code = `singleRgb.setBrightness(${content})
singleRgb.setColor(${value_name.slice(1, -1)})
singleRgb.show()
time.sleep(0.05)
`;
    return code;
};

Blockly.Blocks['ai_v831_rgb_light_off'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_rgb_set_off)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.ai_basic_rgb_set_off);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_v831_rgb_light_off'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_CocoPi_RGB'] = `from CocoPi import singleRgb
singleRgb=singleRgb()`;

    // TODO: Assemble Python into code variable.
    var code = `singleRgb.setColor(0,0,0)
singleRgb.show()
time.sleep(0.05)
`;
    return code;
};

Blockly.Blocks['ai_basic_light_up_led_analog'] = {
    init: function () {
        this.appendValueInput("brightness")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_basic_led_analog_set)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_basic_led_analog_led1, "1"],
                [Blockly.Msg.ai_basic_led_analog_led2, "2"]
            ]), "type")
            .appendField(Blockly.Msg.ai_basic_led_analog_brightness_text);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_basic_led_analog_range_text);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                '1': Blockly.Msg.ai_basic_light_up_led_analog_TOOLTIP.replace('%1', Blockly.Msg.ai_basic_led_analog_led1),
                '2': Blockly.Msg.ai_basic_light_up_led_analog_TOOLTIP.replace('%1', Blockly.Msg.ai_basic_led_analog_led2)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_basic_light_up_led_analog'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    var value_brightness = Blockly.Python.valueToCode(block, 'brightness', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_time'] = `import time`

    Blockly.Python.definitions_['ai_basic_light_up_led_analog_def'] = '' +
        'from machine import Timer,PWM\n' +
        '\n' +
        'led_left_tim = Timer(Timer.TIMER2, Timer.CHANNEL0, mode=Timer.MODE_PWM)\n' +
        'led_right_tim = Timer(Timer.TIMER2, Timer.CHANNEL1, mode=Timer.MODE_PWM)\n' +
        'led_left_ctrl = PWM(led_left_tim, freq=500000, duty=50, pin=31)\n' +
        'led_right_ctrl = PWM(led_right_tim, freq=500000, duty=50, pin=32)\n' +
        '\n' +
        'def analog_light(which, brightness):\n' +
        '    if which == 1:\n' +
        '        led_left_ctrl.duty(brightness)\n' +
        '    if which == 2:\n' +
        '        led_right_ctrl.duty(brightness)\n' +
        '';
    // TODO: Assemble Python into code variable.
    var code = 'analog_light(' + dropdown_type + ',' + value_brightness + ')\n';
    return code;
};



/*
     _    ___   ___                              ____                              
    / \  |_ _| |_ _|_ __ ___   __ _  __ _  ___  |  _ \ _ __ ___   ___ ___  ___ ___ 
   / _ \  | |   | || '_ ` _ \ / _` |/ _` |/ _ \ | |_) | '__/ _ \ / __/ _ \/ __/ __|
  / ___ \ | |   | || | | | | | (_| | (_| |  __/ |  __/| | | (_) | (_|  __/\__ \__ \
 /_/   \_\___| |___|_| |_| |_|\__,_|\__, |\___| |_|   |_|  \___/ \___\___||___/___/
                                    |___/                                          
*/


Blockly.Blocks["ai_lcd_screeninit"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/screen_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_lcd_init);
        this.appendDummyInput().appendField(Blockly.Msg.image_process_lcd_direction)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_lcd_landscape_screen, "False"],
                [Blockly.Msg.image_process_lcd_vertical_screen, "True"]
            ]), "isScreen")
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5cb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_screeninit_TOOLTIP);
        this.setHelpUrl('');
    }
}


Blockly.Blocks["ai_lcd_createnonecarvas"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_create_blank_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_size);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.LCDDCC_F)
        //     .appendField(new Blockly.FieldCheckbox("TRUE"), "check")
        //     .appendField(Blockly.Msg.LCDDCC_I)
        //     .appendField(new Blockly.FieldTextInput(""), "text");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5cb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_createnonecarvas_TOOLTIP);
        this.setHelpUrl('');
    }
}

Blockly.Blocks["ai_lcd_fillcanvas"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("color")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_let_canvas_filled_with_color);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5cb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_fillcanvas_TOOLTIP);
        this.setHelpUrl('');
    }
}


Blockly.Blocks["ai_lcd_createcarvas"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_create_image_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("path").setCheck(null).appendField(Blockly.Msg.image_process_create_image_canvas_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        // this.setInputsInline(true);
        this.setColour("#5cb2d6");
        this.setTooltip(Blockly.Msg.ai_lcd_createcarvas_TOOLTIP);
        this.setHelpUrl('');
    }
}

Blockly.Blocks['lcd_set_position'] = {
    init: function () {
        this.appendValueInput("POSX")
            .setCheck("Number")
            .appendField("X:");
        this.appendValueInput("POSY")
            .setCheck("Number")
            .appendField("Y:");
        this.setOutput(true, "String");
        this.setInputsInline(true);
        this.setColour("#5bb2d6");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['lcd_set_position'] = function (block) {
    // var reg = /^?[0-9]\d*$/
    var pos_x = Blockly.Python.valueToCode(block, 'POSX', Blockly.Python.ORDER_ATOMIC);
    var pos_y = Blockly.Python.valueToCode(block, 'POSY', Blockly.Python.ORDER_ATOMIC);
    //var code = posConvert(pos_x, pos_y);
    var code = pos_x + "," + pos_y;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['lcd_set_color'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.COLOR)
            .appendField(new Blockly.FieldColour("#ff0000"), "COLOR");
        this.setOutput(true, "String");
        this.setColour("#5bb2d6");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['lcd_set_color'] = function (block) {
    var code = block.getFieldValue('COLOR');
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['lcd_set_width_height'] = {
    init: function () {
        this.appendValueInput("WIDTH")
            .setCheck("Number")
            .appendField(Blockly.Msg.OLCD_WIDTH);
        this.appendValueInput("HEIGHT")
            .setCheck("Number")
            .appendField(Blockly.Msg.OLCD_HEIGHT);
        this.setOutput(true, "String");
        this.setInputsInline(true);
        this.setColour("#5bb2d6");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['lcd_set_width_height'] = function (block) {
    var width = Blockly.Python.valueToCode(block, 'WIDTH', Blockly.Python.ORDER_ATOMIC);
    var height = Blockly.Python.valueToCode(block, 'HEIGHT', Blockly.Python.ORDER_ATOMIC);
    var code = width + ', ' + height;
    return [code, Blockly.Python.ORDER_ATOMIC];
};














Blockly.Blocks['v831_img_save'] = {
    init: function () {
        this.appendValueInput("save_path")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_img_save);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.image_process_img_save_quality)
        //     .appendField(new Blockly.FieldNumber(90, 0, 100), "compression")
        //     .appendField("%");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_img_save_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_img_save'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var save_path_location = Blockly.Python.valueToCode(block, 'save_path', Blockly.Python.ORDER_ATOMIC);
    var compression_rate = block.getFieldValue('compression');
    // TODO: Assemble Python into code variable.
    // , quality=' + compression_rate + ' 图片压缩
    var code = variable_name + '.save(' + save_path_location + ')\n';
    return code;
};

Blockly.Blocks['v831_img_open'] = {
    init: function () {
        this.appendValueInput("save_path")
            .setCheck(null)
            .appendField(Blockly.Msg.read_img_path_to)
        // .appendField(Blockly.Msg.image_process_img_save);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.image_process_img_save_quality)
        //     .appendField(new Blockly.FieldNumber(90, 0, 100), "compression")
        //     .appendField("%");
        // this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.read_img_path_to);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_img_open'] = function (block) {
    // var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var save_path_location = Blockly.Python.valueToCode(block, 'save_path', Blockly.Python.ORDER_ATOMIC);
    // var compression_rate = block.getFieldValue('compression');
    // TODO: Assemble Python into code variable.
    // , quality=' + compression_rate + ' 图片压缩
    // MaixPy v4：image.open → image.load。依據是 MaixPy 原始碼 test/ 與
    // examples/ 的實際呼叫，例如 image.load("/maixapp/share/icon/ret.png")。
    //
    // 這個積木屬於「媒体处理 › Vision」那一批，本來不在 Screen 這批裡，
    // 但 ai_lcd_draw_image_on_canvas 的「圖像源」插槽就是接它
    // （見 src/python/屏幕加载图片.xml），不一起遷移那個積木就沒法驗。
    var code = 'image.load(' + save_path_location + ')';
    return [code, Blockly.Python.ORDER_NONE];
};


// 翻转
Blockly.Blocks['v831_lcd_invert'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_image_canvas)
            .appendField(Blockly.Msg.image_process_pixtovec_text_first)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.display_draw_vertical, "0"],
                [Blockly.Msg.display_draw_horizontal, "1"]
            ]), "invert")
            .appendField(Blockly.Msg.MAIXDUINO_DISPLAY_ORIENTATION_ROTATE);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        // this.setTooltip(Blockly.Msg.ai_lcd_invert_color_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_lcd_invert'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    let invert = block.getFieldValue('invert');
    // MaixPy v4：flip() 吃的是 image.FlipDir 列舉，不是 0／1。
    //
    // **X／Y 的意思跟直覺相反**（2026-08-18 用角落記號實測）：
    //   原圖記號在「上左」
    //   flip(FlipDir.X) → 「下左」   沿 X 軸翻 ＝ 上下顛倒 ＝ 積木的「垂直」
    //   flip(FlipDir.Y) → 「上右」   沿 Y 軸翻 ＝ 左右鏡像 ＝ 積木的「水平」
    // 下拉選項 "0" 是垂直、"1" 是水平（見上面的 FieldDropdown）。
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`
    var code = `${variable_name}.flip(image.FlipDir.${invert == '0' ? 'X' : 'Y'})`
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

// 旋转
Blockly.Blocks['v831_lcd_rotating'] = {
    init: function () {
        this.appendValueInput('spend')
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_image_canvas)
            .appendField(Blockly.Msg.image_process_pixtovec_text_first)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.x_motor_cw_ai, "0"],
                [Blockly.Msg.x_motor_acw_ai, "1"]
            ]), "rotating")
            .appendField(Blockly.Msg.x_motor_set_motor_turns_ai);
        this.appendDummyInput().appendField(Blockly.Msg.robot_dog_ag);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_lcd_invert_color_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_lcd_rotating'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    let rotating = block.getFieldValue('rotating');
    let spend = (rotating != 0 ? '+' : '-') + Blockly.Python.valueToCode(block, 'spend', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.

    //     Blockly.Python.definitions_['lcd_invert_init'] = `def lcdRotation(inputImg,rotationAngle):
    //     from maix import image
    //     imgRotationAim = image.new(size = (320, 240),color=(0,0,0))
    //     imageRotationBuffer = inputImg.crop(0, 0, 240, 320)
    //     return imgRotationAim.draw_image(imageRotationBuffer.rotate(rotationAngle, adjust=1),0,0,alpha=1)
    // `
    // console.log(rotating,spend)
    // MaixPy v4：rotate() 沒有 adjust 參數——角度不是 90 的倍數時本來就會自動
    // 放大到不裁切（實測 rotate(45) 把 80x60 變成 98x98），這正是舊的 adjust=1。
    // 90／270 度時長寬自動對調（80x60 → 60x80），也不必自己算。
    //
    // 正負號沿用舊的：實測 rotate(-90) 記號從「上左」到「上右」＝順時針，
    // rotate(90) 到「下左」＝逆時針，跟舊碼「順時針給負角」的約定一致。
    var code = `${variable_name}.rotate(${spend})`
    // variable_name+'.rotate('+ spend +', adjust=1)';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['v831_lcd_resizecanvas'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_image_canvas)
            .appendField(Blockly.Msg.image_process_resize_to);
        this.appendValueInput("wh")
            .setCheck(null);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_lcd_resizecanvas_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_lcd_resizecanvas'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    //     Blockly.Python.definitions_['lcd_invert_init'] = `CANVASINVERT = image.new(size = (240, 320), color = (0,0,0), mode = 'RGB')
    // `
    // var code = `CANVASINVERT.draw_image(${variable_name}.crop(0, 0, 240, 320).resize(${wh}),0,0,alpha=1)`
    // variable_name + '.resize(' + wh + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    // MaixPy v4：resize() 沒有 padding，改用 fit；預設 Fit.FIT_FILL 就是
    // 「拉滿、不留邊」，跟舊的 padding=0 同義，所以直接省略。
    var code = `${variable_name}.resize(${wh})`
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['v831_lcd_img_cut'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_let_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_text_image_canvas)
            .appendField(Blockly.Msg.image_process_imgcut_cutting);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_imgcut_start_coord);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_imgcut_size);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_lcd_img_cut_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_lcd_img_cut'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);

    // TODO: Assemble Python into code variable.
    // TODO: Change ORDER_NONE to the correct strength.
    var code = `${variable_name}.crop(${xy},${wh})`;
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_get_statistics'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_get_statistics_to_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.image_process_get_statistics_get_analysis);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_get_statistics_start_coord);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_get_statistics_size);
        this.appendValueInput("bins")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_get_statistics_boxes);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_get_statistics_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_get_statistics'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    var bins = Blockly.Python.valueToCode(block, 'bins', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.get_statistics(bins=' + bins + ',roi=(' + xy + ',' + wh + '))';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_get_histogram'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_histogram_get)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_get_histogram_compute);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_histogram_region);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_get_histogram_region_xy);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_get_histogram_region_wh);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_get_histogram_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_get_histogram'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var value_wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.get_histogram(roi=(' + value_xy + ',' + value_wh + '))';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_get_histogram_percentile'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_histogram_details_1)
            .appendField(new Blockly.FieldVariable("hist"), "varitem")
            .appendField(Blockly.Msg.ai_vision_get_histogram_details_get);
        this.appendValueInput("perc")
            .setCheck(null);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_get_histogram_percentile_TOOLTIP);
        this.setHelpUrl("https://docs.openmv.io/library/omv.image.html#id3");
    }
};

Blockly.Python['ai_vision_get_histogram_percentile'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_perc = Blockly.Python.valueToCode(block, 'perc', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.get_percentile(' + value_perc + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};





Blockly.Blocks['ai_vision_get_histogram_percentile_detail'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_histogram_percentile_1)
            .appendField(new Blockly.FieldVariable("percentile"), "varitem");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_histogram_percentile_2)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_get_histogram_percentile_3, "value()"],
                [Blockly.Msg.ai_vision_get_histogram_percentile_4, "l_value()"],
                [Blockly.Msg.ai_vision_get_histogram_percentile_5, "a_value()"],
                [Blockly.Msg.ai_vision_get_histogram_percentile_6, "b_value()"]
            ]), "option");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('option');
            var TOOLTIPS = {
                'value()': Blockly.Msg.ai_vision_get_histogram_percentile_detail_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_get_histogram_percentile_3),
                'l_value()': Blockly.Msg.ai_vision_get_histogram_percentile_detail_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_get_histogram_percentile_4),
                'a_value()': Blockly.Msg.ai_vision_get_histogram_percentile_detail_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_get_histogram_percentile_5),
                'b_value()': Blockly.Msg.ai_vision_get_histogram_percentile_detail_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_get_histogram_percentile_6)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("https://docs.openmv.io/library/omv.image.html#id3");
    }
};

Blockly.Python['ai_vision_get_histogram_percentile_detail'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_option = block.getFieldValue('option');

    var code = variable_name + '.' + dropdown_option;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};












Blockly.Blocks['ai_vision_lab_rgb_conversion'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_lab_rgb_conversion_exec)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_lab_rgb_conversion_torgb, "lab_to_rgb"],
                [Blockly.Msg.image_process_lab_rgb_conversion_tolab, "rgb_to_lab"]
            ]), "rgblab");
        this.appendValueInput("color_tuple")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_lab_rgb_conversion_tuple);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('rgblab');
            var TOOLTIPS = {
                'lab_to_rgb': Blockly.Msg.ai_vision_lab_rgb_conversion_TOOLTIP.replace('%1', Blockly.Msg.image_process_lab_rgb_conversion_torgb),
                'rgb_to_lab': Blockly.Msg.ai_vision_lab_rgb_conversion_TOOLTIP.replace('%1', Blockly.Msg.image_process_lab_rgb_conversion_tolab)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_vision_lab_rgb_conversion'] = function (block) {
    var type = block.getFieldValue('rgblab');
    var tuple = Blockly.Python.valueToCode(block, 'color_tuple', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'image.' + type + '(' + tuple + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_rgb_grayscale_conversion'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_rgb_grayscale_conversion_exec)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.image_process_rgb_grayscale_conversion_torgb, "grayscale_to_rgb"],
                [Blockly.Msg.image_process_rgb_grayscale_conversion_togray, "rgb_to_grayscale"]
            ]), "rgb_g");
        this.appendValueInput("color_tuple")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_rgb_grayscale_conversion_set);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('rgb_g');
            var TOOLTIPS = {
                'grayscale_to_rgb': Blockly.Msg.ai_vision_rgb_grayscale_conversion_TOOLTIP.replace('%1', Blockly.Msg.image_process_rgb_grayscale_conversion_torgb),
                'rgb_to_grayscale': Blockly.Msg.ai_vision_rgb_grayscale_conversion_TOOLTIP.replace('%1', Blockly.Msg.image_process_rgb_grayscale_conversion_togray)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_vision_rgb_grayscale_conversion'] = function (block) {
    var type = block.getFieldValue('rgb_g');
    var tuple = Blockly.Python.valueToCode(block, 'color_tuple', Blockly.Python.ORDER_ATOMIC);

    Blockly.Python.addVariable('rgb_tuple', "rgb_tuple = None", true);
    // TODO: Assemble Python into code variable.
    var code = 'image.' + type + '(' + tuple + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};






Blockly.Blocks['ai_canvas_area_tuple'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_canvas_area_tuple);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_canvas_area_tuple_xy);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_canvas_area_tuple_wh);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_canvas_area_tuple_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_canvas_area_tuple'] = function (block) {
    var value_coordinate = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var value_size = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = value_coordinate + ',' + value_size;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};



Blockly.Blocks['ai_lane_tracking_run'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lane_tracking_header.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_lane_tracking_run);
        this.appendValueInput("rgb_value")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_lane_tracking_setup_threshold);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_lane_tracking_setup_threshold);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lane_tracking_run'] = function (block) {
    var value_color = Blockly.Python.valueToCode(block, 'rgb_value', Blockly.Python.ORDER_ATOMIC)
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);

    // MaixPy v4 沒有 find_line()，換成 v831_find_line()（見它自己的說明）。
    // 那四行 draw_line 舊版畫的是「框住線的四邊形」，v4 的 Line 只有兩個端點，
    // 所以現在畫出來是一條線——這是這塊唯一看得出差別的地方。
    //
    // draw_line／draw_circle 的 color= 和 thickness= 在 v4 是位置參數，
    // 而且 color 只吃 image.Color——插槽上的 ai_lcd_rgb_value_input 產的是裸的
    // `r,g,b`（Blockly 會自動加括號變成 tuple），所以要 from_rgb(*...) 解包。
    // 這個寫法跟已驗過的 ai_lcd_linecarvas 一致。
    Blockly.Python.definitions_['v831_find_line'] = `from maix import image

# 預設門檻：只看明暗、抓暗色的線（白底黑線）。循線積木會用插槽上的顏色覆蓋掉。
# 這一行一定要排在覆蓋它的那行之前——definitions_ 照插入順序輸出，
# 所以每個生成器都先設 'v831_find_line' 再設自己那個 key。
_ld_color_detection_threshold = [[0, 40, -128, 127, -128, 127]]


def v831_find_line(img):
    \"\"\"v4 沒有 find_line()，用 get_regression() 湊出舊版同樣的字典。

    舊的 \`find_line()\` **連參數都沒有**——MaixPy3 內部寫死了「線是什麼」。
    v4 只有 \`get_regression()\`，門檻是必填的，所以改用積木上那個
    「要追蹤的顏色」插槽（_ld_color_detection_threshold）——
    那個插槽原本被賦值了卻從來沒被用到，現在總算有作用。

    舊版的 rect 是四個角（8 個數字），v4 的 Line 只有兩個端點；
    這裡把兩端點重複湊成 8 個數字，下游那四行 draw_line 畫出來就是一條線
    （原本畫的是框住線的四邊形）。這是唯一看得出差別的地方。

    找不到線時回傳畫面中心，跟舊版找不到時不會爆掉的行為一致。
    \"\"\"
    # **不要加 robust=True。** 那條路（Theil-Sen）會漏資源：實測每幀呼叫一次，
    # 第 10 圈左右整個行程就卡死不動，不報錯也不結束（2026-08-18 驗 M4 踩到）。
    # 預設的最小平方法跑 80 圈沒事。find_line_segments() 也有同樣的毛病（約 60 圈）。
    _ls = img.get_regression(_ld_color_detection_threshold)
    if not _ls:
        return {\"cx\": img.width() // 2, \"cy\": img.height() // 2, \"rect\": [0] * 8}
    _l = _ls[0]
    return {\"cx\": int((_l.x1() + _l.x2()) / 2),
            \"cy\": int((_l.y1() + _l.y2()) / 2),
            \"rect\": [_l.x1(), _l.y1(), _l.x2(), _l.y2(),
                     _l.x2(), _l.y2(), _l.x1(), _l.y1()]}
`
    var code = '' +
        'line = v831_find_line(' + variable_name + ')\n' +
        '' + variable_name + '.draw_line(line["rect"][0], line["rect"][1], line["rect"][2], line["rect"][3], image.Color.from_rgb(*' + value_color + '), 1)\n' +
        '' + variable_name + '.draw_line(line["rect"][2], line["rect"][3], line["rect"][4], line["rect"][5], image.Color.from_rgb(*' + value_color + '), 1)\n' +
        '' + variable_name + '.draw_line(line["rect"][4], line["rect"][5], line["rect"][6], line["rect"][7], image.Color.from_rgb(*' + value_color + '), 1)\n' +
        '' + variable_name + '.draw_line(line["rect"][6], line["rect"][7], line["rect"][0], line["rect"][1], image.Color.from_rgb(*' + value_color + '), 1)\n' +
        '' + variable_name + '.draw_circle(line["cx"], line["cy"], 4, image.Color.from_rgb(*' + value_color + '), 1)\n';

    return code;
};


Blockly.Blocks['ai_vision_find_lines'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_find_line.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_line);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_line_start_coord);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_line_size);
        /*this.appendValueInput("threshold")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_line_hoffman_threshold);
        this.appendValueInput("theta_margin")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_line_merge_theta);
        this.appendValueInput("rho_margin")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_line_merge_rho);*/
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_lines_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};


Blockly.Python['ai_vision_find_lines'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    //var threshold = Blockly.Python.valueToCode(block, 'threshold', Blockly.Python.ORDER_ATOMIC);
    //var theta_margin = Blockly.Python.valueToCode(block, 'theta_margin', Blockly.Python.ORDER_ATOMIC);
    //var rho_margin = Blockly.Python.valueToCode(block, 'rho_margin', Blockly.Python.ORDER_ATOMIC);
    var xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.find_lines(roi=(' + xy + ',' + wh + '), threshold = 1000, theta_margin = 25, rho_margin = 25)';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_vision_find_rects'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_find_rect.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_rect);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_rect_start_coord);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_rect_region_size);
        /*this.appendValueInput("threshold")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_rect_bounding_threshold);*/
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_rects_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};


Blockly.Python['ai_vision_find_rects'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    // var threshold = Blockly.Python.valueToCode(block, 'threshold', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.find_rects(roi=(' + xy + ',' + wh + '), threshold = 10000)';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};
Blockly.Blocks['ai_vision_find_lines'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_find_color.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_blobs_color_region);
        this.appendValueInput("color")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_lane_tracking_setup_threshold);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_blobs_start_coord);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_blobs_size);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_blobs_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};
Blockly.Python['ai_vision_find_lines'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_color = Blockly.Python.valueToCode(block, 'color', Blockly.Python.ORDER_ATOMIC);
    var value_xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var value_wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_[''] = `
def v831_find_blob_fun(lane_trackingimg,region1,COLOR):
    IMGBLOB = lane_trackingimg.crop(region1[0],region1[1],region1[2],region1[3])
    blobsCANVAS = IMGBLOB.find_blobs(COLOR, merge=True)
    return blobsCANVAS
`;

    var code = `v831_find_blob_fun(${variable_name},(${value_xy},${value_wh}),${value_color})
`;
    return [code, Blockly.Python.ORDER_NONE];
};
Blockly.Blocks['ai_vision_find_blobs'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_find_color.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_lines_color_region);
        this.appendValueInput("color")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_lane_tracking_setup_threshold);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_blobs_start_coord);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_find_blobs_size);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_blobs_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};
Blockly.Python['ai_vision_find_blobs'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_color = Blockly.Python.valueToCode(block, 'color', Blockly.Python.ORDER_ATOMIC);
    var value_xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var value_wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable('lane_trackingline', "lane_trackingline1 = {}", true);
    // MaixPy v4 的三處改動，都是機械性的：
    //   find_line()                     → v831_find_line()（見下方說明）
    //   draw_image(img, x, y)           → draw_image(x, y, img)  參數順序換了
    //   draw_rectangle(x1,y1,x2,y2,...) → draw_rect(x, y, w, h, ...)  角座標變成寬高
    //   color=(r,g,b)                   → image.Color.from_rgb(r, g, b)
    Blockly.Python.definitions_['v831_find_line'] = `from maix import image

# 預設門檻：只看明暗、抓暗色的線（白底黑線）。循線積木會用插槽上的顏色覆蓋掉。
# 這一行一定要排在覆蓋它的那行之前——definitions_ 照插入順序輸出，
# 所以每個生成器都先設 'v831_find_line' 再設自己那個 key。
_ld_color_detection_threshold = [[0, 40, -128, 127, -128, 127]]


def v831_find_line(img):
    \"\"\"v4 沒有 find_line()，用 get_regression() 湊出舊版同樣的字典。

    舊的 \`find_line()\` **連參數都沒有**——MaixPy3 內部寫死了「線是什麼」。
    v4 只有 \`get_regression()\`，門檻是必填的，所以改用積木上那個
    「要追蹤的顏色」插槽（_ld_color_detection_threshold）——
    那個插槽原本被賦值了卻從來沒被用到，現在總算有作用。

    舊版的 rect 是四個角（8 個數字），v4 的 Line 只有兩個端點；
    這裡把兩端點重複湊成 8 個數字，下游那四行 draw_line 畫出來就是一條線
    （原本畫的是框住線的四邊形）。這是唯一看得出差別的地方。

    找不到線時回傳畫面中心，跟舊版找不到時不會爆掉的行為一致。
    \"\"\"
    # **不要加 robust=True。** 那條路（Theil-Sen）會漏資源：實測每幀呼叫一次，
    # 第 10 圈左右整個行程就卡死不動，不報錯也不結束（2026-08-18 驗 M4 踩到）。
    # 預設的最小平方法跑 80 圈沒事。find_line_segments() 也有同樣的毛病（約 60 圈）。
    _ls = img.get_regression(_ld_color_detection_threshold)
    if not _ls:
        return {\"cx\": img.width() // 2, \"cy\": img.height() // 2, \"rect\": [0] * 8}
    _l = _ls[0]
    return {\"cx\": int((_l.x1() + _l.x2()) / 2),
            \"cy\": int((_l.y1() + _l.y2()) / 2),
            \"rect\": [_l.x1(), _l.y1(), _l.x2(), _l.y2(),
                     _l.x2(), _l.y2(), _l.x1(), _l.y1()]}
`
    Blockly.Python.definitions_['ai_vision_find_blobs_color'] = `_ld_color_detection_threshold = ${value_color}


def v831_lane_tracking_setup_one(lane_trackingimg,region1):
    global lane_trackingline
    lane_trackingcanvas = lane_trackingimg.crop(region1[0],region1[1],region1[2],region1[3])
    lane_trackingline = v831_find_line(lane_trackingcanvas)
    lane_trackingcanvas.draw_circle(lane_trackingline["cx"], lane_trackingline["cy"], 2, image.Color.from_rgb(0,255,0), 1)
    lane_trackingimg.draw_image(region1[0],region1[1],lane_trackingcanvas)
    lane_trackingimg.draw_rect(region1[0],region1[1],region1[2],region1[3], image.Color.from_rgb(255,0,0), 1)
    lane_trackingline["cx"] = lane_trackingline["cx"] + region1[0]
    lane_trackingline["cy"] = lane_trackingline["cy"] + region1[1]
    return lane_trackingline
`;

    var code = `v831_lane_tracking_setup_one(${variable_name},(${value_xy},${value_wh}))
`;
    return [code, Blockly.Python.ORDER_NONE];
};

// 
Blockly.Blocks['ai_vision_find_blobs_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_LINE_START)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_lines_color_region_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_object_model_x_center, "cx"],
                [Blockly.Msg.ai_models_object_model_y_center, "cy"]
            ]), "value");
        // this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_lines_color_region_result);
    }
};
Blockly.Python['ai_vision_find_blobs_result'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var property = block.getFieldValue('value');
    var code = `${variable_name}.get("${property}")`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['ai_lane_tracking_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lane_tracking_header.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput().appendField(Blockly.Msg.ai_vision_from_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_lane_tracking_setup);
        this.appendValueInput("color")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_lane_tracking_setup_threshold);
        this.appendValueInput("lsize")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_lane_tracking_setup_l);
        this.appendValueInput("rsize")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_lane_tracking_setup_r);
        // this.appendValueInput("axis")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_vision_lane_tracking_setup_axis);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_lane_tracking_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lane_tracking_setup'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var value_color = Blockly.Python.valueToCode(block, 'color', Blockly.Python.ORDER_ATOMIC);
    var value_lsize = Blockly.Python.valueToCode(block, 'lsize', Blockly.Python.ORDER_ATOMIC);
    var value_rsize = Blockly.Python.valueToCode(block, 'rsize', Blockly.Python.ORDER_ATOMIC);
    var value_axis = Blockly.Python.valueToCode(block, 'axis', Blockly.Python.ORDER_ATOMIC);
    console.log(value_lsize[0])
    Blockly.Python.addVariable('lane_trackingline1', "lane_trackingline1 = {}", true);
    Blockly.Python.addVariable('lane_trackingline2', "lane_trackingline2 = {}", true);
    Blockly.Python.definitions_['v831_find_line'] = `from maix import image

# 預設門檻：只看明暗、抓暗色的線（白底黑線）。循線積木會用插槽上的顏色覆蓋掉。
# 這一行一定要排在覆蓋它的那行之前——definitions_ 照插入順序輸出，
# 所以每個生成器都先設 'v831_find_line' 再設自己那個 key。
_ld_color_detection_threshold = [[0, 40, -128, 127, -128, 127]]


def v831_find_line(img):
    \"\"\"v4 沒有 find_line()，用 get_regression() 湊出舊版同樣的字典。

    舊的 \`find_line()\` **連參數都沒有**——MaixPy3 內部寫死了「線是什麼」。
    v4 只有 \`get_regression()\`，門檻是必填的，所以改用積木上那個
    「要追蹤的顏色」插槽（_ld_color_detection_threshold）——
    那個插槽原本被賦值了卻從來沒被用到，現在總算有作用。

    舊版的 rect 是四個角（8 個數字），v4 的 Line 只有兩個端點；
    這裡把兩端點重複湊成 8 個數字，下游那四行 draw_line 畫出來就是一條線
    （原本畫的是框住線的四邊形）。這是唯一看得出差別的地方。

    找不到線時回傳畫面中心，跟舊版找不到時不會爆掉的行為一致。
    \"\"\"
    # **不要加 robust=True。** 那條路（Theil-Sen）會漏資源：實測每幀呼叫一次，
    # 第 10 圈左右整個行程就卡死不動，不報錯也不結束（2026-08-18 驗 M4 踩到）。
    # 預設的最小平方法跑 80 圈沒事。find_line_segments() 也有同樣的毛病（約 60 圈）。
    _ls = img.get_regression(_ld_color_detection_threshold)
    if not _ls:
        return {\"cx\": img.width() // 2, \"cy\": img.height() // 2, \"rect\": [0] * 8}
    _l = _ls[0]
    return {\"cx\": int((_l.x1() + _l.x2()) / 2),
            \"cy\": int((_l.y1() + _l.y2()) / 2),
            \"rect\": [_l.x1(), _l.y1(), _l.x2(), _l.y2(),
                     _l.x2(), _l.y2(), _l.x1(), _l.y1()]}
`
    Blockly.Python.definitions_['ai_lane_tracking_setup'] = `_ld_color_detection_threshold = ${value_color}


def v831_lane_tracking_setup(lane_trackingimg,region1,region2):
    global lane_trackingline1,lane_trackingline2
    lane_trackingcanvas1 = lane_trackingimg.crop(region1[0],region1[1],region1[2],region1[3])
    lane_trackingcanvas2 = lane_trackingimg.crop(region2[0],region2[1],region2[2],region2[3])
    lane_trackingline1 = v831_find_line(lane_trackingcanvas1)
    lane_trackingline2 = v831_find_line(lane_trackingcanvas2)
    lane_trackingcanvas1.draw_circle(lane_trackingline1["cx"], lane_trackingline1["cy"], 2, image.Color.from_rgb(0,255,0), 1)
    lane_trackingcanvas2.draw_circle(lane_trackingline2["cx"], lane_trackingline2["cy"], 2, image.Color.from_rgb(0,255,0), 1)
    lane_trackingimg.draw_image(region1[0],region1[1],lane_trackingcanvas1)
    lane_trackingimg.draw_image(region2[0],region2[1],lane_trackingcanvas2)
    lane_trackingimg.draw_rect(region1[0],region1[1],region1[2],region1[3], image.Color.from_rgb(255,0,0), 1)
    lane_trackingimg.draw_rect(region2[0],region2[1],region2[2],region2[3], image.Color.from_rgb(255,0,0), 1)
`
    let code = `v831_lane_tracking_setup(${variable_name},${value_lsize},${value_rsize})
`
    return code
}
Blockly.Blocks['ai_lane_tracking_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_lane_tracking_run_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_lane_tracking_run_ld, "left_check"],
                [Blockly.Msg.ai_vision_lane_tracking_run_lv, "left_value"],
                [Blockly.Msg.ai_vision_lane_tracking_run_rd, "right_check"],
                [Blockly.Msg.ai_vision_lane_tracking_run_rv, "right_value"]
            ]), "return");
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_lane_tracking_run_get_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_lane_tracking_get'] = function (block) {
    var dropdown_return = block.getFieldValue('return');
    // TODO: Assemble Python into code variable.
    var code = '_ld_return["' + dropdown_return + '"]';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_vision_color_analyze'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_analyze_color.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_color_analyze_get_result);
        this.appendValueInput("xy")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_color_analyze_start_coord);
        this.appendValueInput("wh")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_vision_color_analyze_size);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_color_analyze_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_vision_color_analyze'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var xy = Blockly.Python.valueToCode(block, 'xy', Blockly.Python.ORDER_ATOMIC);
    var wh = Blockly.Python.valueToCode(block, 'wh', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    // MaixPy v4 沒有 get_blob_color()。它做的事很單純：把某塊區域的像素平均起來。
    // 自己裁一塊出來平均就等價，積木的插槽和回傳值都不用動。
    //
    // 不用 get_statistics()：那個回的是 LAB 的各種統計量，而這塊積木的標籤
    // 明寫「颜色分析结果 (RGB)」，換過去就名不副實了。
    Blockly.Python.definitions_['v831_import_numpy_as_np'] = `import numpy as np`
    Blockly.Python.definitions_['v831_color_analyze'] = `def colorAnalyze(img, x, y, w, h):
    _a = np.frombuffer(img.crop(x, y, w, h).to_bytes(), dtype=np.uint8).reshape(-1, 3)
    return tuple(int(v) for v in _a.mean(axis=0))
`
    var code = 'colorAnalyze(' + variable_name + ', ' + xy + ', ' + wh + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};



Blockly.Blocks['ai_vision_get_blobs'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_get_blobs_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_detection_box_x, "x"],
                [Blockly.Msg.ai_vision_detection_box_y, "y"],
                [Blockly.Msg.ai_models_face_model_ws, "w"],
                [Blockly.Msg.ai_models_face_model_hs, "h"],
                // [Blockly.Msg.ai_vision_detection_box_pixels, "pixels()"],
                [Blockly.Msg.ai_vision_detection_box_cx, "cx"],
                [Blockly.Msg.ai_vision_detection_box_cy, "cy"]
                // [Blockly.Msg.ai_vision_detection_box_degree, "rotation()"],
                // [Blockly.Msg.ai_vision_detection_box_total, "count()"]
            ]), "blob_type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_get_blobs_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};

Blockly.Python['ai_vision_get_blobs'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var type = block.getFieldValue('blob_type');
    // TODO: Assemble Python into code variable.
    // MaixPy v4：find_blobs() 回傳 image.Blob 物件，取值從 `b["x"]` 變成 `b.x()`。
    //
    // 下拉的值有些本來就帶著括號（"pixels()"／"rotation()"／"count()"），
    // 那是舊碼留下的怪東西——在 MaixPy3 是拿去當字典 key 用的，等於永遠 KeyError。
    // v4 剛好這三個都是真的方法名，所以帶括號的直接用、不帶的補上括號。
    //
    // cx／cy 舊碼是自己從 x 和 w 算的，v4 的 Blob 直接有 cx()／cy()。
    var code = `${variable_name}.${type.slice(-2) === '()' ? type : type + '()'}`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_vision_get_threshold_default'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_detection_color_threshold_set)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_detection_color_threshold_set_black, "black"],
                [Blockly.Msg.ai_vision_detection_color_threshold_set_white, "white"],
                [Blockly.Msg.ai_vision_detection_color_threshold_set_red, "red"],
                [Blockly.Msg.ai_vision_detection_color_threshold_set_green, "green"],
                [Blockly.Msg.ai_vision_detection_color_threshold_set_blue, "blue"],
                [Blockly.Msg.ai_vision_detection_color_threshold_set_orange, "orange"]
            ]), "color");
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('color');
            var TOOLTIPS = {
                'black': Blockly.Msg.ai_vision_get_threshold_default_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_detection_color_threshold_set_black),
                'white': Blockly.Msg.ai_vision_get_threshold_default_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_detection_color_threshold_set_white),
                'red': Blockly.Msg.ai_vision_get_threshold_default_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_detection_color_threshold_set_red),
                'green': Blockly.Msg.ai_vision_get_threshold_default_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_detection_color_threshold_set_green),
                'blue': Blockly.Msg.ai_vision_get_threshold_default_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_detection_color_threshold_set_blue),
                'orange': Blockly.Msg.ai_vision_get_threshold_default_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_detection_color_threshold_set_orange)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_get_threshold_default'] = function (block) {
    var dropdown_color = block.getFieldValue('color');
    // TODO: Assemble Python into code variable.

    // MaixPy v4 的 find_blobs／get_regression 吃 List[List[int]]，而且 RGB 影像
    // 一定要六個數（L 上下限、A 上下限、B 上下限）。舊碼的黑和白只給兩個數
    // （那是灰階格式的寫法），在 RGB 影像上會被拒絕——補上 A/B 的全範圍
    // -128~127 就等價於「不管顏色，只看明暗」，跟舊的意思一樣。
    //
    // 紅綠藍橙本來就是六個數，只把小括號換成中括號。
    var TH = {
        black: '[[0, 40, -128, 127, -128, 127]]',
        white: '[[64, 100, -128, 127, -128, 127]]',
        red: '[[45, 65, 40, 80, 40, 60]]',
        green: '[[45, 65, -50, -30, 0, 40]]',
        blue: '[[45, 65, -20, 30, -60, -20]]',
        orange: '[[77, 55, 19, 61, 14, 108]]',
    };
    var code = TH[dropdown_color];
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};




Blockly.Blocks['ai_vision_find_qrcode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_qrcode_.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_qrcode_detected_result);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_qrcode_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_find_qrcode'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.find_qrcodes()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_qrcode_get_info'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_qrcode_get_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_pattern_detection_content, "payload"],
                // [Blockly.Msg.ai_vision_pattern_detection_type, "data_type"],
                [Blockly.Msg.ai_vision_pattern_detection_x, "x"],
                [Blockly.Msg.ai_vision_pattern_detection_y, "y"],
                [Blockly.Msg.ai_vision_pattern_detection_X_Destination, "w"],
                [Blockly.Msg.ai_vision_pattern_detection_Y_Destination, "h"],
                [Blockly.Msg.ai_vision_pattern_detection_w, "w1"],
                [Blockly.Msg.ai_vision_pattern_detection_h, "h2"]
            ]), "get_info");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('get_info');
            var TOOLTIPS = {
                'payload': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_content),
                'data_type': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_type),
                'x': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_x),
                'y': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_y),
                'w': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_X_Destination),
                'h': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_Y_Destination),
                'w1': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_w),
                'h1': Blockly.Msg.ai_vision_qrcode_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_h)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_qrcode_get_info'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_name = block.getFieldValue('get_info');
    // TODO: Assemble Python into code variable.
    // MaixPy v4：find_qrcodes() 回傳的是 image.QRCode 物件，不是字典。
    // 取值從 `d["payload"]` 變成 `d.payload()`，其餘語意完全一樣。
    // （下拉的 "w"／"h" 是「終點座標」，"w1"／"h2" 才是寬高——舊碼的命名，沿用。）
    var code = `${variable_name}.${dropdown_name}()`;
    if (dropdown_name == "w") {
        code = `(${variable_name}.x() + ${variable_name}.w())`
    } else if (dropdown_name == "h") {
        code = `(${variable_name}.y() + ${variable_name}.h())`
    } else if (dropdown_name == "w1") {
        code = `${variable_name}.w()`
    } else if (dropdown_name == "h2") {
        code = `${variable_name}.h()`
    }
    return [code, Blockly.Python.ORDER_NONE];
};



Blockly.Blocks['ai_vision_find_apriltag'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_apriltag_.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_apriltag_detected_result);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_apriltag_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_find_apriltag'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Python into code variable.
    // MaixPy v4：`families` 吃的是 image.ApriltagFamilies 列舉，傳數字 16 會
    // TypeError（實測）。16 正好是 TAG36H11 的值，所以對應過去意思不變。
    //
    // fx／fy／cx／cy 是相機內參，只影響 x_translation 那一組（「距離」用得到）。
    // 舊碼把 320／240 寫死，那是 V831 的解析度；改成問影像自己的尺寸，
    // 換解析度不必回來改，而且公式原封不動。
    // **640x480 找不到任何標籤，而且不報錯。** 實測 find_apriltags 在這個尺寸
    // 會往 stderr 印 `Out of fast Frame Buffer Stack Memory` 然後回傳空串列——
    // 看起來就像「鏡頭前沒東西」，比直接拋例外難查得多。480x360 以下才正常，
    // 而 roi 沒有用（一樣爆），只有先縮小才行。
    //
    // 舊機的相機本來就是 320x240，所以這個坑到 pi2 才踩到。
    // 積木自己縮到安全尺寸再找，座標乘回去——使用者不必知道有這回事。
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`
    Blockly.Python.definitions_['v831_find_apriltags'] = `_APRILTAG_MAX = 480 * 360
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
`
    var code = 'findApriltags(' + variable_name + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_apriltag_get_info'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_apriltag_get_result)
            .appendField(new Blockly.FieldDropdown([
                // [Blockly.Msg.ai_vision_pattern_detection_content, "payload"],
                [Blockly.Msg.ai_vision_pattern_detection_type_id, "id"],
                [Blockly.Msg.ai_vision_pattern_detection_type_family, "family"],
                [Blockly.Msg.ai_vision_pattern_detection_x, "x"],
                [Blockly.Msg.ai_vision_pattern_detection_y, "y"],
                [Blockly.Msg.ai_vision_pattern_detection_w, "w"],
                [Blockly.Msg.ai_vision_pattern_detection_h, "h"],
                [Blockly.Msg.ai_vision_pattern_distance, "distance"]
            ]), "get_info");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('get_info');
            var TOOLTIPS = {
                'payload': Blockly.Msg.ai_vision_apriltag_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_content),
                'id': Blockly.Msg.ai_vision_apriltag_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_type_id),
                'family': Blockly.Msg.ai_vision_apriltag_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_type_family),
                'x': Blockly.Msg.ai_vision_apriltag_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_x),
                'y': Blockly.Msg.ai_vision_apriltag_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_y),
                'w': Blockly.Msg.ai_vision_apriltag_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_w),
                'h': Blockly.Msg.ai_vision_apriltag_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_h)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_apriltag_get_info'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_name = block.getFieldValue('get_info');
    // TODO: Assemble Python into code variable.
    // MaixPy v4：find_apriltags() 回傳 image.AprilTag 物件，取值改成呼叫方法。
    //
    // **`payload` 在 v4 的 AprilTag 上不存在**（QRCode 和 BarCode 才有）。
    // 這塊下拉的「內容」對 AprilTag 來說就是它的編號，所以接到 id()——
    // 保留選項不刪，免得既有專案掉積木。
    // x／y／w／h 是在縮過的圖上算的，要乘回原圖比例（見 findApriltags 的說明）。
    // id／family／distance 不受影響——距離是用內參算的，而內參已經跟著縮圖走了。
    var code = dropdown_name == "payload"
        ? `${variable_name}.id()`
        : (["x", "y", "w", "h"].indexOf(dropdown_name) >= 0
            ? `int(${variable_name}.${dropdown_name}() * _apriltagScale)`
            : `${variable_name}.${dropdown_name}()`);
    if (dropdown_name == "distance") {
        // **舊碼的括號漏了**：`z*z**0.5` 的運算順序是 `z * (z ** 0.5)`，
        // 不是 `(z*z)` 再開根號。原意是歐氏距離 √(x²+y²+z²)，寫成那樣變成
        // `x² + y² + z·√z`——z 是負數時 `z**0.5` 回傳複數，`int()` 直接
        // `TypeError: int() argument must be ... not 'complex'`（2026-08-18 實機踩到）。
        // V831 上大概因為 z 恆正所以沒發作。
        //
        // 3.0649 和 -2 是 V831 鏡頭的經驗校正值，換了鏡頭本來就不準；
        // 這裡只修括號，不動那兩個常數——要校正是另一件事。
        code = `int(((${variable_name}.x_translation()**2 + ${variable_name}.y_translation()**2 + ${variable_name}.z_translation()**2) ** 0.5) * 3.0649 - 2)`
    }
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};




Blockly.Blocks['ai_vision_find_datamatrices'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_datamatrix_.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_datamatrices_detected_result);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_datamatrices_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_find_datamatrices'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.find_datamatrices()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_datamatrices_get_info'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_data_matrices_get_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_pattern_detection_content, "payload"],
                [Blockly.Msg.ai_vision_pattern_detection_rows, "rows"],
                [Blockly.Msg.ai_vision_pattern_detection_cols, "columns"],
                [Blockly.Msg.ai_vision_pattern_detection_can_tolerate_count, "capacity"],
                [Blockly.Msg.ai_vision_pattern_detection_can_not_tolerate_count, "padding"],
                [Blockly.Msg.ai_vision_pattern_detection_x, "x"],
                [Blockly.Msg.ai_vision_pattern_detection_y, "y"],
                [Blockly.Msg.ai_vision_pattern_detection_w, "w"],
                [Blockly.Msg.ai_vision_pattern_detection_h, "h"]
            ]), "get_info");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('get_info');
            var TOOLTIPS = {
                'payload': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_content),
                'rows': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_rows),
                'columns': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_cols),
                'capacity': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_can_tolerate_count),
                'padding': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_can_not_tolerate_count),
                'x': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_x),
                'y': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_y),
                'w': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_w),
                'h': Blockly.Msg.ai_vision_datamatrices_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_h)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_datamatrices_get_info'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_name = block.getFieldValue('get_info');
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.' + dropdown_name + '()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_find_barcodes'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ai_vision_barcode_.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_vision_barcode_detected_result);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_find_barcodes_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_find_barcodes'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.find_barcodes()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_vision_barcodes_get_info'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from_canvas)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_barcode_matrices_get_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_pattern_detection_content, "payload"],
                [Blockly.Msg.ai_vision_pattern_detection_type, "type"],
                [Blockly.Msg.ai_vision_pattern_detection_x, "x"],
                [Blockly.Msg.ai_vision_pattern_detection_y, "y"],
                [Blockly.Msg.ai_vision_pattern_detection_w, "w"],
                [Blockly.Msg.ai_vision_pattern_detection_h, "h"]
            ]), "get_info");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('get_info');
            var TOOLTIPS = {
                'payload': Blockly.Msg.ai_vision_barcodes_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_content),
                'type': Blockly.Msg.ai_vision_barcodes_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_type),
                'x': Blockly.Msg.ai_vision_barcodes_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_x),
                'y': Blockly.Msg.ai_vision_barcodes_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_y),
                'w': Blockly.Msg.ai_vision_barcodes_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_w),
                'h': Blockly.Msg.ai_vision_barcodes_get_info_TOOLTIP.replace('%1', Blockly.Msg.ai_vision_pattern_detection_h)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_vision_barcodes_get_info'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_name = block.getFieldValue('get_info');
    // TODO: Assemble Python into code variable.
    // MaixPy v4：find_barcodes() 回傳 image.BarCode 物件。
    //
    // 舊碼的 x／y／w／h 是自己從 corners 算的（corners[0] 到 corners[2]），
    // 因為 MaixPy3 的字典裡沒有現成的。v4 的 BarCode 直接有 x()／y()／w()／h()，
    // 算的是同一個外接矩形，所以改成直接取——少四次索引，意思不變。
    var code = `${variable_name}.${dropdown_name}()`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};



Blockly.Blocks['ai_vision_get_circles'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_circle_detected_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_find_circle_detected_x, "x()"],
                [Blockly.Msg.ai_vision_find_circle_detected_y, "y()"],
                [Blockly.Msg.ai_vision_find_circle_detected_radius, "r()"]
            ]), "blob_type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_get_circles_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};

Blockly.Python['ai_vision_get_circles'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var type = block.getFieldValue('blob_type');

    var code = variable_name + '.' + type;
    return [code, Blockly.Python.ORDER_NONE];
};




Blockly.Blocks['ai_vision_get_rects'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_rect_detected_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_find_rect_detected_x, "x()"],
                [Blockly.Msg.ai_vision_find_rect_detected_y, "y()"],
                [Blockly.Msg.ai_vision_find_rect_detected_w, "w()"],
                [Blockly.Msg.ai_vision_find_rect_detected_h, "h()"],
                [Blockly.Msg.ai_vision_find_rect_detected_tuple, "rect()"],
                [Blockly.Msg.ai_vision_find_rect_detected_corners, "corners()"]
            ]), "blob_type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_get_rects_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};

Blockly.Python['ai_vision_get_rects'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var type = block.getFieldValue('blob_type');
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.' + type;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};






Blockly.Blocks['ai_vision_get_lines'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_vision_find_line_detected_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_vision_find_line_detected_start_x, "x1()"],
                [Blockly.Msg.ai_vision_find_line_detected_start_y, "y1()"],
                [Blockly.Msg.ai_vision_find_line_detected_end_x, "x2()"],
                [Blockly.Msg.ai_vision_find_line_detected_end_y, "y2()"],
                [Blockly.Msg.ai_vision_find_line_detected_length, "length()"],
                [Blockly.Msg.ai_vision_find_line_detected_angle, "theta()"]
            ]), "blob_type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#f0983e");
        this.setTooltip(Blockly.Msg.ai_vision_get_lines_TOOLTIP);
        this.setHelpUrl("https://docs.singtown.com/micropython/zh/latest/openmvcam/library/omv.image.html?highlight=find_circles");
    }
};

Blockly.Python['ai_vision_get_lines'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var type = block.getFieldValue('blob_type');
    // TODO: Assemble Python into code variable.
    var code = variable_name + '.' + type;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

// 在线语音识别
Blockly.Blocks['ai_online_voice_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_voice_init); //
        this.appendValueInput("A").setCheck(null).appendField('APP ID');
        this.appendValueInput("B").setCheck(null).appendField('API Secret');
        this.appendValueInput("C").setCheck(null).appendField('API Key'); //Blockly.Msg.online_voice_init_path
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_voice_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_voice_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_websocket'] = `import websocket`
    Blockly.Python.definitions_['v831_import_datetime_datetime'] = `from datetime import datetime`
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_hmac'] = `import hmac`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['v831_import_urlencode'] = `from urllib.parse import urlencode`
    Blockly.Python.definitions_['v831_import_ssl'] = `import ssl`
    Blockly.Python.definitions_['v831_import_format_date_time'] = `from wsgiref.handlers import format_date_time`
    Blockly.Python.definitions_['v831_import_from_time_mktime'] = `from time import mktime`
    Blockly.Python.definitions_['v831_import_thread_as_thread'] = `import _thread as thread`
    Blockly.Python.definitions_.ai_online_voice_init = `
STATUS_FIRST_FRAME = 0  # 第一帧的标识
STATUS_CONTINUE_FRAME = 1  # 中间帧标识
STATUS_LAST_FRAME = 2  # 最后一帧的标识

class Ws_Param_voice(object):
    # 初始化
    def __init__(self, APPID, APIKey, APISecret, AudioFile):
        self.APPID_voice = APPID
        self.APIKey_voice = APIKey
        self.APISecret_voice = APISecret
        self.AudioFile_voice = AudioFile
    
        # 公共参数(common)
        self.CommonArgs = {"app_id": self.APPID_voice}
        # 业务参数(business)，更多个性化参数可在官网查看
        self.BusinessArgs = {"domain": "iat", "language": "zh_cn", "accent": "mandarin", "vinfo":1,"vad_eos":10000}
    
    # 生成url
    def create_url_voice(self):
        url = "wss://ws-api.xfyun.cn/v2/iat"
        # 生成RFC1123格式的时间戳
        now = datetime.now()
        date = format_date_time(mktime(now.timetuple()))
    
        # 拼接字符串
        signature_origin = "host: " + "ws-api.xfyun.cn" + "\\n"
        signature_origin += "date: " + date + "\\n"
        signature_origin += "GET " + "/v2/iat " + "HTTP/1.1"
        # 进行hmac-sha256进行加密
        signature_sha = hmac.new(self.APISecret_voice .encode("utf-8"), signature_origin.encode("utf-8"),
                                     digestmod=hashlib.sha256).digest()
        signature_sha = base64.b64encode(signature_sha).decode(encoding="utf-8")
    
        authorization_origin = "api_key=\\"%s\\", algorithm=\\"%s\\", headers=\\"%s\\", signature=\\"%s\\"" % (self.APIKey_voice , "hmac-sha256", "host date request-line", signature_sha)
        authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(encoding="utf-8")
        # 将请求的鉴权参数组合为字典
        v = {
            "authorization": authorization,
            "date": date,
            "host": "ws-api.xfyun.cn"
        }
            # 拼接鉴权参数，生成url
        url = url + "?" + urlencode(v)
        # print("date: ",date)
        # print("v: ",v)
        # 此处打印出建立连接时候的url,参考本demo的时候可取消上方打印的注释，比对相同参数时生成的url与自己代码生成的url是否一致
        # print('websocket url :', url)
        return url
    
    
# 收到websocket消息的处理
def on_message_voice(ws, message):
    global asr_result,txt_result
    try:
        code = json.loads(message)["code"]
        sid = json.loads(message)["sid"]
        if code != 0:
            errMsg = json.loads(message)["message"]
            print("sid:%s call error:%s code is:%s" % (sid, errMsg, code))
    
        else:
            data = json.loads(message)["data"]["result"]["ws"]
            # print(json.loads(message))
            result = ""
            for i in data:
                for w in i["cw"]:
                    result += w["w"]
            print("sid:%s call success!,data is:%s" % (sid, json.dumps(data, ensure_ascii=False)))
            print("json.dumps(data, ensure_ascii=False)",eval(json.dumps(data, ensure_ascii=False)))
            asr_result.append(eval(json.dumps(data, ensure_ascii=False)))
            txt_result.append(eval(json.dumps(data, ensure_ascii=False)[1]))
    except Exception as e:
        print("receive msg,but parse exception:", e)
    
    
    
# 收到websocket错误的处理
def on_error_voice(ws, error):
    print("### error:", error)
    
    
# 收到websocket关闭的处理
def on_close_voice(ws):
    print("### closed ###")
    
    
# 收到websocket连接建立的处理
def on_open_voice(ws):
    def run_voice(*args):
        global wsParam_voice
        frameSize = 8000  # 每一帧的音频大小
        intervel = 0.04  # 发送音频间隔(单位:s)
        status = STATUS_FIRST_FRAME  # 音频的状态信息，标识音频是第一帧，还是中间帧、最后一帧
    
        with open(wsParam_voice.AudioFile_voice, "rb") as fp:
            while True:
                buf = fp.read(frameSize)
                # 文件结束
                if not buf:
                    status = STATUS_LAST_FRAME
                # 第一帧处理
                # 发送第一帧音频，带business 参数
                # appid 必须带上，只需第一帧发送
                if status == STATUS_FIRST_FRAME:
    
                    d = {"common": wsParam_voice.CommonArgs,
                             "business": wsParam_voice.BusinessArgs,
                             "data": {"status": 0, "format": "audio/L16;rate=16000",
                                      "audio": str(base64.b64encode(buf), "utf-8"),
                                      "encoding": "raw"}}
                    d = json.dumps(d)
                    ws.send(d)
                    status = STATUS_CONTINUE_FRAME
                # 中间帧处理
                elif status == STATUS_CONTINUE_FRAME:
                    d = {"data": {"status": 1, "format": "audio/L16;rate=16000",
                                      "audio": str(base64.b64encode(buf), "utf-8"),
                                      "encoding": "raw"}}
                    ws.send(json.dumps(d))
                # 最后一帧处理
                elif status == STATUS_LAST_FRAME:
                    d = {"data": {"status": 2, "format": "audio/L16;rate=16000",
                                      "audio": str(base64.b64encode(buf), "utf-8"),
                                      "encoding": "raw"}}
                    ws.send(json.dumps(d))
                    time.sleep(1)
                    break
                # 模拟音频采样间隔
                time.sleep(intervel)
        ws.close()
    
    thread.start_new_thread(run_voice, ())
    
asr_result=[]
txt_result=[]
APPId_voice = ${APPId}
APISecret_voice = ${APISecret}
APIKey_voice = ${APIKey}
`
    var code = '';
    return code;
};


// 在线语音识别加载
Blockly.Blocks['ai_online_voice_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_voice_loading); //
        this.appendValueInput("path").setCheck(null).appendField(Blockly.Msg.online_voice_init_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_voice_loading);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_voice_loading'] = function (block) {
    var AudioFile = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['get_online_voice_data'] = `asr_string=""
def getVoiceData():
    global wsParam_voice,asr_string,txt_result,asr_result
    # 测试时候在此处正确填写相关信息即可运行
    asr_string = ""
    txt_result = []
    asr_result = []
    time1 = datetime.now()
    wsParam_voice = Ws_Param_voice(APPID=APPId_voice, APISecret=APISecret_voice,
                                            APIKey=APIKey_voice,
                                            AudioFile=${AudioFile})
    websocket.enableTrace(False)
    wsUrl = wsParam_voice.create_url_voice()
    ws = websocket.WebSocketApp(wsUrl, on_message=on_message_voice, on_error=on_error_voice)
    ws.on_open = on_open_voice
    ws.run_forever(sslopt={"cert_reqs": ssl.CERT_NONE})
    time2 = datetime.now()

    for i in range(len(asr_result)):
        for j in range(len(asr_result[i])):
            txt_result.append(asr_result[i][j]["cw"][0]["w"])
            print("txt_result:", txt_result)
    for i in range(len(txt_result)):
        asr_string=asr_string+txt_result[i]
        print("asr_string:", asr_string)
    return asr_string
`
    let code = `VoiceResult = getVoiceData()
`;
    return code;
};

Blockly.Blocks['ai_online_voice_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_voice_result); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_voice_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_voice_result'] = function (block) {
    let code = `VoiceResult`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};


// 在线人脸识别
Blockly.Blocks['ai_online_ident_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_face_init); //
        this.appendValueInput("A").setCheck(null).appendField('APP ID');
        this.appendValueInput("B").setCheck(null).appendField('API Secret');
        this.appendValueInput("C").setCheck(null).appendField('API Key');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_face_init);
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_online_ident_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_hmac'] = `import hmac`
    Blockly.Python.definitions_['v831_import_from_time_mktime'] = `from time import mktime`
    Blockly.Python.definitions_['v831_import_datetime_datetime'] = `from datetime import datetime`
    Blockly.Python.definitions_['v831_import_format_date_time'] = `from wsgiref.handlers import format_date_time`
    Blockly.Python.definitions_['v831_import_urlencode'] = `from urllib.parse import urlencode`
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_traceback'] = `import traceback`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_.ai_online_ident_init = `

class AssembleHeaderException(Exception):
    def __init__(self, msg):
        self.message = msg


class Url:
    def __init__(this, host, path, schema):
        this.host = host
        this.path = path
        this.schema = schema
        pass


# 进行sha256加密和base64编码
def sha256base64(data):
    sha256 = hashlib.sha256()
    sha256.update(data)
    digest = base64.b64encode(sha256.digest()).decode(encoding="utf-8")
    return digest


def parse_url_face(requset_url):
    stidx = requset_url.index("://")
    host = requset_url[stidx + 3:]
    schema = requset_url[:stidx + 3]
    edidx = host.index("/")
    if edidx <= 0:
        raise AssembleHeaderException("invalid request url:" + requset_url)
    path = host[edidx:]
    host = host[:edidx]
    u = Url(host, path, schema)
    return u


def assemble_ws_auth_url_face(requset_url, method="GET", api_key="", api_secret=""):
    u = parse_url_face(requset_url)
    host = u.host
    path = u.path
    now = datetime.now()
    date = format_date_time(mktime(now.timetuple()))
    print(date)
    # date = "Thu, 12 Dec 2019 01:57:27 GMT"
    signature_origin = "host: {}\\ndate: {}\\n{} {} HTTP/1.1".format(host, date, method, path)
    print(signature_origin)
    signature_sha = hmac.new(api_secret.encode("utf-8"), signature_origin.encode("utf-8"),
                             digestmod=hashlib.sha256).digest()
    signature_sha = base64.b64encode(signature_sha).decode(encoding="utf-8")
    authorization_origin = "api_key=\\"%s\\", algorithm=\\"%s\\", headers=\\"%s\\", signature=\\"%s\\"" % (
        api_key, "hmac-sha256", "host date request-line", signature_sha)
    authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(encoding="utf-8")
    print(authorization_origin)
    values = {
        "host": host,
        "date": date,
        "authorization": authorization
    }

    return requset_url + "?" + urlencode(values)

def gen_body_face(appid, img_path, server_id):
    with open(img_path, "rb") as f:
        img_data = f.read()
    body = {
        "header": {
            "app_id": appid,
            "status": 3
        },
        "parameter": {
            server_id: {
                "service_kind": "face_detect",
                #"detect_points": "1", #检测特征点
                #"detect_property": "1", #检测人脸属性
                "face_detect_result": {
                    "encoding": "utf8",
                    "compress": "raw",
                    "format": "json"
                }
            }
        },
        "payload": {
            "input1": {
                "encoding": "jpg",
                "status": 3,
                "image": str(base64.b64encode(img_data), "utf-8")
            }
        }
    }
    return json.dumps(body)


APPId_face = ${APPId}
APISecret_face = ${APISecret}
APIKey_face = ${APIKey}
`;
    let code = ''
    return code;
};


// 在线人脸识别加载
Blockly.Blocks['ai_online_ident_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_face_loading); //
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.online_face_init_path); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_face_loading);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_ident_loading'] = function (block) {
    var path = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_.online_ident = `
ONLINE_IDENT_DATA = ""
def run_face(appid, apikey, apisecret, img_path, server_id="s67c9c78c"):
    url = "http://api.xf-yun.com/v1/private/{}".format(server_id)
    request_url = assemble_ws_auth_url_face(url, "POST", apikey, apisecret)
    headers = {"content-type": "application/json", "host": "api.xf-yun.com", "app_id": appid}
    print(request_url)
    response = requests.post(request_url, data=gen_body_face(appid, img_path, server_id), headers=headers)
    resp_data = json.loads(response.content.decode("utf-8"))
    print(resp_data)
    picRes=base64.b64decode(resp_data["payload"]["face_detect_result"]["text"]).decode()
    print(picRes)
    with open("/root/pic0.txt","w") as f:
        f.write(picRes)
    return eval(picRes)
`
    let code = `
if __name__ == "__main__":
    img_path_face = ${path}
    ONLINE_IDENT_DATA = run_face(appid=APPId_face,apisecret=APISecret_face,apikey=APIKey_face,img_path=img_path_face,)
`;
    return code;
};

// 在线人脸识别结果  
Blockly.Blocks['ai_online_ident_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_face_result); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_face_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_ident_result'] = function (block) {
    let code = `ONLINE_IDENT_DATA["face_num"]`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['ai_online_ident_result_people'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.serialcomm_write_item_first)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.face_information)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_object_model_x, "x"],
                [Blockly.Msg.ai_models_object_model_y, "y"],
                [Blockly.Msg.ai_models_object_model_w, "w"],
                [Blockly.Msg.ai_models_object_model_h, "h"],
                // ['人脸属性信息', "property"],
                [Blockly.Msg.ai_models_object_model_confidence, "score"]
            ]), "TYPE");
        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip('');
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_online_ident_result_people'] = function (block) {
    var type = block.getFieldValue('TYPE');
    var i = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);

    let code = '';
    if (type == "w") {
        code = `ONLINE_IDENT_DATA.get('face_'+str(${i})).get('${type}') + ONLINE_IDENT_DATA.get('face_'+str(${i})).get('x')`
    } else if (type == "h") {
        code = `ONLINE_IDENT_DATA.get('face_'+str(${i})).get('${type}') + ONLINE_IDENT_DATA.get('face_'+str(${i})).get('y')`
    } else {
        code = `ONLINE_IDENT_DATA.get('face_'+str(${i})).get('${type}')`
    }
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 在线物体识别
Blockly.Blocks['ai_online_object_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_object_init); //
        this.appendValueInput("A").setCheck(null).appendField('APP ID');
        // this.appendValueInput("B").setCheck(null).appendField('APISecret');
        this.appendValueInput("C").setCheck(null).appendField('API Key'); //Blockly.Msg.online_voice_init_path
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_object_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_object_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_.ai_online_object_init = `
API_KEY = ${APIKey}
APPID = ${APPId}
    
def objectGetHeader(APPID, image_url, API_KEY):
    with open(image_url, "rb") as f:
        img_data = f.read()
    curTime = str(int(time.time()))
    paramBase64 = base64.b64encode(img_data)
    tmp = str(paramBase64, "utf-8")
    
    m2 = hashlib.md5()
    m2.update((API_KEY + curTime + tmp).encode("utf-8"))
    checkSum = m2.hexdigest()
    
    header = {
        'X-CurTime': curTime,
        'X-Param': paramBase64,
        'X-Appid': APPID,
        'X-CheckSum': checkSum,
    }
    return header    
`
    var code = '';
    return code;
};

Blockly.Blocks['ai_online_object_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_object_load); //
        this.appendValueInput("path").setCheck(null).appendField(Blockly.Msg.online_face_init_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_object_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_object_loading = function (block) {
    var AudioFile = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    let code = `ImageUrl = ${AudioFile}
OBJECTRESULT = requests.post("http://tupapi.xfyun.cn/v1/currency", headers=objectGetHeader(APPID, ImageUrl,API_KEY))
`
    return code
}
Blockly.Blocks['ai_online_object_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_object_result); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_object_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_object_result'] = function (block) {
    let code = `OBJECTRESULT.content`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 在线车牌识别
Blockly.Blocks['ai_online_card_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_card_init); //
        this.appendValueInput("A").setCheck(null).appendField('APP ID');
        this.appendValueInput("B").setCheck(null).appendField('API Secret');
        this.appendValueInput("C").setCheck(null).appendField('API Key'); //Blockly.Msg.online_voice_init_path
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_card_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_card_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_urlencode'] = `from urllib.parse import urlencode`
    Blockly.Python.definitions_['v831_import_format_date_time'] = `from wsgiref.handlers import format_date_time`
    Blockly.Python.definitions_['v831_import_from_time_mktime'] = `from time import mktime`
    Blockly.Python.definitions_['v831_import_datetime_datetime'] = `from datetime import datetime`
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_hmac'] = `import hmac`
    Blockly.Python.definitions_['v831_import_traceback'] = `import traceback`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_.ai_online_card_init = `
APPId_Card = ${APPId}
APISecret_Card = ${APISecret}
APIKey_Card = ${APIKey}

class AssembleHeaderException_Card(Exception):
    def __init__(self, msg):
        self.message = msg
    
class Url_Card:
    def __init__(this, host, path, schema):
        this.host = host
        this.path = path
        this.schema = schema
        pass
    
# 进行sha256加密和base64编码
def sha256base64_Card(data):
    sha256 = hashlib.sha256()
    sha256.update(data)
    digest = base64.b64encode(sha256.digest()).decode(encoding="utf-8")
    return digest
    
def parse_url_Card(requset_url):
    stidx = requset_url.index("://")
    host = requset_url[stidx + 3:]
    schema = requset_url[:stidx + 3]
    edidx = host.index("/")
    if edidx <= 0:
        raise AssembleHeaderException_Card("invalid request url:" + requset_url)
    path = host[edidx:]
    host = host[:edidx]
    u = Url_Card(host, path, schema)
    return u
    
def assemble_ws_auth_url_Card(requset_url, method="GET", api_key="", api_secret=""):
    u = parse_url_Card(requset_url)
    host = u.host
    path = u.path
    now = datetime.now()
    date = format_date_time(mktime(now.timetuple()))
    print(date)
    # date = "Thu, 12 Dec 2019 01:57:27 GMT"
    signature_origin = "host: {}\\ndate: {}\\n{} {} HTTP/1.1".format(host, date, method, path)
    print(signature_origin)
    signature_sha = hmac.new(api_secret.encode("utf-8"), signature_origin.encode("utf-8"),
                                 digestmod=hashlib.sha256).digest()
    signature_sha = base64.b64encode(signature_sha).decode(encoding="utf-8")
    authorization_origin = "api_key=\\"%s\\", algorithm=\\"%s\\", headers=\\"%s\\", signature=\\"%s\\"" % (
            api_key, "hmac-sha256", "host date request-line", signature_sha)
    authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(encoding="utf-8")
    print(authorization_origin)
    values = {
        "host": host,
        "date": date,
        "authorization": authorization
    }
    
    return requset_url + "?" + urlencode(values)
    
def gen_body_Card(appid, img_path, server_id):
    with open(img_path, "rb") as f:
        img_data = f.read()
    body = {
        "header": {
            "app_id": appid,
            "status": 3
        },
        "parameter": {
            server_id: {
                "carLicenseRes": {
                    "encoding": "utf8",
                    "compress": "raw",
                    "format": "json"
                }
            }
        },
        "payload": {
            "carImgBase64Str": {
                "encoding": "jpg",
                "status": 3,
                "image": str(base64.b64encode(img_data), "utf-8")
            }
        }
    }
    return json.dumps(body)       
`
    var code = '';
    return code;
};

Blockly.Blocks['ai_online_card_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_card_load); //
        this.appendValueInput("path").setCheck(null).appendField(Blockly.Msg.online_face_init_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_card_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_card_loading = function (block) {
    var AudioFile = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_.ai_online_card_load = `def run_Card(appid, apikey, apisecret, img_path, server_id="jd_ocr_car"):
    url = "http://api.xf-yun.com/v1/private/{}".format(server_id)
    request_url = assemble_ws_auth_url_Card(url, "POST", apikey, apisecret)
    headers = {"content-type": "application/json", "host": "api.xf-yun.com", "app_id": appid}
    #print(request_url)
    response = requests.post(request_url, data=gen_body_Card(appid, img_path, server_id), headers=headers)
    resp_data = json.loads(response.content.decode("utf-8"))
    print(resp_data)
    resultCard = base64.b64decode(resp_data["payload"]["carLicenseRes"]["text"]).decode("utf-8")
    return json.loads(resultCard)

CARDRESULT = ""
`
    let code = `if __name__ == "__main__":
    img_path_Card = ${AudioFile}
    CARDRESULT = run_Card(appid=APPId_Card,apisecret=APISecret_Card,apikey=APIKey_Card,img_path=img_path_Card,)
`
    return code
}
Blockly.Blocks['ai_online_card_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.online_card_result); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.online_card_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_card_result'] = function (block) {
    let code = `CARDRESULT`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 机器翻译
Blockly.Blocks['ai_online_machine_translation_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.machine_translation_init); //

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.machine_translation_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_machine_translation_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    let FROM = block.getFieldValue('from')
    let TO = block.getFieldValue('to')
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_CocoPi_Gpt'] = `try:
    from CocoPi import GPTrequest
except:
    import sys
    sys.path.append("/root/preset/drivers/pylib/")
    from GPTrequest import GPTrequest`
    Blockly.Python.definitions_['v831_import_CocoPi_Gpt_init'] = `gptInit = GPTrequest()`

    var code = '';
    return code;
};

Blockly.Blocks['ai_online_machine_translation_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.machine_translation_load); //
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.Content_of_text); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.machine_translation_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_machine_translation_loading = function (block) {
    let text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC)
    let lang = localStorage.getItem('handPyLanguage')
    console.log(lang)
    if (lang == 'zh-hans') {
        text = `"翻译：'"+${text}+"'只要翻译结果"`
    } else if (lang == 'zh-hant') {
        text = `"翻譯:'"+${text}+"'只要翻譯結果"`
    } else {
        text = `"translation:'"+ ${text}+"'Only the translation result"`
    }
    console.log(text)
    let code = `TRANSLATIONTEXT = ${text}
print(TRANSLATIONTEXT)
TRANSLATIONRESULT = gptInit.get_post_chatgpt(TRANSLATIONTEXT)
`
    return code
}
Blockly.Blocks['ai_online_machine_translation_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.machine_translation_result); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.machine_translation_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_machine_translation_result'] = function (block) {
    let code = `TRANSLATIONRESULT`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 手写文字识别
Blockly.Blocks['ai_online_handwritten_text_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.handwritten_text_init); //
        this.appendValueInput("A").setCheck(null).appendField('APP ID');
        // this.appendValueInput("B").setCheck(null).appendField('API Secret');
        this.appendValueInput("C").setCheck(null).appendField('API Key');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.handwritten_text_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_handwritten_text_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    // var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['v831_import_from_urllib_parse'] = `from urllib import parse`
    Blockly.Python.definitions_.ai_online_handwritten_text_init = `
URL_handwritten_text = "http://webapi.xfyun.cn/v1/service/v1/ocr/handwriting"
APPId_handwritten_text = ${APPId}
APIKey_handwritten_text = ${APIKey}
def textGetHeader_handwritten_text(language, location):
    curTime = str(int(time.time()))
    param = "{\\"language\\":\\""+language+"\\",\\"location\\":\\""+location+"\\"}"
    paramBase64 = base64.b64encode(param.encode("utf-8"))

    m2 = hashlib.md5()
    str1 = APIKey_handwritten_text + curTime + str(paramBase64, "utf-8")
    m2.update(str1.encode("utf-8"))
    checkSum = m2.hexdigest()
	# 组装http请求头
    header = {
        "X-CurTime": curTime,
        "X-Param": paramBase64,
        "X-Appid": APPId_handwritten_text,
        "X-CheckSum": checkSum,
        "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
    }
    return header
def getBody_handwritten_text(filepath):
    with open(filepath, "rb") as f:
        imgfile = f.read()
    data = {"image": str(base64.b64encode(imgfile), "utf-8")}
    return data
     
`
    var code = '';
    return code;
};

Blockly.Blocks['ai_online_handwritten_text_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.handwritten_text_load); //
        // this.appendDummyInput()
        //     .appendField('设置识别语种')
        //     .appendField(new Blockly.FieldDropdown([
        //         ["en", "en"],
        //         ["cn|en", "cn|en"],
        //     ]), "language");
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.online_face_init_path); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.handwritten_text_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_handwritten_text_loading = function (block) {
    let text = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC)
    // let language = Blockly.Python.valueToCode(block, 'language', Blockly.Python.ORDER_ATOMIC);
    let code = `# 语种设置
textLanguage = "cn|en"
# 是否返回文本位置信息
textLocation = "false"
# 图片上传接口地址
picFilePath_handwritten_text = ${text}
HandwrittenTextData = requests.post(URL_handwritten_text, headers=textGetHeader_handwritten_text(textLanguage, textLocation), data=getBody_handwritten_text(picFilePath_handwritten_text))
`
    return code
}
Blockly.Blocks['ai_online_handwritten_text_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.handwritten_text_result); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.handwritten_text_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_handwritten_text_result'] = function (block) {
    Blockly.Python.definitions_.ai_online_handwritten_text_result = `def handwrittenTextDatas_handwritten_text(r):
    my_json_data = r.content.decode("utf8")
    # print(type(my_json))
    loadsData = json.loads(my_json_data)
    # s = json.dumps(data, indent=4, sort_keys=True)
    print("data",my_json_data)
    deal_data = ""
    if loadsData["code"] == "0" :
        t = loadsData["data"]["block"][0]["line"]
        for i in t:
            print(i)
            for j in i["word"]:
                print(j["content"])
                deal_data = deal_data + j["content"] + " "

    #print('deal_data',deal_data)
    return deal_data
    `
    let code = `handwrittenTextDatas_handwritten_text(HandwrittenTextData)`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 公式识别
Blockly.Blocks['ai_online_formula_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.formula_init); //
        this.appendValueInput("A").setCheck(null).appendField('APP ID');
        this.appendValueInput("B").setCheck(null).appendField('API Secret');
        this.appendValueInput("C").setCheck(null).appendField('API Key');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.formula_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_formula_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_hmac'] = `import hmac`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['v831_import_from_urllib_parse'] = `from urllib import parse`
    Blockly.Python.definitions_['v831_import_datetime_datetime'] = `from datetime import datetime`
    Blockly.Python.definitions_.ai_online_formula_init = `class get_result_formula(object):
    def __init__(self,host,path):
        # 应用ID（到控制台获取）
        self.APPID_formula = ${APPId}
        # 接口APISercet（到控制台公式识别服务页面获取）
        self.Secret_formula = ${APISecret}
        # 接口APIKey（到控制台公式识别服务页面获取）
        self.APIKey_formula = ${APIKey}
        
        
        # 以下为POST请求
        self.Host_formula = host
        self.RequestUri_formula = "/v2/itr"
        # 设置url
        # print(host)
        self.url_formula="https://"+host+self.RequestUri_formula
        self.HttpMethod_formula = "POST"
        self.Algorithm_formula = "hmac-sha256"
        self.HttpProto_formula = "HTTP/1.1"

        # 设置当前时间
        curTime_utc = datetime.utcnow()
        self.Date_formula = self.httpdate_formula(curTime_utc)
        #设置测试图片文件
        self.AudioPath_formula = path
        self.BusinessArgs_formula={
                "ent": "teach-photo-print",
                "aue": "raw",
            }

    def imgRead_formula(self, path):
        with open(path, "rb") as fo:
            return fo.read()

    def hashlib_256_formula(self, res):
        m = hashlib.sha256(bytes(res.encode(encoding="utf-8"))).digest()
        result = "SHA-256=" + base64.b64encode(m).decode(encoding="utf-8")
        return result

    def httpdate_formula(self, dt):
        """
        Return a string representation of a date according to RFC 1123
        (HTTP/1.1).

        The supplied date must be in UTC.

        """
        weekday = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][dt.weekday()]
        month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep",
                 "Oct", "Nov", "Dec"][dt.month - 1]
        return "%s, %02d %s %04d %02d:%02d:%02d GMT" % (weekday, dt.day, month,
                                                        dt.year, dt.hour, dt.minute, dt.second)

    def generateSignature_formula(self, digest):
        signatureStr = "host: " + self.Host_formula + "\\n"
        signatureStr += "date: " + self.Date_formula + "\\n"
        signatureStr += self.HttpMethod_formula + " " + self.RequestUri_formula \\
                        + " " + self.HttpProto_formula + "\\n"
        signatureStr += "digest: " + digest
        signature = hmac.new(bytes(self.Secret_formula.encode(encoding="utf-8")),
                             bytes(signatureStr.encode(encoding="utf-8")),
                             digestmod=hashlib.sha256).digest()
        result = base64.b64encode(signature)
        return result.decode(encoding="utf-8")

    def init_header_formula(self, data):
        digest = self.hashlib_256_formula(data)
        #print(digest)
        sign = self.generateSignature_formula(digest)
        authHeader = "api_key=\\""+self.APIKey_formula+"\\", algorithm=\\""+self.Algorithm_formula+"\\", headers=\\"host date request-line digest\\", signature=\\""+sign+"\\""
        #print(authHeader)
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Method": "POST",
            "Host": self.Host_formula,
            "Date": self.Date_formula,
            "Digest": digest,
            "Authorization": authHeader
        }
        return headers

    def get_body_formula(self):
        audioData = self.imgRead_formula(self.AudioPath_formula)
        content = base64.b64encode(audioData).decode(encoding="utf-8")
        postdata = {
            "common": {"app_id": self.APPID_formula},
            "business": self.BusinessArgs_formula,
            "data": {
                "image": content,
            }
        }
        body = json.dumps(postdata)
        #print(body)
        return body

    def call_url_formula(self):
        if self.APPID_formula == "" or self.APIKey_formula == "" or self.Secret_formula == "":
            print("Appid 或APIKey 或APISecret 为空！请打开demo代码，填写相关信息。")
        else:
            code = 0
            body=self.get_body_formula()
            headers=self.init_header_formula(body)
            #print(self.url_formula)
            response = requests.post(self.url_formula, data=body, headers=headers,timeout=8)
            status_code = response.status_code
            #print(response.content)
            if status_code!=200:
                # 鉴权失败
                print("Http请求失败，状态码：" + str(status_code) + "，错误信息：" + response.text)
                print("请根据错误信息检查代码，接口文档：https://www.xfyun.cn/doc/words/formula-discern/API.html")
            else:
                # 鉴权成功
                respData = json.loads(response.text)
                dataCotent = ""
                try:
                    for i in respData["data"]["region"]:
                        dataCotent += i["recog"]["content"]
                except:
                    dataCotent = "Failure"
                return dataCotent

FORMULARESULT = ""
`
    var code = '';
    return code;
};

Blockly.Blocks['ai_online_formula_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.formula_load); //
        // this.appendDummyInput()
        //     .appendField('设置识别语种')
        //     .appendField(new Blockly.FieldDropdown([
        //         ["en", "en"],
        //         ["cn|en", "cn|en"],
        //     ]), "language");
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.online_face_init_path); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.formula_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_formula_loading = function (block) {
    let text = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC)
    // let language = Blockly.Python.valueToCode(block, 'language', Blockly.Python.ORDER_ATOMIC);
    let code = `
if __name__ == "__main__":
    formulaUrlPath_formula = ${text}
    ##示例:  host="rest-api.xfyun.cn"域名形式
    host = "rest-api.xfyun.cn"
    #初始化类
    gClass=get_result_formula(host,path=formulaUrlPath_formula)
    FORMULARESULT = gClass.call_url_formula()
`
    return code
}
Blockly.Blocks['ai_online_formula_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.formula_result); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.formula_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_formula_result'] = function (block) {
    let code = `FORMULARESULT`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 身份证识别
Blockly.Blocks['ai_online_ID_card_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('身份证识别初始化'); //
        this.appendValueInput("A").setCheck(null).appendField('APP ID');
        this.appendValueInput("B").setCheck(null).appendField('API Secret');
        this.appendValueInput("C").setCheck(null).appendField('API Key');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.handwritten_text_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_ID_card_init'] = function (block) {
    var APPId = Blockly.Python.valueToCode(block, 'A', Blockly.Python.ORDER_ATOMIC);
    var APISecret = Blockly.Python.valueToCode(block, 'B', Blockly.Python.ORDER_ATOMIC);
    var APIKey = Blockly.Python.valueToCode(block, 'C', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_hashlib'] = `import hashlib`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_hmac'] = `import hmac`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['v831_import_from_time_mktime'] = `from time import mktime`
    Blockly.Python.definitions_['v831_import_datetime_datetime'] = `from datetime import datetime`
    Blockly.Python.definitions_['v831_import_from_urllib_parse'] = `from urllib import parse`
    Blockly.Python.definitions_['v831_import_format_date_time'] = `from wsgiref.handlers import format_date_time`
    Blockly.Python.definitions_['v831_import_urlencode'] = `from urllib.parse import urlencode`
    Blockly.Python.definitions_.ai_online_formula_init = `class AssembleHeaderException(Exception):
    def __init__(self, msg):
        self.message = msg


class Url:
    def __init__(this, host, path, schema):
        this.host = host
        this.path = path
        this.schema = schema
        pass


# calculate sha256 and encode to base64
def sha256base64(data):
    sha256 = hashlib.sha256()
    sha256.update(data)
    digest = base64.b64encode(sha256.digest()).decode(encoding="utf-8")
    return digest


def parse_url(requset_url):
    stidx = requset_url.index("://")
    host = requset_url[stidx + 3:]
    schema = requset_url[:stidx + 3]
    edidx = host.index("/")
    if edidx <= 0:
        raise AssembleHeaderException("invalid request url:" + requset_url)
    path = host[edidx:]
    host = host[:edidx]
    u = Url(host, path, schema)
    return u


# build websocket auth request url
def assemble_ws_auth_url(requset_url, method="POST", api_key="", api_secret=""):
    u = parse_url(requset_url)
    host = u.host
    path = u.path
    now = datetime.now()
    date = format_date_time(mktime(now.timetuple()))
    #print(date)
    # date = "Thu, 12 Dec 2019 01:57:27 GMT"
    signature_origin = "host: {}\\ndate: {}\\n{} {} HTTP/1.1".format(host, date, method, path)
    #print(signature_origin)
    signature_sha = hmac.new(api_secret.encode("utf-8"), signature_origin.encode("utf-8"),
                             digestmod=hashlib.sha256).digest()
    signature_sha = base64.b64encode(signature_sha).decode(encoding="utf-8")
    authorization_origin = "api_key=\\"%s\\", algorithm=\\"%s\\", headers=\\"%s\\", signature=\\"%s\\"" % (
        api_key, "hmac-sha256", "host date request-line", signature_sha)
    authorization = base64.b64encode(authorization_origin.encode("utf-8")).decode(encoding="utf-8")
    #print(authorization_origin)
    values = {
        "host": host,
        "date": date,
        "authorization": authorization
    }

    return requset_url + "?" + urlencode(values)


# 控制台获取以下信息
APPId = ${APPId}
APISecret = ${APISecret}
APIKey = ${APIKey}
`
    var code = '';
    return code;
};

Blockly.Blocks['ai_online_ID_card_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('身份证识别加载'); //
        // this.appendDummyInput()
        //     .appendField('设置识别语种')
        //     .appendField(new Blockly.FieldDropdown([
        //         ["en", "en"],
        //         ["cn|en", "cn|en"],
        //     ]), "language");
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.online_face_init_path); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.handwritten_text_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_ID_card_loading = function (block) {
    let text = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC)
    // let language = Blockly.Python.valueToCode(block, 'language', Blockly.Python.ORDER_ATOMIC);
    let code = `with open(${text}, "rb") as f:
    imageBytes = f.read()

url = 'http://api.xf-yun.com/v1/private/s5ccecfce'
    
body = {
    "header": {
        "app_id": APPId,
        "status": 3,
    },
    "parameter": {
        "s5ccecfce": {
            "template_list": "id_card",
            "result": {
                "encoding": "utf8",
                "compress": "raw",
                "format": "json"
            }
        }
    },
    "payload": {
        "s5ccecfce_data_1": {
            "encoding": "jpg",
            "image": str(base64.b64encode(imageBytes), 'UTF-8'),
            "status": 3
        }
    }
}
request_Id_card_url = assemble_ws_auth_url(url, "POST", APIKey, APISecret)

headers = {'content-type': "application/json", 'host': 'api.xf-yun.com', 'app_id': APPId}
#print(request_url)
Id_card_response = requests.post(request_Id_card_url, data=json.dumps(body), headers=headers)
IDCardtempResult = json.loads(Id_card_response.content.decode())
IDCardfinalResult = base64.b64decode(IDCard['payload']['result']['text']).decode()
IDCardfinalResult = IDCardfinalResult.replace(" ", "").replace("\n", "").replace("\t", "").strip()   
`
    return code
}
Blockly.Blocks['ai_online_ID_card_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('身份证识别结果'); //

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.handwritten_text_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_ID_card_result'] = function (block) {
    let code = `IDCardfinalResult`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};


// 情绪识别
Blockly.Blocks['ai_online_emotion_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.emotion_init);
        // this.appendValueInput("path")
        //     .setCheck(null).appendField(Blockly.Msg.set_dictionary)
        //     .appendField(new Blockly.FieldVariable("emotion_recognize_result"), "varitem");
        // this.appendDummyInput().appendField(Blockly.Msg.dictionary_contain);
        this.setInputsInline(false)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);; //
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.emotion_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_emotion_init'] = function (block) {
    // let = []
    // let text = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC)
    // var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.addVariable("EMOTION_SEND_REQUEST", "EMOTION_SEND_REQUEST = {}", true);
    Blockly.Python.definitions_['emotion_init'] = `def get_img_base64str(single_image_path):
    with open(single_image_path, "rb") as fp:
        imgbase64 = base64.b64encode(fp.read())
        return imgbase64.decode()

url = "https://ai-api.cocorobo.cn/face"
`
    // ${variable_name} =${text}
    var code = ``;
    return code;
};

Blockly.Blocks['ai_online_emotion_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.emotion_load); //
        // this.appendDummyInput()
        //     .appendField('设置识别语种')
        //     .appendField(new Blockly.FieldDropdown([
        //         ["en", "en"],
        //         ["cn|en", "cn|en"],
        //     ]), "language");
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.online_face_init_path); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.emotion_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_emotion_loading = function (block) {
    let text = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC)
    // let language = Blockly.Python.valueToCode(block, 'language', Blockly.Python.ORDER_ATOMIC);
    let code = `imageEmotionURLbase64 = str(get_img_base64str(${text}))
    # print(imageURLbase64)
data = "{\\"image\\":\\"" + str(imageEmotionURLbase64) + "\\"}"
try:
    EMOTION_SEND_REQUEST = requests.post(url, data = data , headers = { "Ocp-Apim-Subscription-Key": "6baf787532ef4eec8bc93c88518b8916", "Content-type": "application/json" }, timeout = 10000)
    EMOTION_SEND_REQUEST = json.loads(EMOTION_SEND_REQUEST.content)["data"]["result"]["face_list"][0]
    # print(str(_COCOCLOUD_SEND_REQUEST.status_code)+", "+str(_COCOCLOUD_SEND_REQUEST.content))
except BaseException as e:
    EMOTION_SEND_REQUEST = "no result"
pass
`
    return code
}
Blockly.Blocks['ai_online_emotion_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.emotion_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.emotion_result_age, "age"],
                [Blockly.Msg.emotion_result_emotion, "emotion"],
                [Blockly.Msg.emotion_result_gender, "gender"],
                [Blockly.Msg.emotion_result_expression, "expression"]
            ]), "emotion_type");

        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.emotion_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_emotion_result'] = function (block) {
    var type = block.getFieldValue('emotion_type');
    let code = ""
    // console.log(type)
    if (type == "age") {
        code = `EMOTION_SEND_REQUEST["age"]`
    } else {
        code = `EMOTION_SEND_REQUEST["${type}"]["type"]`
    }

    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 手势识别
Blockly.Blocks['ai_online_gesture_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.gesture_init); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.gesture_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_gesture_init'] = function (block) {
    // let = []
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_fromPIL_Image'] = `from PIL import Image`
    Blockly.Python.definitions_['v831_import_base64'] = `import base64`
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.definitions_['emotion_init'] = `
def getImgData(single_image_path):
    imgGesture = Image.open(single_image_path).convert("RGB")
    imgGesture.save(single_image_path.split(".")[0] + ".png", "png")
    with open(single_image_path.split(".")[0] + ".png", "rb") as fp:
        return fp.read()
    
url = "https://ai-api.cocorobo.cn/gesture"
`
    var code = '';
    return code;
};

Blockly.Blocks['ai_online_gesture_loading'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.gesture_load); //
        // this.appendDummyInput()
        //     .appendField('设置识别语种')
        //     .appendField(new Blockly.FieldDropdown([
        //         ["en", "en"],
        //         ["cn|en", "cn|en"],
        //     ]), "language");
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.online_face_init_path); //
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.gesture_load);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_online_gesture_loading = function (block) {
    let text = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC)
    // let language = Blockly.Python.valueToCode(block, 'language', Blockly.Python.ORDER_ATOMIC);
    let code = `try:
    payload={}
    files=[("image",("filename.png", getImgData(${text}),"image/png"))]
    headers = {}
    GESTURE_SEND_REQUEST = requests.post(url, headers=headers, data=payload, files=files, timeout = 10000)
    GESTURE_SEND_REQUEST = json.loads(GESTURE_SEND_REQUEST.content)["data"]["result"][0]["classname"]
    # print(str(_COCOCLOUD_SEND_REQUEST.status_code)+", "+str(_COCOCLOUD_SEND_REQUEST.content))
except BaseException as e:
    GESTURE_SEND_REQUEST = "no result"
pass
`
    return code
}
Blockly.Blocks['ai_online_gesture_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.gesture_result);
        this.setOutput(true, null);
        this.setColour("#0000ff");
        this.setTooltip(Blockly.Msg.gesture_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_online_gesture_result'] = function (block) {
    let code = `GESTURE_SEND_REQUEST`

    return [code, Blockly.Python.ORDER_ATOMIC];
};


var SPEECH_RECOGNITION_BLOCK_COLOR = "230";


Blockly.Blocks['speech_recognition_new_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/speech_recognition_header_new.png", 70, 70, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_setup);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_speech_recognition_setup_set_sensi)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.ai_speech_recognition_setup_set_sensi_normal, "10000"],
        //         [Blockly.Msg.ai_speech_recognition_setup_set_sensi_high, "20000"],
        //         [Blockly.Msg.ai_speech_recognition_setup_set_sensi_ehigh, "30000"]
        //     ]), "sensitivity");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_new_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_new_setup'] = function (block) {
    Blockly.Python.definitions_["v831_import_coco_mfcc"] = `import _coco_mfcc`
    Blockly.Python.definitions_["v831_import_time"] = `import time`
    Blockly.Python.definitions_["v831_coco_mfcc_init"] = `mfcc = _coco_mfcc.MFCC(is_reply=False)`;
    Blockly.Python.addVariable("RecordState", "RecordState = 0", true);
    Blockly.Python.addVariable("recordFrequency", "recordFrequency = 0", true);
    Blockly.Python.addVariable("recordResultData", `recordResultData = None`, true);
    let code = ""
    return code;
};

Blockly.Blocks['speech_recognition_clear'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(new Blockly.FieldImage("blockly/media/speech_recognition_header_new.png", 70, 70, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.speech_recognition_Clean_up_the_last_study_result);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_Clean_up_the_last_study_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_clear'] = function (block) {
    Blockly.Python.definitions_["v831_import_coco_mfcc"] = `import _coco_mfcc`
    Blockly.Python.definitions_["v831_coco_mfcc_init"] = `mfcc = _coco_mfcc.MFCC(is_reply=False)`;

    var code = `mfcc.clear()
`;
    return code;
};
Blockly.Blocks['speech_recognition_record_start_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/speech_recognition_header_recording_new.png", 130, 60, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_start_recording);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_start_recording_clip_text)
            .appendField(new Blockly.FieldNumber(2, 1, 6, 1), "clip")
        // .appendField(Blockly.Msg.ai_speech_recognition_start_recording_take_note);
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_interface)
            .appendField(new Blockly.FieldVariable("recordCanvas"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_speech_recognition_start_recording);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_record_start_result'] = function (block) {
    var number_take = block.getFieldValue('clip');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_["v831_mfcc_clear"] = `mfcc.clear()
`
    Blockly.Python.addVariable('number_take', `number_take = ${number_take}`, true)
    let idenSuccess = "录制成功";
    let speek = "说第";
    let SpeechFragment = "语音片段";
    if (localStorage.getItem('handPyLanguage') == "zh-hant") {
        idenSuccess = "錄製成功";
        speek = "說第 ";
        SpeechFragment = "語音片段";
    } else if (localStorage.getItem('handPyLanguage') == "en") {
        idenSuccess = "Recorded successfully";
        speek = "Speek ";
        SpeechFragment = "Speech fragment";
    }
    var code = `if RecordState == 0:
    mfcc.recording(recordFrequency)
    recordFrequency = recordFrequency + 1
    time.sleep(1)
    RecordState = 1
if RecordState == 1:
    recordData = mfcc.state()
    if recordData == mfcc._mfcc_result:
        ${variable_name}.draw_string(0,80,"${idenSuccess}", scale = 2, color = (0,204,204) , thickness = 1)
        time.sleep(1)
        if recordFrequency < number_take:
            RecordState = 0
    else:
        ${variable_name}.draw_string(0,80, "${speek} "+str(recordFrequency)+" ${SpeechFragment}", scale = 2, color = (0,204,204) , thickness = 1)
`
    return code
};

Blockly.Blocks['speech_recognition_new_start_recognition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/speech_recognition_header_recognition_new.png", 130, 60, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_start_recognizing);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_new_start_recognition_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['speech_recognition_new_start_recognition'] = function (block) {
    var code = `if RecordState == 0:
    mfcc.recognize()
    recordResultData = None
    time.sleep(1)
    RecordState = 1
`
    return code
};
Blockly.Blocks['speech_recognition_new_recognition_get_any_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_any_result_text);
        this.appendStatementInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_speech_recognition_any_result_text_do);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_new_recognition_get_any_result_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_new_recognition_get_any_result'] = function (block) {
    var statements_name = Blockly.Python.statementToCode(block, 'NAME');
    // TODO: Assemble Python into code variable.
    var code = `if RecordState == 1:
    recordData = mfcc.state()
    if recordData == mfcc._mfcc_result:
        recordResultData = mfcc.result()
        time.sleep(1)
        RecordState = 0
${statements_name}
`;
    return code;
};


Blockly.Blocks['speech_recognition_new_recognition_get_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_get_result)
            .appendField(new Blockly.FieldNumber(1, 1, 6, 1), "index")
            .appendField(Blockly.Msg.ai_speech_recognition_get_result_after);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_new_recognition_get_result_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_new_recognition_get_result'] = function (block) {
    var number_index = block.getFieldValue('index');
    // TODO: Assemble Python into code variable.
    var code = `recordResultData == ${number_index - 1}`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

/*
     _    ___  __     ___     _            
    / \  |_ _| \ \   / (_) __| | ___  ___  
   / _ \  | |   \ \ / /| |/ _` |/ _ \/ _ \ 
  / ___ \ | |    \ V / | | (_| |  __/ (_) |
 /_/   \_\___|    \_/  |_|\__,_|\___|\___/ 
*/


Blockly.Blocks['ai_video_record_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/video_record_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_start_recording);
        this.appendValueInput("save_path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_video_start_recording_file_path);
        this.appendValueInput("w")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_video_start_recording_width);
        this.appendValueInput("h")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_video_start_recording_height);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_video_record_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['ai_video_record_setup'] = function (block) {
    var value_save_path = Blockly.Python.valueToCode(block, 'save_path', Blockly.Python.ORDER_ATOMIC);
    var value_w = Blockly.Python.valueToCode(block, 'w', Blockly.Python.ORDER_ATOMIC);
    var value_h = Blockly.Python.valueToCode(block, 'h', Blockly.Python.ORDER_ATOMIC);

    Blockly.Python.definitions_.import_video = "import video";
    Blockly.Python.definitions_.import_Maix = "from Maix import GPIO";
    Blockly.Python.addVariable('record_vid', 'record_vid = None', true);
    // TODO: Assemble Python into code variable.
    var code = "_record_vid = video.open(" + value_save_path + ", record=1, width=" + value_w + ", height=" + value_h + ", interval=20000, quality=80)\n";
    return code;
};

Blockly.Blocks['ai_video_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_to_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_video_record);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_video_get_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_video_get = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = "_record_vid.record(" + variable_name + ")\n"
    return _code;
}

Blockly.Blocks['ai_video_stop'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_stop_recording);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#60c1bb");
        this.setTooltip(Blockly.Msg.ai_video_stop_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_video_stop = function (block) {
    var _code = "_record_vid.record_finish()\n"
    return _code;
}

Blockly.Blocks['ai_video_set_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/video_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_set_play_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_set_play_init);
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_video_set_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_pyaudio'] = `import pyaudio`
    Blockly.Python.definitions_['v831_import_av'] = `import av`
    Blockly.Python.definitions_['v831_import_from_maix_display'] = `from maix import display`
    Blockly.Python.definitions_['v831_import_from_maix_camera'] = `from maix import camera`
    Blockly.Python.definitions_['v831_import_from_maix_image'] = `from maix import image`
    // MaixPy v4：display 是模組不是物件，要先有一個 Display 實例才能 show()。
    // key 跟 ai_lcd_screeninit 用的同一個，所以兩塊同時放也只會建立一次。
    Blockly.Python.definitions_['v831_display_init'] = `disp = display.Display()
DISP_W = disp.width()
DISP_H = disp.height()
`
    let code = ``
    return code;
}
Blockly.Blocks['ai_video_set'] = {
    init: function () {

        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_video_play_video);
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_video_play_video_file_path);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_video_play_video_2);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_play_video);
        this.setHelpUrl("https://cn.maixpy.sipeed.com/maixpy/zh/api_reference/media/video.html#1-avi");
    }
};

Blockly.Python['ai_video_set'] = function (block) {
    // Blockly.Python.definitions_.import_Maix = "from maix import display, camera, image";
    var value_path = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    var code = `pathToVideo = ${value_path}
containerVideo = av.open(pathToVideo)
streamVideo = containerVideo.streams.video[0]
`
    return code;
};
Blockly.Blocks['ai_video_set_stats'] = {
    init: function () {

        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_set_play_stats);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_video_play_video_2);
        this.setOutput(true, null)
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_set_play_stats);
        this.setHelpUrl("https://cn.maixpy.sipeed.com/maixpy/zh/api_reference/media/video.html#1-avi");
    }
};

Blockly.Python['ai_video_set_stats'] = function (block) {
    var code = `containerVideo.decode(video=0)`
    return [code, Blockly.Python.ORDER_NONE];
};
Blockly.Blocks['ai_video_set_play'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_video_set_play);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_set_play);
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_video_set_play'] = function (block) {
    var value = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // MaixPy v4：
    //   image.load()   只吃檔案路徑，不吃 (bytes, size)——那是 MaixPy3 的簽名。
    //                  從記憶體來的要用 image.from_bytes(w, h, format, data)。
    //   display.show() display 是模組，要用 Display 實例的 show()。
    //
    // 實測 PyAV 16.0.1 解 640x480 一幀給的正是 921600 bytes ＝ w*h*3 ＝ RGB888。
    let code = `if "Video" in repr(${value}):
    VideoImg = image.from_bytes(streamVideo.width, streamVideo.height, image.Format.FMT_RGB888, bytes(${value}.to_rgb().planes[0]))
    disp.show(VideoImg)
`
    return code;
}
Blockly.Blocks['ai_video_stop_play'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_stop_video_playing);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_stop_play_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_video_stop_play'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = `break
`;
    return code;
};

Blockly.Blocks['ai_video_record_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/video_record_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_start_recording);
        this.appendValueInput("save_path")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_video_start_recording_file_path);
        this.appendValueInput("w")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_video_start_recording_width);
        this.appendValueInput("h")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_video_start_recording_height);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_record_setup_TOOLTIP);
        // this.setHelpUrl("https://cn.maixpy.sipeed.com/maixpy/zh/api_reference/media/video.html#1-avi");
    }
};

Blockly.Python['ai_video_record_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_pyaudio'] = `import pyaudio`
    Blockly.Python.definitions_['v831_import_av'] = `import av`
    Blockly.Python.definitions_['v831_import_from_maix_display'] = `from maix import display`
    Blockly.Python.definitions_['v831_import_from_maix_camera'] = `from maix import camera`
    Blockly.Python.definitions_['v831_import_from_maix_image'] = `from maix import image`
    var value_path = Blockly.Python.valueToCode(block, 'save_path', Blockly.Python.ORDER_ATOMIC);
    var w = Blockly.Python.valueToCode(block, 'w', Blockly.Python.ORDER_ATOMIC);
    var h = Blockly.Python.valueToCode(block, 'h', Blockly.Python.ORDER_ATOMIC);
    var code = `path_to_video = ${value_path}
fps = 10
container = av.open(path_to_video, mode='w')
stream = container.add_stream('h264', rate=fps) # h264 or mpeg4
stream.width = ${w}
stream.height = ${h}
stream.pix_fmt = 'yuv420p'
    
`
    return code;
};

Blockly.Blocks['ai_video_record_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_to_canvas)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem")
            .appendField(Blockly.Msg.ai_video_record);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_get_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_video_record_get = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // MaixPy v4：width／height 是方法不是屬性，tobytes() 改叫 to_bytes()。
    //
    // 錄影走的還是 PyAV（av 16.0.1 在 pi2 上還在，實測錄放都通），沒有換成
    // v4 的 maix.video.VideoRecorder——那會讓產碼全變。代價是軟體編碼比較慢：
    // 實測 640x480 只有 5.5 fps，而積木寫死 fps=10，所以錄出來的影片會偏快。
    var _code = `frame = av.VideoFrame(${variable_name}.width(), ${variable_name}.height(), 'rgb24')
frame.planes[0].update(${variable_name}.to_bytes())
for packet in stream.encode(frame):
    container.mux(packet)

`
    return _code;
}

Blockly.Blocks['ai_video_record_stop'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_stop_recording);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_stop_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_video_record_stop = function (block) {
    var _code = `
#Flush stream
for packet in stream.encode():
    container.mux(packet)
    
#Close the file
container.close()

`
    return _code;
}

//  视频录制
Blockly.Blocks['ai_video_record'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/video_init_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_recording_and_save);
        this.appendValueInput("path")
            .setCheck(null)
            .appendField(Blockly.Msg.VIDEO_SET_P);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_play_video_2);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_set_TOOLTIP);
        this.setHelpUrl("https://cn.maixpy.sipeed.com/maixpy/zh/api_reference/media/video.html#1-avi");
    }
};
Blockly.Python['ai_video_record'] = function (block) {
    var value_path = Blockly.Python.valueToCode(block, 'path', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_pyaudio'] = `import pyaudio`
    Blockly.Python.definitions_['v831_import_av'] = `import av`
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_from_maix_display'] = `import display`
    Blockly.Python.definitions_['v831_import_from_maix_camera'] = `import camera`
    Blockly.Python.definitions_['v831_import_from_maix_image'] = `import image`
    var code = `path_to_video = ${value_path};
duration, fps = 4, 10
total_frames = duration * fps
container = av.open(path_to_video, mode='w')
stream = container.add_stream('h264', rate=fps) # h264 or mpeg4
stream.width = 320
stream.height = 240
stream.pix_fmt = 'yuv420p'    
for frame_i in range(total_frames):
    img = image.new(size=(stream.width, stream.height), mode='RGB')
    img.draw_string(0, 0, str(time.time()), 2)
    frame = av.VideoFrame(img.width, img.height, 'rgb24')
    frame.planes[0].update(img.tobytes())
    for packet in stream.encode(frame):
        container.mux(packet)
    
#Flush stream
for packet in stream.encode():
    container.mux(packet)
    
#Close the file
container.close()
    
#Play the video
    
container = av.open(path_to_video)
stream = container.streams.video[0]
for frame in container.decode(video=0):
    if 'Video' in repr(frame):
        img = image.load(bytes(frame.to_rgb().planes[0]), (stream.width, stream.height))
        display.show(img)`
    return code;
};


Blockly.Blocks['ai_video_status'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_video_get_video_playing_status);
        this.setOutput(true, null);
        this.setColour("#4d9994");
        this.setTooltip(Blockly.Msg.ai_video_status_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_video_status = function (block) {
    var code = "_video_play.play()";
    return [code, Blockly.Python.ORDER_NONE];
}


/*
     _    ___   __  __           _      _     
    / \  |_ _| |  \/  | ___   __| | ___| |___ 
   / _ \  | |  | |\/| |/ _ \ / _` |/ _ \ / __|
  / ___ \ | |  | |  | | (_) | (_| |  __/ \__ \
 /_/   \_\___| |_|  |_|\___/ \__,_|\___|_|___/

*/



Blockly.Blocks['ai_model_allinit'] = {
    init: function () {
        // let types = getLocalStorage("isQiehuan");
        // if (!types) {
        //     saveLocalStorage("isQiehuan", 0);
        // }
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_init_hand_written_model, "Single Digit Recognition"],
                [Blockly.Msg.ai_models_init_object_model, "Common Object Recognition"],
                [Blockly.Msg.ai_models_init_face_model, "Human Face Recognition"]
            ]), "DEGREE");
        this.appendDummyInput().appendField(Blockly.Msg.ai_model_allinit_language).appendField(new Blockly.FieldDropdown([
            [Blockly.Msg.ai_speech_recognition_setup_set_english, "English"],
            [Blockly.Msg.ai_speech_recognition_setup_set_simplified_chinese, "Simplified Chinese"],
            [Blockly.Msg.ai_speech_recognition_setup_set_traditional_chinese, "Traditional Chinese"]
        ]), "interface")
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_camera_camera_fit_set1)
        //     .appendField(new Blockly.FieldVariable("img_mnist"), "camera_varitem");
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_models_init_source)
        //     .appendField(new Blockly.FieldVariable("img_mnist"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Single Digit Recognition': Blockly.Msg.ai_model_allinit_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_hand_written_model),
                'Common Object Recognition': Blockly.Msg.ai_model_allinit_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_object_model),
                'Human Face Recognition': Blockly.Msg.ai_model_allinit_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_face_model)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_allinit = function (block) {
    Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    var degee = block.getFieldValue('DEGREE');
    var _code = "";
    if (degee == "Single Digit Recognition") {
        Blockly.Python.addVariable('task_mnist', "task_mnist = kpu.load(\"/sd/preset/models/mnist.kmodel\")\n", true);
    } else if (degee == "Common Object Recognition") {
        var language = localStorage.getItem("handPyLanguage");
        Blockly.Python.addVariable('task_objectrecognition', 'task_objectrecognition = None', true);
        if (language == "en") {
            _code = '' +
                'classes_objectrecognition = [\'aeroplane\', \'bicycle\', \'bird\', \'boat\', \'bottle\', \'bus\', \'car\', \'cat\', \'chair\', \'cow\', \'diningtable\', \'dog\', \'horse\', \'motorbike\', \'person\', \'pottedplant\', \'sheep\', \'sofa\', \'train\', \'tvmonitor\']\n' +
                'task_objectrecognition = kpu.load("/sd/preset/models/tinyyolo_v2_20class.kmodel")\n' +
                'object_anchor = (1.08, 1.19, 3.42, 4.41, 6.63, 11.38, 9.42, 5.11, 16.62, 10.52)\n' +
                'a = kpu.init_yolo2(task_objectrecognition, 0.5, 0.3, 5, object_anchor)\n' +
                '';
        }
        else if (language == "zh-hans") {
            _code = '' +
                'classes_objectrecognition = [\'飞机\', \'自行车\', \'鸟\', \'船\', \'瓶子\', \'公共汽车\', \'汽车\', \'猫\', \'椅子\', \'牛\', \'餐桌\', \'狗\', \'马\', \'摩托车\', \'人\', \'盆栽\', \'羊\', \'沙发\', \'火车\', \'电视监视器\']\n' +
                'task_objectrecognition = kpu.load("/sd/preset/models/tinyyolo_v2_20class.kmodel")\n' +
                'object_anchor = (1.08, 1.19, 3.42, 4.41, 6.63, 11.38, 9.42, 5.11, 16.62, 10.52)\n' +
                'a = kpu.init_yolo2(task_objectrecognition, 0.5, 0.3, 5, object_anchor)\n' +
                '';
        }
        else {
            _code = '' +
                'classes_objectrecognition = [\'飛機\', \'自行車\', \'鳥\', \'船\', \'瓶子\', \'公共汽車\', \'汽車\', \'貓\', \'椅子\', \'牛\', \'餐桌\', \'狗\', \'馬\', \'摩托車\', \'人\', \'盆栽\', \'羊\', \'沙發\', \'火車\', \'電視監視器\']\n' +
                'task_objectrecognition = kpu.load("/sd/preset/models/tinyyolo_v2_20class.kmodel")\n' +
                'object_anchor = (1.08, 1.19, 3.42, 4.41, 6.63, 11.38, 9.42, 5.11, 16.62, 10.52)\n' +
                'a = kpu.init_yolo2(task_objectrecognition, 0.5, 0.3, 5, object_anchor)\n' +
                '';
        }
    } else {
        Blockly.Python.addVariable('task_facerecognition', 'task_facerecognition = None', true);
        _code = "" +
            "task_facerecognition = kpu.load(\"/sd/preset/models/preset/face-recognition.kmodel\")\n" +
            "anchor_face = (1.889, 2.5245, 2.9465, 3.94056, 3.99987, 5.3658, 5.155437, 6.92275, 6.718375, 9.01025)\n" +
            "a = kpu.init_yolo2(task_facerecognition, 0.5, 0.3, 5, anchor_face)\n" +
            "\n";
    }
    return _code;
}


// 边缘检测
Blockly.Blocks['ai_model_edge_init'] = {
    init: function () {
        // let types = getLocalStorage("isQiehuan");
        // if (!types) {
        //     saveLocalStorage("isQiehuan", 0);
        // }
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(Blockly.Msg.ai_models_edge_detection_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_init_title + Blockly.Msg.ai_models_edge_detection_model);
        this.setHelpUrl('');
    }
};

// MaixPy v4：舊版把 Sobel 卷積包成 NPU 模型（v3 的 nn.load ＋ sobel_int8），
// v4 沒有 nn.load 也沒有這個模型檔。Sobel 本來就是固定的 3×3 公式、不是學出來的，
// 改用 OpenCV 的 cv2.Sobel 在 CPU 上算（224×224 約 20 ms）。image2cv／cv2image
// 轉換照 MaixPy 的 docs/doc/zh/vision/opencv.md；官方範例用的是 Canny，這裡沿用
// 舊版的 Sobel——Canny 出來是二值細線，還要兩個門檻值，積木上沒有欄位。
//
// image 的 import 用 v831_import_image 這個 key，不用 v831_import_from_maix_image：
// 後者會被 ai_video_record 寫成 v3 的 `import image`，同一份程式就變成誰後產碼誰贏。
//
// 跟舊版的差別：舊模型是無填充卷積，224 進 222 出；cv2.Sobel 會補邊，進多大出多大。
// 每個色彩通道各算一次、x 與 y 方向取強度，再縮放到 0～255（舊版是除以最大值）。
// 全黑的圖沒有邊緣，NORM_MINMAX 回全黑；舊版在這裡會除以 0。
Blockly.Python.ai_model_edge_init = function (block) {
    Blockly.Python.definitions_['v831_import_cv2'] = `import cv2`;
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`;
    Blockly.Python.definitions_['edge_detect_sobel'] = `def edge_detect_sobel(img: image.Image) -> image.Image:
    src = image.image2cv(img, ensure_bgr=False, copy=False)
    gx = cv2.Sobel(src, cv2.CV_32F, 1, 0)
    gy = cv2.Sobel(src, cv2.CV_32F, 0, 1)
    edge = cv2.normalize(cv2.magnitude(gx, gy), None, 0, 255, cv2.NORM_MINMAX, cv2.CV_8U)
    return image.cv2image(edge, bgr=False, copy=True)
`;
    return "";
}

// 加载边缘检测模型 
Blockly.Blocks['ai_model_edge_loading'] = {
    init: function () {
        // let types = getLocalStorage("isQiehuan");
        // if (!types) {
        //     saveLocalStorage("isQiehuan", 0);
        // }
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_edge_detection_model);

        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_edgedetection"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);

        this.setColour("#ee783a");
        // var thisBlock = this;
        this.setTooltip(Blockly.Msg.ai_models_load_edge_detection_model);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_edge_loading = function (block) {
    var img = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    return `edgeModel = edge_detect_sobel(${img})\n`;
}

// 获取边缘测试模型结果 
Blockly.Blocks['ai_model_edge_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_get_edge_detection_result);

        this.setOutput(true, null);
        // this.setNextStatement(true, null);

        this.setColour("#ee783a");
        // var thisBlock = this;
        this.setTooltip(Blockly.Msg.ai_models_get_edge_detection_result);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_edge_result = function (block) {
    var degee = block.getFieldValue('varitem');
    var _code = "edgeModel";
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_allload'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_init_hand_written_model, "Single Digit Recognition"],
                [Blockly.Msg.ai_models_init_object_model, "Common Object Recognition"],
                [Blockly.Msg.ai_models_init_face_model, "Human Face Recognition"]
            ]), "DEGREE");
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_camera_camera_fit_set1)
        //     .appendField(new Blockly.FieldVariable("img_mnist"), "camera_varitem");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_mnist"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Single Digit Recognition': Blockly.Msg.ai_model_allload_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_hand_written_model),
                'Common Object Recognition': Blockly.Msg.ai_model_allload_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_object_model),
                'Human Face Recognition': Blockly.Msg.ai_model_allload_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_face_model)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_allload = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // var camera_variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('camera_varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    var degee = block.getFieldValue('DEGREE');
    var _code = ""
    if (degee == "Single Digit Recognition") {
        // Blockly.Python.addVariable('img_mnist_resized', '', true);
        _code += "img_mnist1=" + variable_name + ".to_grayscale(1)\n";
        _code += "img_mnist_resized=img_mnist1.resize(28,28)\n";
        _code += "a=img_mnist_resized.invert()\n";
        _code += "a=img_mnist_resized.strech_char(1)\n";
        _code += "a=img_mnist_resized.pix_to_ai()\n";
        _code += "fmap_mnist=kpu.forward(task_mnist, img_mnist_resized)\n";
        _code += "plist_mnist=fmap_mnist[:]\n";
        _code += "pmax_mnist=max(plist_mnist)\n";
        _code += "max_index_mnist=plist_mnist.index(pmax_mnist)\n";
    } else if (degee == "Common Object Recognition") {
        // Blockly.Python.addVariable('code_objectrecognition', '', true);
        _code += "code_objectrecognition = kpu.run_yolo2(task_objectrecognition, " + variable_name + ")\n";
        _code += variable_name + ".ai_to_pix()\n";
    } else {
        // Blockly.Python.addVariable('code_facerecognition', '', true);
        _code += "code_facerecognition = kpu.run_yolo2(task_facerecognition, " + variable_name + ")\n";
        _code += variable_name + ".ai_to_pix()\n";
    }
    return _code;
}

Blockly.Blocks['ai_model_index_init'] = {
    init: function () {
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_models_init_title)
        // .appendField("DEGREE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_init_title);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_index_init = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    console.log('value_class_input', value_class_input)
    var _code = value_class_input;
    // Blockly.Python.addVariable('task_mnist', "task_mnist = kpu.load(\"/sd/preset/models/mnist.kmodel\")\n", true);

    return _code;
}

// 手写数字识别
Blockly.Blocks['ai_model_look_written_model'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_models_init_title)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.ai_models_init_hand_written_model, "Human Face Recognition"]
        //     ]), "DEGREE");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_hand_written_model);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_init_title + Blockly.Msg.ai_models_init_hand_written_model);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_look_written_model = function (block) {
    // Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    var _code = "task_mnist = kpu.load(\"/sd/preset/models/mnist.kmodel\")\n";

    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_look_written_model_old'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_init_hand_written_model, "Human Face Recognition"]
            ]), "DEGREE");
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_models_init_hand_written_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_init_title + Blockly.Msg.ai_models_init_hand_written_model);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_look_written_model_old = function (block) {
    Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    var _code = "task_mnist = kpu.load(\"/sd/preset/models/mnist.kmodel\")\n";

    return _code;
}

Blockly.Blocks['ai_model_index_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_init_hand_written_model, "Single Digit Recognition"]
            ]), "DEGREE");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_mnist"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Single Digit Recognition': Blockly.Msg.ai_model_allload_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_hand_written_model)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_index_load = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // var camera_variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('camera_varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    var degee = block.getFieldValue('DEGREE');
    var _code = ""
    if (degee == "Single Digit Recognition") {
        // Blockly.Python.addVariable('img_mnist_resized', '', true);
        _code += "img_mnist1=" + variable_name + ".to_grayscale(1)\n";
        _code += "img_mnist_resized=img_mnist1.resize(28,28)\n";
        _code += "a=img_mnist_resized.invert()\n";
        _code += "a=img_mnist_resized.strech_char(1)\n";
        _code += "a=img_mnist_resized.pix_to_ai()\n";
        _code += "fmap_mnist=kpu.forward(task_mnist, img_mnist_resized)\n";
        _code += "plist_mnist=fmap_mnist[:]\n";
        _code += "pmax_mnist=max(plist_mnist)\n";
        _code += "max_index_mnist=plist_mnist.index(pmax_mnist)\n";
    }
    return _code;
}

Blockly.Blocks['ai_model_index_mnist'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/digit_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_hand_written_model_result);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_hand_written_model_number, "c"],
                [Blockly.Msg.ai_models_hand_written_model_confidence, "confidence"]
            ]), "value");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_index_mnist_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_index_mnist = function (block) {
    var value = block.getFieldValue('value');
    var _code = "max_index_mnist";
    if (value == "confidence") {
        _code = "int(pmax_mnist*100)";
    }
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_digital_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(Blockly.Msg.ai_models_init_hand_written_model);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_models_init_hand_written_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_init_title + Blockly.Msg.ai_models_init_hand_written_model);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_digital_init = function (block) {
    // Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`
    Blockly.Python.definitions_['v831_import_from_maixnn_decoder'] = `from maix.nn import decoder`
    var _code = `
class Number_recognition:
    mdsc_path = "/root/preset/model/Number.mud"
    labels = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
    anchors = [1.0, 5.0, 1.35, 5.42, 0.49, 2.55, 0.86, 3.75, 0.65, 4.38]

    def __init__(self):
        self.model = nn.load(self.mdsc_path)
        self.decoder = decoder.Yolo2(len(self.labels) , self.anchors , net_in_size = (224, 224) ,net_out_size = (7,7))
    def __del__(self):
        del self.model
        del self.decoder
    def cal_fps(self ,start , end):
        one_second = 1
        one_flash = end - start
        fps = one_second / one_flash
        return  fps

number_recognition = Number_recognition()
`;

    return _code;
}

Blockly.Blocks['ai_model_digital_init_loding'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(Blockly.Msg.ai_models_init_hand_written_model);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_mnist"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Single Digit Recognition': Blockly.Msg.ai_model_allload_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_hand_written_model)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_digital_init_loding = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // var camera_variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('camera_varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_.import_KPU = ``;
    var degee = block.getFieldValue('DEGREE');
    var _code = `out = number_recognition.model.forward(${variable_name}, quantize=1, layout = "hwc")
boxes, probs = number_recognition.decoder.run(out, nms=0.5, threshold=0.3, img_size=(224,224))
if len(boxes):
    for boxesi, box in enumerate(boxes):
        boxes[boxesi].append(probs[boxesi])
`
    return _code;
}

Blockly.Blocks['ai_model_digital_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/digit_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_hand_written_model_result);
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_hand_written_model_number, "c"],
                [Blockly.Msg.ai_models_hand_written_model_confidence, "confidence"],
                [Blockly.Msg.ai_models_object_model_x, "X"],
                [Blockly.Msg.ai_models_object_model_y, "Y"],
                [Blockly.Msg.ai_models_object_model_w, "W"],
                [Blockly.Msg.ai_models_object_model_h, "H"],
                [Blockly.Msg.ai_models_face_model_ws, "2"],
                [Blockly.Msg.ai_models_face_model_hs, "3"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"]
            ]), "value");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_hand_written_model_result);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_digital_result = function (block) {
    var value = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var type = block.getFieldValue('value');
    // var _code = `"{}:{:.2f}%".format(number_recognition.labels[probs[${value}][0]], probs[${value}][1][probs[${value}][0]]*100)`;
    if (type == "confidence") {
        _code = `${value}[4][1][${value}[4][0]]*100`;
    }
    else if (type == "X") {
        _code = `${value}[0]`;
    }
    else if (type == "Y") {
        _code = `${value}[1]`;
    }
    else if (type == "W") {
        _code = `int(${value}[0] + ${value}[2])`;
    }
    else if (type == "H") {
        _code = `int(${value}[1] + ${value}[3])`;
    }
    else if (type == "c") {
        _code = `number_recognition.labels[${value}[4][0]]`;
    } else if (type == "CX") {
        _code = `int((${value}[0] +${value}[0] + ${value}[2])/2)`;
    } else if (type == "CY") {
        _code = `int((${value}[1] + ${value}[1] + ${value}[3])/2)`;
    }
    else {
        _code = `${value}[${type}]`;
    }
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_digital'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_digital);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_digital);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_digital = function (block) {
    var _code = "boxes";
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_digital_attribute'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_digital_attribute);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_digital_attribute);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_digital_attribute'] = function (block) {
    var code = 'len(boxes)';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_Guesswork_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(Blockly.Msg.ai_models_init_guesswork_model);
        // this.appendDummyInput().appendField(Blockly.Msg.ai_model_allinit_language).appendField(new Blockly.FieldDropdown([
        //     [Blockly.Msg.ai_speech_recognition_setup_set_english, "English"],
        //     [Blockly.Msg.ai_speech_recognition_setup_set_simplified_chinese, "Simplified Chinese"],
        //     [Blockly.Msg.ai_speech_recognition_setup_set_traditional_chinese, "Traditional Chinese"]
        // ]), "interface")
        // this.appendValueInput("class_input")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_models_customized_init_setup_name);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Common Object Recognition': Blockly.Msg.ai_model_allinit_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_object_model_title)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_Guesswork_init = function (block) {
    var language = localStorage.getItem("handPyLanguage");
    console.log(language)
    let a = ''
    if (language == "en") {
        a = '["Scissors", "Stone" ,"Paper"]'
    } else if (language == "zh-hans") {
        a = '["剪刀", "石头" ,"布"]'
    } else {
        a = '["剪刀", "石頭" ,"布"]'
    }
    console.log(language)
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`
    Blockly.Python.definitions_['v831_import_from_maixnn_decoder'] = `from maix.nn import decoder`
    Blockly.Python.definitions_.import_Guesswork_init = `class Mora:
    mud_path = "/root/preset/model/mora_int8.mud"
    labels = ${a}
    anchors = [3.23, 3.25, 1.47, 1.55, 5.09, 5.33, 4.03, 4.28, 2.12, 2.56]

    def __init__(self) -> None:
        from maix import nn
        self.model = nn.load(self.mud_path)
        from maix.nn import decoder
        self.decoder = decoder.Yolo2(len(self.labels) , self.anchors , net_in_size = (224, 224) ,net_out_size = (7,7))

    def __del__(self):
        del self.model
        del self.decoder

    def cal_fps(self ,start , end):
        one_second = 1
        one_flash = end - start
        fps = one_second / one_flash
        return  fps

    def draw_rectangle_with_title(self ,img, box, disp_str , fps ):
        img.draw_rectangle(box[0], box[1], box[0] + box[2], box[1] + box[3],color=(255, 0, 0), thickness=2)
        img.draw_string(box[0], box[1] ,disp_str, scale=1,color=(222, 0, 3), thickness=2)
        #img.draw_string(0, 0 ,"FPS :"+str(fps), scale=2 ,color=(0, 0, 255), thickness=2)

    def process(self,input):
        t =  time()
        out = self.model.forward(input, quantize=1, layout = "hwc")
        boxes, probs = self.decoder.run(out, nms=0.5, threshold=0.3, img_size=(224,224))
        for i, box in enumerate(boxes):
            class_id = probs[i][0]
            prob = probs[i][1][class_id]
            disp_str = "{}:{:.2f}%".format(self.labels[class_id], prob*100)
            fps = self.cal_fps(t, time())
            self.draw_rectangle_with_title(input, box, disp_str, fps)

Mora = Mora()          
`;
    var _code = "";
    return _code;
}


Blockly.Blocks['ai_model_Guesswork_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(Blockly.Msg.ai_models_init_guesswork_model);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_guessworkrecognition"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Common Object Recognition': Blockly.Msg.ai_model_allload_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_object_model)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_Guesswork_load = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // var camera_variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('camera_varitem'), Blockly.Variables.NAME_TYPE);
    // Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    var degee = block.getFieldValue('DEGREE');
    var _code = `out = Mora.model.forward(${variable_name}, quantize=1, layout = "hwc")
boxes, probs = Mora.decoder.run(out, nms=0.5, threshold=0.3, img_size=(224,224))
if len(boxes):
    for boxesi, box in enumerate(boxes):
        boxes[boxesi].append(probs[boxesi])
`
    return _code;
}

Blockly.Blocks['ai_model_Guesswork_look'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_guesswork_model_if);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_guesswork_model_if);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_Guesswork_look = function (block) {
    var _code = "len(boxes)";
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_Guesswork_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/object_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_guesswork_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_object_model_name, "Object"],
                [Blockly.Msg.ai_models_object_model_x, "X"],
                [Blockly.Msg.ai_models_object_model_y, "Y"],
                [Blockly.Msg.ai_models_object_model_w, "W"],
                [Blockly.Msg.ai_models_object_model_h, "H"],
                // [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                // [Blockly.Msg.ai_models_object_model_y_center, "CY"],
                // [Blockly.Msg.ai_models_object_model_count, "Number"],
                // [Blockly.Msg.ai_models_object_model_index, "Serial"],
                [Blockly.Msg.ai_models_object_model_confidence, "Confidence"],
                [Blockly.Msg.ai_models_face_model_ws, "2"],
                [Blockly.Msg.ai_models_face_model_hs, "3"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"]
            ]), "TYPE");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(Blockly.Msg.ai_models_guesswork_model_get);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_Guesswork_get = function (block) {
    var type = block.getFieldValue('TYPE');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = "";

    if (type == "Object") {
        _code = `Mora.labels[${variable_name}[4][0]]`
        // _code = `"{}:{:.2f}%".format(labels[probs[${variable_name}][0]], probs[${variable_name}][1][probs[${variable_name}][0]]*100)`
    } else if (type == "X") {
        _code = '' + variable_name + '[0]';
    } else if (type == "Y") {
        _code = '' + variable_name + '[1]';
    } else if (type == "W") {
        _code = 'int(' + variable_name + '[0]+' + '' + variable_name + '[2])';
    } else if (type == "H") {
        _code = 'int(' + variable_name + '[1]+' + '' + variable_name + '[3])';
    } else if (type == "Confidence") {
        _code = `${variable_name}[4][1][${variable_name}[4][0]]*100`;
    } else if (type == "CX") {
        _code = `int((${variable_name}[0] +${variable_name}[0] + ${variable_name}[2])/2)`;
    } else if (type == "CY") {
        _code = `int((${variable_name}[1] + ${variable_name}[1] + ${variable_name}[3])/2)`;
    }
    else {
        _code = `${variable_name}[${type}]`;
    }

    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_Guesswork_look_attribute'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_guesswork_look_attribute);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_guesswork_look_attribute);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_Guesswork_look_attribute'] = function (block) {
    var code = 'boxes';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_card_recognition_init'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(new Blockly.FieldImage("blockly/media/header_customized_model.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(Blockly.Msg.ai_models_init_card_model);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_customized_init_setup_definition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_card_recognition_init'] = function (block) {
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`
    Blockly.Python.definitions_['v831_import_from_maixnn_decoder'] = `from maix.nn import decoder`
    Blockly.Python.addVariable('CARDDATABOEX', `CARDDATABOEX = ""`, true)
    Blockly.Python.definitions_['v831_card_recognition_init'] = `class LPR:
    loc_model_path = "/root/preset/model/loc.mud"
    reg_model_path = "/root/preset/model/reg.mud"
    chars = ["皖", "沪", "津", "渝", "冀", "晋", "蒙", "辽", "吉", "黑",
             "苏", "浙", "京", "闽", "赣", "鲁", "豫", "鄂", "湘", "粤",
             "桂", "琼", "川", "贵", "云", "藏", "陕", "甘", "青", "宁",
             "新", "警", "学", "A", "B",  "C",  "D",  "E",  "F",  "G",
             "H",   "J",  "K",  "L", "M", "N",  "P",  "Q",  "R", "S",
                    "T",  "U",  "V", "W", "X", "Y", "Z", "0", "1", "2", "3",
                    "4", "5", "6", "7", "8", "9", "-"]

    variances = [0.1, 0.2]
    steps = [8, 16, 32]
    min_sizes = [12, 24, 48, 96, 192, 320]
    card_input_img = None

    def __init__(self) -> None:
        from maix import nn
        self.loc_model = nn.load(self.loc_model_path, opt=None)
        self.reg_model = nn.load(self.reg_model_path, opt=None)

        from maix.nn import decoder
        self.loc_decoder = decoder.license_plate_location(
            [224, 224], self.steps, self.min_sizes, self.variances)
        self.reg_decoder = decoder.CTC((1, 68, 18))

    def __del__(self):
        del self.loc_model
        del self.loc_decoder

    def cal_fps(self, start, end):
        one_second = 1
        one_flash = end - start
        fps = one_second / one_flash
        return fps

    def draw_fps(self, img, fps):
        img.draw_string(0, 0, "FPS :"+str(fps), scale=1,
                        color=(255, 0, 255), thickness=1)

    def draw_string(self, img, x, y, string, color):
        img.draw_string(x, y, string, color=color)

    def draw_paste(self, src, dst):
        src.paste(dst, 0, 0)

    def draw_rectangle(self, img, box):
        img.draw_rectangle(box[0], box[1], box[2], box[3],
                           color=(230, 230, 250), thickness=2)

    def draw_point(self, img, landmark):
        for i in range(4):
            x = landmark[2 * i]
            y = landmark[2 * i + 1]
            img.draw_rectangle(x-2, y-2, x+2, y+2,
                               color=(193, 255, 193), thickness=-1)

    def process(self, input):
        global CARDDATABOEX
        self.card_input_img = input
        # retinaface decoder only support chw layout
        loc_out = self.loc_model.forward(input, quantize=1, layout="chw")
        boxes, landmarks = self.loc_decoder.run(loc_out, nms=0.2, score_thresh=0.7, outputs_shape=[
                                                [1, 4, 2058], [1, 2, 2058], [1, 8, 2058]])
        if len(boxes):
            # print(boxes,landmarks)
            for boxesi, box in enumerate(boxes):
                boxes[boxesi].append(landmarks[boxesi])
        CARDDATABOEX = boxes
    def get_card_data(self, landmark):
        # landmark = i[4][:6]
        reg_in = self.card_input_img.crop_affine(landmark, 94, 24)
        reg_out = self.reg_model.forward(reg_in,  quantize=1, layout="chw")

        LP_number = self.reg_decoder.run(reg_out)
        string_LP = ""
        for id in LP_number:
            string_LP += self.chars[id]
        return string_LP

LPRCARD  = LPR()
`;
    var code = '';
    return code;
};

//  车牌识别
Blockly.Blocks['ai_model_card_recognition_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(Blockly.Msg.ai_models_init_card_model);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_setup_source)
            .appendField(new Blockly.FieldVariable("img_card_recognition"), "varitem");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_customized_init_setup_definition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_card_recognition_load'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Python into code variable.
    var code = `LPRCARD.process(${variable_name})
`;
    return code;
};

Blockly.Blocks['ai_model_card_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/object_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_card_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_init_card_result, "Object"],
                [Blockly.Msg.ai_models_object_model_x, "X"],
                [Blockly.Msg.ai_models_object_model_y, "Y"],
                [Blockly.Msg.ai_models_object_model_w, "W"],
                [Blockly.Msg.ai_models_object_model_h, "H"],
                // [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                // [Blockly.Msg.ai_models_object_model_y_center, "CY"],
                // [Blockly.Msg.ai_models_object_model_count, "Number"],
                // [Blockly.Msg.ai_models_object_model_index, "Serial"],
                // [Blockly.Msg.ai_models_object_model_confidence, "Confidence"],
                [Blockly.Msg.ai_models_face_model_ws, "2"],
                [Blockly.Msg.ai_models_face_model_hs, "3"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"]
            ]), "TYPE");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(Blockly.Msg.ai_models_guesswork_model_get);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_card_get = function (block) {
    var type = block.getFieldValue('TYPE');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = "";

    if (type == "Object") {
        _code = `LPRCARD.get_card_data(${variable_name}[4][:6])`
        // _code = `"{}:{:.2f}%".format(labels[probs[${variable_name}][0]], probs[${variable_name}][1][probs[${variable_name}][0]]*100)`
    } else if (type == "X") {
        _code = '' + variable_name + '[0]';
    } else if (type == "Y") {
        _code = '' + variable_name + '[1]';
    } else if (type == "W") {
        _code = 'int(' + variable_name + '[2])';
    } else if (type == "H") {
        _code = 'int(' + variable_name + '[3])';
    } else if (type == "Confidence") {
        _code = `${variable_name}[4][1][${variable_name}[4][0]]*100`;
    } else if (type == "CX") {
        _code = `int((${variable_name}[0] + ${variable_name}[2])/2)`;
    } else if (type == "CY") {
        _code = `int((${variable_name}[1] + ${variable_name}[3])/2)`;
    }
    else {
        _code = `${variable_name}[${type}]-${variable_name}[${type - 2}]`;
    }
    // }
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

// 
//  车牌识别
Blockly.Blocks['ai_model_card_xy'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_card_if_true);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_card_if_true);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_card_xy'] = function (block) {
    var code = 'len(CARDDATABOEX)';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['ai_model_card_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_card_attribute);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_card_attribute);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_card_result'] = function (block) {
    var code = 'CARDDATABOEX';
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// 人体检测
Blockly.Blocks['ai_model_gesture_recognition_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(Blockly.Msg.ai_models_init_humane_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_init_title);
        this.setHelpUrl('');
    }
}

Blockly.Python['ai_model_gesture_recognition_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`
    Blockly.Python.definitions_.import_hunman_init = `class humanPerson:
    mud_path = "/root/preset/model/person_int8.mud"
    labels = ["person"]
    anchors = [4.72, 6.26, 1.39, 3.53, 0.78, 1.9, 0.35, 0.95, 2.49, 4.87]

    def __init__(self) -> None:
        self.model = nn.load(self.mud_path)
        from maix.nn import decoder
        self.decoder = decoder.Yolo2(len(self.labels) , self.anchors , net_in_size = (224, 224) ,net_out_size = (7,7))

    def __del__(self):
        del self.model
        del self.decoder

    def cal_fps(self ,start , end):
        one_second = 1
        one_flash = end - start
        fps = one_second / one_flash
        return  fps

    def draw_rectangle_with_title(self ,img, box, disp_str , fps ):
        img.draw_rectangle(box[0], box[1], box[0] + box[2], box[1] + box[3],color=(255, 0, 0), thickness=2)
        img.draw_string(box[0], box[1]+ box[3] ,disp_str, scale=1,color=(0, 0, 255), thickness=2)
        #img.draw_string(0, 0 ,'FPS :'+str(fps), scale=2 ,color=(0, 0, 255), thickness=2)

humanPerson = humanPerson()
`
    var code = '';
    return code;
};

Blockly.Blocks['ai_model_gesture_recognition_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(Blockly.Msg.ai_models_init_humane_model);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_gesture_facedetection"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_load_title);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_gesture_recognition_load = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = `out = humanPerson.model.forward(${variable_name}, quantize=1, layout = "hwc")
boxes, probs = humanPerson.decoder.run(out, nms=0.5, threshold=0.3, img_size=(224,224))
if len(boxes):
    for boxesi, box in enumerate(boxes):
        boxes[boxesi].append(probs[boxesi])
`
    return _code;
}

Blockly.Blocks['ai_model_gesture'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_human_model_if);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_human_model_if);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_gesture = function (block) {
    var _code = "len(boxes)";
    return [_code, Blockly.Python.ORDER_ATOMIC];
}


Blockly.Blocks['ai_model_gesture_xy'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/face_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_human_model_get)
            .appendField(new Blockly.FieldDropdown([
                // [Blockly.Msg.ai_models_object_model_name, "Object"],
                [Blockly.Msg.ai_models_face_model_x, "X"],
                [Blockly.Msg.ai_models_face_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_w, "W"],
                [Blockly.Msg.ai_models_face_model_h, "H"],
                // [Blockly.Msg.ai_models_face_model_x_center, "CX"],
                // [Blockly.Msg.ai_models_face_model_y_center, "CY"],
                // [Blockly.Msg.ai_models_face_model_count, "Number"],
                // [Blockly.Msg.ai_models_face_model_index, "Serial"],
                [Blockly.Msg.ai_models_face_model_confidence, "Confidence"],
                [Blockly.Msg.ai_models_face_model_ws, "2"],
                [Blockly.Msg.ai_models_face_model_hs, "3"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"]
            ]), "TYPE");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('TYPE');
            var TOOLTIPS = {
                'X': Blockly.Msg.ai_model_human_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x),
                'Y': Blockly.Msg.ai_model_human_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y),
                'W': Blockly.Msg.ai_model_human_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_w),
                'H': Blockly.Msg.ai_model_human_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_h),
                // 'CX': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x_center),
                // 'CY': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y_center),
                // 'Number': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_count),
                // 'Serial': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_index),
                'Confidence': Blockly.Msg.ai_model_human_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_confidence)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_gesture_xy = function (block) {
    var type = block.getFieldValue('TYPE');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = "";
    if (type == "X") {
        _code = '' + variable_name + '[0]';
    } else if (type == "Y") {
        _code = '' + variable_name + '[1]';
    } else if (type == "W") {
        _code = 'int(' + variable_name + '[0]+' + '' + variable_name + '[2])';
    } else if (type == "H") {
        _code = 'int(' + variable_name + '[1]+' + '' + variable_name + '[3])';
    } else if (type == "Confidence") {
        _code = `${variable_name}[4][1][${variable_name}[4][0]]*100`;
    } else if (type == "Object") {
        _code = `Person`;
    } else if (type == "CX") {
        _code = `int((${variable_name}[0] +${variable_name}[0] + ${variable_name}[2])/2)`;
    } else if (type == "CY") {
        _code = `int((${variable_name}[1] + ${variable_name}[1] + ${variable_name}[3])/2)`;
    }
    else {
        _code = `${variable_name}[${type}]`;
    }
    return [_code, Blockly.Python.ORDER_ATOMIC];
};
Blockly.Blocks['ai_model_gesture_attribute'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_human_attribute);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_human_attribute);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_gesture_attribute'] = function (block) {
    var code = 'boxes';
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['ai_model_face_recognition_init_new'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.ai_models_init_title)
            .appendField('人脸识别模型');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_init_title + Blockly.Msg.ai_models_init_face_model);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_face_recognition_init_new = function (block) {
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`
    Blockly.Python.definitions_['v831_import_FaceRecognize'] = `from maix.nn.app.face import FaceRecognize`
    Blockly.Python.definitions_.import_face_recognition_init_new = `
class Face_recognize:
    score_threshold = 70                            #识别分数阈值
    input_size = (224, 224, 3)                      #输入图片尺寸
    input_size_fe = (128, 128, 3)                   #输入人脸数据
    feature_len = 256                               #人脸数据宽度
    steps = [8, 16, 32]                             #
    channel_num = 0                                 #通道数量
    users = []                                      #初始化用户列表
    threshold = 0.5                                         #人脸阈值
    nms = 0.3                                               
    max_face_num = 3                                        #输出的画面中的人脸的最大个数
    names = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]  #人脸标签定义
    model = {                                                                                                                                   
        "param": "/root/preset/model/model_int8.param",
        "bin": "/root/preset/model/model_int8.bin"
    }
    model_fe = {
        "param": "/root/preset/model/fe_res18_117.param",
        "bin": "/root/preset/model/fe_res18_117.bin"
    }
    def __init__(self):
        
        for i in range(len(self.steps)):
            self.channel_num += self.input_size[1] / self.steps[i] * (self.input_size[0] / self.steps[i]) * 2
        self.channel_num = int(self.channel_num)     #统计通道数量
        self.options = {                             #准备人脸输出参数
            "model_type":  "awnn",
            "inputs": {
                "input0": self.input_size
            },
            "outputs": {
                "output0": (1, 4, self.channel_num) ,
                "431": (1, 2, self.channel_num) ,
                "output2": (1, 10, self.channel_num) 
            },
            "mean": [127.5, 127.5, 127.5],
            "norm": [0.0078125, 0.0078125, 0.0078125],
        }
        self.options_fe = {                             #准备特征提取参数
            "model_type":  "awnn",
            "inputs": {
                "inputs_blob": self.input_size_fe
            },
            "outputs": {
                "FC_blob": (1, 1, self.feature_len)
            },
            "mean": [127.5, 127.5, 127.5],
            "norm": [0.0078125, 0.0078125, 0.0078125],
        }
        print("-- load model:", self.model)
        self.m = nn.load(self.model, opt=self.options)
        print("-- load ok")
        print("-- load model:", self.model_fe)
        self.m_fe = nn.load(self.model_fe, opt=self.options_fe)
        print("-- load ok")
        self.face_recognizer = FaceRecognize(self.m, self.m_fe, self.feature_len, self.input_size, self.threshold, self.nms, self.max_face_num)
    def map_face(self,box,points):                           #将224*224空间的位置转换到240*240或320*240空间内
        from maix import display # print(box,points)
        if display.width() == display.height():
            def tran(x):
                return int(x/224*display.width())
            box = list(map(tran, box))
            def tran_p(p):
                return list(map(tran, p))
            points = list(map(tran_p, points))
        else:
            # 168x224(320x240) > 224x224(240x240) > 320x240
            s = (224*display.height()/display.width()) # 168x224
            w, h, c = display.width()/224, display.height()/224, 224/s
            t, d = c*h, (224 - s) // 2 # d = 224 - s // 2 == 28
            box[0], box[1], box[2], box[3] = int(box[0]*w), int((box[1]-28)*t), int(box[2]*w), int((box[3])*t)
            def tran_p(p):
                return [int(p[0]*w), int((p[1]-d)*t)] # 224 - 168 / 2 = 28 so 168 / (old_h - 28) = 240 / new_h
            points = list(map(tran_p, points))
        # print(box,points)
        return box,points
    def recognize(self, feature):                                                                   #进行人脸匹配
        def _compare(user):                                                         #定义映射函数
            return self.face_recognizer.compare(user, feature)                      #推测匹配分数 score相关分数
        face_score_l = list(map(_compare,self.users))                               #映射特征数据在记录中的比对分数
        return max(enumerate(face_score_l), key=lambda x: x[-1])                #提取出人脸分数最大值和最大值所在的位置
    def __del__(self):
        del self.face_recognizer
        del self.m_fe
        del self.m

face_recognizer = Face_recognize()
`;
    // var degee = block.getFieldValue('DEGREE');
    var _code = "";
    // Blockly.Python.addVariable('task_facerecognition', 'task_facerecognition = None', true);
    return [_code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['ai_model_face_recognition_load_new'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(Blockly.Msg.ai_models_init_face_model);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_facerecognition"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Human Face Recognition': Blockly.Msg.ai_model_allload_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_face_model)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_face_recognition_load_new = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // var camera_variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('camera_varitem'), Blockly.Variables.NAME_TYPE);
    // Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    // var degee = block.getFieldValue('DEGREE');
    var _code = `facesRecognitionLoadNew = face_recognizer.face_recognizer.get_faces(AI_img.tobytes(),False)           #提取人脸特征信息
`;
    // Blockly.Python.addVariable('code_facerecognition', '', true);
    // _code += "code_facerecognition = kpu.run_yolo2(task_facerecognition, " + variable_name + ")\n";
    // _code += variable_name + ".ai_to_pix()\n";
    return _code;
}

Blockly.Blocks['ai_model_face_new'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_face_model_if);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_face_new = function (block) {
    var _code = "facesRecognitionLoadNew";
    return [_code, Blockly.Python.ORDER_ATOMIC];
}



Blockly.Blocks['ai_model_xy_new'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/face_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_face_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_face_model_x, "X"],
                [Blockly.Msg.ai_models_face_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_w, "W"],
                [Blockly.Msg.ai_models_face_model_h, "H"],
                [Blockly.Msg.ai_models_face_model_x_center, "CX"],
                [Blockly.Msg.ai_models_face_model_y_center, "CY"],
                [Blockly.Msg.ai_models_face_model_count, "Number"],
                [Blockly.Msg.ai_models_face_model_index, "Serial"],
                [Blockly.Msg.ai_models_face_model_confidence, "Confidence"]
            ]), "TYPE");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('TYPE');
            var TOOLTIPS = {
                'X': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x),
                'Y': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y),
                'W': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_w),
                'H': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_h),
                'CX': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x_center),
                'CY': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y_center),
                'Number': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_count),
                'Serial': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_index),
                'Confidence': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_confidence)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_xy_new = function (block) {
    var type = block.getFieldValue('TYPE');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = "";
    if (type == "X") {
        _code = variable_name + "[0]";
    } else if (type == "Y") {
        _code = variable_name + "[1]";
    } else if (type == "W") {
        _code = variable_name + "[0] + " + variable_name + "[2]";
    } else if (type == "H") {
        _code = variable_name + "[1] + " + variable_name + "[3]";
    }
    // else if (type == "Number") {
    //     _code = variable_name + ".objnum()";
    // } else if (type == "Serial") {
    //     _code = variable_name + ".index()";
    // } else if (type == "Confidence") {
    //     _code = variable_name + ".value()";
    // } else if (type == "CX") {
    //     _code = variable_name + ".x()+(" + variable_name + ".w()/2)";
    // } else if (type == "CY") {
    //     _code = variable_name + ".y()+(" + variable_name + ".h()/2)";
    // }
    return [_code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['ai_model_face_attribute_new'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_attribute);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_attribute_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_attribute_new'] = function (block) {
    var code = 'facesRecognitionLoadNew';
    return [code, Blockly.Python.ORDER_NONE];
};

// 人脸识别
Blockly.Blocks['face_recognition_data_save_path'] = {
    init: function () {
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_face_gather_1);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_gather_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['face_recognition_data_save_path'] = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_json'] = `import json`
    Blockly.Python.addVariable('ai_model_face_gather', `
def _CREATE_TEXT_FILE_WITH_CONTENT(_path, _data, _sep):
    f = open(_path, "a")
    f.write(_data + _sep)
    f.close()
    `, true);
    var code = `try:
    os.remove(${value_class_input})
except:
    pass
try:
    _CREATE_TEXT_FILE_WITH_CONTENT(${value_class_input}, json.dumps(FACERECGNIZER.features), "\\r\\n")

except:
    pass
`;
    return code;
};


Blockly.Blocks['face_recognition_data_results'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("img_face_Recognizer"), "varitem")
            .appendField(Blockly.Msg.WIFIEASYMODE_COCOCLOUD_TYPE)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.v831_model_face_name, "0"],
                [Blockly.Msg.ai_models_face_model_confidence, "1"],
            ]), "TYPE");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.v831_face_recognition_result_title);
        this.setHelpUrl("");
    }
};

Blockly.Python['face_recognition_data_results'] = function (block) {
    var type = block.getFieldValue('TYPE');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);

    var code = `FACERECGNIZER.recognize(${variable_name})[${type}]
`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};
// 自学习
Blockly.Blocks['ai_model_customized_init_setup_definition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/header_customized_model.png", 50, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_customized_init_setup_definition);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_customized_init_setup_definition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_customized_init_setup_definition'] = function (block) {
    // TODO: Assemble Python into code variable.
    Blockly.Python.includes_.import_amxisd = '' +
        'print("Clearing Cached Variables...", end="")\n' +
        'for name in dir(): \n' +
        '    if not name.startswith(\'_\'): \n' +
        '        del globals()[name]\n' +
        'print(" Done")\n' +
        'import KPU as kpu\n' +
        'kpu.memtest()\n' +
        'from Maix import utils\n' +
        'import gc\n' +
        'gc.enable()\n' +
        'utils.gc_heap_size()\n' +
        '\n' +
        '################# Done Init #################\n' +
        '';

    var code = '';
    return code;
};

// 初始化serialcomm_read_setup_title_text_1
Blockly.Blocks['ai_model_index_custom_initialization_init_1'] = {
    init: function () {
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.serialcomm_read_setup_title_text_1)
        // .appendField("DEGREE");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.serialcomm_read_setup_title_text_1);
        this.setHelpUrl('');
    }
};

Blockly.Python.ai_model_index_custom_initialization_init_1 = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_.import_KPU = "import KPU as kpu";
    var _code = value_class_input;

    return _code;
}

// 自定义人脸识别
Blockly.Blocks['ai_model_face_model'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_setup);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_setup);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_face_model = function (block) {
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_gc'] = `import gc`
    Blockly.Python.includes_.import_amxisd = '' +
        'for name in dir(): \n' +
        '    if not name.startswith(\'_\'): \n' +
        '        del globals()[name]\n' +
        'gc.enable()\n' +
        '\n' +
        'try:\n' +
        '    from cocorobo import firmware_info\n' +
        'except BaseException as e:\n' +
        '    print(str(e))\n' +
        '    pass\n' +
        '\n' +
        'if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
        '    from Maix import utils\n' +
        '    utils.gc_heap_size(0xAF000)\n' +
        'else:\n' +
        '    import utime\n' +
        '    clock = None\n' +
        '    ACCURACY = 85\n' +
        '\n' +
        'task_fd = None\n' +
        'task_ld = None\n' +
        'task_fe = None\n' +
        '\n' +
        '';

    var code = `
from fpioa_manager import *
from Maix import FPIOA, GPIO
    
_gp_side_buttons = [9, 10, 11]
    
FPIOA().set_function(_gp_side_buttons[0],FPIOA.GPIO0)
FPIOA().set_function(_gp_side_buttons[1],FPIOA.GPIO1)
FPIOA().set_function(_gp_side_buttons[2],FPIOA.GPIO2)
    
_gp_side_a = GPIO(GPIO.GPIO0,GPIO.IN,GPIO.PULL_UP)
_gp_side_b = GPIO(GPIO.GPIO1,GPIO.IN,GPIO.PULL_UP)
_gp_side_c = GPIO(GPIO.GPIO2,GPIO.IN,GPIO.PULL_UP)
    
side_button_state = False

def run_face_compare(record_ftrs, feature):
    scores = []
    for j in range(len(record_ftrs)):
        score = kpu.face_compare(record_ftrs[j], feature)
        scores.append(score)
    max_score = 0
    # if int(str(firmware_info.ai()).split("-")[0]) < 2021:
    #    index = -1
    # else:
    #    index = 0
    index = -1
    for k in range(len(scores)):
        if max_score < scores[k]:
            max_score = scores[k]
            index = k

    return [scores, max_score, index]

    # print(scores)

    `;
    // var code = '';

    return [code, Blockly.Python.ORDER_ATOMIC];
}

// 设置人脸识别名称
Blockly.Blocks['ai_model_face_setup'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_model_face_setup);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_face_name);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_name.replace(":", ""));
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_setup'] = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    var code = `
img_lcd = image.Image()
# img_face = image.Image(size=(128, 128))
collectNum = 0
record_ftrs = []
result = []
res_index = -1
# a = img_face.pix_to_ai() 
names = ` + value_class_input + `
        `;
    return code;
};

Blockly.Blocks['ai_face_detection_model'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_face_detection_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_face_detection_model_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_face_detection_model'] = function (block) {

    var code = '\n' +
        'if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
        '    task_fd = kpu.load("/sd/preset/models/face_reocgnition/FD.emodel") # 人脸检测模型\n' +
        'else:\n' +
        '    task_fd = kpu.load("/sd/preset/models/face/v2/FaceDetection.emodel") # 0x300000)\n' +
        'anchor = (1.889, 2.5245, 2.9465, 3.94056, 3.99987, 5.3658, 5.155437, 6.92275, 6.718375, 9.01025)\n' +
        'a = kpu.init_yolo2(task_fd, 0.5, 0.3, 5, anchor)\n' +
        '\n' +
        '';
    return code;
};

Blockly.Blocks['ai_face_point_detection_model'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_face_point_detection_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_face_point_detection_model_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_face_point_detection_model'] = function (block) {

    Blockly.Python.definitions_.import_ai_face_point_detection_model = `
def run_five_points_inference(canvas, canvas_face, detected_face_rect):
    a = canvas.draw_rectangle(detected_face_rect)
    # Create face image from detection
    face_cut = canvas.cut(detected_face_rect[0], detected_face_rect[1], detected_face_rect[2], detected_face_rect[3])
    # Convert created face image to a dimension of 128x128
    face_cut_128 = face_cut.resize(128, 128)
    # 将正脸图像转为kpu格式, 便于后面的关键点模型的使用
    a = face_cut_128.pix_to_ai()

    # Get landmark for 5 points of the detected face
    # 运行人脸5点关键点检测模型, 获取当前识别人脸的关键点数据
    fmap = kpu.forward(task_ld, face_cut_128)
    # print("fmap", fmap)
    # 获取关键点预测结果
    plist = fmap[:]
    # print("plist", plist)

    # Get position of left eye, then draw it on the canvas.
    le = (i.x()+int(plist[0]*i.w() - 10), i.y()+int(plist[1]*i.h()))
    a = canvas.draw_circle(le[0], le[1], 4)
    # Get position of Right eye, then draw it on the canvas.
    re = (i.x()+int(plist[2]*i.w()), i.y()+int(plist[3]*i.h()))
    a = canvas.draw_circle(re[0], re[1], 4)
    # Get position of Nose, then draw it on the canvas.
    nose = (i.x()+int(plist[4]*i.w()), i.y()+int(plist[5]*i.h()))
    a = canvas.draw_circle(nose[0], nose[1], 4)
    # Get position of Left cheek, then draw it on the canvas.
    lm = (i.x()+int(plist[6]*i.w()), i.y()+int(plist[7]*i.h()))
    a = canvas.draw_circle(lm[0], lm[1], 4)
    # Get position of Right cheek, then draw it on the canvas.
    rm = (i.x()+int(plist[8]*i.w()), i.y()+int(plist[9]*i.h()))
    a = canvas.draw_circle(rm[0], rm[1], 4)

    # Align face to standard position
    src_point = [le, re, nose, lm, rm]
    '''
    get_affine_transform() 函数, 根据获得的5点坐标与标准正脸坐标获取仿射变换矩阵

    - 计算3个二维点对之间的仿射变换矩阵H（2行x3列），自由度为6。
    - 仿射变换的原理就是根据源图像中一个三角形的顶点坐标和应用仿射变换之后的
    - 目标图像中一个三角形的顶点坐标计算出一个变换矩阵，然后将这个矩阵应用到整个源图像。

    src_point 为输入源图像中的三角形顶点坐标
    dst_point 为输出目标图像中的三角形顶点坐标

    Ref: https://zhuanlan.zhihu.com/p/142260846
    '''
    T = image.get_affine_transform(src_point, dst_point)

    '''
    warp_affine_ai() 函数, 对原始图片人脸图片进行仿射变换，变换为正脸图像
    '''
    a = image.warp_affine_ai(canvas, canvas_face, T)

    '''
    将正脸图像转为kpu格式
    '''
    a = canvas_face.ai_to_pix()

    # Recycle face_cut_128 in order to reduce memory usage
    del(face_cut_128)
    `;

    var code = '\n' +
        'if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
        '    task_ld = kpu.load("/sd/preset/models/face_reocgnition/KP_chwise.emodel")    # 人脸5点关键点检测模型\n' +
        'else:\n' +
        '    task_ld = kpu.load("/sd/preset/models/face/v2/FaceLandmarkDetection.emodel")# 0x400000)\n' +
        'dst_point = [(44, 59), (84, 59), (64, 82), (47, 105),(81, 105)]\n' +
        '\n' +
        '';
    return code;
};

Blockly.Blocks['ai_face_Vitter_eigenvalue_model'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_face_Vitter_eigenvalue_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_face_Vitter_eigenvalue_model_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_face_Vitter_eigenvalue_model'] = function (block) {

    Blockly.Python.definitions_.import_ai_face_Vitter_eigenvalue_model = `
def run_fmap_calculation(canvas_face):
    global fmap
    # Calculate face feature vector from 'img_face', 计算正脸图片的196维特征值
    fmap = kpu.forward(task_fe, canvas_face)
    # 获取计算结果
    feature = kpu.face_encode(fmap[:])

    return feature
    `;

    var code = '\n' +
        'if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
        '    task_fe = kpu.load("/sd/preset/models/face_reocgnition/face_recognition_v4_2020_09_07.emodel")  # 人脸196维特征值模型\n' +
        '    kpu.set_outputs(task_fe, 0,1,1, 512)\n' +
        'else:\n' +
        '    task_fe = kpu.load("/sd/preset/models/face/v2/FeatureExtraction.emodel")# 0x500000)\n' +
        '    clock = time.clock()\n' +
        '\n' +
        '';
    return code;
};

// 加载人脸检测模型，设置识别图像源
Blockly.Blocks['ai_model_face_start_recognition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_start_recognition + Blockly.Msg.ai_models_customized_init_setup_source)
            .appendField(new Blockly.FieldVariable("img"), "varitem");
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_models_customized_init_type_set)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.ai_models_customized_init_type_set_fast, "fast"],
        //         [Blockly.Msg.ai_models_customized_init_type_set_slow, "slow"]
        //     ]), "detect_type");
        // this.appendStatementInput("NAME")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_speech_recognition_any_result_text_do);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_start_recognition_TOOLTIP);
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_model_face_start_recognition'] = function (block) {
    // var statements_name = Blockly.Python.statementToCode(block, 'NAME');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    // var dropdown_detect_type = block.getFieldValue('detect_type');

    localStorage.setItem("ai_model_face_variable_name", variable_name);

    var code = '' +
        'if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
        '    index = -1\n' +
        'else:\n' +
        '    clock.tick()\n' +
        'a = img_face.pix_to_ai()\n' +
        'code = kpu.run_yolo2(task_fd, ' + variable_name + ')\n';

    return code;
}

Blockly.Blocks['ai_models_customized_init_type_set'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_model_face_start_recognition + Blockly.Msg.ai_models_customized_init_setup_source)
        //     .appendField(new Blockly.FieldVariable("img"), "varitem");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_type_set)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_customized_init_type_set_fast, "fast"],
                [Blockly.Msg.ai_models_customized_init_type_set_slow, "slow"]
            ]), "detect_type");
        // this.appendStatementInput("NAME")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_speech_recognition_any_result_text_do);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_customized_init_type_set.replace(":", ""));
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_models_customized_init_type_set'] = function (block) {
    // var statements_name = Blockly.Python.statementToCode(block, 'NAME');
    // var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var dropdown_detect_type = block.getFieldValue('detect_type');

    // localStorage.setItem("ai_model_face_variable_name", variable_name);

    if (dropdown_detect_type == "fast") {
        // var break_string = "        break\n";
        var break_string = "break_string = True\n";
    } else if (dropdown_detect_type == "slow") {
        // var break_string = "        # break\n";
        var break_string = "break_string = False\n";
    }
    var code = '' +
        break_string +
        '\n';

    return code;
}

Blockly.Blocks['ai_model_face_model_load_finish'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_model_load_finish);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_model_load_finish_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_model_load_finish'] = function (block) {
    var code = 'code is not None';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_face_model_list'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_model_list);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_model_list_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_model_list'] = function (block) {
    var code = 'code';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_face_detection_rectangle'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/face_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_face_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_face_model_rect, "rect"],
                [Blockly.Msg.ai_models_face_model_x, "X"],
                [Blockly.Msg.ai_models_face_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_w, "W"],
                [Blockly.Msg.ai_models_face_model_h, "H"],
                [Blockly.Msg.ai_models_face_model_x_center, "CX"],
                [Blockly.Msg.ai_models_face_model_y_center, "CY"],
                [Blockly.Msg.ai_models_face_model_count, "Number"],
                [Blockly.Msg.ai_models_face_model_index, "Serial"],
                [Blockly.Msg.ai_models_face_model_confidence, "Confidence"]
            ]), "TYPE");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('TYPE');
            var TOOLTIPS = {
                'rect': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_rect),
                'X': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x),
                'Y': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y),
                'W': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_w),
                'H': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_h),
                'CX': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x_center),
                'CY': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y_center),
                'Number': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_count),
                'Serial': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_index),
                'Confidence': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_confidence)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_face_detection_rectangle = function (block) {
    var type = block.getFieldValue('TYPE');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var _code = "";
    if (type == "rect") {
        _code = variable_name + ".rect()";
    } else if (type == "X") {
        _code = variable_name + ".x()";
    } else if (type == "Y") {
        _code = variable_name + ".y()";
    } else if (type == "W") {
        _code = variable_name + ".w()";
    } else if (type == "H") {
        _code = variable_name + ".h()";
    } else if (type == "Number") {
        _code = variable_name + ".objnum()";
    } else if (type == "Serial") {
        _code = variable_name + ".index()";
    } else if (type == "Confidence") {
        _code = variable_name + ".value()";
    } else if (type == "CX") {
        _code = variable_name + ".x()+(" + variable_name + ".w()/2)";
    } else if (type == "CY") {
        _code = variable_name + ".y()+(" + variable_name + ".h()/2)";
    }
    return [_code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['ai_model_face_load_point_detection_model'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_load_point_detection_model + Blockly.Msg.ai_models_customized_init_setup_source)
            .appendField(new Blockly.FieldVariable("img"), "varitem");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_load_point_detection_model_1)
            .appendField(new Blockly.FieldVariable("img_face"), "varitem1");
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_face_load_point_detection_model_2);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_load_point_detection_model_TOOLTIP);
        this.setHelpUrl("");
    }
}

Blockly.Python.ai_model_face_load_point_detection_model = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var variable_name_1 = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem1'), Blockly.Variables.NAME_TYPE);
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    var _code = "run_five_points_inference(" + variable_name + ", " + variable_name_1 + ", " + value_class_input + ")\n";
    return _code;
};

Blockly.Blocks['ai_model_face_gather'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_gather);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_face_gather_1);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_gather_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_gather'] = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC).replace('\"', '').replace('\"', '');
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.addVariable('ai_model_face_gather', `
def _CREATE_TEXT_FILE_WITH_CONTENT(_path, _data, _sep):
    f = open(_path, 'a')
    f.write(_data + _sep)
    f.close()

    `, true);

    var code = '' +
        '# start to gather faces\n' +
        'result = run_face_compare(record_ftrs, feature)\n' +
        'if int(str(firmware_info.ai()).split("-")[0]) < 2021 and collectNum < len(names):\n' +
        '    if(len(names) > result[2]):\n' +
        '        if result[1] <= 80:\n' +
        '            a = lcd_draw_string(' + localStorage.getItem("ai_model_face_variable_name") + ', i.x(), i.y(), ("X :%2.1f" % (result[1])), color=(102, 204, 153), scale=1, mono_space=False)\n' +
        '        if _gp_side_b.value() == True and side_button_state == False:\n' +
        '            record_ftrs.append(feature)\n' +
        '            collectNum = collectNum + 1\n' +
        '            side_button_state = True\n' +
        '        elif _gp_side_b.value() == False and side_button_state == True:\n' +
        '            side_button_state = False\n' +
        'elif int(str(firmware_info.ai()).split("-")[0]) >= 2021 and collectNum < len(names):\n' +
        '    if(len(names) > result[2]):\n' +
        '        if result[1] <= ACCURACY:\n' +
        '            a = lcd_draw_string(' + localStorage.getItem("ai_model_face_variable_name") + ', i.x(), i.y(), " " , color=(102, 204, 153), scale=1, mono_space=False)\n' +
        '        if _gp_side_b.value() == True and side_button_state == False:\n' +
        '            record_ftrs.append(feature)\n' +
        '            collectNum = collectNum + 1\n' +
        '            side_button_state = True\n' +
        '        elif _gp_side_b.value() == False and side_button_state == True:\n' +
        '            side_button_state = False\n' +
        'if collectNum >= len(names):\n' +
        '    try:\n' +
        '        os.remove("/sd/user/' + value_class_input + '.py")\n' +
        '    except:\n' +
        '        pass\n' +
        '    all = {}\n' +
        '    try:\n' +
        '        for j in range(len(names)):\n' +
        '            all[names[j]] = record_ftrs[j]\n' +
        '        _CREATE_TEXT_FILE_WITH_CONTENT("/sd/user/' + value_class_input + '.py", "all =" + str(all), "\\r\\n")\n' +
        '\n' +
        '    except:\n' +
        '        pass\n' +
        // 'if break_string == True:\n' +
        // '    break\n' +
        '\n';
    return code;
};

Blockly.Blocks['ai_model_face_gather_num_judge'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_gather_num_judge);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_gather_num_judge_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_gather_num_judge'] = function (block) {
    var code = 'collectNum >= len(names)';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_face_data_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_data_load);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_face_data_load_1);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_data_load_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_data_load'] = function (block) {

    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC).replace('\"', '').replace('\"', '');
    Blockly.Python.addVariable('ai_model_face_data_load', `
    
try:
    import user.${value_class_input} as recorded_face_features
except:
    pass

    `, true);

    var code = '' +
        '# load faces data\n' +
        'all = {}\n' +
        'record_ftrs = []\n' +
        'collectNum = len(names)\n' +
        'try:\n' +
        '    all = recorded_face_features.all\n' +
        '    for j in range(len(names)):\n' +
        '        record_ftrs.append(all[names[j]])\n' +
        '\n' +
        'except:\n' +
        '    pass\n' +
        '\n';
    // 'all = recorded_face_features.all\n' +


    return code;
};

Blockly.Blocks['ai_model_face_recognition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_recognition);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_recognition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_recognition'] = function (block) {
    var code = '' +
        'if collectNum >= len(names):\n' +
        '    result = run_face_compare(record_ftrs, feature)\n' +
        '    if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
        '        if(len(names) > result[2]):\n' +
        '            if result[1] > 80:\n' +
        '                a = lcd_draw_string(' + localStorage.getItem("ai_model_face_variable_name") + ', i.x(), i.y(), ("%s :%2.1f" % (names[result[2]], result[1])), color=(0, 255, 0), scale=1, mono_space=False)\n' +
        '    else:\n' +
        '        if(len(names) > result[2]):\n' +
        '            if result[1] > ACCURACY:\n' +
        '                a = lcd_draw_string(' + localStorage.getItem("ai_model_face_variable_name") + ', i.x(), i.y(), ("%s :%2.1f" % (names[result[2]], result[1])), color=(0, 255, 0), scale=1, mono_space=False)\n' +
        '    res_index = result[2]\n' +
        '\n' +
        'if break_string == True:\n' +
        '    break\n' +
        '\n' +
        '';
    return code;
};

Blockly.Blocks['ai_model_face_recognition_get_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_recognition_get_result);
        // this.appendStatementInput("NAME")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_speech_recognition_any_result_text_do);
        this.setOutput(true);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_recognition_get_result_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_face_recognition_get_result'] = function (block) {
    // var statements_name = Blockly.Python.statementToCode(block, 'NAME');
    var code = '(len(names) > result[2] and collectNum >= len(names))';
    // statements_name +
    // 'if break_string == True:\n' +
    // '    break\n' +
    // 'if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
    // '    ' + localStorage.getItem("ai_model_face_variable_name") + ' = ' + localStorage.getItem("ai_model_face_variable_name") + '.cut(40,0,240,240)\n' +
    // '    a = lcd.display(' + localStorage.getItem("ai_model_face_variable_name") + ', oft=(0,0))\n' +
    // '    gc.collect()\n' +
    // '    # kpu.memtest()\n' +
    // 'else:\n' +
    // '    fps = clock.fps()\n' +
    // '    a = lcd.display(' + localStorage.getItem("ai_model_face_variable_name") + ')\n' +
    // '    gc.collect()\n' +
    // '    # kpu.memtest()\n' +
    // '\n' +
    // '';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_getfaceresult'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_getface);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_getface_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_getfaceresult'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'names[res_index] if (res_index != -1 and len(names) > res_index and collectNum >= len(names)) else ""';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_show_face'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_show_face);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_show_face_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_show_face'] = function (block) {
    var code = '' +
        // '        if break_string == True:\n' +
        // '            break\n' +

        'lcd_draw_string(img, 240, 0, (str(num)), color = (255, 102, 0), scale = 2, mono_space = False)\n' +
        'if isCollect == 0:\n' +
        '    lcd_draw_string(img, 40, 0, "按A识别上次样本", color = (255, 0, 0), scale = 1, mono_space = False)\n' +
        '    lcd_draw_string(img, 40, 16, "按C重新拍摄", color = (255, 0, 0), scale = 1, mono_space = False)\n' +
        'elif isCollect == 1:\n' +
        '    lcd_draw_string(img, 40, 0, "开始识别", color = (255, 0, 0), scale = 1, mono_space = False)\n' +
        'elif isCollect == 2:\n' +
        '    lcd_draw_string(img, 40, 0, "开始采集人脸模板数据", color = (255, 0, 0), scale = 1, mono_space = False)\n' +
        'if int(str(firmware_info.ai()).split("-")[0]) < 2021:\n' +
        '    ' + localStorage.getItem("ai_model_face_variable_name") + ' = ' + localStorage.getItem("ai_model_face_variable_name") + '.cut(40,0,240,240)\n' +
        '    lcd.display(' + localStorage.getItem("ai_model_face_variable_name") + ', oft=(0,0))\n' +
        '    gc.collect()\n' +
        'else:\n' +
        '    fps = clock.fps()\n' +
        '    a = lcd.display(' + localStorage.getItem("ai_model_face_variable_name") + ')\n' +
        '    gc.collect()\n' +
        '';
    return code;
};

Blockly.Blocks['ai_model_class_setup'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.ai_model_class_setup);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_class_name);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_class_name.replace(":", ""));
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_class_setup'] = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);


    var code = `
############### config #################
class_names = ` + value_class_input + `
class_num = len(class_names)
sample_num = len(class_names) * 5
THRESHOLD = 11
board_cube = 0
button_state = False
FPIOA().set_function(10, FPIOA.GPIO1)
key1 = GPIO(GPIO.GPIO1, GPIO.IN, GPIO.PULL_UP)
`;

    return code;
};

Blockly.Blocks['ai_class_model'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_class_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_class_model_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_class_model'] = function (block) {
    Blockly.Python.addVariable('ai_class_model', `
try:
    del model
except Exception:
    pass
try:
    del classifier
except Exception:
    pass
gc.collect()

cap_num = 0
train_status = 0
last_cap_time = 0
last_btn_status = 0
res_index = -1
is_save = 0
        `)

    var code = 'model = kpu.load("/sd/preset/models/object_classifier.emodel")\n';
    return code;
};

Blockly.Blocks['ai_class_model_cluster'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_class_model_cluster);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_class_model_cluster_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_class_model_cluster'] = function (block) {
    // Blockly.Python.addVariable('ai_class_model_cluster', `

    //     `)

    var code = 'classifier = kpu.classifier(model, class_num, sample_num)\n';
    return code;
};

Blockly.Blocks['ai_model_class_start_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_setup_source)
            .appendField(new Blockly.FieldVariable("img"), "varitem");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_class_start_load);
        // this.appendStatementInput("NAME")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_speech_recognition_any_result_text_do);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_class_start_load_TOOLTIP);
        this.setHelpUrl("");
    }
}

Blockly.Python['ai_model_class_start_load'] = function (block) {
    // var statements_name = Blockly.Python.statementToCode(block, 'NAME');
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);

    localStorage.setItem("ai_model_class_start_load", variable_name);

    var code = '' +
        'if board_cube:\n' +
        '    ' + variable_name + ' = ' + variable_name + '.rotation_corr(z_rotation=90)\n' +
        '    ' + variable_name + '.pix_to_ai()\n' +
        '\n';

    return code;
}

Blockly.Blocks['ai_model_class_gather'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_class_gather);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_class_gather_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_class_gather'] = function (block) {
    var code = '' +
        '# capture img\n' +
        'if train_status == 0:\n' +
        '    if key1.value() == 0 and last_btn_status == 1:\n' +
        '        #time.sleep_ms(30)\n' +
        '        #if key1.value() == 1 and (last_btn_status == 1) and (time.ticks_ms() - last_cap_time > 500):\n' +
        '        last_btn_status = 0\n' +
        '        last_cap_time = time.ticks_ms()\n' +
        '        if cap_num < class_num:\n' +
        '            index = classifier.add_class_img(' + localStorage.getItem("ai_model_class_start_load") + ')\n' +
        '            cap_num += 1\n' +
        '        elif cap_num < class_num + sample_num:\n' +
        '            index = classifier.add_sample_img(' + localStorage.getItem("ai_model_class_start_load") + ')\n' +
        '            cap_num += 1\n' +
        '        #else:\n' +
        '        #    ' + localStorage.getItem("ai_model_class_start_load") + ' = draw_string(' + localStorage.getItem("ai_model_class_start_load") + ', 2, 200, "release boot key please", color=lcd.WHITE,scale=1, bg=lcd.RED)\n' +
        '    else:\n' +
        '        #time.sleep_ms(30)\n' +
        '        if key1.value() == 1 and (last_btn_status == 0):\n' +
        '            last_btn_status = 1\n' +
        '        if cap_num < class_num:\n' +
        '            ' + localStorage.getItem("ai_model_class_start_load") + '.draw_rectangle(-2,0, len("press right key to cap "+class_names[cap_num])*10+8 , 24, fill=True, color=lcd.RED)\n' +
        '            ' + localStorage.getItem("ai_model_class_start_load") + ' = lcd_draw_string(' + localStorage.getItem("ai_model_class_start_load") + ', 0, 2, "press right key to cap "+class_names[cap_num], color=lcd.WHITE,scale=1,mono_space=False)\n' +
        '        elif cap_num < class_num + sample_num:\n' +
        '            ' + localStorage.getItem("ai_model_class_start_load") + '.draw_rectangle(-2,0, len("right key to cap {} {}".format(class_names[(cap_num-class_num) // 5],5 if (cap_num-class_num+1) % 5 == 0 else (cap_num-class_num+1) % 5))*10+8 , 24, fill=True, color=lcd.RED)\n' +
        '            ' + localStorage.getItem("ai_model_class_start_load") + ' = lcd_draw_string(' + localStorage.getItem("ai_model_class_start_load") + ', 0, 2, "right key to cap {} {}".format(class_names[(cap_num-class_num) // 5],5 if (cap_num-class_num+1) % 5 == 0 else (cap_num-class_num+1) % 5), color=lcd.WHITE,scale=1,mono_space=False)\n' +
        '\n';
    return code;
};

Blockly.Blocks['ai_model_class_data_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_class_data_load);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_class_data_load_1);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_class_data_load_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_class_data_load'] = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC).replace('\"', '').replace('\"', '');
    var code = '' +
        'try:\n' +
        '    saved_path = "/sd/user/' + value_class_input + '.classifier"\n' +
        '    f=open(saved_path,"r")\n' +
        '    classifier, class_num, sample_num = kpu.classifier.load(model, saved_path)\n' +
        '    train_status = 1\n' +
        'except:\n' +
        '    ' + localStorage.getItem("ai_model_class_start_load") + '.draw_rectangle(0, 0, 240,20, fill=True, color=(0,0,0))\n' +
        '    lcd_draw_string(' + localStorage.getItem("ai_model_class_start_load") + ', 0, 0, "Not found last sample", color=lcd.WHITE,scale=1,mono_space=False)\n' +
        '\n';
    return code;
};

Blockly.Blocks['ai_model_class_gather_load_finish'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_class_gather_load_finish);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_class_gather_load_finish_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_class_gather_load_finish'] = function (block) {
    var code = 'train_status == 0';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_class_cluster_train'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_class_cluster_train);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_model_class_cluster_train_1);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_class_cluster_train_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_class_cluster_train'] = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC).replace('\"', '').replace('\"', '');
    var code = '' +
        'if cap_num >= class_num + sample_num and train_status == 0:\n' +
        '    ' + localStorage.getItem("ai_model_class_start_load") + '.draw_rectangle(58,98, len("training...")*10+8 , 24, fill=True, color=lcd.RED)\n' +
        '    ' + localStorage.getItem("ai_model_class_start_load") + ' = lcd_draw_string(' + localStorage.getItem("ai_model_class_start_load") + ', 60, 100, "training...", color=lcd.WHITE,scale=1,mono_space=False)\n' +
        '    lcd.display(' + localStorage.getItem("ai_model_class_start_load") + ')\n' +
        '    try:\n' +
        '        classifier.train()\n' +
        '        saved_path = "/sd/user/' + value_class_input + '.classifier"\n' +
        '        f=open(saved_path,"r")\n' +
        '        os.remove("/sd/user/' + value_class_input + '.classifier")\n' +
        '        classifier.save("/sd/user/' + value_class_input + '.classifier")\n' +
        '    except:\n' +
        '        classifier.save("/sd/user/' + value_class_input + '.classifier")\n' +
        '    time.sleep(2)\n' +
        '    train_status = 1\n' +
        '\n';
    return code;
};

Blockly.Blocks['ai_model_class_recognition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_class_recognition);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_class_recognition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_class_recognition'] = function (block) {
    var code = '' +
        '# predict\n' +
        'if train_status == 1:\n' +
        '    res_index = -1\n' +
        '    try:\n' +
        '        res_index, min_dist = classifier.predict(' + localStorage.getItem("ai_model_class_start_load") + ')\n' +
        '    except Exception as e:\n' +
        '        print("predict err:", e)\n' +
        '    if res_index >= 0 and min_dist < THRESHOLD :\n' +
        '        ' + localStorage.getItem("ai_model_class_start_load") + '.draw_rectangle(0,0, len(class_names[res_index])*10+8 , 24, fill=True, color=lcd.RED)\n' +
        '        ' + localStorage.getItem("ai_model_class_start_load") + ' = lcd_draw_string(' + localStorage.getItem("ai_model_class_start_load") + ', 2, 2, class_names[res_index], color=lcd.WHITE,scale=1,mono_space=False)\n' +
        '    else:\n' +
        '        ' + localStorage.getItem("ai_model_class_start_load") + '.draw_rectangle(0,0, len("maybe {}".format(class_names[res_index]))*10+8 , 24, fill=True, color=lcd.RED)\n' +
        '        ' + localStorage.getItem("ai_model_class_start_load") + ' = lcd_draw_string(' + localStorage.getItem("ai_model_class_start_load") + ', 2, 2, "maybe {}".format(class_names[res_index]), color=lcd.WHITE,scale=1,mono_space=False)\n' +
        '\n';
    return code;
};



Blockly.Blocks['ai_model_show_class'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_show_face);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_show_face_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_show_class'] = function (block) {
    var code = '' +
        '' + localStorage.getItem("ai_model_class_start_load") + ' = ' + localStorage.getItem("ai_model_class_start_load") + '.cut(0,0,240,240)\n' +
        'lcd.display(' + localStorage.getItem("ai_model_class_start_load") + ', oft=(0,0))\n' +
        '';
    return code;
};


Blockly.Blocks['ai_model_customized_init_setup_Graphics'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_setup_title_Graphics);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_setup_path)
            .appendField(new Blockly.FieldTextInput("/root/preset/model/yolov2_int8"), "model_path");
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_models_customized_init_setup_name);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_customized_init_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_customized_init_setup_Graphics'] = function (block) {
    var value_class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    var text_model_path = block.getFieldValue('model_path');

    Blockly.Python.definitions_['v831_import_from_maix_nn'] = "from maix import nn";
    Blockly.Python.definitions_['v831_import_from_maixnn_decoder'] = `from maix.nn import decoder`

    let code = `class Yolo:
    labels = ${value_class_input}
    anchors = [1.19, 1.98, 2.79, 4.59, 4.53, 8.92, 8.06, 5.29, 10.32, 10.65]
    m = {
        "param": "${text_model_path}.param",
        "bin": "${text_model_path}.bin"
    }
    options = {
        "model_type":  "awnn",
        "inputs": {
            "input0": (224, 224, 3)
        },
        "outputs": {
            "output0": (7, 7, (1+4+len(labels))*5)
        },
        "mean": [127.5, 127.5, 127.5],
        "norm": [0.0078125, 0.0078125, 0.0078125],
    }
    def __init__(self):
        from maix import nn
        from maix.nn import decoder
        self.model = nn.load(self.m, opt=self.options)
        self.decoder = decoder.Yolo2(len(self.labels), self.anchors, net_in_size=(224, 224), net_out_size=(7, 7))
    def __del__(self):
        del self.model
        del self.decoder
Yolo = Yolo()
`;
    return code;
};

Blockly.Blocks['ai_model_customized_load_setup_Graphics'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_customized_load_setup_title_Graphics);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_setup_source)
            .appendField(new Blockly.FieldVariable("img_modelrecognition"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_customized_load_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_customized_load_setup_Graphics'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var code = `outGraphics = Yolo.model.forward(${variable_name}, quantize=True, layout="hwc")
`;
    return code;
};

Blockly.Blocks['ai_model_customized_get_result_Graphics'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_get_result_any_Graphics)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_customized_get_result_name, "classid"],
                [Blockly.Msg.ai_models_customized_get_result_confidence, "value"]
            ]), "get_results");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('get_results');
            var TOOLTIPS = {
                'classid': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_name),
                'value': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_confidence)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_customized_get_result_Graphics'] = function (block) {
    var dropdown_get_results = block.getFieldValue('get_results');
    // TODO: Assemble Python into code variable.
    var code = '';
    if (dropdown_get_results == "classid") {
        code = 'Yolo.labels[outGraphics.argmax()]';
    } else if (dropdown_get_results == "value") {
        code = `int(outGraphics.max() * 10)`;
    }
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['ai_model_Classification_validation'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('从摄像头获取图像')
            .appendField(new Blockly.FieldVariable("AI_img"), "varitem")
            .appendField('并通过训练的模型对图片进行验证')
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip('对训练的模型进行分类验证')
    }
}

Blockly.Python['ai_model_Classification_validation'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_.import_self_learn_Classification_validation = `from maix import nn
`


    let code = `idx, distance = SELFLEARN.classifier.predict(${variable_name}.copy().resize(224, 224))`;
    return code
}

Blockly.Blocks['ai_model_Classification_validation_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField('验证结果')
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip('验证结果')
    }
}

Blockly.Python['ai_model_Classification_validation_result'] = function (block) {

    let code = `"predict class:" str(idx+1), "conf:" str(100-distance)`;
    return [code, Blockly.Python.ORDER_NONE];
}


/*
     _    ___   ____            _                 
    / \  |_ _| / ___| _   _ ___| |_ ___ _ __ ___  
   / _ \  | |  \___ \| | | / __| __/ _ \ '_ ` _ \ 
  / ___ \ | |   ___) | |_| \__ \ ||  __/ | | | | |
 /_/   \_\___| |____/ \__, |___/\__\___|_| |_| |_|
                      |___/                       
*/

Blockly.Blocks['ai_system_off'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_system_off);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.ai_system_restart_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_system_off = function (block) {
    // 不能直接 os.system("poweroff")：pi2 開機時 bl1 就打開了硬體看門狗，ATF 又沒有實作
    // PSCI system_off，關機會停在半路、被看門狗重開（開機原因 0x04）。
    // 官方 maix.sys.poweroff() 先關掉看門狗再 poweroff（MaixCDK maix_sys_maixcam2.cpp:25）。
    Blockly.Python.definitions_['maixcam2_import_maix_sys_off'] = `from maix import sys as _maixSysOff`
    return `_maixSysOff.poweroff()\n`;
}



Blockly.Blocks['ai_system_restart'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_system_restart);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.ai_system_off_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_system_restart = function (block) {
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    var _code = `os.system("reboot")
`
    return _code;
}

Blockly.Blocks['ai_system_refresh'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_system_refresh);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.ai_system_refresh_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_system_refresh = function (block) {
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    var _code = `os.system("sync")
`
    return _code;
}

Blockly.Blocks['ai_system_volume'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.system_voice)
            .appendField(new Blockly.FieldNumber(25, 0, 100), "play_vol");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#22398e");
    }
}

Blockly.Python.ai_system_volume = function (block) {
    var number_play_vol = block.getFieldValue('play_vol');
    // 舊碼寫的是 V831 的 `numid=8,iface=MIXER,name="LINEOUT volume"`；pi2 的 numid=8
    // 是 `ALC GATE THRESHOLD`（麥克風的噪音閘門），調「系統音量」其實在動麥克風。
    // pi2 的輸出增益只能往上加、降不下來，所以跟「設置音量」（ai_audio_play_volume）
    // 走同一個 setSystemVolume，見 maixcam2_audio.js 的 maixAudioVolumeDef。
    maixAudioVolumeDef();
    return `setSystemVolume(${number_play_vol})\n`;
}

Blockly.Blocks['ai_system_thread'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_system_thread_setting).appendField(new Blockly.FieldNumber(1, 1, 5), "thread")
        this.appendStatementInput("input")
            .setCheck(null)
            .appendField(Blockly.Msg.basic_motion_statement_exec);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.ai_system_thread_setting);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_system_thread'] = function (block) {
    var threadNum = block.getFieldValue('thread');
    var statements_input = Blockly.Python.statementToCode(block, 'input');
    Blockly.Python.definitions_['v831_import_threading'] = `import threading`
    let allBlocks = block.workspace.getAllBlocks();
    let global = ""
    try {
        global = allBlocks[0].workspace.variableList.toString()
    }
    catch (e) {
        console.log(e)
    }
    // 盤面沒有變數時不能產出光禿禿的 `global`（語法錯）；身體也空的話補 pass
    let body = ((global ? `    global ${global}\n` : "") + statements_input) || "    pass\n"
    Blockly.Python.definitions_['v831_import_thread_calsss_fun' + threadNum] = `def thread_calsss_fun${threadNum}():
${body}

CocoPiThread${threadNum} = threading.Thread(target=thread_calsss_fun${threadNum})
`
    var code = ``;
    return code;
};


Blockly.Blocks['ai_system_thread_create_with_container'] = {
    init: function () {
        this.setColour("#22398e");
        this.appendDummyInput()
            .appendField(Blockly.Msg.serialcomm_write_item);
        this.appendStatementInput('STACK');
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Blocks['ai_system_thread_data_create_with_item'] = {
    init: function () {
        this.setColour("#22398e");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_systen_thread_val);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Blocks['ai_system_thread_set_setDaemon'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_system_thread_setting).appendField(new Blockly.FieldNumber(1, 1, 5), "thread")
            .appendField(Blockly.Msg.digital_set_as).appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_system_thread_setDaemon, "True"],
                [Blockly.Msg.ai_system_thread_not_setDaemon, "False"]
            ]), "setDaemon");

        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null)
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.ai_system_thread_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_system_thread_set_setDaemon'] = function (block) {
    var threadNum = block.getFieldValue('thread');
    var queue_value = block.getFieldValue('setDaemon');
    var code = `CocoPiThread${threadNum}.setDaemon(${queue_value})
`;
    return code;
};
Blockly.Blocks['ai_system_thread_set_join'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_system_thread_setting)
            .appendField(new Blockly.FieldNumber(1, 1, 5), "thread")
            .appendField(Blockly.Msg.ai_system_thread_set_join)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null)
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.ai_system_thread_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_system_thread_set_join'] = function (block) {
    var threadNum = block.getFieldValue('thread');
    var code = `CocoPiThread${threadNum}.join()
`;
    return code;
};
Blockly.Blocks['ai_system_thread_start'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_system_thread).appendField(new Blockly.FieldNumber(1, 1, 5), "thread");
        // this.appendStatementInput("input")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.basic_motion_statement_exec);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null)
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.ai_system_thread_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_system_thread_start'] = function (block) {
    var threadNum = block.getFieldValue('thread');
    // var statements_input = Blockly.Python.statementToCode(block, 'input');
    var code = `CocoPiThread${threadNum}.start()
`;
    return code;
};

// 「放在隊列中」「得到隊列的值」共用：同一組 key，誰先用誰插入，只拉了「得到」也不會 NameError
function aiQueueDef(n) {
    Blockly.Python.definitions_["v831_import_queue"] = `import queue`
    Blockly.Python.definitions_["v831_import_queue_init" + n] = `queue${n} = queue.Queue()`
}

Blockly.Blocks["ai_system_set_queue"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_systen_queue_aritem)
        this.appendValueInput("queueVaritem")
            .setCheck(null);
        this.appendDummyInput().appendField(Blockly.Msg.ai_systen_queue_put)
            .appendField(new Blockly.FieldDropdown([
                ["1", "1"],
                ["2", "2"],
                ["3", "3"],
                ["4", "4"],
                ["5", "5"]
            ]), "queue_value");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#22398e");
        this.setTooltip("");
    }
}
Blockly.Python['ai_system_set_queue'] = function (block) {
    var variable_name = Blockly.Python.valueToCode(block, 'queueVaritem', Blockly.Python.ORDER_ATOMIC);
    // var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var queue_value = block.getFieldValue('queue_value');
    aiQueueDef(queue_value);
    var code = `queue${queue_value}.put(${variable_name})
`;
    return code;
}
Blockly.Blocks["ai_system_get_queue"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_systen_queue_get)
            .appendField(new Blockly.FieldDropdown([
                ["1", "1"],
                ["2", "2"],
                ["3", "3"],
                ["4", "4"],
                ["5", "5"]
            ]), "queue_value")
            .appendField(Blockly.Msg.ai_systen_queue_value);
        this.setOutput(true, null);
        this.setColour("#22398e");
        this.setTooltip("");
    }
}
Blockly.Python['ai_system_get_queue'] = function (block) {
    var queue_value = block.getFieldValue('queue_value');
    aiQueueDef(queue_value);
    // 隊列空的時候會等到有值為止
    var code = `queue${queue_value}.get()`;
    return [code, Blockly.Python.ORDER_FUNCTION_CALL];
}
// 拼音识别
// 舊碼是 v3 的 _maix_speech.Asr()，模型在 /root/preset/drivers/ASR/（pi2 沒有）。
// 改走 v4 的 nn.Speech，而且跟「AI 聽覺」（maixcam2_speech.js）共用同一個 Speech：
// 麥克風只能開一次，一個 Speech 也只有一個 kws 解碼器——兩組各開各的會搶麥克風、
// 各註冊各的會互相蓋掉。這組的詞放 _maixKwsExtra，跟 AI 聽覺的詞一起由 _maixKwsRegister 送進去；
// AI 聽覺的積木讀不到這組的詞，「終止」也只清這組的。
//
// 舊碼寫死的近音表 similars（pai3≈ai4、le4≈luo4）沒搬：v4 的 similar() 會蓋掉整張自動近音表
// （docstring 原話），共用解碼器下等於改到 AI 聽覺的詞。這兩組是不同音節、不是聲調差，
// auto_similar 補不回來——含 pai、le 的詞可能比舊版難認（見票 08）。
function pinyinAsrDef() {
    maixKwsStartDef();
    Blockly.Python.definitions_['pinyin_asr_def'] = `def _pinyinKwsSet(words):
    """上一代 asr.set_kws()：換成這組詞、整張詞表重新註冊。"""
    _maixKwsExtra[:] = words
    _maixKwsRegister()


def _pinyinKwsStop():
    """上一代 asr.exit()。只拿掉這組的詞；麥克風不關——AI 聽覺可能還在用，程式結束時統一釋放。"""
    del _maixKwsExtra[:]
    _maixKwsRegister()
`;
}

// 「獲取結果」和「聲調」兩塊都寫這個定義（舊碼就是這樣，同一個 key）。
function pinyinAsrResultDef() {
    pinyinAsrDef();
    Blockly.Python.definitions_.speech_recognition_phonetic_to_pinyin_start_recognition_def = `def getAsrResult():
    """最新一幀裡，這組詞相似度最高的那個；全是 0（取到小數兩位）就回 None。跟上一代一樣。"""
    _best = None
    _top = 0.0
    for _w in _maixKwsExtra:
        _i = _maixKwsAll.index(_w) if _w in _maixKwsAll else -1
        _s = round(float(_maixKwsScore[_i]), 2) if 0 <= _i < len(_maixKwsScore) else 0.0
        if _s > _top:
            _best = _w
            _top = _s
    return _best
`;
}

Blockly.Blocks['speech_recognition_phonetic_to_pinyin_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/speech_recognition_header_recognition_new.png", 130, 60, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_setup);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_phonetic_to_pinyin_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_phonetic_to_pinyin_setup'] = function (block) {
    Blockly.Python.definitions_['v831_import_display'] = `from maix import display`;
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`;
    Blockly.Python.definitions_['v831_import_camera'] = `from maix import camera`;
    pinyinAsrDef();
    // 舊碼在檔頭就開麥克風；這裡改成積木放的位置開（約 2 秒）
    return "_maixSpeechOpen()\n";
};

Blockly.Blocks['speech_recognition_phonetic_to_pinyin_set_param_new'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_set_param);
        // this.appendValueInput("data")
        //     .setCheck(null)
        //     .appendField(Blockly.Msg.ai_speech_recognition_setup_pinyin);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(true);
        this.setColour("#ee783a");
        this.pinyinitemCount_ = 1
        this.updateShape_();
        this.setMutator(new Blockly.Mutator(["v831_to_pinyin_set_param"]));
        this.setTooltip(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_set_param_TOOLTIP + Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_set_param_max);
        this.setHelpUrl("");
    },
    mutationToDom: function () {
        var a = document.createElement("mutation");
        a.setAttribute("items", this.pinyinitemCount_);
        return a
    },
    domToMutation: function (a) {
        this.pinyinitemCount_ = parseInt(a.getAttribute("items"), 10);
        this.updateShape_()
    },
    decompose: function (a) {
        var b = a.newBlock("v831_to_pinyin_set_param_container");
        b.initSvg();
        for (var c = b.getInput("STACK").connection, e = 0; e < this.pinyinitemCount_; e++) {
            var d = a.newBlock("v831_to_pinyin_set_param");
            d.initSvg();
            c.connect(d.previousConnection);
            c = d.nextConnection
        }
        return b
    },
    compose: function (a) {
        var b = a.getInputTargetBlock("STACK");
        for (a = []; b;)
            a.push(b.valueConnection_),
                b = b.nextConnection && b.nextConnection.targetBlock();
        for (b = 0; b < this.pinyinitemCount_; b++) {
            var c = this.getInput("PINYIN" + b).connection.targetConnection;
            c && -1 == a.indexOf(c) && c.disconnect()
        }
        this.pinyinitemCount_ = a.length;
        this.updateShape_();
        for (b = 0; b < this.pinyinitemCount_; b++)
            Blockly.Mutator.reconnect(a[b], this, "PINYIN" + b)
    },
    saveConnections: function (a) {
        a = a.getInputTargetBlock("STACK");
        for (var b = 0; a;) {
            var c = this.getInput("PINYIN" + b);
            a.valueConnection_ = c && c.connection.targetConnection;
            b++;
            a = a.nextConnection && a.nextConnection.targetBlock()
        }
    },
    updateShape_: function () {
        // this.itemCount_ && this.getInput("EMPTY") ? this.removeInput("EMPTY") : this.itemCount_ || this.getInput("EMPTY") || this.appendDummyInput("EMPTY").appendField(Blockly.Msg.TUPLE_CREATE_EMPTY_TITLE);
        for (var a = 0; a < this.pinyinitemCount_; a++)
            if (!this.getInput("PINYIN" + a)) {
                var b = this.appendValueInput("PINYIN" + a);
                0 == a && b.appendField(Blockly.Msg.ai_speech_recognition_setup_pinyin_and_tone)
            }
        for (; this.getInput("PINYIN" + a);)
            this.removeInput("PINYIN" + a),
                a++
    }
};


Blockly.Blocks['v831_to_pinyin_set_param'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_setup_pinyin_and_tone);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#ee783a")
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Blocks['v831_to_pinyin_set_param_container'] = {
    init: function () {
        this.setColour("#ee783a");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ARD_SERIAL_SETUP);
        this.appendStatementInput('STACK');
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Python['speech_recognition_phonetic_to_pinyin_set_param_new'] = function (block) {
    // var data = Blockly.Python.valueToCode(block, 'data', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_display'] = `from maix import display`;
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`;
    Blockly.Python.definitions_['v831_import_camera'] = `from maix import camera`;
    pinyinAsrDef();
    var a = Array(this.pinyinitemCount_)
    for (let b = 0; b < this.pinyinitemCount_; b++) {
        var c = Blockly.Python.valueToCode(this, "PINYIN" + b, Blockly.Python.ORDER_NONE)
        a[b] = c.slice(1, -1).replaceAll(",", "")
    }
    // 舊碼每個詞配 0.1 的門檻（[詞, 0.1]）；AI 聽覺的 _maixKwsStart 也是固定 0.1
    return `_pinyinKwsSet(${JSON.stringify(a)})\n`;
};
Blockly.Blocks['speech_recognition_set_pinyin_tone'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("声调").appendField(new Blockly.FieldDropdown([
                ["1", "1"],
                ["2", "2"],
                ["3", "3"],
                ["4", "4"],
            ]), "tone");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_get_result_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_set_pinyin_tone'] = function (block) {
    let tone = block.getFieldValue('tone');
    console.log(tone)
    pinyinAsrResultDef();
    var code = tone;
    return [code, Blockly.Python.ORDER_NONE];
};
Blockly.Blocks.set_pinyin_dict_create_with_items_insert = {
    init: function () {
        this.setColour("#ee783a");
        this.appendDummyInput("").appendField(new Blockly.FieldLabel(Blockly.Msg.ai_speech_recognition_setup_pinyin), "TIP");
        this.itemCount_ = 3;
        this.updateShape_();
        this.setOutput(!0);
        this.setMutator(new Blockly.Mutator(["set_pinyin_dict_create_with_item"]));
        this.setTooltip(Blockly.Msg.ai_speech_recognition_setup_pinyin_and_tone)
    },
    mutationToDom: function () {
        var a = document.createElement("mutation");
        a.setAttribute("items", this.itemCount_);
        return a
    },
    domToMutation: function (a) {
        this.itemCount_ = parseInt(a.getAttribute("items"), 10);
        this.updateShape_()
    },
    decompose: function (a) {
        var b = a.newBlock("set_pinyin_dict_create_with_container");
        b.initSvg();
        for (var c = b.getInput("STACK").connection, e = 0; e < this.itemCount_; e++) {
            var d = a.newBlock("set_pinyin_dict_create_with_item");
            d.initSvg();
            c.connect(d.previousConnection);
            c = d.nextConnection
        }
        return b
    },
    compose: function (a) {
        a = a.getInputTargetBlock("STACK");
        for (var b = [], c = 0; a;)
            b[c] = a.valueConnection_,
                a = a.nextConnection && a.nextConnection.targetBlock(),
                c++;
        this.itemCount_ = c;
        this.updateShape_();
        for (c = 0; c < this.itemCount_; c++)
            b[c] && this.getInput("ADD" + c).connection.connect(b[c])
    },
    saveConnections: function (a) {
        a = a.getInputTargetBlock("STACK");
        for (var b = 0; a;) {
            var c = this.getInput("ADD" + b);
            a.valueConnection_ = c && c.connection;
            b++;
            a = a.nextConnection && a.nextConnection.targetBlock()
        }
    },
    updateShape_: function () {
        this.getInput("EMPTY") && this.removeInput("EMPTY");

        for (var a = [], b = 0; this.getInput("ADD" + b); b++)
            a.push(this.getFieldValue("KEY" + b)),
                this.removeInput("ADD" + b);
        if (0 == this.itemCount_)
            this.getField("TIP").setText(Blockly.Msg.ai_speech_recognition_setup_pinyin);
        else
            for (this.getField("TIP").setText(Blockly.Msg.ai_speech_recognition_setup_pinyin),
                b = 0; b < this.itemCount_; b++)
                this.appendInput_(Blockly.DUMMY_INPUT, "ADD" + b).appendField(new Blockly.FieldTextInput(a.length > b ? a[b] : 0 == b ? "key_0" : "key_" + b), "KEY" + b).appendField(":")
                    .appendField(Blockly.Msg.ai_speech_recognition_setup_tone).appendField(new Blockly.FieldDropdown([
                        ["1", "1"],
                        ["2", "2"],
                        ["3", "3"],
                        ["4", "4"],
                    ]), "toneADD" + b + b)

    },
    getVars: function () {
        return [this.getFieldValue("VAR")]
    },
    renameVar: function (a, b) {
        Blockly.Names.equals(a, this.getFieldValue("VAR")) && this.setTitleValue(b, "VAR")
    }
};
Blockly.Python.set_pinyin_dict_create_with_items_insert = function (block) {
    for (var a = Array(this.itemCount_), b = 0; b < this.itemCount_; b++) {
        var c = this.getFieldValue("KEY" + b);
        a[b] = c + block.getFieldValue("toneADD" + b + b);
    }
    // console.log(a.join(" "))
    a = `"${a.join(" ")}"`;
    return [a, Blockly.Python.ORDER_ATOMIC]
};

Blockly.Blocks.set_pinyin_dict_create_with_item = {
    init: function () {
        this.setColour("#ee783a");
        this.appendDummyInput().appendField(Blockly.Msg.ai_speech_recognition_setup_pinyin);
        this.setPreviousStatement(!0);
        this.setNextStatement(!0);
        this.setTooltip(Blockly.Msg.ai_speech_recognition_setup_pinyin);
        this.contextMenu = !1
    }
};
Blockly.Blocks.set_pinyin_dict_create_with_container = {
    init: function () {
        this.setColour("#ee783a");
        this.appendDummyInput().appendField(Blockly.Msg.robot_dog_servo_execution);
        this.appendStatementInput("STACK");
        this.setTooltip(Blockly.Msg.robot_dog_servo_execution);
        this.contextMenu = !1
    }
};
Blockly.Blocks['speech_recognition_phonetic_to_pinyin_set_param'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_set_param);
        this.appendValueInput("data")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_speech_recognition_setup_pinyin);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setInputsInline(false);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_set_param_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_phonetic_to_pinyin_set_param'] = function (block) {
    var data = Blockly.Python.valueToCode(block, 'data', Blockly.Python.ORDER_ATOMIC);
    var code = `keywords = ${data}
asr.set_kws(keywords, similars, asr_kws)
`;
    return code;
};

Blockly.Blocks['speech_recognition_phonetic_to_pinyin_start_recognition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.speech_recognition_phonetic_to_pinyin_start_recognition);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_phonetic_to_pinyin_start_recognition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_phonetic_to_pinyin_start_recognition'] = function (block) {
    pinyinAsrDef();
    // 跟 AI 聽覺的「處理一幀語音」同一個：推進一幀、會停住約 0.77 秒
    var code = "_maixSpeechRun()\n";
    return code;
};

Blockly.Blocks['speech_recognition_phonetic_to_pinyin_stop_recognition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.speech_recognition_phonetic_to_pinyin_stop_recognition);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_phonetic_to_pinyin_stop_recognition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_phonetic_to_pinyin_stop_recognition'] = function (block) {
    pinyinAsrDef();
    var code = "_pinyinKwsStop()\n";
    return code;
};

Blockly.Blocks['speech_recognition_phonetic_to_pinyin_pause_recognition'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.speech_recognition_phonetic_to_pinyin_pause_recognition);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.speech_recognition_phonetic_to_pinyin_pause_recognition_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_phonetic_to_pinyin_pause_recognition'] = function (block) {
    pinyinAsrDef();
    var code = "_maixSpeechOpen().clear()\n";
    return code;
};

Blockly.Blocks['speech_recognition_phonetic_to_pinyin_get_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_get_result);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_speech_recognition_phonetic_to_pinyin_get_result_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['speech_recognition_phonetic_to_pinyin_get_result'] = function (block) {
    pinyinAsrResultDef();
    var code = 'getAsrResult()';
    return [code, Blockly.Python.ORDER_NONE];
};


// numpy + mnist
// 「訓練模組啟動」「設置訓練參數」「清除 numpy 模組」共用一個旗標檔：在＝訓練過了。
// 舊碼的旗標是 /usr/lib/python3.8/site-packages/numpy/random/__init__.py，pi2 是 Python 3.13，
// 那個目錄不存在：touch 失敗、旗標永遠不在、每次都重新訓練。不照新版本號重算那條路徑——
// 3.13 的 numpy/random/__init__.py 是真的模組，「清除」會把 numpy.random 刪掉。
// 三塊各自呼叫這個函式，只拉其中一塊也不會 NameError（舊碼沒有 import os，靠別的積木帶）
function numpyNNTrainedFlagDef() {
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['numpy_nn_trained_flag'] = `NUMPY_NN_TRAINED_FLAG = "/root/user/model/.numpy_nn_trained"`
}

Blockly.Blocks['Numpy_Neural_Network_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.numpy_mnist_model_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.numpy_mnist_model_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_numpy_as_np'] = `import numpy as np`;
    Blockly.Python.definitions_["v831_import_pickle"] = `import pickle`
    Blockly.Python.definitions_["v831_NeuralNetwork_init"] = `def sigmoid(x):
    return 1/(1+np.exp(-x))
def grad(x):
    return x*(1-x)
class NeuralNetwork:
    """
    三层全连接前馈神经网络
    """
    def __init__(self, inputnodes, hiddennodes, outputnodes, learningrate, active_function=sigmoid, gradient=grad, lambda_=0.1):
        """

        :param inputnodes: 输入层结点数
        :param hiddennodes: 隐藏层节点数
        :param outputnodes: 输出层节点数
        :param learningrate: 学习率
        :param active_function: 激活函数
        :param gradient: 激活函数的导数
        :param lambda_: L2正则化系数
        """
        self.inputnodes = inputnodes
        self.hiddennodes = hiddennodes
        self.outputnodes = outputnodes
        self.learningrate = learningrate
        self.active_function = active_function
        self.gradient = gradient
        self.lambda_ = lambda_

        # 权值矩阵
        self.weights_i_h = np.random.rand(
            self.hiddennodes, self.inputnodes) - 0.5
        self.weights_h_o = np.random.rand(
            self.outputnodes, self.hiddennodes) - 0.5

    def train_sgd(self, x, y):
        """梯度下降训练"""
        TRAINX = np.array(x).reshape(-1, 1)
        target = np.zeros((self.outputnodes, 1)) + 0.01
        target[y, 0] = 0.99

        hiddeninputs = np.dot(self.weights_i_h, TRAINX)
        hiddenoutputs = self.active_function(hiddeninputs)

        outputinputs = np.dot(self.weights_h_o, hiddenoutputs)
        final_outputs = self.active_function(outputinputs)

        error = target - final_outputs

        hidden_error = np.dot(self.weights_h_o.transpose(), error)

        self.weights_h_o += self.learningrate * error * \
            np.dot(self.gradient(final_outputs), hiddenoutputs.transpose())

        self.weights_i_h += self.learningrate * hidden_error * \
            np.dot(self.gradient(hiddenoutputs), TRAINX.transpose())

    def fit(self, TRAINX, targets):
        TRAINX = np.array(TRAINX)
        for i in range(TRAINX.shape[0]):
            self.train_sgd(TRAINX[i], targets[i])

    def query(self, inputs, debug=False):
        """单个值预测"""
        inputs = np.array(inputs).reshape(-1, 1)
        hidden_input = np.dot(self.weights_i_h, inputs)
        hidden_output = self.active_function(hidden_input)

        output_input = np.dot(self.weights_h_o, hidden_output)

        final_output = self.active_function(output_input)

        if debug:
            print("predict: ", final_output)

        return np.argmax(final_output)

    def predict(self, inputs):
        """批量预测"""
        res = []
        for x in inputs:
            res.append(self.query(x))
        return res

    def __str__(self):
        return "NeuralNetwork: \\ninput_nodes = {0}, hidden_nodes = {1}, \\noutputnodes = {2}, learningrate = {3}".format(self.inputnodes, self.hiddennodes, self.outputnodes, self.learningrate)

# 用测试数据测试
def accuracy(y_true, y_pred):
    """准确度"""
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    return sum(y_true == y_pred)/y_true.shape[0]

# 用全部数据进行训练


def get_data():
    # train_df = np.loadtxt("mnist_train.csv", delimiter=",", dtype=str)
    # test_df = np.loadtxt("mnist_test.csv", delimiter=",", dtype=str)
    global train_df, test_df
    print(train_df.shape)
    print(test_df.shape)

    train_data = train_df.astype("int")
    TRAINX = train_data[:, 1:]
    TRAINY = train_data[:, 0]
    TRAINX = TRAINX / 255 * 0.99 + 0.01

    test_data = test_df.astype("int")
    TESTX = test_data[:, 1:]
    TESTY = test_data[:, 0]
    TESTX = TESTX / 255 * 0.99 + 0.01

    return TRAINX, TRAINY, TESTX, TESTY
`

    var code = '';
    return code;
};

Blockly.Blocks['Numpy_Neural_Network_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("numpy + mnist 训练模型加载");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip("numpy + mnist 训练模型加载");
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_load'] = function (block) {
    var code = `#构建神经网络训练服务
TRAINX, TRAINY, TESTX, TESTY = get_data()

NN = NeuralNetwork(784, 100, 10, 0.3)
NN.fit(TRAINX, TRAINY)
y_pred = NN.predict(TESTX)
`;

    return code;
};


Blockly.Blocks['Numpy_Neural_Network_LOading_test_train'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.numpy_mnist_loading_train_and_test_set);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.numpy_mnist_train_set_url);
        this.appendValueInput("class_input1")
            .setCheck(null)
            .appendField(Blockly.Msg.numpy_mnist_test_set_url);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.numpy_mnist_loading_train_and_test_set);
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_LOading_test_train'] = function (block) {
    var trainUrl = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    var testUrl = Blockly.Python.valueToCode(block, 'class_input1', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = `test_df = np.loadtxt(${testUrl}, delimiter=",", dtype=str)    
train_df = np.loadtxt(${trainUrl}, delimiter=",", dtype=str)
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

Blockly.Blocks['Numpy_Neural_Network_numpy_isStart'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.numpy_mnist_is_training_start);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.numpy_mnist_is_training_start);
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_numpy_isStart'] = function (block) {
    numpyNNTrainedFlagDef();
    var code = `not os.path.exists(NUMPY_NN_TRAINED_FLAG)`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['Numpy_Neural_Network_setting_training_argument'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.numpy_mnist_setting_training_argument);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.numpy_mnist_input_trait_dimensionality);
        this.appendValueInput("class_input1")
            .setCheck(null)
            .appendField(Blockly.Msg.numpy_mnist_setting_training_argument_number_node);
        this.appendValueInput("class_input2")
            .setCheck(null)
            .appendField(Blockly.Msg.numpy_mnist_output_dimensionality);
        this.appendValueInput("class_input3")
            .setCheck(null)
            .appendField(Blockly.Msg.numpy_mnist_setting_training_argument_learning_rate);
        this.appendValueInput("class_input4")
            .setCheck(null)
            .appendField(Blockly.Msg.numpy_mnist_setting_training_argument_frequency);
        this.appendValueInput("class_input5")
            .setCheck(null)
            .appendField(Blockly.Msg.VIDEO_S_S);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.numpy_mnist_setting_training_argument);
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_setting_training_argument'] = function (block) {
    var class_input = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    var class_input1 = Blockly.Python.valueToCode(block, 'class_input1', Blockly.Python.ORDER_ATOMIC);
    var class_input2 = Blockly.Python.valueToCode(block, 'class_input2', Blockly.Python.ORDER_ATOMIC);
    var class_input3 = Blockly.Python.valueToCode(block, 'class_input3', Blockly.Python.ORDER_ATOMIC);
    var class_input4 = Blockly.Python.valueToCode(block, 'class_input4', Blockly.Python.ORDER_ATOMIC);
    var class_input5 = Blockly.Python.valueToCode(block, 'class_input5', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    console.log(Number(class_input.slice(1, -1)), class_input1, class_input2, class_input3)
    numpyNNTrainedFlagDef();
    // 存檔目錄不替使用者建：路徑是學生填的，不在就該看到 FileNotFoundError。預設的 /root/user/model/ 歸映像（票 10）
    var code = `TRAINX, TRAINY, TESTX, TESTY = get_data()
NN = NeuralNetwork(${Number(class_input.slice(1, -1))}, ${Number(class_input1.slice(1, -1))}, ${Number(class_input2.slice(1, -1))}, ${Number(class_input3.slice(1, -1))})
#开启神经网络训练，记录时长
AccuracyRATE = 0
# 训练10次，每3次训练下降一次学习率
for e in range(1, ${Number(class_input4.slice(1, -1)) + 1}):
    if e % 3 == 0:
        NN.learningrate /= 2
    NN.fit(TRAINX, TRAINY)
    y_pred = NN.predict(TESTX)
    CURRENTACCURACY = accuracy(TESTY, y_pred)
    if  CURRENTACCURACY > AccuracyRATE:
        AccuracyRATE = CURRENTACCURACY
        #文件已保存至
        with open(${class_input5}, "wb") as f:  # 保存模型
            pickle.dump(pickle.dumps(NN), f)
os.makedirs(os.path.dirname(NUMPY_NN_TRAINED_FLAG), exist_ok=True)
open(NUMPY_NN_TRAINED_FLAG, "a").close()
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

// 

Blockly.Blocks['Numpy_Neural_Network_numpy_loading_model'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.numpy_mnist_loading_model);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.AUDIO_S_PF);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.numpy_mnist_loading_model);
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_numpy_loading_model'] = function (block) {
    var trainUrl = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = `try:
    with open(${trainUrl},"rb") as f:
        b_data = pickle.load(f)
        net_model = pickle.loads(b_data)
except:
    pass
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};



Blockly.Python['Numpy_Neural_Network_LOading_test_train'] = function (block) {
    var trainUrl = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    var testUrl = Blockly.Python.valueToCode(block, 'class_input1', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = `test_df = np.loadtxt(${testUrl}, delimiter=",", dtype=str)    
train_df = np.loadtxt(${trainUrl}, delimiter=",", dtype=str)
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

Blockly.Blocks['Numpy_Neural_Network_numpy_loading_model_fun'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField("获取检测结果");
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_numpyrecognition"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_getclass_TOOLTIP);
        this.setHelpUrl("");
    }
};

// MaixPy v4：舊碼是 v3 的 API（image.new、rotate(adjust=)、image.open），灰階靠 PIL 存檔再讀回來，
// 還寫死 320×240：從左上角裁 240×240。改成裁「短邊 × 短邊」的正方形、一樣從左上角，
// 320×240 進來裁出來跟舊版相同，640×480 就是 480×480。灰階改用 to_format，numpy 陣列用 image2cv
// （docs/doc/zh/vision/opencv.md），不落地中間檔。
// 舊碼還畫了一張 numpyResultcanvas 卻沒有回傳也沒有顯示，連同 224×224 那一步一起拿掉——辨識結果不受影響。
// 照舊沒有反白：MNIST 是黑底白字，紙上是白底黑字（舊碼就這樣，見票 07）
Blockly.Python['Numpy_Neural_Network_numpy_loading_model_fun'] = function (block) {
    var variable_name = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    Blockly.Python.definitions_['v831_import_image'] = `from maix import image`
    Blockly.Python.definitions_["v831_function_numpy_result"] = `def numpyResult(img: image.Image) -> np.integer:
    side = min(img.width(), img.height())
    digit = img.crop(0, 0, side, side).resize(28, 28).to_format(image.Format.FMT_GRAYSCALE)
    numpyResultImg = image.image2cv(digit, ensure_bgr=False, copy=True).reshape(1, 784).astype('int')
    numpyResultImg = numpyResultImg / 255 * 0.99 + 0.01
    print(numpyResultImg.shape)

    result = net_model.query(numpyResultImg)
    return result
`
    // TODO: Assemble Python into code variable.
    var code = `GETNUMPYRESULT = numpyResult(${variable_name})
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};


Blockly.Blocks['Numpy_Neural_Network_numpy_loading_model_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.numpy_mnist_get_result);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.numpy_mnist_get_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_numpy_loading_model_result'] = function (block) {
    var code = `GETNUMPYRESULT`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};
// 
Blockly.Blocks['Numpy_Neural_Network_numpy_clear'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.numpy_mnist_clear);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.numpy_mnist_clear);
        this.setHelpUrl("");
    }
};

Blockly.Python['Numpy_Neural_Network_numpy_clear'] = function (block) {
    numpyNNTrainedFlagDef();
    var code = `if os.path.exists(NUMPY_NN_TRAINED_FLAG):
    os.remove(NUMPY_NN_TRAINED_FLAG)
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

Blockly.Blocks["cocopi_chatGpt_init"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ChatGpt_init)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_init);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_CocoPi_Gpt'] = `try:
    from CocoPi import GPTrequest
except:
    import sys
    sys.path.append("/root/preset/drivers/pylib/")
    from GPTrequest import GPTrequest`
    Blockly.Python.definitions_['v831_import_CocoPi_Gpt_init'] = `gptInit = GPTrequest()`
    var code = ``;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};
Blockly.Blocks["cocopi_chatGpt_text_to_img_loading"] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.AIGC_select_model)
            .appendField(new Blockly.FieldDropdown([
                ["cogview-3", "cogview-3"],
                ["cogview-3-flash", "cogview-3-flash"],
                ["dall-e-3", "dall-e-3"],
                ["dall-e-2", "dall-e-2"],
            ]), "select_model");

        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_img_des);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_set_img_des);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_text_to_img_loading'] = function (block) {
    var model = block.getFieldValue('select_model');
    var text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable("TextContent", `TextContent = ""`, true)
    Blockly.Python.addVariable("text_to_img", `textToImgModel = "${model}"`, true)
    var code = `TextContent = ${text}
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};
Blockly.Blocks["cocopi_chatGpt_text_to_img_result"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ChatGpt_get_img_path_result);
        this.setOutput(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_get_img_path_result);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_text_to_img_result'] = function (block) {
    var code = `gptInit.get_text_to_img(TextContent)`;
    return [code, Blockly.Python.ORDER_ATOMIC];;
};

Blockly.Blocks["cocopi_chatGpt_image_to_text_loading"] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.AIGC_select_model)
            .appendField(new Blockly.FieldDropdown([
                ["4o", "gpt-4o"],
                ["4o-mini", "gpt-4o-mini"],
                ["qwen-vl-max", "qwen-vl-max"],
                ["qwen-vl-plus", "qwen-vl-plus"],
                // ["qwen-vl-ocr", "qwen-vl-ocr"],
                ["glm-4v", "glm-4v"],
                ["glm-4v-flash", "glm-4v-flash"],
            ]), "select_model");
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_text_path);
        this.appendValueInput("NAME1")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_text_text_content);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_set_text_path);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_image_to_text_loading'] = function (block) {
    var model = block.getFieldValue('select_model');
    var text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
    var content = Blockly.Python.valueToCode(block, 'NAME1', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable("IMAGEPATH", `IMAGEPATH = ""`, true)
    Blockly.Python.addVariable("IMAGECONTENT", `IMAGECONTENT = ""`, true)
    Blockly.Python.addVariable("imageToTextModel", `imageToTextModel = ""`, true)
    var code = `IMAGEPATH = ${text}
IMAGECONTENT = ${content}
imageToTextModel = "${model}"
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};
Blockly.Blocks["cocopi_chatGpt_image_to_text_result"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ChatGpt_get_text_content_result);
        this.setOutput(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_get_text_content_result);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_image_to_text_result'] = function (block) {
    var code = `gptInit.get_image_to_text(IMAGEPATH,IMAGECONTENT)`;
    return [code, Blockly.Python.ORDER_ATOMIC];;
};


Blockly.Blocks["cocopi_chatGpt_text_to_voice_loading"] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.AIGC_select_model)
            .appendField(new Blockly.FieldDropdown([
                ["tts-1", "tts-1"],
                ["tts-1-hd", "tts-1-hd"],
            ]), "select_model");
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_text_content);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_set_text_content);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_text_to_voice_loading'] = function (block) {
    var model = block.getFieldValue('select_model');
    var text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable("VOICECONTENT", `VOICECONTENT = ""`, true)
    Blockly.Python.addVariable("text_to_voice", `textToVoiceModel = ""`, true)
    var code = `VOICECONTENT = ${text}
textToVoiceModel = "${model}"
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};
Blockly.Blocks["cocopi_chatGpt_text_to_voice_result"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ChatGpt_get_voice_path_result);
        this.setOutput(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_get_voice_path_result);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_text_to_voice_result'] = function (block) {
    var code = `gptInit.get_text_to_voice(VOICECONTENT)`;
    return [code, Blockly.Python.ORDER_ATOMIC];;
};
Blockly.Blocks["cocopi_chatGpt_voice_to_text_loading"] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.AIGC_select_model)
            .appendField(new Blockly.FieldDropdown([
                ["tts-1", "tts-1"],
                ["tts-1-hd", "tts-1-hd"],
            ]), "select_model");
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_voice_path);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_set_voice_path);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_voice_to_text_loading'] = function (block) {
    var model = block.getFieldValue('select_model');
    var text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable("VOICEPATH", `VOICEPATH = ""`, true)
    Blockly.Python.addVariable("voiceToTextModel", `voiceToTextModel = ""`, true)
    var code = `VOICEPATH = ${text}
voiceToTextModel = ""
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};
Blockly.Blocks["cocopi_chatGpt_voice_to_text_result"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ChatGpt_get_voice_text_content_result);
        this.setOutput(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_get_voice_text_content_result);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_voice_to_text_result'] = function (block) {
    var code = `gptInit.get_voice_to_text(VOICEPATH)`;
    return [code, Blockly.Python.ORDER_ATOMIC];;
};
Blockly.Blocks["cocopi_chatGpt_post_chatgpt_loading"] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.AIGC_select_model)
            .appendField(new Blockly.FieldDropdown([
                ["deepseek-chat", "deepseek-chat"],
                ["4o", "gpt-4o"],
                ["4o-mini", "gpt-4o-mini"],
                ["qwen-max", "qwen-max"],
                ["qwen-turbo", "qwen-turbo"],
                ["qwen-max-longcontext", "qwen-max-longcontext"],
                ["qwen-long", "qwen-long"],
                ["qwen-plus", "qwen-plus"],
                ["glm-4-plus", "glm-4-plus"],
                ["glm-4-flash", "glm-4-flash"],
                ["llama3.2", "llama3.2"],
                ["deepseek-reasoner", "deepseek-reasoner"],
                ["deepseek-r1:latest", "deepseek-r1:latest"],
                ["deepseek-r1:8b", "deepseek-r1:8b"],
            ]), "select_model");
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_problem_content);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_set_problem_content);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_post_chatgpt_loading'] = function (block) {
    var model = block.getFieldValue('select_model');
    var text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable("CHATGPTPROBLEM", `CHATGPTPROBLEM = ""`, true)
    Blockly.Python.addVariable("chatGptModel", `chatGptModel = ""`, true)
    var code = `CHATGPTPROBLEM = ${text}
chatGptModel = "${model}"
`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};
Blockly.Blocks["cocopi_chatGpt_post_chatgpt_result"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ChatGpt_get_problem_result);
        this.setOutput(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_get_problem_result);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_post_chatgpt_result'] = function (block) {
    var code = `gptInit.get_post_chatgpt(CHATGPTPROBLEM)`;
    return [code, Blockly.Python.ORDER_ATOMIC];;
};
// 
Blockly.Blocks["cocopi_chatGpt_result"] = {
    init: function () {
        this.appendDummyInput()
            // .appendField(Blockly.Msg.ChatGpt_get_problem_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ChatGpt_get_img_path_result, "1"],
                [Blockly.Msg.ChatGpt_get_text_content_result, "2"],
                [Blockly.Msg.ChatGpt_get_voice_path_result, "3"],
                [Blockly.Msg.ChatGpt_get_voice_text_content_result, "4"],
                [Blockly.Msg.ChatGpt_get_problem_result, "5"],
                [Blockly.Msg.ChatGpt_ai_agent_chat_result, "6"]
            ]), "gpt_return");
        this.setOutput(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_get_problem_result);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_result'] = function (block) {
    var queue_value = block.getFieldValue('gpt_return');
    var res = ``;
    let resModel = ""
    if (queue_value == 5) {
        res = `gptInit.get_post_chatgpt(CHATGPTPROBLEM,chatGptModel)`
        resModel = `gptInit.get_post_chatgpt(CHATGPTPROBLEM)`
    } else if (queue_value == 4) {
        res = `gptInit.get_voice_to_text(VOICEPATH,voiceToTextModel)`
        resModel = `gptInit.get_voice_to_text(VOICEPATH)`
    } else if (queue_value == 3) {
        res = `gptInit.get_text_to_voice(VOICECONTENT,textToVoiceModel)`
        resModel = `gptInit.get_text_to_voice(VOICECONTENT)`
    } else if (queue_value == 2) {
        res = `gptInit.get_image_to_text(IMAGEPATH,IMAGECONTENT,imageToTextModel)`
        resModel = `gptInit.get_image_to_text(IMAGEPATH,IMAGECONTENT)`
    } else if (queue_value == 1) {
        res = `gptInit.get_text_to_img(TextContent,textToImgModel)`
        resModel = `gptInit.get_text_to_img(TextContent)`
    }
    else if (queue_value == 6) {
        res = `gptInit.get_post_AI_Intelligence(AIAGENTCHATID,AIAGENTCHATMESSAGE,AIAGENTMODEL)`
        resModel = `gptInit.get_post_AI_Intelligence(AIAGENTCHATID,AIAGENTCHATMESSAGE)`
    }
    Blockly.Python.definitions_["CocoPiGPTRESULTFUNC" + queue_value] = `def CocoPiGPTRESULTFUNC${queue_value}():
    try:
        CocoPiGPTRESULT = ${res}
    except:
        CocoPiGPTRESULT = ${resModel}
    return CocoPiGPTRESULT
    `
    var code = `CocoPiGPTRESULTFUNC${queue_value}()`;
    return [code, Blockly.Python.ORDER_ATOMIC];;
};


Blockly.Blocks["cocopi_chatGpt_AI_loading"] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.AIGC_select_model)
            .appendField(new Blockly.FieldDropdown([
                ["4o-mini", "gpt-4o-mini"],
                ["4o", "gpt-4o"],
            ]), "select_model");
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_ai_agent_chat_set_appID);
        this.appendValueInput("NAME1")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_text_text_content);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.ChatGpt_set_text_path);
        this.setHelpUrl("");
    }
};
Blockly.Python['cocopi_chatGpt_AI_loading'] = function (block) {
    var model = block.getFieldValue('select_model');
    var text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
    var content = Blockly.Python.valueToCode(block, 'NAME1', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable("AIAGENTCHATID", `AIAGENTCHATID = ""`, true)
    Blockly.Python.addVariable("AIAGENTCHATMESSAGE", `AIAGENTCHATMESSAGE = ""`, true)
    Blockly.Python.addVariable("AIAGENTMODEL", `AIAGENTMODEL = ""`, true)
    var code = `AIAGENTCHATID = ${text}
AIAGENTCHATMESSAGE = ${content}
AIAGENTMODEL = "${model}"
`
    return code;
};
// 设置ai聊天机器人的url文件名
Blockly.Blocks["set_cocopi_agent_file_name"] = {
    init: function () {
        this.appendValueInput("fileName")
            .setCheck(null)
            .appendField(Blockly.Msg.set_cocopi_agent_file_name);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.set_cocopi_agent_file_name);
        this.setHelpUrl("");
    }
};
Blockly.Python['set_cocopi_agent_file_name'] = function (block) {
    var text = Blockly.Python.valueToCode(block, 'fileName', Blockly.Python.ORDER_ATOMIC);
    localStorage.setItem("cocopi_agent_file_name", text);
    var code = `set_cocopi_agent_file_name = True \n`;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

// 获取aigent 代码并执行
Blockly.Blocks["get_cocopi_agent_exec"] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.get_cocopi_agent_exec_title);
        this.appendValueInput("message")
            .setCheck(null)
            .appendField(Blockly.Msg.get_cocopi_agent_exec_message);
        this.appendValueInput("packages")
            .setCheck(null)
            .appendField(Blockly.Msg.get_cocopi_agent_exec_packages);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#7e3cca");
        this.setTooltip(Blockly.Msg.get_cocopi_agent_exec_title);
        this.setHelpUrl("");
    }
};
Blockly.Python['get_cocopi_agent_exec'] = function (block) {
    var message = Blockly.Python.valueToCode(block, 'message', Blockly.Python.ORDER_ATOMIC);
    var packages = Blockly.Python.valueToCode(block, 'packages', Blockly.Python.ORDER_ATOMIC);
    let packagesArr = JSON.parse(packages)
    console.log(packagesArr)
    let packagesStr = ""
    packagesArr.map((a) => {
        packagesStr += `import ${a} \n`
    })
    Blockly.Python.definitions_['import_cocopi_requests'] = 'import requests';
    Blockly.Python.definitions_['import_cocopi_os'] = 'import os';
    var code = `import sys
sys.path.append("/root/user/app/")
${packagesStr}

url = "http://gpt4.cocorobo.cn/mini_pi/gen_code"
cmd="cat /sys/class/sunxi_info/sys_info"
rec=os.popen(cmd).read()
hwMac=rec[rec.find("sunxi_serial      : ")+20:rec.find("sunxi_serial      : ")+52]
params = {
    "sn":hwMac,
    "message":${message},
    "packages": ${packages}
}

try:
    response = requests.post(url, json=params)  # 确保替换为正确的URL
    if response.status_code == 200:
        try:
            exec(response.text)
        except Exception as e:
            print(f"执行响应文本时发生错误: {e}")
    else:
        print(f"请求错误，状态码：{response.status_code}")
except requests.exceptions.RequestException as e:
    print(f"网络请求错误: {e}")
   `;
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

// 智能体线程
Blockly.Blocks['cocopi_chatGpt_AI_loading_cocoFlow'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.AIGC_select_model)
            .appendField(new Blockly.FieldDropdown([
                ["DeepSeek", "open-deepseek-chat"],
                ["DeepSeek-R1", "open-deepseek-reasoner"],
                ["4.1", "open-gpt-4.1"],
                ["4.1-mini", "open-gpt-4.1-mini"],
                ["4.1-nano", "open-gpt-4.1-nano"],
                ["4o-mini", "open-gpt-4o-mini"],
                ["4o-2024-11-20", "open-gpt-4o-2024-11-20"],
            ]), "select_model");
        this.appendValueInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_ai_agent_chat_set_appID);
        this.appendValueInput("NAME1")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_text_text_content_new);
        this.appendValueInput("userId")
            .setCheck(null)
            .appendField(Blockly.Msg.ChatGpt_set_userId);
        this.appendStatementInput("input")
            .setCheck(null)
            .appendField(Blockly.Msg.basic_motion_statement_exec);
        this.setColour("#7e3cca");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Msg.ai_system_thread_setting);
        this.setHelpUrl("");
    }
};

Blockly.Python['cocopi_chatGpt_AI_loading_cocoFlow'] = function (block) {
    Blockly.Python.definitions_['v831_import_uuid'] = `import uuid`;
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`;
    Blockly.Python.definitions_['v831_import_json'] = `import json`;
    Blockly.Python.definitions_['v831_import_os'] = `import os`;
    var model = block.getFieldValue('select_model');
    var statements_input = Blockly.Python.statementToCode(block, 'input');
    var text = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC);
    var content = Blockly.Python.valueToCode(block, 'NAME1', Blockly.Python.ORDER_ATOMIC);
    var userId = Blockly.Python.valueToCode(block, 'userId', Blockly.Python.ORDER_ATOMIC);
    let allBlocks = block.workspace.getAllBlocks();
    let global = ""
    try {
        global = allBlocks[0].workspace.variableList.toString()
    }
    catch (e) {
        console.log(e)
    }
    Blockly.Python.definitions_['cocopi_chatGpt_AI_loading_cocoFlow'] = `def cocopi_chatGpt_AI_loading_cocoFlow(text, content, userId, model):
    global ${global}
    url = "https://appapi.cocorobo.cn/api/agentchats/ai_agent_chat"
    uid = str(uuid.uuid1().hex)
    cmd="cat /sys/class/sunxi_info/sys_info"
    rec=os.popen(cmd).read()
    hwMac=rec[rec.find("sunxi_serial      : ")+20:rec.find("sunxi_serial      : ")+52]

    params = {
        "id": text,
        "message": content,
        "userId": userId,
        "model": model,
        "file_ids": [],
        "sound_url": "",
        "temperature": 0.2,
        "top_p": 1,
        "max_completion_tokens": 4096,
        "stream": "true",
        "uid": uid,
    }
    headers={
        "Content-Type":"application/json",
        "hwMac":hwMac,
        'Accept': 'text/event-stream'
    }
    cocoFlowResult = ""
    try:
        with requests.post(url, headers=headers, data=json.dumps(params), stream=True) as response:
            response.raise_for_status()
            for line in response.iter_lines():
                try:
                    if line:
                        line = line.decode('UTF-8')
                        data = line[len('data:'):].strip()
                        data = json.loads(data)
                        if data and data['content'] != '[DONE]':
                            cocoFlowResult += data['content'].replace(" ", "").replace("\\n", "").replace("\\t", "").replace("*", "")
                            cocopi_chatGpt_AI_loading_cocoFlow_shwo()
                    
                except json.JSONDecodeError as e:   
                    print("JSON解析错误:", e)
    except:
        print("请求错误")

`
    Blockly.Python.definitions_['cocopi_chatGpt_AI_loading_cocoFlow_shwo'] = `def cocopi_chatGpt_AI_loading_cocoFlow_shwo():
    global ${global}
${statements_input}
`
    var code = `cocopi_chatGpt_AI_loading_cocoFlow(${text},${content},${userId},"${model}")\n`;
    return code;
};


// 智能体线程
Blockly.Blocks['cocopi_chatGpt_AI_loading_cocoFlow_result'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.ChatGpt_cocoFlow_result)
        this.setColour("#7e3cca");
        this.setOutput(true, null);
        this.setTooltip(Blockly.Msg.ChatGpt_cocoFlow_result);
        this.setHelpUrl("");
    }
};

Blockly.Python['cocopi_chatGpt_AI_loading_cocoFlow_result'] = function (block) {
    Blockly.Python.addVariable("cocoFlowResult", `cocoFlowResult = ""`, true)
    var code = `cocoFlowResult`;
    return [code, Blockly.Python.ORDER_NONE];
};
