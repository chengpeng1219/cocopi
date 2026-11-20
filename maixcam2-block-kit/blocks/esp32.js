/* additional text */

Blockly.Blocks['text_split_string_by_delimiter'] = {
    init: function () {
        this.appendValueInput("string_input")
            .setCheck(null)
            .appendField(Blockly.Msg.text_additional_delimiter_string);
        this.appendDummyInput()
            .appendField(Blockly.Msg.text_additional_delimiter_deli)
            .appendField(new Blockly.FieldTextInput(","), "delimiter")
            .appendField(Blockly.Msg.text_additional_delimiter_end);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#33cc99");
        this.setTooltip(Blockly.Msg.Text_Split_String_By_Delimiter_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['text_split_string_by_delimiter'] = function (block) {
    var value_string_input = Blockly.Python.valueToCode(block, 'string_input', Blockly.Python.ORDER_ATOMIC);
    var text_delimiter = block.getFieldValue('delimiter');
    // TODO: Assemble Python into code variable.
    var code = value_string_input + '.split("' + text_delimiter + '")';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

/* additional math */
Blockly.Blocks['math_degrad'] = {
    init: function () {
        this.appendValueInput("convert")
            .setCheck(null)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.math_degrad_rad, "radians"],
                [Blockly.Msg.math_degrad_deg, "degrees"]
            ]), "rad_deg");
        this.setOutput(true, null);
        this.setColour("#5472ea");
        // this.setTooltip("");
        this.setHelpUrl("");

        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('rad_deg');
            var TOOLTIPS = {
                'radians': Blockly.Msg.Math_Degrad_RAD_TOOLTIP,
                'degrees': Blockly.Msg.Math_Degrad_DEG_TOOLTIP
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['math_degrad'] = function (block) {
    var dropdown_rad_deg = block.getFieldValue('rad_deg');
    var value_convert = Blockly.Python.valueToCode(block, 'convert', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['import_math'] = 'import math\n';

    var code = 'math.' + dropdown_rad_deg + '(' + value_convert + ')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

/* Serial Comm. */

Blockly.Blocks['serial_comm_print'] = {
    init: function () {
        this.appendValueInput("serial_comm_input")
            .setCheck("String")
            .appendField(Blockly.Msg.serialcomm_print);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#22b845");
        this.setTooltip(Blockly.Msg.serial_Comm_Print_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['serial_comm_print'] = function (block) {
    var value_name = Blockly.Python.valueToCode(block, 'serial_comm_input', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'print(' + value_name + ')\n';
    return code;
};


Blockly.Blocks['serial_send_data_to_control_panel'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/control.png", 90, 70, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.serialcomm_write_data_bps_title)
            .appendField("9600")
            .appendField(Blockly.Msg.serialcomm_write_data_bps_attrib);
        this.appendValueInput("NAME")
            // .appendField(Blockly.Msg.serial_send_data_on)
            .appendField(Blockly.Msg.serial_send_data_on_send_data_control_panel);
        this.setInputsInline(false);
        this.setColour("#22b845");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setHelpUrl("");
        this.setTooltip(Blockly.Msg.serial_send_data_on_send_data_control_panel);
    }
};

Blockly.Python['serial_send_data_to_control_panel'] = function (block) {
    var value_name = Blockly.Python.valueToCode(block, 'NAME', Blockly.Python.ORDER_ATOMIC) || "";
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['maixcam2_uart_tx'] = `from maix import uart
SERIAL_TX = uart.UART("/dev/ttyS4", 9600)
`
    var code = `SERIAL_TX.write_str(str(${value_name}) + "\\n")
`;

    return code;

};

/*
INPUT & OUTPUT
*/

var ESP32_IO_COLOR = "#ff8027";

Blockly.Blocks['esp32_main_controller_text_print'] = {

    init: function () {
        this.jsonInit({
            "message0": Blockly.Msg.TEXT_PRINT_TITLE,
            "args0": [{
                "type": "input_value",
                "name": "TEXT"
            }],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#33cc99",
            "tooltip": Blockly.Msg.TEXT_PRINT_TOOLTIP,
            "helpUrl": Blockly.Msg.TEXT_PRINT_HELPURL
        });
    }
};

Blockly.Python['esp32_main_controller_text_print'] = function (block) {
    // Print statement.
    var msg = Blockly.Python.valueToCode(block, 'TEXT',
        Blockly.Python.ORDER_NONE) || '___';
    return 'print(' + msg + ')\n';
};

Blockly.Blocks['esp32_main_controller_text'] = {

    init: function () {
        this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
        this.setColour("#33cc99");
        this.appendDummyInput()
            .appendField(this.newQuote_(true))
            .appendField(new Blockly.FieldTextInput(''), 'TEXT')
            .appendField(this.newQuote_(false));
        this.setOutput(true, 'String');
        // Assign 'this' to a variable for use in the tooltip closure below.
        var thisBlock = this;
        // Text block is trivial.  Use tooltip of parent block if it exists.
        this.setTooltip(function () {
            var parent = thisBlock.getParent();
            return (parent && parent.getInputsInline() && parent.tooltip) ||
                Blockly.Msg.TEXT_TEXT_TOOLTIP;
        });
    },
    newQuote_: function (open) {
        if (open == this.RTL) {
            var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==';
        } else {
            var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC';
        }
        return new Blockly.FieldImage(file, 12, 12, '"');
    }
};

Blockly.Python['esp32_main_controller_text'] = function (block) {
    // Text value.
    var code = Blockly.Python.quote_(block.getFieldValue('TEXT'));
    return [code, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Blocks['esp32_main_controller_io_from_digital_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.digital_get)
            .appendField(new Blockly.FieldDropdown([
                ["S1", "1"],
                ["S2", "2"],
                ["PH7", "7"],
                ["PH8", "8"],
                ["PH13", "13"],
                ["CLK", "PC0"],
                ["CS0", "PC1"],
                ["MOSI", "PC2"],
                ["MISO", "PC3"],
                ["TXD", "PG6"],
                ["RXD", "PG7"],
                ["P0", "21"],
                ["P1", "22"],
                ["P2", "23"],
                ["P3", "24"],
                ["A0", "25"],
                ["A1", "26"],
                ["A2", "27"],
                ["A3", "28"]
            ]), "analog_pin");
        this.appendDummyInput()
            .appendField(Blockly.Msg.digital_get_value);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        this.setTooltip("");
    }
};

Blockly.Python['esp32_main_controller_io_from_digital_pin'] = function (block) {
    var value_name = block.getFieldValue('analog_pin');
    // TODO: Assemble Python into code variable.
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    var code = ""
    if (value_name == 2 || value_name == 1) {
        // S1/S2 是舊機的接口，新擴充板上沒有
        Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
        Blockly.Python.definitions_['v831_import_CocoPi_multiFuncGpio'] = `from CocoPi import multiFuncGpio`;
        Blockly.Python.addVariable('_Math_gpio_' + value_name, `_Math_gpio_${value_name} = multiFuncGpio(${value_name - 1},2)`, true);
        code = `_Math_gpio_${value_name}.digitalRead()`;
    } else if (value_name == "PG6" || value_name == "PG7" || value_name == "PC0" || value_name == "PC1" || value_name == "PC2" || value_name == "PC3") {
        // Blockly.Python

        Blockly.Python.addFunction("pinMode", `def pinMode(pin,mode):
    os.system(f"echo {pin} {mode} > /sys/kernel/debug/sunxi_pinctrl/function")
`)
        Blockly.Python.addFunction("digitalWrite", `def digitalWrite(pin,level):
    if pin == "PC1" or pin == "PC0" or pin == "PC2" or pin == "PC3":
        os.system(f"echo {pin} 1 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system(f"echo {pin} {level} > /sys/kernel/debug/sunxi_pinctrl/data")
`)
        Blockly.Python.addFunction("digitalRead", `def digitalRead(pin):
    if pin == "PC1" or pin == "PC0" or pin == "PC2" or pin == "PC3":
        os.system("echo {pin} 2 >  /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system(f"echo {pin}  > /sys/kernel/debug/sunxi_pinctrl/sunxi_pin")
    return int(os.popen("cat /sys/kernel/debug/sunxi_pinctrl/data").read()[-2:])
`)
        Blockly.Python.addFunction("setToSpi", `def setToSpi():
    os.system("echo PC0 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC1 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC2 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC3 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC0 0 > /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system("echo PC1 1 > /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system("echo PC2 0 > /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system("echo PC3 0 > /sys/kernel/debug/sunxi_pinctrl/pull")
`)
        Blockly.Python.addFunction("setToSerial", `def setToSerial():
    os.system("echo PG6 5 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PG7 5 > /sys/kernel/debug/sunxi_pinctrl/function")
`)
        Blockly.Python.addVariable(`pinMode${value_name}`, `pinMode("${value_name}","0")`, true)
        code = `digitalRead("${value_name}")`
    }
    else if (value_name == 7 || value_name == 8 || value_name == 13) {
        Blockly.Python.definitions_['v831_import_CocoPi_BUTTON'] = `from CocoPi import BUTTON `;
        Blockly.Python.addFunction("getBUTTONNum", `def getBUTTONNum(data):
    if data:
        return 0
    else:
        return 1
`)
        Blockly.Python.addVariable('_Math_gpio_' + value_name, `_Math_gpio_${value_name} = BUTTON(${value_name})`, true);
        code = `getBUTTONNum(_Math_gpio_${value_name}.is_pressed())`;
    } else {
        let gpioNum = value_name - 21
        Blockly.Python.definitions_['v831_import_CocoPi_pca'] = `from CocoPi import PCA9685, extServo, i2c_bus`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio'] = `from CocoPi import extGpio`;
        Blockly.Python.definitions_['v831_pca9685_init'] = `_ext_pca = PCA9685(i2c_bus, freq=400, min_us=460, max_us=2400, address=0x40)`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio_init'] = `_ext_gpio = extGpio(_ext_pca)`;
        Blockly.Python.addVariable('InputGpio' + value_name, `_ext_gpio.pinMode(${gpioNum},0)`, true);

        code = `_ext_gpio.digitalRead(${gpioNum})`
    }

    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_io_high_low'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.io_high, "1"],
                [Blockly.Msg.io_low, "0"]
            ]), "high_low");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('high_low');
            var TOOLTIPS = {
                '1': Blockly.Msg.Esp32_Main_Controller_Io_High_Low_TOOLTIP.replace('%1', Blockly.Msg.io_high),
                '0': Blockly.Msg.Esp32_Main_Controller_Io_High_Low_TOOLTIP.replace('%1', Blockly.Msg.io_low)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_io_high_low'] = function (block) {
    var dropdown_name = block.getFieldValue('high_low');
    // TODO: Assemble Python into code variable.
    var code = dropdown_name;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['esp32_main_controller_io_analog_pin_1'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.Esp32_Main_Controller_Io_analog_pin_1)
            .appendField(new Blockly.FieldDropdown([
                ["0", "0"],
                ["1", "1"],
                ["2", "2"],
                ["3", "3"],
                ["13", "13"],
                ["14", "14"],
                ["15", "15"],
                ["17", "17"],
                ["21", "21"],
                ["22", "22"],
                ["23", "23"],
                ["24", "24"],
                ["29", "29"],
                ["30", "30"]
            ]), "analog_pin");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('analog_pin');
            var TOOLTIPS = {
                '0': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '0'),
                '1': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '1'),
                '2': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '2'),
                '3': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '3'),
                '13': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '13'),
                '14': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '14'),
                '15': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '15'),
                '17': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '17'),
                '21': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '21'),
                '22': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '22'),
                '23': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '23'),
                '24': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '24'),
                '29': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '29'),
                '30': Blockly.Msg.esp32_main_controller_io_analog_pin_1_TOOLTIP.replace('%1', '30')
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_io_analog_pin_1'] = function (block) {
    var dropdown_name = block.getFieldValue('analog_pin');
    // TODO: Assemble Python into code variable.
    var code = dropdown_name;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['esp32_main_controller_io_analog_pin_2'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.Esp32_Main_Controller_Io_analog_pin_2)
            .appendField(new Blockly.FieldDropdown([
                ["4", "4"],
                ["12", "12"],
                ["13", "13"],
                ["14", "14"],
                ["15", "15"],
                ["16", "16"],
                ["17", "17"],
                ["21", "21"],
                ["22", "22"],
                ["25", "25"],
                ["27", "27"],
                ["34", "34"],
                ["35", "35"],
                ["36", "36"]
            ]), "analog_pin");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('analog_pin');
            var TOOLTIPS = {
                '4': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '4'),
                '12': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '12'),
                '13': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '13'),
                '14': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '14'),
                '15': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '15'),
                '16': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '16'),
                '17': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '17'),
                '21': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '21'),
                '22': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '22'),
                '25': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '25'),
                '27': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '27'),
                '34': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '34'),
                '35': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '35'),
                '36': Blockly.Msg.esp32_main_controller_io_analog_pin_2_TOOLTIP.replace('%1', '36')
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_io_analog_pin_2'] = function (block) {
    var dropdown_name = block.getFieldValue('analog_pin');
    // TODO: Assemble Python into code variable.
    var code = dropdown_name;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['esp32_main_controller_io_set_digital_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("")
            .appendField(Blockly.Msg.digital_set);
        this.appendDummyInput()
            .appendField("")
            .appendField(new Blockly.FieldDropdown([
                ["S1", "1"],
                ["S2", "2"],
                ["CLK", "PC0"],
                ["CS0", "PC1"],
                ["MOSI", "PC2"],
                ["MISO", "PC3"],
                ["TXD", "PG6"],
                ["RXD", "PG7"],
                ["P0", "10"],
                ["P1", "11"],
                ["P2", "12"],
                ["P3", "13"],
                ["A0", "14"],
                ["A1", "15"],
                ["A2", "16"],
                ["A3", "17"]
                // ["3", "231"],
                // ["4", "232"],
                // ["5", "237"],
                // ["6", "238"]
            ]), "digital_set_type_gpio").appendField("");
        this.appendDummyInput()
            .appendField(Blockly.Msg.digital_set_as);
        this.appendValueInput("high_low")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('digital_set_type');
            var TOOLTIPS = {
                '1': Blockly.Msg.Esp32_Main_Controller_Io_Set_Digital_Pin_TOOLTIP.replace('%1', Blockly.Msg.time_iot_module),
                '2': Blockly.Msg.Esp32_Main_Controller_Io_Set_Digital_Pin_TOOLTIP.replace('%1', Blockly.Msg.time_ai_module)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_io_set_digital_pin'] = function (block) {
    var high_low = Blockly.Python.valueToCode(block, 'high_low', Blockly.Python.ORDER_ATOMIC).slice(1, 2);
    var timer_type = block.getFieldValue('digital_set_type');
    let value_name = block.getFieldValue('digital_set_type_gpio');

    Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
    Blockly.Python.definitions_['v831_import_time'] = `import time`;
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    var code = ''
    if (value_name == 2 || value_name == 1) {
        Blockly.Python.definitions_['v831_import_CocoPi_multiFuncGpio'] = `from CocoPi import multiFuncGpio`;
        Blockly.Python.addVariable('MATHOUT' + value_name, `MATHOUT${value_name} = multiFuncGpio(${value_name - 1},3)`, true);
        code = `MATHOUT${value_name}.digitalWrite(${high_low})
`
    } else if (value_name == "PG6" || value_name == "PG7" || value_name == "PC0" || value_name == "PC1" || value_name == "PC2" || value_name == "PC3") {

        Blockly.Python.addFunction("pinMode", `def pinMode(pin,mode):
    os.system(f"echo {pin} {mode} > /sys/kernel/debug/sunxi_pinctrl/function")
`)
        Blockly.Python.addFunction("digitalWrite", `def digitalWrite(pin,level):
    if pin == "PC1" or pin == "PC0" or pin == "PC2" or pin == "PC3":
        os.system(f"echo {pin} 1 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system(f"echo {pin} {level} > /sys/kernel/debug/sunxi_pinctrl/data")
`)
        Blockly.Python.addFunction("digitalRead", `def digitalRead(pin):
    if pin == "PC1" or pin == "PC0" or pin == "PC2" or pin == "PC3":
        os.system("echo {pin} 2 >  /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system(f"echo {pin}  > /sys/kernel/debug/sunxi_pinctrl/sunxi_pin")
    return int(os.popen("cat /sys/kernel/debug/sunxi_pinctrl/data").read()[-2:])
`)
        Blockly.Python.addFunction("setToSpi", `def setToSpi():
    os.system("echo PC0 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC1 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC2 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC3 4 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PC0 0 > /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system("echo PC1 1 > /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system("echo PC2 0 > /sys/kernel/debug/sunxi_pinctrl/pull")
    os.system("echo PC3 0 > /sys/kernel/debug/sunxi_pinctrl/pull")
`)
        Blockly.Python.addFunction("setToSerial", `def setToSerial():
    os.system("echo PG6 5 > /sys/kernel/debug/sunxi_pinctrl/function")
    os.system("echo PG7 5 > /sys/kernel/debug/sunxi_pinctrl/function")
`)
        high_low = 1 - high_low
        if (value_name == "PG6" || value_name == "PG7") {
            Blockly.Python.addVariable(`pinModeOut${value_name}`, `pinMode("${value_name}","1")`, false)
        } else {
            Blockly.Python.addVariable(`pinModeOut${value_name}`, `pinMode("${value_name}","0")`, false)
        }

        code = `digitalWrite("${value_name}","${high_low}")
`
    } else {
        let gpioNum = value_name - 10
        Blockly.Python.definitions_['v831_import_CocoPi_pca'] = `from CocoPi import PCA9685, extServo, i2c_bus`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio'] = `from CocoPi import extGpio`;
        Blockly.Python.definitions_['v831_pca9685_init'] = `_ext_pca = PCA9685(i2c_bus, freq=400, min_us=460, max_us=2400, address=0x40)`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio_init'] = `_ext_gpio = extGpio(_ext_pca)`;
        Blockly.Python.addVariable('ExtGpio' + value_name, `_ext_gpio.pinMode(${gpioNum},1)`, true);
        code = `_ext_gpio.digitalWrite(${gpioNum},${high_low})\n`
    }



    return code;
};



Blockly.Blocks['esp32_main_controller_io_out_pwm'] = {
    init: function () {
        let types = getLocalStorage("type")
        types == 1 ? this.appendDummyInput()
            .appendField("")
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.time_ai_module, "2"],
                [Blockly.Msg.time_iot_module, "1"]
            ]), "digital_set_type")
            .appendField(Blockly.Msg.digital_set) :
            this.appendDummyInput()
                .appendField("")
                .appendField(new Blockly.FieldDropdown([
                    [Blockly.Msg.time_iot_module, "1"],
                    [Blockly.Msg.time_ai_module, "2"]
                ]), "digital_set_type")
                .appendField(Blockly.Msg.digital_set);
        this.appendDummyInput()
            .appendField("")
            .appendField(new Blockly.FieldDropdown([
                ['6', '6'],
                ['7', '7'],
                ['8', '8']
            ]), "digital_set_type_gpio").appendField(Blockly.Msg.OUT_PWM);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('digital_set_type');
            var TOOLTIPS = {
                '1': Blockly.Msg.Esp32_Main_Controller_Io_Set_Digital_Pin_TOOLTIP.replace('%1', Blockly.Msg.time_iot_module),
                '2': Blockly.Msg.Esp32_Main_Controller_Io_Set_Digital_Pin_TOOLTIP.replace('%1', Blockly.Msg.time_ai_module)
            };
            return TOOLTIPS[mode];
        });
    }
}

Blockly.Python['esp32_main_controller_io_out_pwm'] = function (block) {
    var value_name1 = Blockly.Python.valueToCode(block, 'digital_pin_input', Blockly.Python.ORDER_ATOMIC);
    var value_name2 = Blockly.Python.valueToCode(block, 'high_low', Blockly.Python.ORDER_ATOMIC).slice(1, 2);
    var timer_type = block.getFieldValue('digital_set_type');
    let digital_set_type_gpio = block.getFieldValue('digital_set_type_gpio');

    var code = "";
    if (timer_type == 1) {

        // TODO: Assemble Python into code variable.
        Blockly.Python.definitions_['import_main_controller_io_out_pwm'] = '' +
            'from machine import Pin\n' +
            '';
        let variable = '_PIN_OUT_' + value_name1 + ' = Pin(' + value_name1 + ', Pin.OUT)\n'
        Blockly.Python.addVariable('_PIN_OUT_' + value_name1, variable, true);
        code = '_PIN_OUT_' + value_name1 + '.value' + value_name2 + '\n';
    } else if (timer_type == 2) {
        Blockly.Python.definitions_['v831_import_time'] = `import time`
        Blockly.Python.definitions_['import_main_controller_io_out_pwm'] = '' +
            'from Maix import pwm\n' +
            'def numberMap(value, leftMin, leftMax, rightMin, rightMax):\n' +
            '    leftSpan = leftMax - leftMin\n' +
            '    rightSpan = rightMax - rightMin\n' +
            '    valueScaled = float(value - leftMin) / float(leftSpan)\n' +
            '    return rightMin + (valueScaled * rightSpan)\n' +
            '';
        // let variable = 'fm.register(' + value_name1 + ',fm.fpioa.GPIOHS' + value_name1 + ')\n' +
        //     '_set_ai_ext_pin' + value_name1 + ' = GPIO(GPIO.GPIOHS' + value_name1 + ', GPIO.OUT)\n'
        // Blockly.Python.addVariable('_set_ai_ext_pin' + value_name1, variable, true);
        code = 'pwm6.PWM(' + digital_set_type_gpio + ')\n' + // 配置PWM引脚，可用引脚：6、7、8
            'pwm6.export()\n' +
            'pwm6.period = 20000000 \n' + //表示 pwm 的周期，单位 ns
            'pwm_6_value=0\n' +
            'pwm_6.duty_cycle = numberMap(pwm_6_value,0,1023,0,20000000)\n' + // # 表示占空比，单位 ns，map函数
            'pwm6.duty_cycle = 500000\n' +
            'pwm6.enable = True';  // 表示是否使能 pwm
    }
    return code;
}
Blockly.Blocks['esp32_main_controller_io_from_analog_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.analog_get)
            .appendField(new Blockly.FieldDropdown([
                ["S1", "1"],
                ["S2", "2"],
                ["A0", "4"],
                ["A1", "5"],
                ["A2", "6"],
                ["A3", "7"]
            ]), "gpio");
        this.appendDummyInput()
            .appendField(Blockly.Msg.analog_get_value);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Io_From_Analog_Pin_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_io_from_analog_pin'] = function (block) {
    // var value_name = Blockly.Python.valueToCode(block, 'analog_pin_input', Blockly.Python.ORDER_ATOMIC);
    var value_gpio = block.getFieldValue('gpio');
    // TODO: Assemble Python into code variable.
    //Blockly.Python.addVariable('_PWM_PIN_IN_' + value_name, '_PWM_PIN_IN_' + value_name + '=None', true);
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    var code = ""
    if (value_gpio == 1 || value_gpio == 2) {
        // S1/S2 是舊機的接口，新擴充板上沒有
        Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
        Blockly.Python.definitions_['v831_import_CocoPi_multiFuncGpio'] = `from CocoPi import multiFuncGpio`;
        Blockly.Python.addVariable('_PWN_gpio_' + value_gpio, `_PWN_gpio_${value_gpio} = multiFuncGpio(${value_gpio - 1},4)`, true);
        code = `_PWN_gpio_${value_gpio}.analogRead()`;
    } else {
        Blockly.Python.definitions_['v831_import_CocoPi_pca'] = `from CocoPi import PCA9685, extServo, i2c_bus`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio'] = `from CocoPi import extGpio`;
        Blockly.Python.definitions_['v831_pca9685_init'] = `_ext_pca = PCA9685(i2c_bus, freq=400, min_us=460, max_us=2400, address=0x40)`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio_init'] = `_ext_gpio = extGpio(_ext_pca)`;
        Blockly.Python.addVariable('InputGpio' + value_gpio, `_ext_gpio.pinMode(${value_gpio},0)`, true);
        code = `_ext_gpio.analogRead(${value_gpio})`;
    }

    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


Blockly.Blocks['esp32_main_controller_io_set_analog_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.digital_set)
            .appendField(new Blockly.FieldDropdown([
                ["S1", "1"],
                ["S2", "2"],
                ["A0", "4"],
                ["A1", "5"],
                ["A2", "6"],
                ["A3", "7"]
                // ["7", "7"],
                // ["8", "8"],
                // ["9", "9"],
                // ["10", "10"],
                // ["11", "11"],
                // ["12", "12"]
            ]), "gpio");
        this.appendValueInput("pwm")
            .appendField(Blockly.Msg.set_pwm)
            .setCheck(null);
        this.appendDummyInput().appendField(Blockly.Msg.esp32_expand_io_set_analog_pin_digital_set_af)
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('LED');
            var TOOLTIPS = {
                'LED': Blockly.Msg.Esp32_Main_Controller_Io_Set_Analog_Pin_TOOLTIP.replace('%1', Blockly.Msg.led)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_io_set_analog_pin'] = function (block) {
    var value_name1 = block.getFieldValue('gpio');
    var value_name2 = Blockly.Python.valueToCode(block, 'pwm', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_smbus2'] = `import smbus2`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    var code = ""
    if (value_name1 == 1 || value_name1 == 2) {
        Blockly.Python.definitions_['v831_import_CocoPi_multiFuncGpio'] = `from CocoPi import multiFuncGpio`;
        Blockly.Python.addVariable('PWNOUT_' + value_name1, `PWNOUT_${value_name1} = multiFuncGpio(${value_name1 - 1},5)`, true);
        code = `PWNOUT_${value_name1}.analogWrite(${value_name2})\n`;
    } else {
        let num = value_name1 - 4
        Blockly.Python.definitions_['v831_import_CocoPi_pca'] = `from CocoPi import PCA9685, extServo, i2c_bus`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio'] = `from CocoPi import extGpio`;
        Blockly.Python.definitions_['v831_pca9685_init'] = `_ext_pca = PCA9685(i2c_bus, freq=400, min_us=460, max_us=2400, address=0x40)`
        Blockly.Python.definitions_['v831_import_CocoPi_extGpio_init'] = `_ext_gpio = extGpio(_ext_pca)`;
        Blockly.Python.addVariable('InputGpio' + value_name1, `_ext_gpio.pinMode(${value_name1},1)`, true);
        code = `_ext_gpio.analogWrite(${num},${value_name2})\n`;
    }

    return code;
};


Blockly.Blocks['ai_main_controller_io_set_analog_pin'] = {
    init: function () {
        var _en = true;
        for (var i = 0; i < ids.length; i++) {
            if (!ids[i]) {
                _en = false;
            }
        }
        this.disabled = ids.length > 11 && _en ? true : false;
        this.appendValueInput("analog_pin_input")
            .appendField(Blockly.Msg.analog_set_ai)
            .setCheck(null);
        // this.appendValueInput("frequency")
        //     .appendField(Blockly.Msg.analog_set_freq)
        //     .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.control)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.led, "LED"]
            ]), "LED");

        this.appendValueInput("pwm")
            .appendField(Blockly.Msg.set_pwm)
            .setCheck(null);
        // this.appendValueInput("timer")
        //     .appendField(Blockly.Msg.analog_set_timer)
        //     .setCheck(null);
        // this.appendValueInput("channel")
        //     .appendField(Blockly.Msg.analog_set_timer_channel)
        //     .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_IO_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('LED');
            var TOOLTIPS = {
                'LED': Blockly.Msg.Ai_Main_Controller_Io_Set_Analog_Pin_TOOLTIP.replace('%1', Blockly.Msg.led)
            };
            return TOOLTIPS[mode];
        });
    }
};

var ids = [];

Blockly.Python['ai_main_controller_io_set_analog_pin'] = function (block) {
    var value_name1 = Blockly.Python.valueToCode(block, 'analog_pin_input', Blockly.Python.ORDER_ATOMIC);
    var value_name2 = Blockly.Python.valueToCode(block, 'pwm', Blockly.Python.ORDER_ATOMIC);
    var str = '';
    var j = 0;
    var returnvalue = '';
    for (var i = 0; i < ids.length; i++) {
        if (ids[i] && !Blockly.getMainWorkspace().getBlockById(ids[i].id)) {
            ids[i] = null;
        }
    }

    for (var i = 0; i < ids.length; i++) {
        if (ids[i] && ids[i].id == block.id) {
            j = i;
            break;
        } else {
            if (j == 0) {
                if (!ids[i]) {
                    j = i;
                } else if (i == ids.length - 1) {
                    j = ids.length;
                }
            }
        }

    }

    if (!ids[j]) {
        ids[j] = { id: block.id, index: j };
    }

    for (var i = 0; i < ids.length; i++) {
        if (ids[i]) {
            Blockly.Python.addVariable('_pwm_gpio_tim_' + ids[i].index, '', true);
            Blockly.Python.addVariable('_pwm_gpio_control_' + ids[i].index, '', true);
            str += '_pwm_gpio_tim_' + ids[i].index + ' = Timer(_io_timer_use[' + ids[i].index + '][0],_io_timer_use[' + ids[i].index + '][1], mode=Timer.MODE_PWM)\n';
            str += '_pwm_gpio_control_' + ids[i].index + ' = PWM(_pwm_gpio_tim_' + ids[i].index + ', freq=500000, duty=0, pin=' + value_name1 + ')\n';
        }
    }

    returnvalue += '_pwm_gpio_control_' + ids[j].index + '.duty(int(' + value_name2 + '/10.23))\n';

    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['import_analog_ai_set_setup'] = '' +
        'from machine import Pin,PWM,Timer\n' +
        '\n' +
        '_io_timer_use = [[Timer.TIMER0, Timer.CHANNEL0],[Timer.TIMER0, Timer.CHANNEL1],[Timer.TIMER0, Timer.CHANNEL2],[Timer.TIMER1, Timer.CHANNEL0],[Timer.TIMER1, Timer.CHANNEL1],[Timer.TIMER1, Timer.CHANNEL2],[Timer.TIMER2, Timer.CHANNEL0],[Timer.TIMER2, Timer.CHANNEL1],[Timer.TIMER2, Timer.CHANNEL2]]\n' + str;

    return returnvalue;



    // var module_type = block.getFieldValue('digital_set_type');
    // var str = '';
    // var ss = '';
    // if (counts.length != 0) {
    //     if (ids.indexOf(block.id) == -1) {
    //         ids.push(block.id);
    //         count = count + 1;
    //         counts.push(count);
    //         Blockly.Python.addVariable('_pwm_gpio_tim_' + count, '', true);
    //         Blockly.Python.addVariable('_pwm_gpio_control_' + count, '', true);
    //         str += '_pwm_gpio_tim_' + count + ' = Timer(_io_timer_use[' + count + '][0],_io_timer_use[' + count + '][1], mode=Timer.MODE_PWM)\n';
    //         str += '_pwm_gpio_control_' + count + ' = PWM(_pwm_gpio_tim_' + count + ', freq=500000, duty=0, pin=' + value_name1 + ')\n';
    //         ss += '_pwm_gpio_control_' + count + '.duty(int(' + value_name2 + '/10.23))\n';
    //     }
    //     else {
    //         for (var i = 0; i < counts.length; i++) {
    //             Blockly.Python.addVariable('_pwm_gpio_tim_' + counts[i], '', true);
    //             Blockly.Python.addVariable('_pwm_gpio_control_' + counts[i], '', true);
    //             str += '_pwm_gpio_tim_' + counts[i] + ' = Timer(_io_timer_use[' + counts[i] + '][0],_io_timer_use[' + counts[i] + '][1], mode=Timer.MODE_PWM)\n';
    //             str += '_pwm_gpio_control_' + counts[i] + ' = PWM(_pwm_gpio_tim_' + counts[i] + ', freq=500000, duty=0, pin=' + value_name1 + ')\n';
    //             ss += '_pwm_gpio_control_' + counts[i] + '.duty(int(' + value_name2 + '/10.23))\n';
    //         }
    //     }
    // }

    // else {
    //     if (ids.indexOf(block.id) == -1) {
    //         ids.push(block.id);
    //         counts.push(count);
    //         Blockly.Python.addVariable('_pwm_gpio_tim_' + count, '', true);
    //         Blockly.Python.addVariable('_pwm_gpio_control_' + count, '', true);
    //         str += '_pwm_gpio_tim_' + count + ' = Timer(_io_timer_use[' + count + '][0],_io_timer_use[' + count + '][1], mode=Timer.MODE_PWM)\n';
    //         str += '_pwm_gpio_control_' + count + ' = PWM(_pwm_gpio_tim_' + count + ', freq=500000, duty=0, pin=' + value_name1 + ')\n';
    //         ss += '_pwm_gpio_control_' + count + '.duty(int(' + value_name2 + '/10.23))\n';
    //     }
    // }

    // // TODO: Assemble Python into code variable.
    // Blockly.Python.definitions_['import_analog_ai_set_setup'] = '' +
    //     'from machine import Pin,PWM,Timer\n' +
    //     '\n' +
    //     '_io_timer_use = [[Timer.TIMER0, Timer.CHANNEL0],[Timer.TIMER0, Timer.CHANNEL1],[Timer.TIMER0, Timer.CHANNEL2],[Timer.TIMER1, Timer.CHANNEL0],[Timer.TIMER1, Timer.CHANNEL1],[Timer.TIMER1, Timer.CHANNEL2],[Timer.TIMER2, Timer.CHANNEL0],[Timer.TIMER2, Timer.CHANNEL1],[Timer.TIMER2, Timer.CHANNEL2]]\n' + str;

    // // code = ss;
    // return ss;
};


/*
Button
*/

Blockly.Blocks['esp32_main_controller_button_read_pressed'] = {
    init: function () {
        // this.appendDummyInput()
        //    .appendField(new Blockly.FieldImage("blockly/media/button_pressed.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32BUTTON)
            .appendField(new Blockly.FieldDropdown([
                ["P1", "button_type_1"],
                ["P2", "button_type_2"]
            ]), "button_type")
            .appendField(Blockly.Msg.ESP32PRESSED)
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('button_type');
            var TOOLTIPS = {
                'button_type_1': Blockly.Msg.Esp32_Main_Controller_Button_Read_Pressed_TOOLTIP.replace('%1', "P1"),
                'button_type_2': Blockly.Msg.Esp32_Main_Controller_Button_Read_Pressed_TOOLTIP.replace('%1', "P2")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_button_read_pressed'] = function (block) {
    Blockly.Python.definitions_['import_Pin'] = 'from machine import Pin';
    var _type = block.getField('button_type').text_;
    var _button_state = block.getFieldValue('button_state');
    var _num = _type == "P1" ? "34" : "35";
    var _upstr = "";
    if (_type == "P2") { _upstr = ",Pin.PULL_UP"; }
    Blockly.Python.addVariable('_' + _type, '_' + _type + ' = Pin(' + _num + ', Pin.IN' + _upstr + ')', true);
    var code = '(_' + _type + '.value() == ' + 1 + ')';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_button_read_released'] = {
    init: function () {
        // this.appendDummyInput()
        //    .appendField(new Blockly.FieldImage("blockly/media/button_released.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32BUTTON)
            .appendField(new Blockly.FieldDropdown([
                ["P1", "button_type_1"],
                ["P2", "button_type_2"]
            ]), "button_type")
            .appendField(Blockly.Msg.ESP32RELEASED)
        this.setOutput(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('button_type');
            var TOOLTIPS = {
                'button_type_1': Blockly.Msg.Esp32_Main_Controller_Button_Read_Released_TOOLTIP.replace('%1', "P1"),
                'button_type_2': Blockly.Msg.Esp32_Main_Controller_Button_Read_Released_TOOLTIP.replace('%1', "P2")
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_button_read_released'] = function (block) {
    Blockly.Python.definitions_['import_Pin'] = 'from machine import Pin';
    var _type = block.getField('button_type').text_;
    var _button_state = block.getFieldValue('button_state');
    var _num = _type == "P1" ? "34" : "35";
    var _upstr = "";
    if (_type == "P2") { _upstr = ",Pin.PULL_UP"; }
    Blockly.Python.addVariable('_' + _type, '_' + _type + ' = Pin(' + _num + ', Pin.IN' + _upstr + ')', true);
    var code = '(_' + _type + '.value() == ' + 0 + ')';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_button_read_value'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_button_read_value)
            .appendField(new Blockly.FieldDropdown([
                ["P1", "button_type_1"],
                ["P2", "button_type_2"]
            ]), "button_type")
            .appendField(Blockly.Msg.basic_button_read_value_after);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('button_type');
            var TOOLTIPS = {
                'button_type_1': Blockly.Msg.Esp32_Main_Controller_Button_Read_Value_TOOLTIP.replace('%1', "P1"),
                'button_type_2': Blockly.Msg.Esp32_Main_Controller_Button_Read_Value_TOOLTIP.replace('%1', "P2")
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_button_read_value'] = function (block) {
    Blockly.Python.definitions_['import_Pin'] = 'from machine import Pin';
    var _type = block.getField('button_type').text_;
    // TODO: Assemble Python into code variable.
    var _num = _type == "P1" ? "34" : "35";
    var _upstr = "";
    if (_type == "P2") { _upstr = ",Pin.PULL_UP"; }
    Blockly.Python.addVariable('_' + _type, '_' + _type + ' = Pin(' + _num + ', Pin.IN' + _upstr + ')', true);
    var code = '_' + _type + '.value()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

/*
Blockly.Python['esp32_main_controller_button_read'] = function (block) {
    Blockly.Python.definitions_['import_Pin'] = 'from machine import Pin';
    var _type = block.getField('button_type').text_;
    var _button_state = block.getFieldValue('button_state');
    var _num = _type == "1" ? "36" : "22";
    var _upstr = "";
    if (_type == "2") { _upstr = ",Pin.PULL_UP"; }
    Blockly.Python.addVariable('p' + _type, 'p' + _type + ' = Pin(' + _num + ', Pin.IN' + _upstr + ')', true);
    var code = '(p' + _type + '.value() == ' + (_button_state == "button_state_pressed" ? "1" : "0") + ')';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};
*/

/*
Dialer
*/


Blockly.Blocks['esp32_main_controller_dial_switch_read_pressed'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32DIALSWITCH)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ESP32DIALER_LEFT, "switch_type_left"],
                [Blockly.Msg.ESP32DIALER_MIDDLE, "switch_type_middle"],
                [Blockly.Msg.ESP32DIALER_RIGHT, "switch_type_right"]
            ]), "switch_type")
            .appendField(Blockly.Msg.ESP32PRESSED)
        this.setOutput(true, null);
        this.setColour("#e8795b");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_dial_switch_read_pressed'] = function (block) {
    Blockly.Python.definitions_['import_Pin'] = 'from machine import Pin';
    var _type = block.getFieldValue('switch_type');
    var _num = "34";
    var _upstr = "";
    var _button_type = "";
    if (_type == "switch_type_left") {
        var _num = "34";
        _button_type = "Left";
    } else if (_type == "switch_type_middle") {
        var _num = "19";
        _upstr = ", Pin.PULL_UP";
        _button_type = "Middle";
    } else if (_type == "switch_type_right") {
        var _num = "35";
        _button_type = "Right";
    }

    // Blockly.Python.addVariable("dialer_type", 'p' + _button_type + ' = Pin(' + _num + ', Pin.IN' + _upstr + ')');
    Blockly.Python.addVariable("pLeft", 'pLeft = Pin(38, Pin.IN)');
    Blockly.Python.addVariable("pMiddle", 'pMiddle = Pin(19, Pin.IN)');
    Blockly.Python.addVariable("pRight", 'pRight = Pin(35, Pin.IN)');
    var code = '(p' + _button_type + '.value() == 1)';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


Blockly.Blocks['esp32_main_controller_dial_switch_read_released'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32DIALSWITCH)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ESP32DIALER_LEFT, "switch_type_left"],
                [Blockly.Msg.ESP32DIALER_MIDDLE, "switch_type_middle"],
                [Blockly.Msg.ESP32DIALER_RIGHT, "switch_type_right"]
            ]), "switch_type")
            .appendField(Blockly.Msg.ESP32RELEASED)
        this.setOutput(true, null);
        this.setColour("#e8795b");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_dial_switch_read_released'] = function (block) {
    Blockly.Python.definitions_['import_Pin'] = 'from machine import Pin';
    var _type = block.getFieldValue('switch_type');
    var _state = block.getFieldValue('switch_state');
    var _num = "34";
    var _upstr = "";
    var _button_type = "";
    if (_type == "switch_type_left") {
        var _num = "34";
        _button_type = "Left";
    } else if (_type == "switch_type_middle") {
        var _num = "19";
        _upstr = ", Pin.PULL_UP";
        _button_type = "Middle";
    } else if (_type == "switch_type_right") {
        var _num = "35";
        _button_type = "Right";
    }
    Blockly.Python.addVariable('p' + _button_type, 'p' + _button_type + ' = Pin(' + _num + ', Pin.IN' + _upstr + ')');
    var code = '(p' + _button_type + '.value() == 0)';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


/*
LED 
*/



Blockly.Blocks['esp32_main_controller_set_led_turnon'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(new Blockly.FieldImage("blockly/media/led_on.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32TURN + Blockly.Msg.ESP32LED_MONO_TEXT_NO);
        this.appendValueInput("led_type")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32LED_MONO_TEXT_AFTER + Blockly.Msg.ESP32LED + Blockly.Msg.ESP32LED_TURNON);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Set_Led_Turnon_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_set_led_turnon'] = function (block) {
    Blockly.Python.definitions_['import_led_Pin'] = 'from machine import Pin';
    var _type = Blockly.Python.valueToCode(block, 'led_type', Blockly.Python.ORDER_ATOMIC);
    var _state = block.getFieldValue('led_state');
    var _num = "2";
    if (_type == "1") {
        var _num = "2";
    } else if (_type == "2") {
        var _num = "12";
    } else if (_type == "3") {
        var _num = "5";
    } else if (_type == "4") {
        var _num = "13";
    } else if (_type == "5") {
        var _num = "14";
    } else if (_type == "6") {
        var _num = "15";
    } else if (_type == "7") {
        var _num = "18";
    } else if (_type == "8") {
        var _num = "19";
    } else if (_type == "9") {
        var _num = "23";
    } else {
        var _num = "ERROR";
    }

    Blockly.Python.addSetup('iot_led_light_setup', '' +
        '_light = [0,2,12,5,13,14,15,18,19,23]\n' +
        '\n' +
        '_light_1 = Pin(_light[1], Pin.OUT, value=0)\n' +
        '_light_2 = Pin(_light[2], Pin.OUT, value=0)\n' +
        '_light_3 = Pin(_light[3], Pin.OUT, value=0)\n' +
        '_light_4 = Pin(_light[4], Pin.OUT, value=0)\n' +
        '_light_5 = Pin(_light[5], Pin.OUT, value=0)\n' +
        '_light_6 = Pin(_light[6], Pin.OUT, value=0)\n' +
        '_light_7 = Pin(_light[7], Pin.OUT, value=0)\n' +
        '_light_8 = Pin(_light[8], Pin.OUT, value=0)\n' +
        '_light_9 = Pin(_light[9], Pin.OUT, value=0)\n' +
        '\n' +
        'def _led_light(state, pin):\n' +
        '    if (state == True):\n' +
        '        if pin == 1: _light_1.value(1)\n' +
        '        if pin == 2: _light_2.value(1)\n' +
        '        if pin == 3: _light_3.value(1)\n' +
        '        if pin == 4: _light_4.value(1)\n' +
        '        if pin == 5: _light_5.value(1)\n' +
        '        if pin == 6: _light_6.value(1)\n' +
        '        if pin == 7: _light_7.value(1)\n' +
        '        if pin == 8: _light_8.value(1)\n' +
        '        if pin == 9: _light_9.value(1)\n' +
        '    elif (state == False):\n' +
        '        if pin == 1: _light_1.value(0)\n' +
        '        if pin == 2: _light_2.value(0)\n' +
        '        if pin == 3: _light_3.value(0)\n' +
        '        if pin == 4: _light_4.value(0)\n' +
        '        if pin == 5: _light_5.value(0)\n' +
        '        if pin == 6: _light_6.value(0)\n' +
        '        if pin == 7: _light_7.value(0)\n' +
        '        if pin == 8: _light_8.value(0)\n' +
        '        if pin == 9: _light_9.value(0)\n' +
        '');

    var code = '_led_light(True,' + _type + ')\n';
    return code;
};


Blockly.Blocks['esp32_main_controller_set_led_turnoff'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(new Blockly.FieldImage("blockly/media/led_off.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32TURN + Blockly.Msg.ESP32LED_MONO_TEXT_NO);
        this.appendValueInput("led_type")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32LED_MONO_TEXT_AFTER + Blockly.Msg.ESP32LED + Blockly.Msg.ESP32LED_TURNOFF);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Set_Led_Turnoff_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_set_led_turnoff'] = function (block) {
    Blockly.Python.definitions_['import_led_Pin'] = 'from machine import Pin';
    var _type = Blockly.Python.valueToCode(block, 'led_type', Blockly.Python.ORDER_ATOMIC);
    var _state = block.getFieldValue('led_state');
    var _num = "2";
    if (_type == "1") {
        var _num = "2";
    } else if (_type == "2") {
        var _num = "12";
    } else if (_type == "3") {
        var _num = "5";
    } else if (_type == "4") {
        var _num = "13";
    } else if (_type == "5") {
        var _num = "14";
    } else if (_type == "6") {
        var _num = "15";
    } else if (_type == "7") {
        var _num = "18";
    } else if (_type == "8") {
        var _num = "19";
    } else if (_type == "9") {
        var _num = "23";
    } else {
        var _num = "ERROR";
    }

    Blockly.Python.addSetup('iot_led_light_setup', '' +
        '_light = [0,2,12,5,13,14,15,18,19,23]\n' +
        '\n' +
        '_light_1 = Pin(_light[1], Pin.OUT, value=0)\n' +
        '_light_2 = Pin(_light[2], Pin.OUT, value=0)\n' +
        '_light_3 = Pin(_light[3], Pin.OUT, value=0)\n' +
        '_light_4 = Pin(_light[4], Pin.OUT, value=0)\n' +
        '_light_5 = Pin(_light[5], Pin.OUT, value=0)\n' +
        '_light_6 = Pin(_light[6], Pin.OUT, value=0)\n' +
        '_light_7 = Pin(_light[7], Pin.OUT, value=0)\n' +
        '_light_8 = Pin(_light[8], Pin.OUT, value=0)\n' +
        '_light_9 = Pin(_light[9], Pin.OUT, value=0)\n' +
        '\n' +
        'def _led_light(state, pin):\n' +
        '    if (state == True):\n' +
        '        if pin == 1: _light_1.value(1)\n' +
        '        if pin == 2: _light_2.value(1)\n' +
        '        if pin == 3: _light_3.value(1)\n' +
        '        if pin == 4: _light_4.value(1)\n' +
        '        if pin == 5: _light_5.value(1)\n' +
        '        if pin == 6: _light_6.value(1)\n' +
        '        if pin == 7: _light_7.value(1)\n' +
        '        if pin == 8: _light_8.value(1)\n' +
        '        if pin == 9: _light_9.value(1)\n' +
        '    elif (state == False):\n' +
        '        if pin == 1: _light_1.value(0)\n' +
        '        if pin == 2: _light_2.value(0)\n' +
        '        if pin == 3: _light_3.value(0)\n' +
        '        if pin == 4: _light_4.value(0)\n' +
        '        if pin == 5: _light_5.value(0)\n' +
        '        if pin == 6: _light_6.value(0)\n' +
        '        if pin == 7: _light_7.value(0)\n' +
        '        if pin == 8: _light_8.value(0)\n' +
        '        if pin == 9: _light_9.value(0)\n' +
        '');

    var code = '_led_light(False,' + _type + ')\n';
    return code;
};

Blockly.Blocks['esp32_main_controller_set_led_drawpixel_on'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHTUP + Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHT_INIT_TEXT);
        this.appendValueInput("x")
            .setCheck(null)
        this.appendValueInput("y")
            .setCheck(null)
            .appendField(Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHT_MIDDLE_TEXT);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHT_END_TEXT);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Set_Led_Drawpixel_On_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_set_led_drawpixel_on'] = function (block) {
    var value_x = Blockly.Python.valueToCode(block, 'x', Blockly.Python.ORDER_ATOMIC);
    var value_y = Blockly.Python.valueToCode(block, 'y', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.

    Blockly.Python.definitions_['import_led_Pin'] = 'from machine import Pin';

    Blockly.Python.addSetup('iot_led_light_setup', '' +
        '_light = [0,2,12,5,13,14,15,18,19,23]\n' +
        '\n' +
        '_light_1 = Pin(_light[1], Pin.OUT, value=0)\n' +
        '_light_2 = Pin(_light[2], Pin.OUT, value=0)\n' +
        '_light_3 = Pin(_light[3], Pin.OUT, value=0)\n' +
        '_light_4 = Pin(_light[4], Pin.OUT, value=0)\n' +
        '_light_5 = Pin(_light[5], Pin.OUT, value=0)\n' +
        '_light_6 = Pin(_light[6], Pin.OUT, value=0)\n' +
        '_light_7 = Pin(_light[7], Pin.OUT, value=0)\n' +
        '_light_8 = Pin(_light[8], Pin.OUT, value=0)\n' +
        '_light_9 = Pin(_light[9], Pin.OUT, value=0)\n' +
        '\n' +
        'def _led_light(state, pin):\n' +
        '    if (state == True):\n' +
        '        if pin == 1: _light_1.value(1)\n' +
        '        if pin == 2: _light_2.value(1)\n' +
        '        if pin == 3: _light_3.value(1)\n' +
        '        if pin == 4: _light_4.value(1)\n' +
        '        if pin == 5: _light_5.value(1)\n' +
        '        if pin == 6: _light_6.value(1)\n' +
        '        if pin == 7: _light_7.value(1)\n' +
        '        if pin == 8: _light_8.value(1)\n' +
        '        if pin == 9: _light_9.value(1)\n' +
        '    elif (state == False):\n' +
        '        if pin == 1: _light_1.value(0)\n' +
        '        if pin == 2: _light_2.value(0)\n' +
        '        if pin == 3: _light_3.value(0)\n' +
        '        if pin == 4: _light_4.value(0)\n' +
        '        if pin == 5: _light_5.value(0)\n' +
        '        if pin == 6: _light_6.value(0)\n' +
        '        if pin == 7: _light_7.value(0)\n' +
        '        if pin == 8: _light_8.value(0)\n' +
        '        if pin == 9: _light_9.value(0)\n' +
        '');


    Blockly.Python.addSetup('drawpixel_setup', '' +
        'def _led_draw_pixel(state, x, y):\n' +
        '    real_pin = (3*y-3+x)\n' +
        '    _led_light(state,real_pin)\n' +
        '\n')

    var code = '_led_draw_pixel(True,' + value_x + ',' + value_y + ')\n';
    return code;
};

Blockly.Blocks['esp32_main_controller_set_led_drawpixel_off'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHTOFF + Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHT_INIT_TEXT);
        this.appendValueInput("x")
            .setCheck(null)
        this.appendValueInput("y")
            .setCheck(null)
            .appendField(Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHT_MIDDLE_TEXT);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32LED_CORD_DRAWPIXEL_LIGHT_END_TEXT);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Set_Led_Drawpixel_Off_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_set_led_drawpixel_off'] = function (block) {
    var value_x = Blockly.Python.valueToCode(block, 'x', Blockly.Python.ORDER_ATOMIC);
    var value_y = Blockly.Python.valueToCode(block, 'y', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.

    Blockly.Python.definitions_['import_led_Pin'] = 'from machine import Pin';

    Blockly.Python.addSetup('iot_led_light_setup', '' +
        '_light = [0,2,12,5,13,14,15,18,19,23]\n' +
        '\n' +
        '_light_1 = Pin(_light[1], Pin.OUT, value=0)\n' +
        '_light_2 = Pin(_light[2], Pin.OUT, value=0)\n' +
        '_light_3 = Pin(_light[3], Pin.OUT, value=0)\n' +
        '_light_4 = Pin(_light[4], Pin.OUT, value=0)\n' +
        '_light_5 = Pin(_light[5], Pin.OUT, value=0)\n' +
        '_light_6 = Pin(_light[6], Pin.OUT, value=0)\n' +
        '_light_7 = Pin(_light[7], Pin.OUT, value=0)\n' +
        '_light_8 = Pin(_light[8], Pin.OUT, value=0)\n' +
        '_light_9 = Pin(_light[9], Pin.OUT, value=0)\n' +
        '\n' +
        'def _led_light(state, pin):\n' +
        '    if (state == True):\n' +
        '        if pin == 1: _light_1.value(1)\n' +
        '        if pin == 2: _light_2.value(1)\n' +
        '        if pin == 3: _light_3.value(1)\n' +
        '        if pin == 4: _light_4.value(1)\n' +
        '        if pin == 5: _light_5.value(1)\n' +
        '        if pin == 6: _light_6.value(1)\n' +
        '        if pin == 7: _light_7.value(1)\n' +
        '        if pin == 8: _light_8.value(1)\n' +
        '        if pin == 9: _light_9.value(1)\n' +
        '    elif (state == False):\n' +
        '        if pin == 1: _light_1.value(0)\n' +
        '        if pin == 2: _light_2.value(0)\n' +
        '        if pin == 3: _light_3.value(0)\n' +
        '        if pin == 4: _light_4.value(0)\n' +
        '        if pin == 5: _light_5.value(0)\n' +
        '        if pin == 6: _light_6.value(0)\n' +
        '        if pin == 7: _light_7.value(0)\n' +
        '        if pin == 8: _light_8.value(0)\n' +
        '        if pin == 9: _light_9.value(0)\n' +
        '');


    Blockly.Python.addSetup('drawpixel_setup', '' +
        'def _led_draw_pixel(state, x, y):\n' +
        '    real_pin = (3*y-3+x)\n' +
        '    _led_light(state,real_pin)\n' +
        '\n')

    var code = '_led_draw_pixel(False,' + value_x + ',' + value_y + ')\n';
    return code;
};


/*
BUZZER 
*/



Blockly.Blocks['esp32_main_controller_set_buzzer_init'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(new Blockly.FieldImage("blockly/media/buzzer.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField( /*Blockly.Msg.ESP32TURNOBAF*/);
        //.appendField(new Blockly.FieldNumber(31, 31, 65535, 1), "buzzer_frequency");
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_buzzer_set_init)
            .appendField(new Blockly.FieldDropdown([
                ["S1", "0"],
                ["S2", "1"]
            ]), "notes")
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // this.setPreviousStatement(true, null);
        // this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Set_Buzzer_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_set_buzzer_init'] = function (block) {
    var notes = block.getFieldValue('notes');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_CocoPi_multiFuncGpio'] = `from CocoPi import multiFuncGpio`;
    Blockly.Python.addVariable('BUZZER' + notes, `BUZZER${notes} = multiFuncGpio(${notes},6)`, true);
    var code = '';
    return code;
};

Blockly.Blocks['esp32_main_controller_set_buzzer'] = {
    init: function () {
        // this.appendDummyInput()
        //     .appendField(new Blockly.FieldImage("blockly/media/buzzer.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField( /*Blockly.Msg.ESP32TURNOBAF*/);
        //.appendField(new Blockly.FieldNumber(31, 31, 65535, 1), "buzzer_frequency");
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([
            ["S1", "0"],
            ["S2", "1"]
        ]), "notes")
            .appendField(Blockly.Msg.basic_buzzer_set)
            .appendField(new Blockly.FieldNumber(31, 20, 12000), 'esp32_var_num');
        this.setInputsInline(true);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        // this.setPreviousStatement(true, null);
        // this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Set_Buzzer_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_set_buzzer'] = function (block) {
    var esp32_var_num = block.getFieldValue("esp32_var_num");
    var notes = block.getFieldValue('notes');
    var code = `BUZZER${notes}.beep(${esp32_var_num})
`;
    return code;
};

Blockly.Blocks['esp32_main_controller_turn_off_buzzer'] = {
    init: function () {
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([
            ["S1", "0"],
            ["S2", "1"]
        ]), "notes").appendField(Blockly.Msg.ESP32TURNOB);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Turn_Off_Buzzer_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['esp32_main_controller_turn_off_buzzer'] = function (block) {
    var notes = block.getFieldValue('notes');
    var code = `BUZZER${notes}.beep(0)
`
    return code;
    //return [code, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['esp32_main_controller_turn_off_buzzer_music'] = {
    init: function () {
        this.appendDummyInput().appendField(new Blockly.FieldDropdown([
            ["S1", "0"],
            ["S2", "1"]
        ]), "type")
            .appendField(Blockly.Msg.esp32_main_controller_turn_off_buzzer_music_lite)
            .appendField(new Blockly.FieldDropdown([
                ["C2", "65"],
                ["D2", "73"],
                ["E2", "82"],
                ["F2", "87"],
                ["G2", "98"],
                ["A2", "110"],
                ["B2", "123"],
                ["C3", "130"],
                ["D3", "146"],
                ["E3", "164"],
                ["F3", "174"],
                ["G3", "196"],
                ["A3", "220"],
                ["B3", "246"],
                ["C4", "261"],
                ["D4", "293"],
                ["E4", "329"],
                ["F4", "349"],
                ["G4", "392"],
                ["A4", "440"],
                ["B4", "493"],
                ["C5", "523"],
                ["D5", "587"],
                ["E5", "659"],
                ["F5", "698"],
                ["G5", "784"],
                ["A5", "880"],
                ["B5", "987"],
                ["C6", "1046"],
                ["D6", "1174"],
                ["E6", "1318"],
                ["F6", "1396"],
                ["G6", "1568"],
                ["A6", "1760"],
                ["B6", "1975"],
                ["C7", "2093"],
                ["D7", "2349"],
                ["E7", "2637"],
                ["F7", "2793"],
                ["G7", "3136"],
                ["A7", "3520"],
                ["B7", "3951"],
                ["C8", "4186"],
                ["D8", "4698"],
                ["E8", "5274"],
                ["F8", "5587"],
                ["G8", "6272"],
                ["A8", "7040"],
                ["B8", "7902"]
            ]), "notes")
            .appendField(Blockly.Msg.esp32_main_controller_turn_off_buzzer_music_lite_2);
        this.appendValueInput("beat")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_main_controller_turn_off_buzzer_music_lite_3);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.esp32_main_controller_turn_off_buzzer_music_lite_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_turn_off_buzzer_music'] = function (block) {
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    var beat = Blockly.Python.valueToCode(block, 'beat', Blockly.Python.ORDER_ATOMIC).replace("(", "").replace(")", "");

    var type = block.getFieldValue('type');
    var notes = block.getFieldValue('notes');
    // TODO: Assemble Python into code variable.
    // TODO: Assemble Python into code variable.
    var code = `BUZZER${type}.beep(${notes})
time.sleep(${beat})
`
    return code;
};

Blockly.Blocks['esp32_main_controller_buzzer_set_beat_lite'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                ["1/2", "0.5"],
                ["1", "1"],
                ["1/4", "0.25"],
                ["1/8", "0.125"],
                ["1/16", "0.063"]
            ]), "beat");
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('beat');
            var TOOLTIPS = {
                "1": "%1".replace("%1", "1"),
                "0.5": "%1".replace("%1", "1/2"),
                "0.25": "%1".replace("%1", "1/4"),
                "0.125": "%1".replace("%1", "1/8"),
                "0.063": "%1".replace("%1", "1/16")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_buzzer_set_beat_lite'] = function (block) {
    var value_name1 = block.getFieldValue('beat');
    var code = value_name1;

    return [code, Blockly.Python.ORDER_NONE];
};


/*
TOUCH AREA
*/

Blockly.Blocks['esp32_main_controller_touch_read_touched'] = {
    init: function () {
        // this.appendDummyInput()
        //    .appendField(new Blockly.FieldImage("blockly/media/touched.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32TA)
            .appendField(new Blockly.FieldDropdown([
                ["A", "touch_area_type_a"],
                ["B", "touch_area_type_b"]
            ]), "touch_area_type")
            .appendField(Blockly.Msg.ESP32_TOUCHED)
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('touch_area_type');
            var TOOLTIPS = {
                'touch_area_type_a': Blockly.Msg.Esp32_Main_Controller_Touch_Read_Touched_TOOLTIP.replace('%1', "A"),
                'touch_area_type_b': Blockly.Msg.Esp32_Main_Controller_Touch_Read_Touched_TOOLTIP.replace('%1', "B")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_touch_read_touched'] = function (block) {
    Blockly.Python.definitions_['import_touch_esp32'] = 'from machine import TouchPad\n' +
        'from machine import Pin\n' +
        '\n' +
        '_TOUCH_A = TouchPad(Pin(4))\n' +
        '_TOUCH_B = TouchPad(Pin(27))\n' +
        '\n' +
        'def GetTouchValue(area):\n' +
        '    try:\n' +
        '        if area == "A":\n' +
        '            return _TOUCH_A.read()\n' +
        '        elif area == "B":\n' +
        '            return _TOUCH_B.read()\n' +
        '    except BaseException as e:\n' +
        '        return False\n' +
        '';

    // var code = '_TOUCH_' + block.getField('touch_area_type').text_ + '.read() ' + "< 100";
    var code = 'GetTouchValue("' + block.getField('touch_area_type').text_ + '") < 100';

    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_touch_read_untouched'] = {
    init: function () {
        // this.appendDummyInput()
        //    .appendField(new Blockly.FieldImage("blockly/media/untouched.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32TA)
            .appendField(new Blockly.FieldDropdown([
                ["A", "touch_area_type_a"],
                ["B", "touch_area_type_b"]
            ]), "touch_area_type")
            .appendField(Blockly.Msg.ESP32_UNTOUCHED)
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('touch_area_type');
            var TOOLTIPS = {
                'touch_area_type_a': Blockly.Msg.Esp32_Main_Controller_Touch_Read_Untouched_TOOLTIP.replace('%1', "A"),
                'touch_area_type_b': Blockly.Msg.Esp32_Main_Controller_Touch_Read_Untouched_TOOLTIP.replace('%1', "B")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_touch_read_untouched'] = function (block) {

    Blockly.Python.definitions_['import_touch_esp32'] = 'from machine import TouchPad\n' +
        'from machine import Pin\n' +
        '\n' +
        '_TOUCH_A = TouchPad(Pin(4))\n' +
        '_TOUCH_B = TouchPad(Pin(27))\n' +
        '\n' +
        'def GetTouchValue(area):\n' +
        '    try:\n' +
        '        if area == "A":\n' +
        '            return _TOUCH_A.read()\n' +
        '        elif area == "B":\n' +
        '            return _TOUCH_B.read()\n' +
        '    except BaseException as e:\n' +
        '        return False\n' +
        '';

    // var code = '_TOUCH_' + block.getField('touch_area_type').text_ + '.read() ' + "< 100";
    var code = 'GetTouchValue("' + block.getField('touch_area_type').text_ + '") >= 100';

    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


Blockly.Blocks['esp32_main_controller_touch_read_value'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32_READ)
            .appendField(new Blockly.FieldDropdown([
                ["A", "touch_area_type_a"],
                ["B", "touch_area_type_b"]
            ]), "touch_area_type")
            .appendField(Blockly.Msg.ESP32_READ_VALUE);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('touch_area_type');
            var TOOLTIPS = {
                'touch_area_type_a': Blockly.Msg.Esp32_Main_Controller_Touch_Read_Value_TOOLTIP.replace('%1', "A"),
                'touch_area_type_b': Blockly.Msg.Esp32_Main_Controller_Touch_Read_Value_TOOLTIP.replace('%1', "B")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_touch_read_value'] = function (block) {
    Blockly.Python.definitions_['import_touch_esp32'] = 'from machine import TouchPad\n' +
        'from machine import Pin\n' +
        '\n' +
        '_TOUCH_A = TouchPad(Pin(4))\n' +
        '_TOUCH_B = TouchPad(Pin(27))\n' +
        '\n' +
        'def GetTouchValue(area):\n' +
        '    try:\n' +
        '        if area == "A":\n' +
        '            return _TOUCH_A.read()\n' +
        '        elif area == "B":\n' +
        '            return _TOUCH_B.read()\n' +
        '    except BaseException as e:\n' +
        '        return False\n' +
        '';

    // var code = '_TOUCH_' + block.getField('touch_area_type').text_ + '.read() ' + "< 100";
    var code = 'GetTouchValue("' + block.getField('touch_area_type').text_ + '")';

    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


/* 
Env Sensor: BME280
*/


Blockly.Blocks['esp32_main_controller_get_environmental_value'] = {
    init: function () {
        // this.appendDummyInput()
        //    .appendField(new Blockly.FieldImage("blockly/media/env_get.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ESP32_ENV_GET_TEXT)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_temperature, "temperature"],
                [Blockly.Msg.basic_humidity, "humidity"]
                // [Blockly.Msg.basic_pressure, "pressure"]
            ]), "env_get_type")
            .appendField(Blockly.Msg.basic_env_value);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#5fcd8e");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('env_get_type');
            var TOOLTIPS = {
                'temperature': Blockly.Msg.Esp32_Main_Controller_Get_Environmental_Value_TOOLTIP.replace('%1', Blockly.Msg.basic_temperature),
                'humidity': Blockly.Msg.Esp32_Main_Controller_Get_Environmental_Value_TOOLTIP.replace('%1', Blockly.Msg.basic_humidity)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_get_environmental_value'] = function (block) {
    var _type_selected = block.getFieldValue('env_get_type');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_AHT20'] = `from CocoPi import AHT20`
    // Blockly.Python.definitions_['v831_import_CocoPi'] = `sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_AHT20_object'] = `aht20 = AHT20(2)    `
    Blockly.Python.addVariable('_BME', '');

    let code = ''
    if (_type_selected == 'temperature') {
        code = `aht20.get_temperature()`
    } else if (_type_selected == 'humidity') {
        code = `aht20.get_humidity()`;
    } else {
        code = _type_selected;
    }
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

/* 
Motion Sensor: QMI8658
*/


Blockly.Blocks['esp32_main_controller_motion_init'] = {
    init: function () {
        //this.appendDummyInput()
        //    .appendField(new Blockly.FieldImage("blockly/media/motion_setup.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_motion_use);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#e8795b");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_motion_init'] = function (block) {

    // Blockly.Python.addVariable('_SENSOR_MPU_PINS', '');

    Blockly.Python.definitions_['import_QMI8658'] = '' +
        'from machine import I2C, Pin\n' +
        'import math\n' +
        'import QMI8658\n' +
        '_SENSOR_MPU_PINS = I2C(scl=Pin(22), sda=Pin(21))\n' +
        '';

    var code = '' +
        '_MPU = QMI8658.accel(_SENSOR_MPU_PINS)\n' +
        '_MPU_SHAKING_OFFSET = _MPU.get_values()[\'AcZ\']\n' +
        '_MPU_ACCL_X = _MPU.get_values()[\'AcX\']\n' +
        '_MPU_ACCL_Y = _MPU.get_values()[\'AcY\']\n' +
        '_MPU_ACCL_Z = _MPU.get_values()[\'AcZ\']\n' +
        '_MPU_OFFSET_TILT_X = _MPU_GET_TILT_ANGLE(\'X\')\n' +
        '_MPU_OFFSET_TILT_Y = _MPU_GET_TILT_ANGLE(\'Y\')\n' +
        '_MPU_OFFSET_TILT_Z = _MPU_GET_TILT_ANGLE(\'Z\')\n' +
        '';
    return code;
};

Blockly.Blocks['esp32_main_controller_motion_when_shaking'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_when_shaking);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#e8795b");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_motion_when_shaking'] = function (block) {


    Blockly.Python.definitions_['shaking_def'] = '' +
        'def _CHECK_SHAKING():\n' +
        '    if _MPU_SHAKING_OFFSET < 0 and _SSTATE == 0:\n' +
        '        _SSTATE = 1\n' +
        '        return True\n' +
        '    elif _MPU_SHAKING_OFFSET > 0 and _SSTATE == 1:\n' +
        '        _SSTATE = 0\n' +
        '        return False\n' +
        '';

    var code = '(_CHECK_SHAKING() == True)';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_motion_when_shaking_STATEMENT'] = {
    init: function () {
        this.appendDummyInput()
            .appendField()
            .appendField(Blockly.Msg.basic_shaking_sensitivity)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_shaking_sensitivity_high, "high"],
                [Blockly.Msg.basic_shaking_sensitivity_middle, "middle"],
                [Blockly.Msg.basic_shaking_sensitivity_low, "low"]
            ]), "sensitivity")
            .appendField(Blockly.Msg.basic_when_shaking_when_module)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_when_shaking_when_is_in, "True"],
                [Blockly.Msg.basic_when_shaking_when_is_not_in, "False"]
            ]), "status")
            .appendField(Blockly.Msg.basic_when_shaking_when_shaking);
        this.appendStatementInput("input")
            .setCheck(null)
            .appendField(Blockly.Msg.basic_motion_statement_exec);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('status');
            var TOOLTIPS = {
                'True': Blockly.Msg.Esp32_Main_Controller_Motion_When_Shaking_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_shaking_when_is_in),
                'False': Blockly.Msg.Esp32_Main_Controller_Motion_When_Shaking_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_shaking_when_is_not_in)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_main_controller_motion_when_shaking_STATEMENT'] = function (block) {
    var dropdown_status = block.getFieldValue('status');
    var sensitivity = block.getFieldValue('sensitivity');
    var statements_input = Blockly.Python.statementToCode(block, 'input');
    var temp = 0;

    if (sensitivity == "high") {
        temp = 99;
    }
    else if (sensitivity == "middle") {
        temp = 23;
    }
    else {
        temp = 1;
    }
    Blockly.Python.definitions_['import_QMI8658'] = '' +
        'from machine import I2C, Pin\n' +
        'import math\n' +
        'import QMI8658\n' +
        '\n' +
        'mpu_lib_version_is_latest = "QMI8658" in dir(QMI8658)\n' +
        'if mpu_lib_version_is_latest == True:\n' +
        '    mpui2c = I2C(scl=Pin(22), sda=Pin(21))\n' +
        '    QMI8658 = QMI8658.QMI8658(mpui2c)\n' +
        '    mpucal = QMI8658.calibrate()\n' +
        'elif mpu_lib_version_is_latest == False:\n' +
        '    _SENSOR_MPU_PINS = I2C(scl=Pin(22), sda=Pin(21))\n' +
        '    _MPU = QMI8658.accel(_SENSOR_MPU_PINS)\n' +
        '    _MPU_SHAKING_OFFSET = _MPU.get_values()[\'AcZ\']\n' +
        '    _MPU_ACCL_X = _MPU.get_values()[\'AcX\']\n' +
        '    _MPU_ACCL_Y = _MPU.get_values()[\'AcY\']\n' +
        '    _MPU_ACCL_Z = _MPU.get_values()[\'AcZ\']\n' +
        '    _MPU_OFFSET_TILT_X = _MPU_GET_TILT_ANGLE(\'X\')\n' +
        '    _MPU_OFFSET_TILT_Y = _MPU_GET_TILT_ANGLE(\'Y\')\n' +
        '    _MPU_OFFSET_TILT_Z = _MPU_GET_TILT_ANGLE(\'Z\')\n' +
        '\n' +
        '';

    Blockly.Python.definitions_['shaking_def'] = '' +
        'def _CHECK_SHAKING():\n' +
        '    _MPU = QMI8658.accel(_SENSOR_MPU_PINS)\n' +
        '    _MPU_SHAKING_OFFSET = _MPU.get_values()[\'AcZ\']\n' +
        '    _MPU_ACCL_Z = _MPU.get_values()[\'AcZ\']\n' +
        '    _SSTATE = 0\n' +
        '    if _MPU_SHAKING_OFFSET < 0:\n' +
        '        _SSTATE = 1\n' +
        '        return True\n' +
        '    elif _MPU_SHAKING_OFFSET > 0:\n' +
        '        _SSTATE = 0\n' +
        '        return False\n' +
        '';

    var code = '' +
        'if mpu_lib_version_is_latest == True and (QMI8658.is_shaking(mpucal,' + temp + ') == ' + dropdown_status + '):\n' +
        '' + statements_input + '\n' +
        'elif mpu_lib_version_is_latest == False and (_CHECK_SHAKING() == ' + dropdown_status + '):\n' +
        '    _MPU = QMI8658.accel(_SENSOR_MPU_PINS)\n' +
        '    _MPU_SHAKING_OFFSET = _MPU.get_values()[\'AcZ\']\n' +
        '    _MPU_ACCL_Z = _MPU.get_values()[\'AcZ\']\n' +
        '' + statements_input + '\n' +
        '';
    return code;
};


Blockly.Blocks['esp32_main_controller_motion_when_tilting'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_when_tilting_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_when_tilting_get_left, "L"],
                [Blockly.Msg.basic_when_tilting_get_right, "R"],
                [Blockly.Msg.basic_when_tilting_get_forward, "F"],
                [Blockly.Msg.basic_when_tilting_get_backward, "B"]
            ]), "tilt_type")
            .appendField(Blockly.Msg.basic_when_tilting_get_when);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#e8795b");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_motion_when_tilting'] = function (block) {
    var _type_selected = block.getFieldValue('tilt_type');

    Blockly.Python.definitions_['tilting_def'] = '' +
        'def _CHECK_TILT_LR():\n' +
        '    if _MPU_OFFSET_TILT_X < 160 and _MPU_OFFSET_TILT_X > 0:\n' +
        '        return "R"\n' +
        '    elif _MPU_OFFSET_TILT_X > 200 and _MPU_OFFSET_TILT_X < 360:\n' +
        '        return "L"\n' +
        '    else:\n' +
        '        return None\n' +
        '\n' +
        'def _CHECK_TILT_FB():\n' +
        '    if _MPU_OFFSET_TILT_Y < 160 and _MPU_OFFSET_TILT_Y > 0:\n' +
        '        return "F"\n' +
        '    elif _MPU_OFFSET_TILT_Y > 200 and _MPU_OFFSET_TILT_Y < 360:\n' +
        '        return "B"\n' +
        '    else:\n' +
        '        return None\n' +
        '';
    if (_type_selected == "L" || _type_selected == "R") {
        _check_function = '(_CHECK_TILT_LR() == "';
    } else if (_type_selected == "F" || _type_selected == "B") {
        _check_function = '(_CHECK_TILT_FB() == "';
    }
    var code = _check_function + _type_selected + '")';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};



Blockly.Blocks['esp32_main_controller_motion_when_tilting_STATEMENT'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_when_tilting_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_when_tilting_get_left, "L"],
                [Blockly.Msg.basic_when_tilting_get_right, "R"],
                [Blockly.Msg.basic_when_tilting_get_forward, "F"],
                [Blockly.Msg.basic_when_tilting_get_backward, "B"],
                // [Blockly.Msg.basic_when_tilting_get_left_and_forward, "LF"],
                // [Blockly.Msg.basic_when_tilting_get_left_and_backward, "LB"],
                // [Blockly.Msg.basic_when_tilting_get_right_and_forward, "RF"],
                // [Blockly.Msg.basic_when_tilting_get_right_and_backward, "RB"],
                // [Blockly.Msg.basic_when_tilting_not_tilting, "N"]
            ]), "tilt_type")
            .appendField(Blockly.Msg.basic_when_tilting_get_when);
        this.appendStatementInput("input")
            .setCheck(null)
            .appendField(Blockly.Msg.basic_motion_statement_exec);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null)
        this.setColour("#5fcd8e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('tilt_type');
            var TOOLTIPS = {
                'L': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_left),
                'R': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_right),
                'F': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_forward),
                'B': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_backward),
                'LF': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_left_and_forward),
                'LB': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_left_and_backward),
                'RF': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_right_and_forward),
                'RB': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_get_right_and_backward),
                'N': Blockly.Msg.Esp32_Main_Controller_Motion_When_Tilting_STATEMENT_TOOLTIP.replace('%1', Blockly.Msg.basic_when_tilting_not_tilting)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_motion_when_tilting_STATEMENT'] = function (block) {
    var _type_selected = block.getFieldValue('tilt_type');


    var statements_input = Blockly.Python.statementToCode(block, 'input') || Blockly.Python.PASS;
    // pi2 板載 IMU，見 maixcam2_imu.js 與 tools/e2e/contracts/imu-contract.md。
    // 左右看 X 分量（tilt "y"）、前後看 Y 分量（tilt "x"）、門檻 15°、正負都同舊版。
    maixImuSetup();
    var RULES = {
        'L': `_pi2Imu.tilt("y") < -15`,
        'R': `_pi2Imu.tilt("y") > 15`,
        'B': `_pi2Imu.tilt("x") < -15`,
        'F': `_pi2Imu.tilt("x") > 15`
    };
    if (!RULES[_type_selected]) return '';
    return `if ${RULES[_type_selected]}:\n${statements_input}`;
};




Blockly.Blocks['esp32_main_controller_motion_acceleration'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_motion_get_along)
            .appendField(new Blockly.FieldDropdown([
                ["X", "4"],
                ["Y", "3"],
                ["Z", "5"]
            ]), "accel_type")
            .appendField(Blockly.Msg.basic_motion_accel);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.isUnit)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.cancUnit, "N"],
        //         [Blockly.Msg.confUnit, "Y"]
        //     ]), "isUnit");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#5fcd8e");
        var thisBlock = this;
        this.setTooltip(function () {
            // 欄位值是舊版的陣列索引（4/3/5），保留它舊專案才載得進來；顯示用 X/Y/Z
            var AXIS = { '4': 'X', '3': 'Y', '5': 'Z' };
            var axis = AXIS[thisBlock.getFieldValue('accel_type')] || 'X';
            return Blockly.Msg.Esp32_Main_Controller_Motion_Acceleration_TOOLTIP.replace('%1', axis);
        });
        this.setHelpUrl("");
    }
};

// 顯示為「角速度」：舊版取的本來就是陀螺儀讀數（名實不符）。現在回傳度/秒、扣掉零漂，
// 並修正舊版 X、Y 對調（舊版選 X 取到 GyY）。合約 4.1，使用者 2026-11-12 同意。
Blockly.Python['esp32_main_controller_motion_acceleration'] = function (block) {
    var AXIS = { '4': 'x', '3': 'y', '5': 'z' };
    var axis = AXIS[block.getFieldValue('accel_type')] || 'x';
    maixImuSetup();
    return [`round(_pi2Imu.rate("${axis}"), 2)`, Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['esp32_main_controller_motion_rotation_measurement'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_motion_get_along)
            .appendField(new Blockly.FieldDropdown([
                ["X", "4"],
                ["Y", "3"],
                ["Z", "5"]
            ]), "accel_type")
            .appendField(Blockly.Msg.basic_motion_rotation_measurement);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.isUnit)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.cancUnit, "N"],
        //         [Blockly.Msg.confUnit, "Y"]
        //     ]), "isUnit");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('accel_type');
            var TOOLTIPS = {
                'X': Blockly.Msg.Esp32_Main_Controller_Motion_Rotation_Measurement_TOOLTIP.replace('%1', 'X'),
                'Y': Blockly.Msg.Esp32_Main_Controller_Motion_Rotation_Measurement_TOOLTIP.replace('%1', 'Y'),
                'Z': Blockly.Msg.Esp32_Main_Controller_Motion_Rotation_Measurement_TOOLTIP.replace('%1', 'Z')
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_motion_rotation_measurement'] = function (block) {
    var _type_selected = block.getFieldValue('accel_type');
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_QMI8658'] = `from CocoPi import QMI8658`
    Blockly.Python.definitions_['v831_QMI8658_import_path'] = `
#初始化设置
qmi8658=QMI8658()
#校准
qmi8658.calibrate()
#标定初始方位
initData={}
initData["AcX"]=qmi8658.get_accel(10)["AcX"]
initData["AcY"]=qmi8658.get_accel(10)["AcY"]
initData["AcZ"]=qmi8658.get_accel(10)["AcZ"]
initData["GyX"]=qmi8658.get_accel(10)["GyX"]
initData["GyY"]=qmi8658.get_accel(10)["GyY"]
initData["GyZ"]=qmi8658.get_accel(10)["GyZ"]
`;

    // Blockly.Python.addVariable('_MPU_ACCL_' + _type_selected, '');

    var code = `round(qmi8658.getPitchYawRollGxGyGz(initData)[${_type_selected}],2)`;
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_motion_tilt_angle'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_motion_get_along)
            .appendField(new Blockly.FieldDropdown([
                ["X", "1"],
                ["Y", "0"],
                // ["Z", "2"]
            ]), "tilt_angle_type")
            .appendField(Blockly.Msg.basic_motion_angle);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.isUnit)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.cancUnit, "N"],
        //         [Blockly.Msg.confUnit, "Y"]
        //     ]), "isUnit");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#5fcd8e");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('tilt_angle_type');
            var TOOLTIPS = {
                'X': Blockly.Msg.Esp32_Main_Controller_Motion_Tilt_Angle_TOOLTIP.replace('%1', 'X'),
                'Y': Blockly.Msg.Esp32_Main_Controller_Motion_Tilt_Angle_TOOLTIP.replace('%1', 'Y')
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};


// pi2 板載 IMU。欄位值同舊版（"1"＝X、"0"＝Y）；X 看加速度的 Y 分量、Y 看 X 分量，同舊版取法。
// 改成以水平為 0、用 atan2（舊版以開機姿勢為 0、/182.04 線性近似）。合約 4.1。
Blockly.Python['esp32_main_controller_motion_tilt_angle'] = function (block) {
    var axis = block.getFieldValue('tilt_angle_type') == '0' ? 'y' : 'x';
    maixImuSetup();
    return [`round(_pi2Imu.tilt("${axis}"), 2)`, Blockly.Python.ORDER_FUNCTION_CALL];
};

/*
LIGHT & SOUND
*/

Blockly.Blocks['esp32_main_controller_get_light'] = {
    init: function () {
        // this.appendDummyInput()
        //    .appendField(new Blockly.FieldImage("blockly/media/light_sensor.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.basic_light_get);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Get_Light_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_get_light'] = function (block) {

    Blockly.Python.definitions_['v831_import_LIGHTINTENSITY'] = `class v83x_ADC():
    def __init__(self, addr=b"0x05070080") -> None:
        self.addr = addr
        self.path = "/sys/class/sunxi_dump/dump"
        self.file = open(self.path, "wb+")
        self.last = self.value()
    def __del__(self):
        try:
            if self.file:
                self.file.close()
                del self.file
        except Exception as e:
            pass
    def value(self):
        self.file.write(b"0x05070080")
        self.file.seek(0)
        return int(self.file.read()[:-1], 16)

v831_adc0 = v83x_ADC()
`


    var code = 'v831_adc0.value()';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};



/* time */

var ESP32_TIME_COLOR = "#fabe23";

Blockly.Blocks['esp32_main_controller_time_timer_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.time_init_timer);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_TIME_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'on_esp32': Blockly.Msg.Esp32_Main_Controller_Time_Timer_Init_TOOLTIP.replace('%1', Blockly.Msg.time_iot_module),
                'on_ai': Blockly.Msg.Esp32_Main_Controller_Time_Timer_Init_TOOLTIP.replace('%1', Blockly.Msg.time_ai_module)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_time_timer_init'] = function (block) {
    var timer_type = block.getFieldValue('type');

    Blockly.Python.definitions_['v831_import_time'] = `import time`
    Blockly.Python.definitions_['counter_start_variable'] = `counter_start = 0 
def counter_start_fun():
    global counter_start
    counter_start = time.perf_counter()
`;
    var code = `counter_start_fun()
`

    return code;
};

Blockly.Blocks['esp32_main_controller_time_timer_get_current'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.time_timer_get_time);
        this.setOutput(true, null);
        this.setColour(ESP32_TIME_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'on_esp32': Blockly.Msg.Esp32_Main_Controller_Time_Timer_Get_Current_TOOLTIP.replace('%1', Blockly.Msg.time_iot_module),
                'on_ai': Blockly.Msg.Esp32_Main_Controller_Time_Timer_Get_Current_TOOLTIP.replace('%1', Blockly.Msg.time_ai_module)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_time_timer_get_current'] = function (block) {
    var timer_type = block.getFieldValue('type');
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['counter_end'] = `def getcounterEndStart(newDate):
    global counter_start
    return newDate - counter_start
`

    // '' +
    //     'counter_end=time.perf_counter()\n' +
    //     '\n';
    var code = `getcounterEndStart(time.perf_counter())`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_time_timer_clear'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.time_timer_clear);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_TIME_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'on_esp32': Blockly.Msg.Esp32_Main_Controller_Time_Timer_Clear_TOOLTIP.replace('%1', Blockly.Msg.time_iot_module),
                'on_ai': Blockly.Msg.Esp32_Main_Controller_Time_Timer_Clear_TOOLTIP.replace('%1', Blockly.Msg.time_ai_module)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_time_timer_clear'] = function (block) {
    var timer_type = block.getFieldValue('type');
    // 包成函式帶 global：直接產 `del counter_start` 的話，放進函式（含週期計時器的身體）
    // 裡就變成刪區域變數，UnboundLocalError
    Blockly.Python.definitions_['counter_clear_fun'] = `def counter_clear_fun():
    global counter_start
    del counter_start
`;
    var code = `counter_clear_fun()
`;
    return code;
};

Blockly.Blocks['esp32_main_controller_time_period_timer'] = {
    init: function () {

        this.appendDummyInput()
            .appendField(Blockly.Msg.time_timer_periodically);
        this.appendDummyInput()
            .appendField(Blockly.Msg.time_timer_every)
            .appendField(new Blockly.FieldTextInput("500"), "period_timer_count")
            .appendField(Blockly.Msg.time_timer_ms);
        this.appendStatementInput("exec_period_timer")
            .setCheck(null)
            .appendField(Blockly.Msg.time_execution);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_TIME_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Time_Period_Timer_TOOLTIP.replace('%1', "CocoPi"));
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_time_period_timer'] = function (block) {
    var text_period_timer_count = block.getFieldValue('period_timer_count') * 0.001;
    var statements_name = Blockly.Python.statementToCode(block, 'exec_period_timer');
    Blockly.Python.addVariable("STOPTHREAD", "STOPTHREAD = False", true)
    Blockly.Python.definitions_['v831_import_threading'] = `import threading`
    Blockly.Python.definitions_['v831_import_time'] = `import time`
    let allBlocks = block.workspace.getAllBlocks();
    let global = ""
    // console.log('allBlocks',allBlocks)
    try {
        global = allBlocks[0].workspace.variableList.toString()
    }
    catch (e) {
        console.log(e)
    }
    Blockly.Python.definitions_['v831_import_thread_calsss'] = `def period_timer_count(n: int):
    global STOPTHREAD
    while True:
        if STOPTHREAD:
            break
        time.sleep(${text_period_timer_count})
        if STOPTHREAD:      # 睡的時候被清除了：這一輪不能再執行
            break
        thread_calsss_fun_timer()
`
    Blockly.Python.definitions_['v831_import_thread_calsss_fun'] = `def thread_calsss_fun_timer():
    global ${global}
${statements_name}
`
    var code = `CocoPiThread = threading.Thread(target=period_timer_count, args=(1,))
CocoPiThread.start()
`
    return code;
};

Blockly.Blocks['esp32_main_controller_time_period_timer_clear'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.time_timer_periodically_clear);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_TIME_COLOR);
        var thisBlock = this;
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Time_Period_Timer_Clear_TOOLTIP.replace('%1', "CocoPi"));
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_time_period_timer_clear'] = function (block) {
    var code = `STOPTHREAD = True
`
    return code;
};

Blockly.Blocks['esp32_get_current_date'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.time_get_current_date_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.time_get_current_date_y, "Y"],
                [Blockly.Msg.time_get_current_date_m, "m"],
                [Blockly.Msg.time_get_current_date_d, "d"],
                [Blockly.Msg.time_get_current_date_hour, "H"],
                [Blockly.Msg.time_get_current_date_min, "M"],
                [Blockly.Msg.time_get_current_date_sec, "S"]
            ]), "type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(ESP32_TIME_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                '0': Blockly.Msg.Esp32_Get_Current_Date_TOOLTIP.replace('%1', Blockly.Msg.time_get_current_date_y),
                '1': Blockly.Msg.Esp32_Get_Current_Date_TOOLTIP.replace('%1', Blockly.Msg.time_get_current_date_m),
                '2': Blockly.Msg.Esp32_Get_Current_Date_TOOLTIP.replace('%1', Blockly.Msg.time_get_current_date_d),
                '3': Blockly.Msg.Esp32_Get_Current_Date_TOOLTIP.replace('%1', Blockly.Msg.time_get_current_date_hour),
                '4': Blockly.Msg.Esp32_Get_Current_Date_TOOLTIP.replace('%1', Blockly.Msg.time_get_current_date_min),
                '5': Blockly.Msg.Esp32_Get_Current_Date_TOOLTIP.replace('%1', Blockly.Msg.time_get_current_date_sec)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_get_current_date'] = function (block) {
    var dropdown_type = block.getFieldValue('type');

    // Blockly.Python.definitions_['v831_import_time'] = `from datetime import date`
    Blockly.Python.definitions_['v831_import_datetime_datetime'] = `from datetime import datetime`
    Blockly.Python.definitions_['v831_get_current_date'] = `def getCurrent_data(type):
    now = datetime.now()
    return now.strftime("%"+type+"")
`
    // TODO: Assemble Python into code variable.
    var code = `getCurrent_data("${dropdown_type}")`
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};





/*
LCD
*/



var ESP32_SCREEN_COLOR = "#5bb2d6";


Blockly.Blocks['esp32_main_controller_lcd_rotation'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_SETROTATION)
            .appendField(new Blockly.FieldDropdown([
                ["0°", "1"],
                ["90°", "2"],
                ["180°", "3"],
                ["270°", "0"]
            ]), "DEGREE")
            .appendField(Blockly.Msg.OLCD_SETROTATION_DEGREE)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
}

Blockly.Python['esp32_main_controller_lcd_rotation'] = function (block) {
    var degree = block.getFieldValue("DEGREE");
    var code = "tft.rotation(" + degree + ")\n";
    // Blockly.Python.addSetup("setRotation", code);
    return code;
}


Blockly.Blocks['esp32_main_controller_clear_screen'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.display_clear_screen);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_SCREEN_COLOR);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_clear_screen'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'tft.fill(TFT.BLACK)\n';
    return code;
};

Blockly.Blocks['esp32_main_controller_lcd_screen_fill'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.display_fill_screen);
        this.appendValueInput("COLOR")
            .setCheck(null)
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_SCREEN_COLOR);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_lcd_screen_fill'] = function (block) {
    var value_lcd_rgb_value = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    if (value_lcd_rgb_value.charAt(0) != '#') {
        var code = 'tft.fill(_TFTColor' + value_lcd_rgb_value + ')\n';
    } else if (value_lcd_rgb_value.charAt(0) == '#') {
        var d = 0,
            e = 0,
            f = 0;
        try {
            7 == color.length && (d = parseInt(color.substring(1, 3), 16),
                e = parseInt(color.substring(3, 5), 16),
                f = parseInt(color.substring(5, 7), 16))
        } catch (g) { }

        var code = "tft.fill(_TFTColor" + d + "," + e + "," + f + ")\n";
    }
    return code;
};


Blockly.Blocks['esp32_main_controller_lcd_drawpixel'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_pixel.png", 42, 42, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_DRAW + Blockly.Msg.display_draw_pixel);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_COLOR);
        this.appendValueInput("POS")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_COORDINATE);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_drawpixel'] = function (block) {
    // var drawrectcolor = sharpTo565(
    //     Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC));
    var drawrectcoord = Blockly.Python.valueToCode(block, 'POS', Blockly.Python.ORDER_ATOMIC);
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

        code = "tft.pixel((" + drawrectcoord + "), _TFTColor" + d + "," + e + "," + f + ")\n"
    } else if (color.charAt(0) != '#') {
        code = "tft.pixel((" + drawrectcoord + "), _TFTColor" + color + ")\n"
    }
    return code;
};

Blockly.Blocks['esp32_main_controller_lcd_drawline'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_line.png", 42, 42, { alt: "*", flipRtl: "FALSE" }));
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/line.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_DRAW + Blockly.Msg.OLCD_LINE);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_COLOR);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_LINE_START);
        this.appendValueInput("POSB")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_LINE_END);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_drawline'] = function (block) {
    // var drawlinecolor = sharpTo565(
    //     Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC));
    var drawlinestart = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var drawlineend = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
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

        code = "tft.line((" + drawlinestart + "), (" + drawlineend + "), _TFTColor" + d + "," + e + "," + f + ")\n"
    } else if (color.charAt(0) != '#') {
        code = "tft.line((" + drawlinestart + "), (" + drawlineend + "), _TFTColor" + color + ")\n"
    }
    return code;
};

Blockly.Blocks['esp32_main_controller_lcd_drawlinelen'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_line.png", 42, 42, { alt: "*", flipRtl: "FALSE" }));
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/line.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_DRAW)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.display_draw_vertical, "vline"],
                [Blockly.Msg.display_draw_horizontal, "hline"]
            ]), "rect_type")
            .appendField(Blockly.Msg.OLCD_LINE)
        this.appendValueInput("COLOR")
            .setCheck(null)
            .appendField(Blockly.Msg.OLCD_COLOR);
        this.appendValueInput("POS")
            .setCheck(null)
            .appendField(Blockly.Msg.display_start_cord);
        this.appendValueInput("LENGTH")
            .setCheck(null)
            .appendField(Blockly.Msg.display_length);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_drawlinelen'] = function (block) {
    var _type = block.getFieldValue("rect_type");

    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    var drawlinestart = Blockly.Python.valueToCode(block, 'POS', Blockly.Python.ORDER_ATOMIC);
    var drawlineend = Blockly.Python.valueToCode(block, 'LENGTH', Blockly.Python.ORDER_ATOMIC);
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);

    code = "tft." + _type + "((" + drawlinestart + "), " + drawlineend + ", _TFTColor" + color + ")\n"
    return code;
};

Blockly.Blocks['esp32_main_controller_lcd_drawrect'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_rectangle.png", 42, 42, { alt: "*", flipRtl: "FALSE" }));
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/line.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_DRAW)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.OLCD_FULL, "fillrect"],
                [Blockly.Msg.OLCD_CIRCLE, "rect"]
            ]), "rect_type")
            .appendField(Blockly.Msg.display_draw_rectangle);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_COLOR);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_COORDINATE);
        this.appendValueInput("POSB")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_SIZE);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_drawrect'] = function (block) {
    // var drawlinecolor = sharpTo565(
    //     Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC));
    var _type = block.getFieldValue("rect_type");
    var drawlinestart = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var drawlineend = Blockly.Python.valueToCode(block, 'POSB', Blockly.Python.ORDER_ATOMIC);
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    code = "tft." + _type + "((" + drawlinestart + "), (" + drawlineend + "), _TFTColor" + color + ")\n"
    return code;
};

Blockly.Blocks['esp32_main_controller_lcd_drawcircle'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_circle.png", 42, 42, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_DRAW)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.OLCD_FULL, "fillcircle"],
                [Blockly.Msg.OLCD_STROKED, "circle"]
            ]), "circle_type")
            .appendField(Blockly.Msg.OLCD_CIRCLE);
        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_COLOR);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_CENTER_POS);
        this.appendValueInput("RADIUS")
            .setCheck(null)
            .appendField(Blockly.Msg.OLCD_RADIUS);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_drawcircle'] = function (block) {
    // var drawcirclecolor = sharpTo565(
    //     Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC));
    var circletype = block.getFieldValue('circle_type');
    var position = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var radius = Blockly.Python.valueToCode(block, 'RADIUS', Blockly.Python.ORDER_ATOMIC);
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);

    code = 'tft.' + circletype + '((' + position + '), ' + radius + ', _TFTColor' + color + ')\n';
    return code;
};

Blockly.Blocks['esp32_main_controller_lcd_drawqrcode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_qr.png", 42, 42, { alt: "*", flipRtl: "FALSE" }));
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/circle.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_DRAW + Blockly.Msg.display_drawqr_text);
        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_SET_POS);
        this.appendValueInput("CONTENT")
            .setCheck("String")
            .appendField(Blockly.Msg.display_drawqr_content);
        this.appendValueInput("WIDTH")
            .setCheck("Number")
            .appendField(Blockly.Msg.display_drawqr_padding);
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_drawqrcode'] = function (block) {
    var position = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
    var width = Blockly.Python.valueToCode(block, 'WIDTH', Blockly.Python.ORDER_ATOMIC);
    var code = 'tft.drawqrcode(' + '(' + position + '), ' + content + ', ' + width + ')\n';
    return code;
};

Blockly.Blocks['esp32_main_controller_lcd_drawtext'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/lcd_draw_text.png", 42, 42, { alt: "*", flipRtl: "FALSE" }));
        // this.appendDummyInput()
        //     .appendField(
        //         new Blockly.FieldImage("./../blockly/media/circle.png", 25, 25, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.OLCD_DRAW + Blockly.Msg.display_draw_text);

        this.appendValueInput("COLOR")
            .setCheck("String")
            .appendField(Blockly.Msg.OLCD_COLOR);

        this.appendValueInput("POSA")
            .setCheck("String")
            .appendField(Blockly.Msg.display_start_cord);

        this.appendValueInput("CONTENT")
            .setCheck("String")
            .appendField(Blockly.Msg.display_draw_text_content);

        this.appendValueInput("SIZE")
            .setCheck("Number")
            .appendField(Blockly.Msg.display_draw_text_size);

        this.appendDummyInput()
            .appendField(Blockly.Msg.display_draw_text_return)
            .appendField(new Blockly.FieldCheckbox('TRUE'), 'TextCheckBox');

        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_drawtext'] = function (block) {
    // var drawcirclecolor = sharpTo565(
    //     Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC));
    var position = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC);
    var content = Blockly.Python.valueToCode(block, 'CONTENT', Blockly.Python.ORDER_ATOMIC);
    var size = Blockly.Python.valueToCode(block, 'SIZE', Blockly.Python.ORDER_ATOMIC);
    var box = block.getFieldValue('TextCheckBox') == "TRUE" ? "True" : "False";
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    code = 'tft.text((' + position + '), ' + content + ', _TFTColor' + color + ', sysfont, ' + size + ', nowrap=' + box + ')\n';
    return code;
};

Blockly.Blocks['esp32_main_controller_rgb_value'] = {
    init: function () {
        this.appendValueInput("rgb_value_r")
            .setCheck(null)
            .appendField(Blockly.Msg.display_red);
        this.appendValueInput("rgb_value_g")
            .setCheck(null)
            .appendField(Blockly.Msg.display_green);
        this.appendValueInput("rgb_value_b")
            .setCheck(null)
            .appendField(Blockly.Msg.display_blue);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(ESP32_SCREEN_COLOR);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};



Blockly.Python['esp32_main_controller_rgb_value'] = function (block) {
    var r = Blockly.Python.valueToCode(block, 'rgb_value_r', Blockly.Python.ORDER_ATOMIC);
    var g = Blockly.Python.valueToCode(block, 'rgb_value_g', Blockly.Python.ORDER_ATOMIC);
    var b = Blockly.Python.valueToCode(block, 'rgb_value_b', Blockly.Python.ORDER_ATOMIC);

    var original_r = parseInt(r, 10);
    var original_g = parseInt(g, 10);
    var original_b = parseInt(b, 10);

    _r = original_r.toString(16);
    _g = original_g.toString(16);
    _b = original_b.toString(16);

    if (_r.length == 1)
        _r = "0" + _r;
    if (_g.length == 1)
        _g = "0" + _g;
    if (_b.length == 1)
        _b = "0" + _b;
    // TODO: Assemble Python into code variable.
    var code = '' + r + ',' + g + ',' + b + '';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['esp32_main_controller_lcd_color_hex_to_rgb'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.COLOR)
            .appendField(new Blockly.FieldColour("#ff0000"), "COLOR");
        this.setOutput(true, null);
        this.setColour("#5bb2d6");
        this.setTooltip('');
        this.setHelpUrl('');
    }
};

Blockly.Python['esp32_main_controller_lcd_color_hex_to_rgb'] = function (a) {
    a = a.getFieldValue("COLOR");
    // var d = 0
    //     , e = 0
    //     , f = 0;
    // try {
    //     7 == a.length && (d = a.substring(1, 3),
    //         e = a.substring(3, 5),
    //         f = a.substring(5, 7));
    // }
    // catch (g) { }
    var gethex = a;

    function hexToRGB(h) {
        let r = 0,
            g = 0,
            b = 0;

        // 3 digits
        if (h.length == 4) {
            r = "0x" + h[1] + h[1];
            g = "0x" + h[2] + h[2];
            b = "0x" + h[3] + h[3];

            // 6 digits
        } else if (h.length == 7) {
            r = "0x" + h[1] + h[2];
            g = "0x" + h[3] + h[4];
            b = "0x" + h[5] + h[6];
        }

        return "" + +r + "," + +g + "," + +b + "";
    }

    var _code = hexToRGB(gethex);
    //_code += "tft.fill(TFT.TFTColor(FS_COLOR))\n";
    return [_code, Blockly.Python.ORDER_CONDITIONAL];
};


/*
WiFi
*/

var ESP32_WIFI_COLOR = "#3062c1";



Blockly.Blocks['esp32_main_controller_wifi_enable_hotspot_mode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/hotspot_setup.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_setup_hotspot);
        this.appendValueInput("SSID")
            .setCheck(null)
            .appendField(Blockly.Msg.wifi_hotspot_ssid);
        this.appendValueInput("PASSWORD")
            .setCheck(null)
            .appendField(Blockly.Msg.wifi_hotspot_pass);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Wifi_Enable_Hotspot_Mode_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_wifi_enable_hotspot_mode'] = function (block) {
    var text_ssid = Blockly.Python.valueToCode(block, 'SSID', Blockly.Python.ORDER_ATOMIC);
    var text_password = Blockly.Python.valueToCode(block, 'PASSWORD', Blockly.Python.ORDER_ATOMIC);
    var _code = '' +
        '_WIFI = network.WLAN(network.STA_IF)\n' +
        '_WIFI.active(False)\n' +
        '_WIFI = network.WLAN(network.AP_IF)\n' +
        '_WIFI.active(True)\n';

    Blockly.Python.definitions_['import_network'] = 'import network\n' +
        _code +
        '_WIFI.config(essid=' + text_ssid + ', password=' + text_password + ', authmode=2, channel=11, hidden=0)\n' +
        '\n';
    code = '';
    return code;
};


Blockly.Blocks['esp32_main_controller_wifi_connect_internet'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/wifi_setup.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_connect_router);
        this.appendValueInput("ssid")
            .setCheck(null)
            .appendField(Blockly.Msg.wifi_router_ssid);
        this.appendValueInput("password")
            .setCheck(null)
            .appendField(Blockly.Msg.wifi_router_pass);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Wifi_Connect_Internet_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['esp32_main_controller_wifi_connect_internet'] = function (block) {
    var text_ssid = Blockly.Python.valueToCode(block, 'ssid', Blockly.Python.ORDER_ATOMIC);
    var text_password = Blockly.Python.valueToCode(block, 'password', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_os'] = `import os`
    Blockly.Python.definitions_['maixcam2_import_network'] = `from maix import network`
    // Blockly.Python.definitions_['v831_import_datetime'] = `import datetime`
    // Blockly.Python.definitions_['v831_import_ntplib'] = `import ntplib`

    Blockly.Python.definitions_['v831_wifi_getdate_noexit'] = `def getNetworkDate_noexit():
    global getDateNum
    try:
        coon = http.client.HTTPConnection("www.baidu.com")
        coon.request("GET","/")
        r = coon.getresponse()
        ts = r.getheader("date")
        GMT_time = time.strptime(ts[5:25],"%d %b %Y %H:%M:%S")
        BeiJing_time = time.localtime(time.mktime(GMT_time) + 8*60*60)
        format_time = time.strftime("%Y-%m-%d %H:%M:%S",BeiJing_time)
        command = "date -s "+"\\"{}\\"".format(format_time)
        os.system(command)
        getDateNum = 1
        # sys.exit()
    except:
        pass
`
    var code = `
WiFiSSID = ${text_ssid}
WiFiPSD = ${text_password}
network.wifi.Wifi().connect(WiFiSSID, WiFiPSD, wait=True, timeout=60)
getNetworkDate_noexit()
`;
    return code;
};


// Blockly.Python.addFunction("wifiConnect", `def wifiConnect(text_ssid,text_password):

//     with open('/etc/wifi/wpa_supplicant.conf', 'w',encoding='utf-8') as f:
//         f.write((''.join([str(x) for x in ["ctrl_interface=/var/run/wpa_supplicant", "\\n", "update_config=1", "\\n\\n", "network={\\n    ssid='"+text_ssid+"'\\n    psk='"+text_password+"'\\n}"]]))+'\\r\\n')
//     getNetworkDate_noexit()
// `);
//     var code = `
// WiFiSSID = ${text_ssid}
// WiFiPSD = ${text_password}
// wifiConnect(WiFiSSID,WiFiPSD)

// `;


Blockly.Blocks['esp32_main_controller_wifi_disconnect'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_router_disconnect);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Wifi_Disconnect_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['esp32_main_controller_wifi_disconnect'] = function (block) {
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_os'] = 'import os\n'
    // pi2：maix 的 Wifi.disconnect() 在 MaixCAM2 沒實作（throw ERR_NOT_IMPL）。
    // 不能用 systemctl stop wifi——udhcpc.service Requires=wifi，會一起停掉，之後「連接」拿不到 IP。
    // 只斷 wpa_supplicant 的話 wlan0 還留著舊 IP，所以要一併清掉
    var code = 'os.system("wpa_cli -i wlan0 disconnect >/dev/null; ip addr flush dev wlan0")\n';
    return code;
};




Blockly.Blocks['esp32_main_controller_get_wifi_devices_number'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_hotspot_get_clients);
        this.setOutput(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Get_Wifi_Devices_Number_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_get_wifi_devices_number'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'len(_WIFI.status("stations"))';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_wifi_acquiring_equipment'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_hotspot_get_list);
        this.setOutput(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Wifi_Acquiring_Equipment_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_wifi_acquiring_equipment'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = '_WIFI.status("stations")';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


Blockly.Blocks['esp32_main_controller_get_wifi_connection_status'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_router_connection_status);
        this.setOutput(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Get_Wifi_Connection_Status_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_get_wifi_connection_status'] = function (block) {
    // TODO: Assemble Python into code variable.

    Blockly.Python.definitions_['v831_import_os'] = `import os`;
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_time'] = `import time`;
    Blockly.Python.definitions_['v831_import_socket'] = `import socket`;
    Blockly.Python.definitions_['v831_import_http_client'] = `import http.client`;
    Blockly.Python.definitions_['wifi_is_content'] = `
def wifi_is_content():
    cmd = "ping -c 1 8.8.8.8"
    res = os.popen(cmd).read()
    data = False
    if res.find("round-trip min/avg/max")>-1:
        data = True
    
    return data
`
    // TODO: Change ORDER_NONE to the correct strength.
    let code = `wifi_is_content()`
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_wifi_close'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_close_hotspot);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Wifi_Close_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_wifi_close'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = '_WIFI.active(False)';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_main_controller_wifi_get_info'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_router_get_info)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.wifi_router_device_ip, "0"],
                // [Blockly.Msg.wifi_router_device_mask, "1"],
                // [Blockly.Msg.wifi_router_device_gateway, "2"],
                // [Blockly.Msg.wifi_router_device_dns, "3"]
            ]), "wifi_info");
        this.setOutput(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('wifi_info');
            var TOOLTIPS = {
                '0': Blockly.Msg.Esp32_Main_Controller_Wifi_Get_Info_TOOLTIP.replace('%1', Blockly.Msg.wifi_router_device_ip),
                '1': Blockly.Msg.Esp32_Main_Controller_Wifi_Get_Info_TOOLTIP.replace('%1', Blockly.Msg.wifi_router_device_mask),
                '2': Blockly.Msg.Esp32_Main_Controller_Wifi_Get_Info_TOOLTIP.replace('%1', Blockly.Msg.wifi_router_device_gateway),
                '3': Blockly.Msg.Esp32_Main_Controller_Wifi_Get_Info_TOOLTIP.replace('%1', Blockly.Msg.wifi_router_device_dns)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_wifi_get_info'] = function (block) {
    Blockly.Python.definitions_["v831_import_socket"] = `import socket`
    var dropdown_name = block.getFieldValue('wifi_info');
    Blockly.Python.addFunction("getWifiIP", `def getWifiIP():
    st = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        #st.connect(('10.255.255.255', 1))
        st.connect(('8.8.8.8', 80))
        IP = st.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        st.close()
    return IP`, true)
    // TODO: Assemble Python into code variable.
    var code = 'getWifiIP()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


Blockly.Blocks['esp32_main_controller_wifi_ntptime'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ntptime_header.png", 38, 38, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_ntptime_title);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Wifi_Ntptime_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_wifi_ntptime'] = function (block) {
    // var dropdown_timezone = block.getFieldValue('timezone');
    // var text_website = block.getFieldValue('website');

    Blockly.Python.definitions_['v831_import_os'] = `import os`;
    Blockly.Python.definitions_['v831_import_sys'] = `import sys
sys.path.append("/root/")`
    Blockly.Python.definitions_['v831_import_time'] = `import time`;
    Blockly.Python.definitions_['v831_import_http_client'] = `import http.client`;
    Blockly.Python.definitions_['v831_wifi_getdate'] = `def getNetworkDate():
    try:
        coon = http.client.HTTPConnection("www.baidu.com")
        coon.request("GET","/")
        r = coon.getresponse()
        ts = r.getheader("date")
        GMT_time = time.strptime(ts[5:25],"%d %b %Y %H:%M:%S")
        BeiJing_time = time.localtime(time.mktime(GMT_time)+ 8*60*60)
        format_time = time.strftime("%Y-%m-%d %H:%M:%S",BeiJing_time)
        command = "date -s "+"\\"{}\\"".format(format_time)
        os.system(command)
        sys.exit()
    except:
        pass
`
    // TODO: Assemble Python into code variable.
    var code = 'getNetworkDate()\n';
    return code;
};

// web 
// 获取天气
Blockly.Blocks['v831_get_weather_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_get_weather_init)
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.v831_get_weather_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_get_weather_init'] = function (block) {
    // var dropdown_timezone = block.getFieldValue('timezone');
    // var text_website = block.getFieldValue('website');
    Blockly.Python.definitions_['v831_import_request'] = `import requests`;
    // TODO: Assemble Python into code variable.
    var code = '';
    return code;
};
Blockly.Blocks['v831_set_city_and_time'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.set_weather_city)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.beijing, "101010100"],
                [Blockly.Msg.shanghai, "101020100"],
                [Blockly.Msg.guangzhou, "101280101"],
                [Blockly.Msg.shenzhen, "101280601"],
                [Blockly.Msg.HongKong, "101320101"],
            ]), "get_city")
        this.setOutput(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.set_weather_city_title);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_set_city_and_time'] = function (block) {
    var city = block.getFieldValue('get_city');
    Blockly.Python.definitions_['v831_import_json'] = `import json`;
    Blockly.Python.definitions_['v831_import_bs4'] = `import bs4`;
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_get_weather_fuc'] = `def get_html(url):
    headers = {
        "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
        "ContentType":
        "text/html; charset=utf-8",
        "Accept-Encoding":
        "gzip, deflate, sdch",
        "Accept-Language":
        "zh-CN,zh;q=0.8",
        "Connection":
        "keep-alive",
    }
    try:
        htmlcontet = requests.get(url, headers=headers, timeout=30)
        htmlcontet.raise_for_status()
        htmlcontet.encoding = "utf-8"
        return htmlcontet.text
    except:
        return " 请求失败 "

def get_content(url):
    weather_list = []
    html = get_html(url)
    soup = bs4.BeautifulSoup(html, "lxml")
    content_ul = soup.find("div", class_="t").find("ul", class_="clearfix").find_all("li")
    
    for content in content_ul:
        try:
            weather = {}
            weather["D"] = content.find("h1").text
            weather["WEA"] = content.find("p", class_="wea").text
            weather["T"] = content.find(
                "p", class_="tem").span.text + content.find(
                    "p", class_="tem").em.text
            weather_list.append(weather)
        except:
            print("查询不到")
    print(weather_list)
    return weather_list
`
    var code = `get_content("http://www.weather.com.cn/weather1d/${city}.shtml")`;
    // if(title_small === "all"){
    //     code = `getCityWeather_AllDay("${city}")['message']`
    // }else{
    //     code = `getCityWeather_RealTime("${city}")['message']`
    // }
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['v831_set_city_and_time_new'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.set_weather_city)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.beijing, "101010100"],
                [Blockly.Msg.shanghai, "101020100"],
                [Blockly.Msg.guangzhou, "101280101"],
                [Blockly.Msg.shenzhen, "101280601"],
                [Blockly.Msg.HongKong, "101320101"],
            ]), "get_city")
        // .appendField(Blockly.Msg.set_weather_title_small)
        // .appendField(new Blockly.FieldDropdown([
        //     [Blockly.Msg.set_weather_All_day_long, 'all'],[Blockly.Msg.set_weather_real_time, "real"]
        // ]), "title_small");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.set_weather_city_title);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_set_city_and_time_new'] = function (block) {
    // var title_small = block.getFieldValue('title_small');
    var city = block.getFieldValue('get_city');
    Blockly.Python.addVariable("getWeatherResult", 'getWeatherResult = ""', true)
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_[""] = `def hefengGetWeather(city,lang):
    getWeatherUrl = f"https://devapi.qweather.com/v7/weather/now?location={city}&key=d8d1d01bac3246ee8c34640681c1c9b6&lang={lang}"
    weatherResult = ""
    try:
        responseResult = requests.get(getWeatherUrl)
        if responseResult.status_code == 200:
            weatherResult = responseResult.json()
    except:
        pass
    return weatherResult
`
    var code = `getWeatherResult = hefengGetWeather(${city},"${localStorage.getItem("handPyLanguage")}")
`;
    // if(title_small === "all"){
    //     code = `getCityWeather_AllDay("${city}")['message']`
    // }else{
    //     code = `getCityWeather_RealTime("${city}")['message']`
    // }
    return code;
};


Blockly.Blocks['v831_get_weather_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_vision_get_histogram_percentile_2)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.weather_resulet, "result"],
                [Blockly.Msg.image_process_temperature, "temp"],
                [Blockly.Msg.weather_condition, "text"],
                [Blockly.Msg.windDir, "windDir"],
                [Blockly.Msg.windScale, "windScale"],
                [Blockly.Msg.windSpeed, "windSpeed"],
                [Blockly.Msg.image_process_humidity, "humidity"],
            ]), "get_weather")
        this.setOutput(true, null);
        this.setColour(ESP32_WIFI_COLOR);
        this.setTooltip(Blockly.Msg.set_weather_city_title);
        this.setHelpUrl("");
    }
};

Blockly.Python['v831_get_weather_result'] = function (block) {
    var weather = block.getFieldValue('get_weather');
    var code = "";
    if (weather == "result") {
        code = `getWeatherResult`
    } else {
        code = `getWeatherResult["now"]["${weather}"]`
    }
    // if(title_small === "all"){
    //     code = `getCityWeather_AllDay("${city}")['message']`
    // }else{
    //     code = `getCityWeather_RealTime("${city}")['message']`
    // }
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};
/*
IoT Service 
*/


Blockly.Blocks['esp32_main_controller_ThingSpeak_send_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/thingspeak.png", 190, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_send_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_send_api_set)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_CHANNEL_API_KEY"), "key");
        this.appendValueInput("data")
            .setCheck(null)
            .appendField(Blockly.Msg.iotservice_thingspeak_send_data_1);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ESP32_IOT_COLOR);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_ThingSpeak_send_data'] = function (block) {
    var text_key = block.getFieldValue('key');
    var data = Blockly.Python.valueToCode(block, 'data', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['import_urequests'] = '' +
        'import requests\n' +
        'import json\n'
    '';
    var code = '_THINGSPEAK_CHANNEL_API = "' + text_key + '"\n'
    Blockly.Python.addSetup("esp32_main_controller_ThingSpeak_send_data", code);
    var code = '_THINGSPEAK_DATA1 = ' + data + '\n';
    code += '_THINGSPEAK_ENDPOINT = "http://api.thingspeak.com/update?api_key=" + _THINGSPEAK_CHANNEL_API + "&field1=" + _THINGSPEAK_DATA1\n';
    code += '_THINGSPEAK_REQEUST = requests.get(_THINGSPEAK_ENDPOINT)\n';
    return code;
};



Blockly.Blocks['CocoRobo_set_max'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/http_server_header.png", 130, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_server_setup);
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_server_set_max)
            .appendField(new Blockly.FieldTextInput("5"), "number");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#183895");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['CocoRobo_set_max'] = function (block) {
    var number = block.getFieldValue('number');
    Blockly.Python.definitions_['import_socket'] = 'import usocket as socket';
    var code = '_S = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n';
    code += '_S.bind((_WIFI.ifconfig()[0], 80))\n';
    code += '_S.listen(' + number + ')\n';
    Blockly.Python.addSetup("CocoRobo_set_max", code);
    var code = '_SERVER_CONN, _SERVER_ADDR = _S.accept()\n';
    code += '_SERVER_REQUEST = _CONN.recv(1024)\n';
    return code;
};



Blockly.Blocks['CocoRobo_get_source'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_server_set_source);
        this.setOutput(true, null);
        this.setColour("#183895");
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['CocoRobo_get_source'] = function (block) {
    var code = 'str(_SERVER_ADDR)\n';
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};



Blockly.Blocks['CocoRobo_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_response_http_content_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.internet_response_text, "text"],
                [Blockly.Msg.internet_response_content, "content"],
                [Blockly.Msg.internet_response_status, "state"],
                [Blockly.Msg.internet_response_json, "json"],
                [Blockly.Msg.internet_response_encode, "code"],
                [Blockly.Msg.internet_response_reason, "reason"]
            ]), "op");
        this.setOutput(true, null);
        this.setColour("#183895");
        // this.setTooltip(Blockly.Msg.CocoRobo_get_TOOLTIP);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('op');
            var TOOLTIPS = {
                'text': Blockly.Msg.CocoRobo_get_TOOLTIP.replace('%1', Blockly.Msg.internet_response_text),
                'content': Blockly.Msg.CocoRobo_get_TOOLTIP.replace('%1', Blockly.Msg.internet_response_content),
                'state': Blockly.Msg.CocoRobo_get_TOOLTIP.replace('%1', Blockly.Msg.internet_response_status),
                'json': Blockly.Msg.CocoRobo_get_TOOLTIP.replace('%1', Blockly.Msg.internet_response_json),
                'code': Blockly.Msg.CocoRobo_get_TOOLTIP.replace('%1', Blockly.Msg.internet_response_encode),
                'reason': Blockly.Msg.CocoRobo_get_TOOLTIP.replace('%1', Blockly.Msg.internet_response_reason)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['CocoRobo_get'] = function (block) {
    var op = block.getFieldValue('op');
    var code = '_SEND_HTTP_REQUEST.text';
    if (op == "text") {
        code = '_SEND_HTTP_REQUEST.text';
    } else if (op == "content") {
        code = '_SEND_HTTP_REQUEST.content';
    } else if (op == "state") {
        code = '_SEND_HTTP_REQUEST.status_code';
    } else if (op == "json") {
        code = '_SEND_HTTP_REQUEST.json()';
    } else if (op == "code") {
        code = '_SEND_HTTP_REQUEST.encoding';
    } else if (op == "reason") {
        code = '_SEND_HTTP_REQUEST.reason';
    }
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};


Blockly.Blocks['iot_system_run'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_RUN);
        this.appendValueInput("PATH")
            .setCheck(null)
            .appendField(Blockly.Msg.system_code_path);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(32);
        this.setTooltip(Blockly.Msg.Iot_System_Run_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.iot_system_run = function (block) {
    var _path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC);
    var _code = "exec(open(" + _path + ").read())\n";
    return _code;
}

Blockly.Blocks['iot_system_create_file'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_CREATE_FILE);
        this.appendValueInput("filename")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_CREATE_F);
        this.appendValueInput("PATH")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_CREATE_F_1);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(32);
        this.setTooltip(Blockly.Msg.Iot_System_Create_File_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.iot_system_create_file = function (block) {
    var _filename = Blockly.Python.valueToCode(block, 'filename', Blockly.Python.ORDER_ATOMIC).replace("\"", "").replace("\"", "");
    var _path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC).replace("\"", "").replace("\"", "");
    // 'a'：檔案已存在就不動它的內容，不存在才建空檔
    var _code = `open('${_path + _filename}', 'a').close()
`;
    return _code;
}

Blockly.Blocks['iot_system_open_file'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_OPEN_FILE);
        this.appendValueInput("filename")
            .setCheck(null)
            .appendField(Blockly.Msg.AUDIO_S_PF);
        this.appendValueInput("PATH")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_WRITE_W);
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_WRITE_S)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.SYSTEM_WRITE_S_N, "newline"],
                [Blockly.Msg.SYSTEM_WRITE_S_C, "comma"],
                [Blockly.Msg.SYSTEM_WRITE_S_S, "space"],
                [Blockly.Msg.SYSTEM_WRITE_S_SE, "semicolon"]
            ]), "separator");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(32);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('separator');
            var TOOLTIPS = {
                'newline': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_N),
                'comma': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_C),
                'space': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_S),
                'semicolon': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_SE)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python.iot_system_open_file = function (block) {
    var _filename = Blockly.Python.valueToCode(block, 'filename', Blockly.Python.ORDER_ATOMIC);
    var _path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC);
    var _separator = block.getFieldValue('separator');
    console.log("_path", _path);
    let _mode = "a";
    if (_separator == "newline") {
        _mode = '\\r\\n';
    } else if (_separator == "comma") {
        _mode = ',';
    } else if (_separator == "space") {
        _mode = ' ';
    } else if (_separator == "semicolon") {
        _mode = ';';
    }
    // 不能用 with：後面的「寫入檔案」「關閉檔案」積木要接著用同一個 f
    var _code = `f = open(${_filename}, "w")
f.write(${_path} + "${_mode}")
`;
    return _code;
}

Blockly.Blocks['iot_system_write_file'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_WRITE_FILE);
        this.appendValueInput("WPATH")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_WRITE_W);
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_WRITE_S)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.SYSTEM_WRITE_S_N, "newline"],
                [Blockly.Msg.SYSTEM_WRITE_S_C, "comma"],
                [Blockly.Msg.SYSTEM_WRITE_S_S, "space"],
                [Blockly.Msg.SYSTEM_WRITE_S_SE, "semicolon"]
            ]), "separator");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(32);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('separator');
            var TOOLTIPS = {
                'newline': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_N),
                'comma': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_C),
                'space': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_S),
                'semicolon': Blockly.Msg.Iot_System_Write_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_SE)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python.iot_system_write_file = function (block) {
    var _wpath = Blockly.Python.valueToCode(block, 'WPATH', Blockly.Python.ORDER_ATOMIC);
    console.log("_wpath", _wpath);
    var _separator = block.getFieldValue('separator');
    var _code = ""
    if (_separator == "newline") {
        _code = "f.write(" + _wpath + " + '\\r\\n')\n";
    } else if (_separator == "comma") {
        _code = "f.write(" + _wpath + " + ',')\n";
    } else if (_separator == "space") {
        _code = "f.write(" + _wpath + " + ' ')\n";
    } else if (_separator == "semicolon") {
        _code = "f.write(" + _wpath + " + ';')\n";
    }
    return _code;
}

Blockly.Blocks['iot_system_close_file'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_CLOSE_FILE);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(32);
        this.setHelpUrl("");
        this.setTooltip(Blockly.Msg.SYSTEM_CLOSE_FILE);
    }
};

Blockly.Python.iot_system_close_file = function (block) {
    var _code = "f.close()\n";
    return _code;
}

Blockly.Blocks['iot_system_input_file'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_INPUT_FILE);
        this.appendValueInput("filename")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_WRITE_F);
        this.appendValueInput("PATH")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_CREATE_F_1);
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_WRITE_S)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.SYSTEM_WRITE_S_N, "newline"],
                [Blockly.Msg.SYSTEM_WRITE_S_C, "comma"],
                [Blockly.Msg.SYSTEM_WRITE_S_S, "space"],
                [Blockly.Msg.SYSTEM_WRITE_S_SE, "semicolon"]
            ]), "separator");
        this.setInputsInline(false);
        this.setOutput(true, null);
        // this.setPreviousStatement(true, null);
        // this.setNextStatement(true, null);
        this.setColour(32);
        // this.setTooltip("");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('separator');
            var TOOLTIPS = {
                'newline': Blockly.Msg.Iot_System_Input_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_N),
                'comma': Blockly.Msg.Iot_System_Input_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_C),
                'space': Blockly.Msg.Iot_System_Input_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_S),
                'semicolon': Blockly.Msg.Iot_System_Input_File_TOOLTIP.replace('%1', Blockly.Msg.SYSTEM_WRITE_S_SE)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python.iot_system_input_file = function (block) {
    var _filename = Blockly.Python.valueToCode(block, 'filename', Blockly.Python.ORDER_ATOMIC).replace("\"", "").replace("\"", "");
    var _path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC).replace("\"", "").replace("\"", "");
    var _separator = block.getFieldValue('separator');
    // 文字模式預設會把 \r\n 轉成 \n，split('\r\n') 就永遠切不開——newline='' 讀原樣，
    // 換行再把 \r\n 統一成 \n，兩種都認（不用 splitlines：它連 \f、\x1c 這些也切）。
    var _code = "def _GET_LIST_FROM_FILE(_path, _sep):\n"
    _code += "    with open(_path, 'r', newline='') as f:\n"
    _code += "        text = f.read()\n"
    _code += "    if _sep == '\\r\\n':\n"
    _code += "        text, _sep = text.replace('\\r\\n', '\\n'), '\\n'\n"
    _code += "    result = text.split(_sep)\n"
    _code += "    return result\n"
    Blockly.Python.addFunction("_GET_LIST_FROM_FILE", _code);
    _code = "_GET_LIST_FROM_FILE(\"" + _path + _filename + "\", '\\r\\n')";
    if (_separator == "newline") {
        _code = "_GET_LIST_FROM_FILE(\"" + _path + _filename + "\", '\\r\\n')";
    } else if (_separator == "comma") {
        _code = "_GET_LIST_FROM_FILE(\"" + _path + _filename + "\", ',')";
    } else if (_separator == "space") {
        _code = "_GET_LIST_FROM_FILE(\"" + _path + _filename + "\", ' ')";
    } else if (_separator == "semicolon") {
        _code = "_GET_LIST_FROM_FILE(\"" + _path + _filename + "\", ';')";
    }
    return [_code, Blockly.Python.ORDER_NONE];
}

Blockly.Blocks['iot_system_delete_file'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_system_delete);
        this.appendValueInput("PATH")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_CREATE_F_1);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(32);
        this.setTooltip(Blockly.Msg.iot_system_delete_file_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.iot_system_delete_file = function (block) {
    var _path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_os'] = 'import os\n'
    var _code = "os.remove(" + _path + ")\n";
    return _code;
}


Blockly.Blocks['iot_system_restart'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.Iot_System_Restart_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.iot_system_restart = function (block) {
    Blockly.Python.definitions_.import_machine = "import machine";
    var _code = "machine.reset()\n"
    return _code;
}

Blockly.Blocks['iot_system_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.system_get_size);
        this.setOutput(true, null);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.Iot_System_Get_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.iot_system_get = function (block) {
    var code = "_MCU_FREESPACE"
    return [code, Blockly.Python.ORDER_CONDITIONAL];
}

Blockly.Blocks['iot_system_mac'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.system_get_mac);
        this.setOutput(true, null);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.Iot_System_Mac_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.iot_system_mac = function (block) {
    Blockly.Python.definitions_.import_machine_ub = "import machine, ubinascii";
    var _code = "ubinascii.hexlify(machine.unique_id()).decode().upper()"
    return [_code, Blockly.Python.ORDER_CONDITIONAL];
}

Blockly.Blocks['iot_system_get_cocorobo_id'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.system_get_cocorobo_cid);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.Iot_System_Get_Cocorobo_Id_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_system_get_cocorobo_id'] = function (block) {
    Blockly.Python.definitions_['import_cocorobo_cid'] = 'from cocorobo import cid\n';
    // TODO: Assemble Python into code variable.
    var code = 'cid._GET_MACHINE_ID().strip(\'\\n\')';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['iot_system_get_cocorobo_firmware_version'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_system_get_cocorobo_firmware_version);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.iot_system_get_cocorobo_firmware_version_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_system_get_cocorobo_firmware_version'] = function (block) {
    Blockly.Python.definitions_['import_cocorobo_cid'] = '' +
        'try:\n' +
        '	from cocorobo import firmware_info\n' +
        'except BaseException as e:\n' +
        '	print(str(e))\n' +
        '	pass\n' +
        '\n';
    // TODO: Assemble Python into code variable.
    var code = 'firmware_info.iot()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['iot_system_delete'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_system_delete);
        this.appendValueInput("PATH")
            .setCheck(null)
            .appendField(Blockly.Msg.SYSTEM_CREATE_F);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#22398e");
        this.setTooltip(Blockly.Msg.iot_system_delete_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.iot_system_delete = function (block) {
    var _path = Blockly.Python.valueToCode(block, 'PATH', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_os'] = 'import os\n'
    var _code = "os.remove(" + _path + ")\n";
    return _code;
}


/*

  _____     _____   __                 _          
  \_   \___/__   \ / _\ ___ _ ____   _(_) ___ ___ 
   / /\/ _ \ / /\/ \ \ / _ \ '__\ \ / / |/ __/ _ \
/\/ /_| (_) / /    _\ \  __/ |   \ V /| | (_|  __/
\____/ \___/\/     \__/\___|_|    \_/ |_|\___\___|
                                                  

*/




var ESP32_IOT_COLOR = "#3c7683";
var IFTTT_BLOCK_COLOR = "#ff3b00";
var ONENET_BLOCK_COLOR = "#00b5ff";




Blockly.Blocks['esp32_main_controller_onenet_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/onenet_setup_logo.png", 130, 70, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_setup);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_server)
            .appendField(new Blockly.FieldTextInput("183.230.40.39"), "server_ip");
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_productid)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_PRODUCT_ID"), "product_id");
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_productkey)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_PRODUCT_KEY"), "product_api_key");
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_deviceid)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_DEVICE_ID"), "device_id");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};


Blockly.Python['esp32_main_controller_onenet_setup'] = function (block) {
    var text_server_ip = block.getFieldValue('server_ip');
    var text_product_id = block.getFieldValue('product_id');
    var text_product_api_key = block.getFieldValue('product_api_key');
    var text_device_id = block.getFieldValue('device_id');
    // TODO: Assemble Python into code variable.
    var code = '...\n';
    return code;
};





Blockly.Blocks['iot_service_onenet'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/onenet_setup_logo.png", 120, 70, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_send);
        /*this.appendValueInput("first_input")
            .setCheck(null)
            .appendField("Field 0");*/
        this.itemCount_ = 1;
        this.updateShape_();
        this.setMutator(new Blockly.Mutator(['iot_service_onenet_create_with_item']));
        this.setColour(ONENET_BLOCK_COLOR);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip("");
        this.setHelpUrl("");
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function (xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('iot_service_onenet_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
            var itemBlock = workspace.newBlock('iot_service_onenet_create_with_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        // Disconnect any children that don't belong.
        for (var i = 0; i < this.itemCount_; i++) {
            var connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) == -1) {
                connection.disconnect();
            }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
        }
    },
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    },
    updateShape_: function () {
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i);
                input.appendField(Blockly.Msg.iotservice_onenet_mqtt_send_item)
                    .appendField(new Blockly.FieldTextInput("Property" + i), "field" + i);
                //input.appendField("資料 " + (i + 1) + ":");
                //input.appendField(new Blockly.FieldLabelSerializable("field" + (i + 1)), 'FIELD' + i);
                // input.appendField(new Blockly.FieldTextInput("資料" + (i + 1)), 'FIELD' + i)
            }
        }
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }
    },
};

Blockly.Blocks['iot_service_onenet_create_with_container'] = {
    init: function () {
        this.setColour(ONENET_BLOCK_COLOR);
        this.appendDummyInput()
            .appendField("Items");
        this.appendStatementInput('STACK');
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Blocks['iot_service_onenet_create_with_item'] = {
    init: function () {
        this.setColour(ONENET_BLOCK_COLOR);
        this.appendDummyInput()
            .appendField("Field");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Python['iot_service_onenet'] = function (block) {

    var code = "";
    // onenet_data_final.slice(0, -3) + '}\''

    return code;
};


Blockly.Blocks['esp32_main_controller_onenet_when_receive_msg'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_receive);
        this.appendValueInput("content")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_receive_when);
        this.appendStatementInput("exec")
            .setCheck(null)
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_receive_exec);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_onenet_when_receive_msg'] = function (block) {
    var value_content = Blockly.Python.valueToCode(block, 'content', Blockly.Python.ORDER_ATOMIC);
    var statements_exec = Blockly.Python.statementToCode(block, 'exec');
    // TODO: Assemble Python into code variable.
    var code = '...\n';
    return code;
};


Blockly.Blocks['esp32_main_controller_onenet_disconnect'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_onenet_mqtt_disconnect);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip("");
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_onenet_disconnect'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = '\n';
    return code;
};


Blockly.Blocks['esp32_main_controller_ifttt_send_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ifttt_webhook.png", 110, 60, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_ifttt_send_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_ifttt_send_webhook)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_API_KEY"), "ifttt_api_key");
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_ifttt_send_eventname)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_EVENT_NAME"), "ifttt_event");
        this.appendValueInput("ifttt_data_1")
            .setCheck(null)
            .appendField(Blockly.Msg.iotservice_ifttt_send_1);
        this.appendValueInput("ifttt_data_2")
            .setCheck(null)
            .appendField(Blockly.Msg.iotservice_ifttt_send_2);
        this.appendValueInput("ifttt_data_3")
            .setCheck(null)
            .appendField(Blockly.Msg.iotservice_ifttt_send_3);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(IFTTT_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Ifttt_Send_Data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_ifttt_send_data'] = function (block) {
    var text_ifttt_api_key = block.getFieldValue('ifttt_api_key');
    var text_ifttt_event = block.getFieldValue('ifttt_event');
    var value_ifttt_data_1 = Blockly.Python.valueToCode(block, 'ifttt_data_1', Blockly.Python.ORDER_ATOMIC);
    var value_ifttt_data_2 = Blockly.Python.valueToCode(block, 'ifttt_data_2', Blockly.Python.ORDER_ATOMIC);
    var value_ifttt_data_3 = Blockly.Python.valueToCode(block, 'ifttt_data_3', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.

    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;

    var code = '' +
        '_IFTTT_POST_API_KEY = "' + text_ifttt_api_key + '"\n' +
        '_IFTTT_POST_EVENT_NAME = "' + text_ifttt_event + '"\n' +
        '_IFTTT_POST_ENDPOINT = "http://maker.ifttt.com/trigger/"+ _IFTTT_POST_EVENT_NAME + "/with/key/" + _IFTTT_POST_API_KEY\n' +
        '_IFTTT_POST_DATA = \'{"value1":"\'+ str(' + value_ifttt_data_1 + ') +\'","value2":"\'+ str(' + value_ifttt_data_2 + ') +\'","value3":"\'+ str(' + value_ifttt_data_3 + ') +\'"}\'\n' +
        '_IFTTT_POST_REQUEST = requests.post(_IFTTT_POST_ENDPOINT, data = _IFTTT_POST_DATA , headers = { "Content-type": "application/json" }, timeout=60)\n' +
        '\n';
    return code;
};



Blockly.Blocks['esp32_main_controller_ifttt_touched'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ifttt_webhook.png", 110, 60, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_ifttt_trigger_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_ifttt_trigger_webhook)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_API_KEY"), "key");
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_ifttt_trigger_eventname)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_EVENT_NAME"), "timename");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(IFTTT_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Main_Controller_Ifttt_Touched_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_main_controller_ifttt_touched'] = function (block) {
    var text_ifttt_api_key = block.getFieldValue('key');
    var text_timename = block.getFieldValue('timename');
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;
    var code = '_IFTTT_TRIGGER_EVENT_NAME = "' + text_timename + '"\n'
    code += '_IFTTT_TRIGGER_API_KEY = "' + text_ifttt_api_key + '"\n'
    code += '_IFTTT_TRIGGER_ENDPOINT = "https://maker.ifttt.com/trigger/" + _IFTTT_TRIGGER_EVENT_NAME + "/with/key/" + _IFTTT_TRIGGER_API_KEY\n'
    Blockly.Python.addSetup("esp32_main_controller_ifttt_touched", code);
    var code = '_IFTTT_GET_REQUEST = requests.get(_IFTTT_TRIGGER_ENDPOINT, timeout=60)\n'
    return code;
};


IOT_THINGSPEAK_COLOR = "#1b379f";
// IOT_THINGSPEAK_COLOR = ESP32_IOT_COLOR;


Blockly.Blocks['iot_service_thingspeak'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/thingspeak.png", 170, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_send_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_send_api)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_CHANNEL_WRITE_API_KEY"), "t_api");
        /*this.appendValueInput("first_input")
            .setCheck(null)
            .appendField("Field 0");*/
        this.itemCount_ = 1;
        this.updateShape_();
        this.setMutator(new Blockly.Mutator(['iot_service_thingspeak_create_with_item']));
        this.setColour(IOT_THINGSPEAK_COLOR);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Msg.Iot_Service_Thingspeak_TOOLTIP);
        this.setHelpUrl("");
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function (xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('iot_service_thingspeak_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
            var itemBlock = workspace.newBlock('iot_service_thingspeak_create_with_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        // Disconnect any children that don't belong.
        for (var i = 0; i < this.itemCount_; i++) {
            var connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) == -1) {
                connection.disconnect();
            }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
        }
    },
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    },
    updateShape_: function () {
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i);
                input.appendField("Field " + (i + 1) + ":");
                //input.appendField(new Blockly.FieldLabelSerializable("field" + (i + 1)), 'FIELD' + i);
                // input.appendField(new Blockly.FieldTextInput("field" + (i + 1)), 'FIELD' + i)
            }
        }
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }
    },
};

Blockly.Blocks['iot_service_thingspeak_create_with_container'] = {
    init: function () {
        this.setColour(IOT_THINGSPEAK_COLOR);
        this.appendDummyInput()
            .appendField("Items");
        this.appendStatementInput('STACK');
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Blocks['iot_service_thingspeak_create_with_item'] = {
    init: function () {
        this.setColour(IOT_THINGSPEAK_COLOR);
        this.appendDummyInput()
            .appendField("Field");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Python['iot_service_thingspeak'] = function (block) {
    var first_input = Blockly.Python.valueToCode(block, 'first_input', Blockly.Python.ORDER_ATOMIC);
    var api = block.getFieldValue('t_api');

    Blockly.Python.addVariable('_THINGSPEAK_REQUEST', '', true);
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;


    // var key = Blockly.Arduino.valueToCode(block, 'KEY', Blockly.Arduino.ORDER_ATOMIC).replace(/\"/g, '') || "";

    var item_field = '',
        item_value = '';
    var thingspeak_url = "http://api.thingspeak.com/update?api_key=" + api;
    for (var n = 0; n < this.itemCount_; n++) {
        item_field = "field" + (n + 1);
        item_value = Blockly.Python.valueToCode(this, 'ADD' + n,
            Blockly.Python.ORDER_NONE) || '';
        thingspeak_url += '&' + item_field + '=\"+str(' + item_value + ')+\"';
    }

    var code = '' +
        '_THINGSPEAK_ENDPOINT = "' + thingspeak_url + '"\n' +
        '_THINGSPEAK_REQUEST = requests.get(_THINGSPEAK_ENDPOINT,timeout=60)\n' +
        '';

    return code;
};



Blockly.Blocks['iot_service_thingspeak_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/thingspeak.png", 170, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_query_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_query_api)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_CHANNEL_READ_API_KEY"), "api_key");
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_channel_id)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_CHANNEL_ID"), "id");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(IOT_THINGSPEAK_COLOR);
        this.setTooltip(Blockly.Msg.Iot_Service_Thingspeak_Read_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['iot_service_thingspeak_read'] = function (block) {
    var text_api_key = block.getFieldValue('api_key');
    var text_id = block.getFieldValue('id');
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;

    Blockly.Python.addVariable('_THINGSPEAK_READ_REQUEST', '', true);
    // TODO: Assemble Python into code variable.
    var code = '_THINGSPEAK_READ_REQUEST = requests.get("https://api.thingspeak.com/channels/" + "' + text_id + '" + "/feeds.json?api_key=" + "' + text_api_key + '",timeout=60)\n';
    return code;
};


Blockly.Blocks['iot_service_thingspeak_read_total'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_read_total);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(IOT_THINGSPEAK_COLOR);
        this.setTooltip(Blockly.Msg.Iot_Service_Thingspeak_Read_Total_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_thingspeak_read_total'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = '_THINGSPEAK_READ_REQUEST.json()[\'channel\'][\'last_entry_id\']';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['iot_service_thingspeak_read_specific'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeak_get_title);
        this.appendValueInput("entry")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeaK_get_field);
        this.appendValueInput("field")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_thingspeaK_get_value);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(IOT_THINGSPEAK_COLOR);
        this.setTooltip(Blockly.Msg.Iot_Service_Thingspeak_Read_Specific_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_thingspeak_read_specific'] = function (block) {
    var value_entry = Blockly.Python.valueToCode(block, 'entry', Blockly.Python.ORDER_ATOMIC);
    var value_field = Blockly.Python.valueToCode(block, 'field', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = '_THINGSPEAK_READ_REQUEST.json()[\'feeds\'][' + value_entry + '][\'field' + value_field + '\']';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

// KUJU
var KUJU_BLOCK_COLOR = "#00b5ff";

Blockly.Blocks['iot_service_KUJU_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/KUJU.png", 110, 65, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.KUJU_title);
        this.appendValueInput("username")
            .setCheck(null)
            .appendField(Blockly.Msg.KUJU_username);
        this.appendValueInput("password")
            .setCheck(null)
            .appendField(Blockly.Msg.KUJU_password);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_KUJU_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_KUJU_setup'] = function (block) {
    var username = Blockly.Python.valueToCode(block, 'username', Blockly.Python.ORDER_ATOMIC);
    var password = Blockly.Python.valueToCode(block, 'password', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable('_COCOCLOUD_SEND_REQUEST', '_COCOCLOUD_SEND_REQUEST = None', true);
    Blockly.Python.addVariable('token', 'token = ""', true);

    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;

    Blockly.Python.definitions_['import_iot_service_KUJU_get_sensor_data'] = '' +
        'def GetSensorValue(typeCode):\n' +
        '    _COCOCLOUD_SEND_ENDPOINT = "http://ssl.kujuportal.com/apps/get_info"\n' +
        '    _COCOCLOUD_SEND_DATA = \'{"token":"\' + token + \'","type":"device_list"}\'\n' +
        '    try:\n' +
        '        _COCOCLOUD_SEND_REQUEST = requests.post(_COCOCLOUD_SEND_ENDPOINT, data = _COCOCLOUD_SEND_DATA, headers = { "Content-type": "application/json" }, timeout = 60)\n' +
        '        a = json.loads(str(_COCOCLOUD_SEND_REQUEST.content.decode("utf-8")).replace("\'","").replace("\'",""))\n' +
        '        if a["result"] == "1":\n' +
        '            info = a["info"]\n' +
        '            for i in range(len(info)):\n' +
        '                if info[i]["type_code"] == typeCode:\n' +
        '                    _COCOCLOUD_SEND_ENDPOINT = "http://ssl.kujuportal.com/apps/get_info"\n' +
        '                    _COCOCLOUD_SEND_DATA = \'{"token":"\' + token + \'","type":"device_status","gateway_sn":"\' + info[i]["gateway_sn"] + \'","system_id":"\' + info[i]["system_id"] + \'","type_code":"\' + info[i]["type_code"] + \'"}\'\n' +
        '                    _COCOCLOUD_SEND_REQUEST = requests.post(_COCOCLOUD_SEND_ENDPOINT, data = _COCOCLOUD_SEND_DATA, headers = { "Content-type": "application/json" }, timeout = 60)\n' +
        '                    a = json.loads(str(_COCOCLOUD_SEND_REQUEST.content.decode("utf-8")).replace("\'","").replace("\'",""))\n' +
        '                    if a["result"] == "1":\n' +
        '                        return a["info"]["value"]\n' +
        '    except BaseException as e:\n' +
        '        return 0\n' +
        '';

    var cococloud_data = "'{\"username\":" + username + ",\"password\":\"" + hex_md5(password.replace('"', '').replace('"', '')) + "\",\"type\":\"token\"}'";
    var code = '' +
        '_COCOCLOUD_SEND_ENDPOINT = "http://ssl.kujuportal.com/apps/user_token"\n' +
        '_COCOCLOUD_SEND_DATA = ' + cococloud_data + '\n' +
        'try:\n' +
        '    _COCOCLOUD_SEND_REQUEST = requests.post(_COCOCLOUD_SEND_ENDPOINT, data = _COCOCLOUD_SEND_DATA , headers = { "Content-type": "application/json" }, timeout = 60)\n' +
        '    token = json.loads(str(_COCOCLOUD_SEND_REQUEST.content.decode("utf-8")).replace("\'","").replace("\'",""))["info"]["token"]\n' +
        // '    print(token)\n' +
        'except BaseException as e:\n' +
        '    print(e)\n' +
        'pass\n' +
        '';

    return code;
};


Blockly.Blocks['iot_service_KUJU_controll'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/KUJU.png", 110, 65, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.KUJU_controll_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.KUJU_controll_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.KUJU_controll_action_0, "0"],
                [Blockly.Msg.KUJU_controll_action_1, "1"]
            ]), "type");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_KUJU_controll_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_KUJU_controll'] = function (block) {
    var dropdown_type = block.getFieldValue('type');

    var code = '' +
        '_COCOCLOUD_SEND_ENDPOINT = "http://ssl.kujuportal.com/apps/get_info"\n' +
        '_COCOCLOUD_SEND_DATA = \'{"token":"\' + token + \'","type":"device_list"}\'\n' +
        'try:\n' +
        '    _COCOCLOUD_SEND_REQUEST = requests.post(_COCOCLOUD_SEND_ENDPOINT, data = _COCOCLOUD_SEND_DATA, headers = { "Content-type": "application/json" }, timeout = 60)\n' +
        '    a = json.loads(str(_COCOCLOUD_SEND_REQUEST.content.decode("utf-8")).replace("\'","").replace("\'",""))\n' +
        '    if a["result"] == "1":\n' +
        '        info = a["info"]\n' +
        '        for i in range(len(info)):\n' +
        '            if info[i]["type_code"] == "0010001":\n' +
        '                _COCOCLOUD_SEND_ENDPOINT = "http://ssl.kujuportal.com/apps/ctrl_device"\n' +
        '                _COCOCLOUD_SEND_DATA = \'{"token":"\' + token + \'","type":"device","gateway_sn":"\' + info[i]["gateway_sn"] + \'","system_id":"\' + info[i]["system_id"] + \'","type_code":"\' + info[i]["type_code"] + \'","value":' + dropdown_type + '}\'\n' +
        '                _COCOCLOUD_SEND_REQUEST = requests.post(_COCOCLOUD_SEND_ENDPOINT, data = _COCOCLOUD_SEND_DATA, headers = { "Content-type": "application/json" }, timeout = 60)\n' +
        'except BaseException as e:\n' +
        '    print(e)\n' +
        'pass\n' +
        '';

    return code;
};

Blockly.Blocks['iot_service_KUJU_get_temperature_humidity_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/KUJU.png", 110, 65, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.KUJU_get_temperature_humidity_data_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_temperature, "temperature"],
                [Blockly.Msg.basic_humidity, "humidity"]
                // [Blockly.Msg.basic_pressure, "pressure"]
            ]), "env_get_type")
            .appendField(Blockly.Msg.basic_env_value);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_KUJU_get_temperature_humidity_data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_KUJU_get_temperature_humidity_data'] = function (block) {
    var dropdown_type = block.getFieldValue('env_get_type');
    var code = '';
    if (dropdown_type == "temperature") {
        code = "GetSensorValue(\"0320101\")";
    }
    if (dropdown_type == "humidity") {
        code = "GetSensorValue(\"0320201\")";
    }
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['iot_service_KUJU_get_motion_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/KUJU.png", 110, 65, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.KUJU_get_motion_data_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_motion_data, "move"],
                [Blockly.Msg.basic_illumination_intensity, "Illumination intensity"]
                // [Blockly.Msg.basic_pressure, "pressure"]
            ]), "env_get_type")
            .appendField(Blockly.Msg.basic_env_value);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_KUJU_get_motion_data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_KUJU_get_motion_data'] = function (block) {
    var dropdown_type = block.getFieldValue('env_get_type');
    var code = '';
    if (dropdown_type == "move") {
        code = "GetSensorValue(\"0300101\")";
    }
    if (dropdown_type == "Illumination intensity") {
        code = "GetSensorValue(\"0300201\")";
    }
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['iot_service_KUJU_get_sensor_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/KUJU.png", 110, 65, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.KUJU_get_sensor_data_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_water_sensor, "water sensor"],
                [Blockly.Msg.basic_door_sensor, "door sensor"]
                // [Blockly.Msg.basic_pressure, "pressure"]
            ]), "env_get_type")
            .appendField(Blockly.Msg.basic_env_value);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(ONENET_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_KUJU_get_sensor_data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_KUJU_get_sensor_data'] = function (block) {
    var dropdown_type = block.getFieldValue('env_get_type');
    var code = '';
    if (dropdown_type == "water sensor") {
        code = "GetSensorValue(\"0120001\")";
    }
    if (dropdown_type == "door sensor") {
        code = "GetSensorValue(\"0080001\")";
    }
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

// Wetech

var WETECH_COLOR = "#3CB371";

Blockly.Blocks['wifiServices_WeTech_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/wetech_header.png", 150, 60, "15"));
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifiServices_WeTech_title);
        this.appendValueInput("username")
            .setCheck(null)
            .appendField(Blockly.Msg.wifiServices_WeTech_username);
        this.appendValueInput("password")
            .setCheck(null)
            .appendField(Blockly.Msg.wifiServices_WeTech_password);
        this.appendValueInput("gateway_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY7)
        this.appendValueInput("mac_address")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY12)
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_setup_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_setup'] = function (block) {
    var username = Blockly.Python.valueToCode(block, 'username', Blockly.Python.ORDER_ATOMIC);
    var password = Blockly.Python.valueToCode(block, 'password', Blockly.Python.ORDER_ATOMIC);
    var gateway_id = Blockly.Python.valueToCode(block, 'gateway_id', Blockly.Python.ORDER_ATOMIC);
    var mac_address = Blockly.Python.valueToCode(block, 'mac_address', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.addVariable('_wetech_username', '_wetech_username = ' + username, true);
    Blockly.Python.addVariable('_wetech_password', '_wetech_password = ' + password, true);
    Blockly.Python.addVariable('_wetech_gateway_id', '_wetech_gateway_id = ' + gateway_id, true);
    Blockly.Python.addVariable('_wetech_mac_address', '_wetech_mac_address = ' + mac_address, true);

    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;
    Blockly.Python.definitions_['import_urequests'] = '' +
        'from umqtt_simple import MQTTClient\n' +
        'import ubinascii\n' +
        'import machine' +
        '';

    Blockly.Python.definitions_['import_wifiServices_WeTech_setup'] = '' +
        '\n' +
        '_wetech_mqtt_server = ""\n' +
        '_wetech_mqtt_username = ""\n' +
        '_wetech_mqtt_pw = ""\n' +
        '_WeTech_CLIENT_ID = ubinascii.hexlify(machine.unique_id())\n' +
        'isMqttConnect = False\n' +
        'MQTT_Data = None\n' +
        'client = None\n' +
        '\n' +
        'def restart_and_reconnect():\n' +
        '    print(\'Failed to connect to MQTT broker. Reconnecting...\')\n' +
        '    time.sleep(10)\n' +
        '    machine.reset()\n' +
        '\n' +
        'def connect_and_subscribe(CLIENT_ID,server,TOPIC,username,password):\n' +
        '    c = MQTTClient(CLIENT_ID, server,1883,username,password,keepalive=60)\n' +
        '    c.set_callback(sub_cb)                    #set callback\n' +
        '    c.connect()                               #connect mqtt\n' +
        '    c.subscribe(TOPIC)                        #client subscribes to a topic\n' +
        '    time.sleep(0.1)\n' +
        '    return c\n' +
        '\n' +
        'def sub_cb(topic, msg):\n' +
        '    global MQTT_Data\n' +
        '    MQTT_Data = json.loads(msg)[\'StatusList\']\n' +
        '\n' +
        'def setup_mqtt(url, username, password):\n' +
        '    global _wetech_mqtt_server,_wetech_mqtt_username,_wetech_mqtt_pw\n' +
        '    if _wetech_mqtt_server == "" and _wetech_mqtt_username == "" and _wetech_mqtt_pw == "":\n' +
        '        _WeTech_SEND_DATA = \"language=en&pf=ios&username=\"+ username + \"&password=\" + password\n' +
        '        try:\n' +
        '            _WeTech_SEND_REQUEST = requests.post(url, data = _WeTech_SEND_DATA , headers = { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" }, timeout = 60)\n' +
        '            #print(str(_WeTech_SEND_REQUEST.status_code)+", "+str(_WeTech_SEND_REQUEST.content))\n' +
        '            _wetech_mqtt_server = _WeTech_SEND_REQUEST.json()[\'mqtt_url\']\n' +
        '            _wetech_mqtt_username = _WeTech_SEND_REQUEST.json()[\'mqtt_username\']\n' +
        '            _wetech_mqtt_pw = _WeTech_SEND_REQUEST.json()[\'mqtt_pw\']\n' +
        '        except BaseException as e:\n' +
        '            print(e)\n' +
        '        pass\n' +
        '\n' +
        'def getStatusDeviceById(device_id):\n' +
        '    global _wetech_mqtt_server,_wetech_mqtt_username,_wetech_mqtt_pw,client, _wetech_mac_address, MQTT_Data,isMqttConnect\n' +
        '    data = \'{"SourceID":"\' + str(_WeTech_CLIENT_ID).replace("b\'","").replace("\'","") + \'", "DestID": "gateway/"\' + str(_wetech_mac_address) + \', "Cmd": "13", "DeviceID":"0"}\'\n' +
        '    setup_mqtt("http://ihouse.janwit.cn/ha/ios/process/checkLogin.php", _wetech_username, _wetech_password)\n' +
        '    if _wetech_mqtt_server != "" and _wetech_mqtt_username != "" and _wetech_mqtt_pw != "":\n' +
        '        if isMqttConnect == False:\n' +
        '            try:\n' +
        '                client = connect_and_subscribe(str(_WeTech_CLIENT_ID).replace("b\'","").replace("\'",""), _wetech_mqtt_server, "gateway/" + str(_wetech_mac_address) + "/" + str(_WeTech_CLIENT_ID).replace("b\'","").replace("\'",""), _wetech_mqtt_username, _wetech_mqtt_pw)\n' +
        '                time.sleep(0.1)\n' +
        '                isMqttConnect = True\n' +
        '                client.publish("gateway/" + str(_wetech_mac_address) , data, 1)\n' +
        '                time.sleep(0.1)\n' +
        '                client.wait_msg()\n' +
        '                return stringToHex(MQTT_Data,device_id)\n' +
        '            except OSError as e:\n' +
        '                restart_and_reconnect()\n' +
        '        else:\n' +
        '            try:\n' +
        '                client.publish("gateway/" + str(_wetech_mac_address) , data, 1)\n' +
        '                time.sleep(0.1)\n' +
        '                client.wait_msg()\n' +
        '                return stringToHex(MQTT_Data,device_id)\n' +
        '            except OSError as e:\n' +
        '                restart_and_reconnect()\n' +
        '\n' +
        'def stringToHex(msg,device_id):\n' +
        '    status = None\n' +
        '    for item in msg:\n' +
        '        if str(item[\'id\']) == device_id:\n' +
        '            status = item[\'status\']\n' +
        '            break\n' +
        '    status_value =status[6:] + status[4:6] + status[2:4] +  status[0:2]\n' +
        '    return round(float(int(status_value,16) / 100),2)\n' +
        '\n' +
        'def decToHexstring(x):\n' +
        '    hex_str = \'{:04X}\'.format(data*100)\n' +
        '    data_h, data_l = hex_str[0:2], hex_str[2:4]\n' +
        '    return str(data_l) + str(data_h)\n' +
        '\n' +
        'def controllDeviceById(url, username, password, gateway_id, device_id, status):\n' +
        '    _WeTech_SEND_DATA = \"language=en&pf=ios&username=\"+ username + \"&password=\" + password +\"&cmd=control_device_req&gateway_id="+ gateway_id +"&controlList=[{\\\"DeviceID\\\":\\\"" +  device_id + "\\\",\\\"Status\\\":\\\""+ status +"\\\",\\\"delayTime\\\":\\\"0\\\"}]\"\n' +
        '    try:\n' +
        '        _WeTech_SEND_REQUEST = requests.post(url, data = _WeTech_SEND_DATA , headers = { "Content-type": "application/x-www-form-urlencoded; charset=UTF-8" }, timeout = 60)\n' +
        '        print(str(_WeTech_SEND_REQUEST.status_code)+", "+str(_WeTech_SEND_REQUEST.content))\n' +
        '    except BaseException as e:\n' +
        '        print(e)\n' +
        '    pass\n' +
        '\n' +
        '';
    var code = '';
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY6)
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.WeTech_controll_action_0, "0"],
                [Blockly.Msg.WeTech_controll_action_1, "1"]
            ]), "type");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var code = '';
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    if (dropdown_type == 0) {
        code += "" +
            "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"FF000000\")\n";
    }
    else {
        code += "" +
            "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"00000000\")\n";
    }
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_second_way'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY8)
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.WeTech_controll_action_0, "0"],
                [Blockly.Msg.WeTech_controll_action_1, "1"]
            ]), "type");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_second_way_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_second_way'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var code = '';
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    if (dropdown_type == 0) {
        code += "" +
            "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"FF000000\")\n";
    }
    else {
        code += "" +
            "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"00000000\")\n";
    }
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_curtain_sensor'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY9)
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.WeTech_controll_action_0, "0"],
                [Blockly.Msg.WeTech_controll_action_1, "1"],
                [Blockly.Msg.WeTech_controll_action_2, "2"]
            ]), "type");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_curtain_sensor_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_curtain_sensor'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var code = "";
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    if (dropdown_type == 0) {
        code += "" +
            "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"01000000\")\n";
    }
    else if (dropdown_type == 1) {
        code += "" +
            "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"00000000\")\n";
    }
    else {
        code += "" +
            "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"02000000\")\n";
    }
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_air_conditioning_mode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY10)
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_air_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.WeTech_controll_mode_0, "00FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_1, "01FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_2, "03FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_3, "04FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_4, "05FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_5, "06FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_6, "07FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_7, "08FFFFFF"],
                [Blockly.Msg.WeTech_controll_mode_8, "09FFFFFF"],
                // [Blockly.Msg.WeTech_controll_mode_9, "F0FFFFFF"]
            ]), "type");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_air_conditioning_mode_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_air_conditioning_mode'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    var code = "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"" + dropdown_type + "\")\n";
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_wind_speed_mode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY10)
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_wind_speed_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.WeTech_controll_action_0, "FF00FFFF"],
                [Blockly.Msg.WeTech_controll_mode_10, "FF01FFFF"],
                [Blockly.Msg.WeTech_controll_mode_11, "FF02FFFF"],
                [Blockly.Msg.WeTech_controll_mode_12, "FF03FFFF"],
                [Blockly.Msg.WeTech_controll_mode_13, "FF05FFFF"]
            ]), "type");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_wind_speed_mode_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_wind_speed_mode'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    var code = "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"" + dropdown_type + "\")\n";
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_temp'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY10)
        this.appendValueInput("ADD0")
            .setCheck(null)
            .appendField(Blockly.Msg.WeTech_controll_temp_content)
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_temp_TOOLTIP);
        this.setHelpUrl("");
    },
    onchange: function () {
        var num = this.getChildren()[1].getFieldValue("NUM");
        if (num > 30) {
            this.getChildren()[1].getField("NUM").setValue("30");
        }
        else if (num < 16) {
            this.getChildren()[1].getField("NUM").setValue("16");
        }
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_temp'] = function (block) {
    var ADD0 = Blockly.Python.valueToCode(block, 'ADD0', Blockly.Python.ORDER_ATOMIC);
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    var code = "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"FFFF\" + decToHexstring(" + ADD0 + "))\n";
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_all_mode'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY10)
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_air_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.WeTech_controll_mode_0, "00"],
                [Blockly.Msg.WeTech_controll_mode_1, "01"],
                [Blockly.Msg.WeTech_controll_mode_2, "03"],
                [Blockly.Msg.WeTech_controll_mode_3, "04"],
                [Blockly.Msg.WeTech_controll_mode_4, "05"],
                [Blockly.Msg.WeTech_controll_mode_5, "06"],
                [Blockly.Msg.WeTech_controll_mode_6, "07"],
                [Blockly.Msg.WeTech_controll_mode_7, "08"],
                [Blockly.Msg.WeTech_controll_mode_8, "09"],
                // [Blockly.Msg.WeTech_controll_mode_9, "9"]
            ]), "air_conditioning_mode_type");
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_wind_speed_content)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.WeTech_controll_action_0, "00"],
                [Blockly.Msg.WeTech_controll_mode_10, "01"],
                [Blockly.Msg.WeTech_controll_mode_11, "02"],
                [Blockly.Msg.WeTech_controll_mode_12, "03"],
                [Blockly.Msg.WeTech_controll_mode_13, "05"]
            ]), "speed_mode_type");
        this.appendValueInput("ADD0")
            .setCheck(null)
            .appendField(Blockly.Msg.WeTech_controll_temp_content)
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_all_mode_TOOLTIP);
        this.setHelpUrl("");
    },
    onchange: function () {
        var num = this.getChildren()[1].getFieldValue("NUM");
        if (num > 30) {
            this.getChildren()[1].getField("NUM").setValue("30");
        }
        else if (num < 16) {
            this.getChildren()[1].getField("NUM").setValue("16");
        }
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_all_mode'] = function (block) {
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var air_conditioning_mode_type = block.getFieldValue('air_conditioning_mode_type');
    var speed_mode_type = block.getFieldValue('speed_mode_type');
    var ADD0 = Blockly.Python.valueToCode(block, 'ADD0', Blockly.Python.ORDER_ATOMIC);
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    var code = "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", \"" + air_conditioning_mode_type + speed_mode_type + "\" + decToHexstring(" + ADD0 + "))\n";
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_IR'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WIFIEASYMODE_WeTech_KEY11)
        this.appendValueInput("ADD0")
            .setCheck(null)
            .appendField(Blockly.Msg.WeTech_controll_IR_content)
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_IR_TOOLTIP);
        this.setHelpUrl("");
    },
    onchange: function () {
        var num = this.getChildren()[1].getFieldValue("NUM");
        if (num > 255) {
            this.getChildren()[1].getField("NUM").setValue("255");
        }
        else if (num < 0) {
            this.getChildren()[1].getField("NUM").setValue("0");
        }
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_IR'] = function (block) {
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var ADD0 = Blockly.Python.valueToCode(block, 'ADD0', Blockly.Python.ORDER_ATOMIC);
    var item_url = "http://ihouse.janwit.cn/ha/ios/bsInterface.php";
    var code = "controllDeviceById(\"" + item_url + "\", _wetech_username, _wetech_password, _wetech_gateway_id, " + device_id + ", str('{:02X}'.format(" + ADD0 + ")) + \"000000\");\n";
    return code;
};

Blockly.Blocks['wifiServices_WeTech_controll_derail_get_power_meter'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_power_meter);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.WeTech_controll_power_meter_1)
        this.setOutput(true);
        this.setInputsInline(false);
        this.setColour(WETECH_COLOR);
        this.setTooltip(Blockly.Msg.wifiServices_WeTech_controll_derail_get_power_meter_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_get_power_meter'] = function (block) {
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var code = "getStatusDeviceById(" + device_id + ")";
    return [code, Blockly.Python.ORDER_ATOMIC];
}

Blockly.Blocks['wifiServices_WeTech_controll_derail_get_sensor_number'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.WeTech_controll_power_meter);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.Wetech_controll_pm25_sensor, "0"],
                [Blockly.Msg.Wetech_controll_CO2_sensor, "1"],
                [Blockly.Msg.Wetech_controll_Temperature_sensor, "2"],
                [Blockly.Msg.Wetech_controll_Humidity_sensor, "3"]
            ]), "type")
            .appendField(Blockly.Msg.Wetech_controll_sensor_title);
        this.setOutput(true);
        this.setInputsInline(false);
        this.setColour(WETECH_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                '0': Blockly.Msg.wifiServices_WeTech_controll_derail_get_sensor_number_TOOLTIP.replace('%1', Blockly.Msg.Wetech_controll_pm25_sensor),
                '1': Blockly.Msg.wifiServices_WeTech_controll_derail_get_sensor_number_TOOLTIP.replace('%1', Blockly.Msg.Wetech_controll_CO2_sensor),
                '2': Blockly.Msg.wifiServices_WeTech_controll_derail_get_sensor_number_TOOLTIP.replace('%1', Blockly.Msg.Wetech_controll_Temperature_sensor),
                '3': Blockly.Msg.wifiServices_WeTech_controll_derail_get_sensor_number_TOOLTIP.replace('%1', Blockly.Msg.Wetech_controll_Humidity_sensor)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['wifiServices_WeTech_controll_derail_get_sensor_number'] = function (block) {
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var type = block.getFieldValue('type');
    var code = "getStatusDeviceById(" + device_id + ")";
    return [code, Blockly.Python.ORDER_ATOMIC];
};

// tuya

var tuya_BLOCK_COLOR = "#FF5500";

Blockly.Blocks['iot_service_tuya_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_service_tuya_title);
        this.appendValueInput("access_id")
            .setCheck(null)
            .appendField(Blockly.Msg.iot_service_tuya_access_id);
        this.appendValueInput("access_secret")
            .setCheck(null)
            .appendField(Blockly.Msg.iot_service_tuya_access_secret);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(tuya_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_tuya_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_tuya_setup'] = function (block) {
    var access_id = Blockly.Python.valueToCode(block, 'access_id', Blockly.Python.ORDER_ATOMIC);
    var access_secret = Blockly.Python.valueToCode(block, 'access_secret', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['import_iot_service_tuya_setup'] = '' +
        '\n' +
        'import tuya\n' +
        'import  json\n' +
        '\n' +
        '\n' +
        'access_id = ' + access_id + '\n' +
        'access_secret = ' + access_secret + '\n' +
        '\n' +
        'def getAccessToken():\n' +
        '    global access_id, access_secret\n' +
        '    return tuya.setToken(access_id,access_secret)\n' +
        '\n' +
        '\n' +
        'def getTuyaDeviceList():\n' +
        '    deviceList = tuya.getData(\"/v1.0/iot-01/associated-users/devices\")\n' +
        '    dlist = []\n' +
        '    for i in range(len(deviceList["result"]["devices"])):\n' +
        '        dlist.append({\"id\":deviceList[\"result\"][\"devices\"][i][\"id\"],\"name\":deviceList[\"result\"][\"devices\"][i][\"name\"]})\n' +
        '    return dlist\n' +
        '\n' +
        '\n' +
        'def getTuyaTempAndHumValue(url,sign):\n' +
        '    deviceInfo = tuya.getData(url)\n' +
        '    tuyaValue = 0.0\n' +
        '    for i in range(3):\n' +
        '        if sign == 0 and deviceInfo["result"][i]["code"] == \"va_temperature\":\n' +
        '            tuyaValue = deviceInfo["result"][i]["value"] / 100\n' +
        '            break\n' +
        '        if sign == 1 and deviceInfo["result"][i]["code"] == \"va_humidity\":\n' +
        '            tuyaValue = deviceInfo["result"][i]["value"] / 100\n' +
        '            break\n' +
        '    return tuyaValue\n' +
        '\n' +
        '\n' +
        'def rgb2hsv(r, g, b):\n' +
        '    r, g, b = r/255.0, g/255.0, b/255.0\n' +
        '    mx = max(r, g, b)\n' +
        '    mn = min(r, g, b)\n' +
        '    m = mx-mn\n' +
        '    if mx == mn:\n' +
        '        h = 1\n' +
        '    elif mx == r:\n' +
        '        if g >= b:\n' +
        '            h = ((g-b)/m)*60\n' +
        '        else:\n' +
        '            h = ((g-b)/m)*60 + 360\n' +
        '    elif mx == g:\n' +
        '        h = ((b-r)/m)*60 + 120\n' +
        '    elif mx == b:\n' +
        '        h = ((r-g)/m)*60 + 240\n' +
        '    if mx == 0:\n' +
        '        s = 1\n' +
        '    else:\n' +
        '        s = m/mx\n' +
        '    v = mx\n' +
        '    H = h * 1.0\n' +
        '    S = s * 255.0\n' +
        '    V = v * 255.0\n' +
        '    return str({\"h\":H,\"s\":S,\"v\":V})\n' +
        '\n' +
        '';
    var code = '';
    return code;
};

Blockly.Blocks['iot_service_tuya_setToken'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_service_tuya_setToken_text);
        this.appendStatementInput("NAME")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_speech_recognition_any_result_text_do);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(tuya_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_tuya_setToken_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_tuya_setToken'] = function (block) {
    var statements_name = Blockly.Python.statementToCode(block, 'NAME');
    var code = '' +
        'if (getAccessToken() == True):\n' +
        statements_name +
        '';
    return code;
};

Blockly.Blocks['iot_service_tuya_getDeviceList'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_service_tuya_getDeviceList_text);
        this.setOutput(true, null);
        this.setColour(tuya_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_tuya_setToken_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_tuya_getDeviceList'] = function (block) {
    var code = 'getTuyaDeviceList()';
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['iot_service_tuya_controll_light_belt'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_service_tuya_controll_light_belt_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.iot_service_tuya_controll_light_belt_device_id);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_service_tuya_controll_light_belt_des)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_0, "0"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_1, "1"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_2, "2"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_3, "3"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_4, "4"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_5, "5"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_6, "6"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_7, "7"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_8, "8"],
                [Blockly.Msg.iot_service_tuya_controll_light_belt_status_9, "9"]
            ]), "status");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(tuya_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_tuya_controll_light_belt_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_tuya_controll_light_belt'] = function (block) {
    var dropdown_type = block.getFieldValue('status');
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var code = '';
    if (dropdown_type == "0") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"switch_led\",\"value\": false}]}')\n";
    }
    else if (dropdown_type == "1") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"switch_led\",\"value\": true}]}')\n";
    }
    else if (dropdown_type == "2") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"flash_scene_1\",\"value\": {\"bright\":255,\"frequency\":80,\"hsv\":[{\"h\":120.0,\"s\":255.0,\"v\":255.0}],\"temperature\":255}}]}')\n";
    }
    else if (dropdown_type == "3") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"flash_scene_2\",\"value\": {\"bright\":255,\"frequency\":190,\"hsv\":[{\"h\":0.0,\"s\":255.0,\"v\":255.0},{\"h\":120.0,\"s\":255.0,\"v\":255.0},{\"h\":240.0,\"s\":255.0,\"v\":255.0},{\"h\":54.8,\"s\":255.0,\"v\":255.0},{\"h\":183.1,\"s\":255.0,\"v\":255.0},{\"h\":288.0,\"s\":255.0,\"v\":255.0}],\"temperature\":255}}]}')\n";
    }
    else if (dropdown_type == "4") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"flash_scene_3\",\"value\": {\"bright\":255,\"frequency\":80,\"hsv\":[{\"h\":0.0,\"s\":255.0,\"v\":255.0}],\"temperature\":255}}]}')\n";
    }
    else if (dropdown_type == "5") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"flash_scene_4\",\"value\": {\"bright\":255,\"frequency\":55,\"hsv\":[{\"h\":0.0,\"s\":255.0,\"v\":255.0},{\"h\":120.0,\"s\":255.0,\"v\":255.0},{\"h\":60.0,\"s\":255.0,\"v\":255.0},{\"h\":300.0,\"s\":255.0,\"v\":255.0},{\"h\":240.0,\"s\":255.0,\"v\":255.0},{\"h\":0.0,\"s\":255.0,\"v\":255.0}],\"temperature\":255}}]}')\n";
    }
    else if (dropdown_type == "6") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"scene_data\",\"value\": {\"h\":37.5,\"s\":255.0,\"v\":189.0}}]}')\n";
    }
    else if (dropdown_type == "7") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"scene_data\",\"value\": {\"h\":37.5,\"s\":8.0,\"v\":255.0}}]}')\n";
    }
    else if (dropdown_type == "8") {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"scene_data\",\"value\": {\"h\":16.2,\"s\":255.0,\"v\":207.0}}]}')\n";
    }
    else {
        code += "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"scene_data\",\"value\": {\"h\":226.0,\"s\":175.7,\"v\":180.0}}]}')\n";
    }
    return code;
};

Blockly.Blocks['iot_service_tuya_controll_light_belt_color_value'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iot_service_tuya_controll_light_belt_color_value_title);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.iot_service_tuya_controll_light_belt_device_id);
        this.appendValueInput("COLOR")
            .setCheck(null)
            .appendField(Blockly.Msg.iot_service_tuya_controll_light_belt_color_value_title1);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(tuya_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_tuya_controll_light_belt_color_value_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_tuya_controll_light_belt_color_value'] = function (block) {
    var COLOR = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC).split("(")[2].split(")")[0];
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = "tuya.postData(\"/v1.0/devices/\"+" + device_id + "+\"/commands\",'{\"commands\": [{\"code\": \"work_mode\",\"value\": \"colour\"},{\"code\": \"colour_data\",\"value\": '+ rgb2hsv(" + COLOR + ") + '}]}')\n";
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

Blockly.Blocks['iot_service_tuya_get_temperature_humidity_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.KUJU_get_temperature_humidity_data_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.basic_temperature, "temperature"],
                [Blockly.Msg.basic_humidity, "humidity"]
                // [Blockly.Msg.basic_pressure, "pressure"]
            ]), "env_get_type")
            .appendField(Blockly.Msg.basic_env_value);
        this.appendValueInput("device_id")
            .setCheck(null)
            .appendField(Blockly.Msg.iot_service_tuya_controll_light_belt_device_id);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(tuya_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.iot_service_KUJU_get_temperature_humidity_data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_tuya_get_temperature_humidity_data'] = function (block) {
    var dropdown_type = block.getFieldValue('env_get_type');
    var device_id = Blockly.Python.valueToCode(block, 'device_id', Blockly.Python.ORDER_ATOMIC);
    var code = '';
    if (dropdown_type == "temperature") {
        code = "getTuyaTempAndHumValue(\"/v1.0/devices/\"+" + device_id + "+\"/status\",0)";
    }
    if (dropdown_type == "humidity") {
        code = "getTuyaTempAndHumValue(\"/v1.0/devices/\"+" + device_id + "+\"/status\",1)";
    }
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

// cococloud 

var COCOCLOUD_BLOCK_COLOR = "#4085de";


Blockly.Blocks['iot_service_cococloud'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/cococloud_send.png", 180, 65, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_send_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_send_title_api)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_EVENT_API_KEY"), "t_api");
        /*this.appendValueInput("first_input")
            .setCheck(null)
            .appendField("Field 0");*/
        this.itemCount_ = 1;
        this.updateShape_();
        this.setMutator(new Blockly.Mutator(['iot_service_cococloud_create_with_item']));
        this.setColour(COCOCLOUD_BLOCK_COLOR);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Msg.Iot_Service_Cococloud_TOOLTIP);
        this.setHelpUrl("");
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function (xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('iot_service_cococloud_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
            var itemBlock = workspace.newBlock('iot_service_cococloud_create_with_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        // Disconnect any children that don't belong.
        for (var i = 0; i < this.itemCount_; i++) {
            var connection = this.getInput('ADD' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) == -1) {
                connection.disconnect();
            }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
        }
    },
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('ADD' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    },
    updateShape_: function () {
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('ADD' + i)) {
                var input = this.appendValueInput('ADD' + i);
                input.appendField(Blockly.Msg.iotservice_cococloud_send_property)
                    .appendField(new Blockly.FieldTextInput("Property" + i), "field" + i);
                //input.appendField("資料 " + (i + 1) + ":");
                //input.appendField(new Blockly.FieldLabelSerializable("field" + (i + 1)), 'FIELD' + i);
                // input.appendField(new Blockly.FieldTextInput("資料" + (i + 1)), 'FIELD' + i)
            }
        }
        while (this.getInput('ADD' + i)) {
            this.removeInput('ADD' + i);
            i++;
        }
    },
};

Blockly.Blocks['iot_service_cococloud_create_with_container'] = {
    init: function () {
        this.setColour(COCOCLOUD_BLOCK_COLOR);
        this.appendDummyInput()
            .appendField("Items");
        this.appendStatementInput('STACK');
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Blocks['iot_service_cococloud_create_with_item'] = {
    init: function () {
        this.setColour(COCOCLOUD_BLOCK_COLOR);
        this.appendDummyInput()
            .appendField("Field");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setTooltip('');
        this.contextMenu = false;
    }
};

Blockly.Python['iot_service_cococloud'] = function (block) {
    var api = block.getFieldValue('t_api');

    Blockly.Python.addVariable('_COCOCLOUD_SEND_REQUEST', '_COCOCLOUD_SEND_REQUEST = None', true);
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`


    // var key = Blockly.Arduino.valueToCode(block, 'KEY', Blockly.Arduino.ORDER_ATOMIC).replace(/\"/g, '') || "";

    var item_field = '',
        item_value = '';
    var cococloud_data = cococloud_data = '{';
    for (var n = 0; n < this.itemCount_; n++) {
        console.log(block.getFieldValue("field" + n))
        item_field = block.getFieldValue("field" + n);
        item_value = Blockly.Python.valueToCode(this, 'ADD' + n, Blockly.Python.ORDER_NONE) || '';
        cococloud_data += `"${item_field}":${item_value},`
        // cococloud_data += "+  item_field + '":"\' + str(' + item_value + ') + \'",';
    }
    var cococloud_data_final = cococloud_data.slice(0, -1) + '}';
    var code = `
_COCOCLOUD_SEND_ENDPOINT = "http://api.cocorobo.cn/iot/data/eventAPIKeyJson/${api}"
_COCOCLOUD_SEND_DATA = ${cococloud_data_final}
try:
    _COCOCLOUD_SEND_REQUEST = requests.post(_COCOCLOUD_SEND_ENDPOINT, json = _COCOCLOUD_SEND_DATA , headers = { "Content-type": "application/json" }, timeout = 60)
    print(str(_COCOCLOUD_SEND_REQUEST.status_code)+", "+str(_COCOCLOUD_SEND_REQUEST.content))
except BaseException as e:
    print(e)
pass
`
    return code;
};

Blockly.Blocks['v831_service_cococloud'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/cococloud_send.png", 180, 65, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_send_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_send_title_api)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_EVENT_API_KEY"), "t_api");
        /*this.appendValueInput("first_input")
            .setCheck(null)
            .appendField("Field 0");*/
        this.itemCount_ = 1;
        this.updateShape_();
        this.setMutator(new Blockly.Mutator(['iot_service_cococloud_create_with_item']));
        this.setColour(COCOCLOUD_BLOCK_COLOR);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setTooltip(Blockly.Msg.Iot_Service_Cococloud_TOOLTIP);
        this.setHelpUrl("");
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function (xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    decompose: function (workspace) {
        var containerBlock = workspace.newBlock('iot_service_cococloud_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
            var itemBlock = workspace.newBlock('iot_service_cococloud_create_with_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    compose: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
        // Disconnect any children that don't belong.
        for (var i = 0; i < this.itemCount_; i++) {
            var connection = this.getInput('KEY' + i).connection.targetConnection;
            if (connection && connections.indexOf(connection) == -1) {
                connection.disconnect();
            }
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            Blockly.Mutator.reconnect(connections[i], this, 'KEY' + i);
        }
    },
    saveConnections: function (containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        var i = 0;
        while (itemBlock) {
            var input = this.getInput('KEY' + i);
            itemBlock.valueConnection_ = input && input.connection.targetConnection;
            i++;
            itemBlock = itemBlock.nextConnection &&
                itemBlock.nextConnection.targetBlock();
        }
    },
    updateShape_: function () {
        for (var i = 0; i < this.itemCount_; i++) {
            if (!this.getInput('KEY' + i) && !this.getInput('ADD' + i)) {
                var input = this.appendValueInput('KEY' + i);
                input.appendField(Blockly.Msg.iotservice_cococloud_send_property)
                //     .appendField(new Blockly.FieldValueInput("KEY" + i));

                var ADD = this.appendValueInput("ADD" + i)
                ADD.appendField(Blockly.Msg.iotservice_cococloud_send_property_1)
            }
        }
        while (this.getInput('KEY' + i) && this.getInput('ADD' + i)) {
            this.removeInput('KEY' + i);
            this.removeInput('ADD' + i);
            i++;
        }
    },
};

Blockly.Python['v831_service_cococloud'] = function (block) {
    var api = block.getFieldValue('t_api');

    Blockly.Python.addVariable('_COCOCLOUD_SEND_REQUEST', '_COCOCLOUD_SEND_REQUEST = None', true);

    Blockly.Python.definitions_['v831_import_requests'] = `import requests`


    // var key = Blockly.Arduino.valueToCode(block, 'KEY', Blockly.Arduino.ORDER_ATOMIC).replace(/\"/g, '') || "";

    var item_field = '',
        item_value = '';
    var cococloud_data = cococloud_data = '{';
    for (var n = 0; n < this.itemCount_; n++) {
        item_field = Blockly.Python.valueToCode(this, 'KEY' + n, Blockly.Python.ORDER_NONE) || '';
        item_value = Blockly.Python.valueToCode(this, 'ADD' + n, Blockly.Python.ORDER_NONE) || '';
        cococloud_data += `${item_field}:${item_value},`
        // cococloud_data += "+  item_field + '":"\' + str(' + item_value + ') + \'",';
    }
    var cococloud_data_final = cococloud_data.slice(0, -1) + '}';
    console.log(cococloud_data_final)
    var code = `
_COCOCLOUD_SEND_ENDPOINT = "http://api.cocorobo.cn/iot/data/eventAPIKeyJson/${api}"
_COCOCLOUD_SEND_DATA = ${cococloud_data_final}
try:
    _COCOCLOUD_SEND_REQUEST = requests.post(_COCOCLOUD_SEND_ENDPOINT, json = _COCOCLOUD_SEND_DATA , headers = { "Content-type": "application/json" }, timeout = 60)
    print(str(_COCOCLOUD_SEND_REQUEST.status_code)+", "+str(_COCOCLOUD_SEND_REQUEST.content))
except BaseException as e:
    print(e)
pass
`;
    return code;
};

Blockly.Blocks['iot_service_cococloud_read'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/cococloud_get.png", 200, 70, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_get_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_get_api)
            .appendField(new Blockly.FieldTextInput("ENTER_YOUR_EVENT_API_KEY"), "api");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COCOCLOUD_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Iot_Service_Cococloud_Read_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['iot_service_cococloud_read'] = function (block) {
    var api = block.getFieldValue('api');

    Blockly.Python.addVariable('_COCOCLOUD_READ_REQUEST', '_COCOCLOUD_READ_REQUEST = None', true);
    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    // TODO: Assemble Python into code variable.
    var code = '_COCOCLOUD_READ_REQUEST = requests.get("http://api.cocorobo.cn/iot/data/eventAPIKeyJson/" + "' + api + '", timeout=60)\n';
    return code;
};


Blockly.Blocks['iot_service_cococloud_read_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_get_property);
        this.appendValueInput("property")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.iotservice_cococloud_get_data);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour(COCOCLOUD_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Iot_Service_Cococloud_Read_Data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['iot_service_cococloud_read_data'] = function (block) {
    var property = Blockly.Python.valueToCode(block, 'property', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = '_COCOCLOUD_READ_REQUEST.json()[\'data\'][0][' + property + ']';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


/*
     __     _                      _        __                            _   
  /\ \ \___| |___      _____  _ __| | __   /__\ ___  __ _ _   _  ___  ___| |_ 
 /  \/ / _ \ __\ \ /\ / / _ \| '__| |/ /  / \/// _ \/ _` | | | |/ _ \/ __| __|
/ /\  /  __/ |_ \ V  V / (_) | |  |   <  / _  \  __/ (_| | |_| |  __/\__ \ |_ 
\_\ \/ \___|\__| \_/\_/ \___/|_|  |_|\_\ \/ \_/\___|\__, |\__,_|\___||___/\__|
                                                       |_|                    
*/

var NETWORK_BLOCK_COLOR = "#16318a";


Blockly.Blocks['esp32_network_http_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/http_header_get.png", 180, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_http_get_title);
        this.appendValueInput("http_get_url")
            .setCheck(null)
            .appendField(Blockly.Msg.internet_http_get_url);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Network_Http_Get_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['esp32_network_http_get'] = function (block) {
    var url = Blockly.Python.valueToCode(block, 'http_get_url', Blockly.Python.ORDER_ATOMIC);

    Blockly.Python.addVariable('_SEND_HTTP_GET_ENDPOINT', '', true);
    Blockly.Python.addVariable('_SEND_HTTP_REQUEST', '', true);

    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;
    Blockly.Python.definitions_['v831_import_SEND_HTTP'] = `_SEND_HTTP_GET_ENDPOINT = ${url}`;
    // TODO: Assemble Python into code variable.

    var code = '_SEND_HTTP_REQUEST = requests.get(_SEND_HTTP_GET_ENDPOINT)\n';
    return code;
};

Blockly.Blocks['cocopi_email_send'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.send_email_title);
        this.appendValueInput("email")
            .setCheck(null)
            .appendField(Blockly.Msg.send_email_to);
        this.appendValueInput("email_title")
            .setCheck(null)
            .appendField(Blockly.Msg.send_email_content_title);
        this.appendValueInput("email_content")
            .setCheck(null)
            .appendField(Blockly.Msg.send_email_content);
        // this.setOutput(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Network_Http_Get_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['cocopi_email_send'] = function (block) {
    var Email = Blockly.Python.valueToCode(block, 'email', Blockly.Python.ORDER_ATOMIC);
    var EmailTitle = Blockly.Python.valueToCode(block, 'email_title', Blockly.Python.ORDER_ATOMIC);
    var EmailContent = Blockly.Python.valueToCode(block, 'email_content', Blockly.Python.ORDER_ATOMIC);

    Blockly.Python.definitions_['v831_import_requests'] = `import requests`
    Blockly.Python.definitions_['v831_import_json'] = `import json`;
    // TODO: Assemble Python into code variable.
    Blockly.Python.addFunction(`send_email`, `def send_email(email,content,title):
    params = {
        "email": email,
        "content": content,
        "subject":title,
        "content_type":'plain'
    }
    emailURL = "https://traininguser-api.cocorobo.cn/sendEmail"
    try:
        r = requests.post(emailURL,json=params)
        print(json.loads(r.text))
    except Exception as e:
        print(e)
    `)

    var code = `send_email(${Email},${EmailContent},${EmailTitle})\n`;
    return code;
};


Blockly.Blocks['esp32_network_http_post'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/http_header_post.png", 180, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_http_post_title);
        this.appendValueInput("http_post_url")
            .setCheck(null)
            .appendField(Blockly.Msg.internet_http_post_url);
        this.appendValueInput("data")
            .setCheck(null)
            .appendField(Blockly.Msg.internet_http_post_json);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Network_Http_Post_TOOLTIP);
        this.setHelpUrl("");
    }
};


Blockly.Python['esp32_network_http_post'] = function (block) {
    var url = Blockly.Python.valueToCode(block, 'http_post_url', Blockly.Python.ORDER_ATOMIC);
    var data = Blockly.Python.valueToCode(block, 'data', Blockly.Python.ORDER_ATOMIC);

    Blockly.Python.addVariable('_SEND_HTTP_POST_ENDPOINT', '', true);
    Blockly.Python.addVariable('_SEND_HTTP_REQUEST', '', true);
    Blockly.Python.definitions_['831_import_requests'] = `import requests`
    Blockly.Python.definitions_['831_import_json'] = `import json`
    Blockly.Python.definitions_['import_urequests'] = '' +
        '_SEND_HTTP_POST_ENDPOINT = ' + url + '\n' +
        '';
    // TODO: Assemble Python into code variable.

    // var code = '' +
    //     '_SEND_HTTP_POST_DATA = \'' + data + '\'\n' +
    //     '_SEND_HTTP_REQUEST = requests.post(_SEND_HTTP_POST_ENDPOINT, data = _SEND_HTTP_POST_DATA , headers = { "Content-type": "application/json" })\n' +
    //     '';
    var code = `_SEND_HTTP_POST_DATA = ${data}
_SEND_HTTP_REQUEST = requests.post(_SEND_HTTP_POST_ENDPOINT, json = _SEND_HTTP_POST_DATA , headers = { "Content-type": "application/json" })
`
    return code;
};

Blockly.Blocks['esp32_network_http_get_data_from_local_server'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_http_get_server_data_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_http_get_server_data_type)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.internet_http_get_server_data_json, "json"],
                [Blockly.Msg.internet_http_get_server_data_text, "text"]
            ]), "type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'json': Blockly.Msg.Esp32_Network_Http_Get_Data_From_Local_Server_TOOLTIP.replace('%1', Blockly.Msg.internet_http_get_server_data_json),
                'text': Blockly.Msg.Esp32_Network_Http_Get_Data_From_Local_Server_TOOLTIP.replace('%1', Blockly.Msg.internet_http_get_server_data_text)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_network_http_get_data_from_local_server'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    // TODO: Assemble Python into code variable.
    if (dropdown_type == "text") {
        var request_code = "_SEND_HTTP_REQUEST.text";
    } else if (dropdown_type == "json") {
        var request_code = "eval(_SEND_HTTP_REQUEST.text)";
    }
    var code = request_code;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};





Blockly.Blocks['esp32_network_http_server_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/http_server_header.png", 130, 40, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_web_http_server_setup);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Network_Http_Server_Setup_TOOLTIP);
        this.setHelpUrl("");
    }
};






Blockly.Python['esp32_network_http_server_setup'] = function (block) {
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['esp32_network_http_server_setup_def_setup'] = `from http.server import BaseHTTPRequestHandler, HTTPServer`;
    Blockly.Python.definitions_['v831_import_json'] = `import json`;
    Blockly.Python.definitions_['v831_import_flask'] = `from flask import Flask`;
    Blockly.Python.definitions_['http_server_init'] = `app = Flask(__name__)`;
    var code = `
app.run(host='0.0.0.0', port=5000)
print(f'Starting httpd server on port 5000...')
`;
    return code;
};

Blockly.Blocks['esp32_network_http_server_route'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_web_http_server_route_setting_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_web_http_server_route_setting_path)
            .appendField(new Blockly.FieldTextInput("/"), "path")
            .appendField(Blockly.Msg.wifi_web_http_server_route_setting_being_requested);
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_web_http_server_route_setting_property)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.wifi_web_http_server_route_setting_get, "get"],
                [Blockly.Msg.wifi_web_http_server_route_setting_post, "post"]
            ]), "response_type");
        this.appendStatementInput("exec")
            .setCheck(null)
            .appendField(Blockly.Msg.wifi_web_http_server_route_setting_do);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        // this.setTooltip("");
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('response_type');
            var TOOLTIPS = {
                'get': Blockly.Msg.Esp32_Network_Http_Server_Route_TOOLTIP.replace('%1', Blockly.Msg.wifi_web_http_server_route_setting_get),
                'post': Blockly.Msg.Esp32_Network_Http_Server_Route_TOOLTIP.replace('%1', Blockly.Msg.wifi_web_http_server_route_setting_post)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_network_http_server_route'] = function (block) {
    var dropdown_response_type = block.getFieldValue('response_type');
    var text_path = block.getFieldValue('path');
    var statements_exec = Blockly.Python.statementToCode(block, 'exec');
    console.log(text_path + dropdown_response_type)
    Blockly.Python.addFunction(text_path + dropdown_response_type, `
@app.route("${text_path}", methods=["${dropdown_response_type}"])
def ${text_path.slice(1) + "_" + dropdown_response_type}():
${statements_exec}
`)

    var code = `
`;
    return code;
};




Blockly.Blocks['esp32_network_http_server_route_respond'] = {
    init: function () {
        this.appendValueInput("exec")
            .setCheck(null)
            .appendField(Blockly.Msg.wifi_web_http_server_respond_title);
        // this.appendDummyInput()
        //     .appendField(Blockly.Msg.wifi_web_http_server_respond_type)
        //     .appendField(new Blockly.FieldDropdown([
        //         [Blockly.Msg.wifi_web_http_server_respond_text, "text/plain"],
        //         [Blockly.Msg.wifi_web_http_server_respond_json, "application/json"],
        //         [Blockly.Msg.wifi_web_http_server_respond_html, "text/html"]
        //     ]), "response_type");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        var thisBlock = this;
        this.setTooltip(Blockly.Msg.Esp32_Network_Http_Server_Route_Respond_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_network_http_server_route_respond'] = function (block) {
    // var dropdown_response_type = block.getFieldValue('response_type');
    var statements_exec = Blockly.Python.valueToCode(block, 'exec', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'return str(' + statements_exec + ')\n';
    return code;
};

Blockly.Blocks['esp32_network_http_server_get_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.wifi_web_http_server_get_title)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.wifi_web_http_server_get_as_json, "json"],
                [Blockly.Msg.wifi_web_http_server_get_as_text, "text"]
            ]), "type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(NETWORK_BLOCK_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'json': Blockly.Msg.Esp32_Network_Http_Server_Get_Data_TOOLTIP.replace('%1', Blockly.Msg.wifi_web_http_server_get_as_json),
                'text': Blockly.Msg.Esp32_Network_Http_Server_Get_Data_TOOLTIP.replace('%1', Blockly.Msg.wifi_web_http_server_get_as_text)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_network_http_server_get_data'] = function (block) {
    var dropdown_type = block.getFieldValue('type');

    if (dropdown_type == "json") {
        var as_type = "ReadRequestContentAsJSON()";
    } else if (dropdown_type == "text") {
        var as_type = "ReadRequestContent(size=None)";
    }
    // TODO: Assemble Python into code variable.
    var code = 'httpClient.' + as_type;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};


var WS_BLOCK_COLOR = "#83178a";

Blockly.Blocks['esp32_web_ws_setup_send'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ws_header_send.png", 220, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_ws_setup_send_text);
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_ws_setup_send_ip)
            .appendField(new Blockly.FieldTextInput("192.168.4.1"), "ip");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WS_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Web_Ws_Setup_Send_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_web_ws_setup_send'] = function (block) {

    var text_ip = block.getFieldValue('ip');

    Blockly.Python.definitions_['ws_setup_send'] = '' +
        'import uwebsockets.client\n' +
        '\n';
    // TODO: Assemble Python into code variable.
    var code = '_client_websocket = uwebsockets.client.connect("ws://' + text_ip + ':80")\n';
    return code;
};


Blockly.Blocks['esp32_web_ws_send'] = {
    init: function () {
        this.appendValueInput("command")
            .setCheck(null)
            .appendField(Blockly.Msg.internet_ws_send_msg);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WS_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Web_Ws_Send_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_web_ws_send'] = function (block) {
    var value_command = Blockly.Python.valueToCode(block, 'command', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = '' +
        'message = ' + value_command + '\n' +
        '_client_websocket.send(message)\n';
    return code;
};


Blockly.Blocks['esp32_web_ws_setup_receive'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/ws_header_receive.png", 220, 50, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_ws_setup_recv);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WS_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Web_Ws_Setup_Receive_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_web_ws_setup_receive'] = function (block) {

    Blockly.Python.definitions_['ws_setup_receive'] = '' +
        'import uasyncio, logging\n' +
        'from uasyncio.websocket.server import WSReader, WSWriter\n' +
        'logging.basicConfig(level=logging.DEBUG)\n' +
        '\n';
    // TODO: Assemble Python into code variable.
    var code = '';
    return code;
};


Blockly.Blocks['esp32_web_ws_receive_statement'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_ws_setup_receiving);
        this.appendStatementInput("command")
            .setCheck(null)
            .appendField(Blockly.Msg.internet_ws_setup_recv_exec);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(WS_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.Esp32_Web_Ws_Receive_Statement_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_web_ws_receive_statement'] = function (block) {
    var statements_command = Blockly.Python.statementToCode(block, 'command');

    Blockly.Python.definitions_['ws_setup_receive_statement'] = '' +
        'def _ws_exec(msg):\n' +
        '' + statements_command +
        '\n' +
        'def _ws_echo(reader, writer):\n' +
        '    yield from reader.readline()\n' +
        '\n' +
        '    reader = yield from WSReader(reader, writer)\n' +
        '    writer = WSWriter(reader, writer)\n' +
        '\n' +
        '    while 1:\n' +
        '        _ws_l = yield from reader.read(1024)\n' +
        '        print(_ws_l)\n' +
        '        _ws_exec(_ws_l)\n' +
        '\n' +
        '        if _ws_l == b"\\r":\n' +
        '            await writer.awrite(b"\\r\\n")\n' +
        '        else:\n' +
        '            await writer.awrite(_ws_l)\n' +
        '\n' +
        '_ws_loop = uasyncio.get_event_loop()\n' +
        '_ws_loop.create_task(uasyncio.start_server(_ws_echo, "0.0.0.0", 80))\n' +
        '_ws_loop.run_forever()\n' +
        '_ws_loop.close()\n' +
        '';
    // TODO: Assemble Python into code variable.
    var code = '\n';
    return code;
};


Blockly.Blocks['esp32_web_ws_receive_get_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_ws_setup_get_msg);
        this.appendDummyInput()
            .appendField(Blockly.Msg.internet_ws_setup_get_msg_type)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.internet_ws_setup_get_msg_text, "text"],
                [Blockly.Msg.internet_ws_setup_get_msg_json, "json"]
            ]), "type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(WS_BLOCK_COLOR);
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                'text': Blockly.Msg.Esp32_Web_Ws_Receive_Get_Data_TOOLTIP.replace('%1', Blockly.Msg.internet_ws_setup_get_msg_text),
                'json': Blockly.Msg.Esp32_Web_Ws_Receive_Get_Data_TOOLTIP.replace('%1', Blockly.Msg.internet_ws_setup_get_msg_json)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_web_ws_receive_get_data'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    // TODO: Assemble Python into code variable.
    if (dropdown_type == "text") {
        var code = "msg.decode(\"utf-8\")";
    } else if (dropdown_type == "json") {
        var code = "eval(msg.decode(\"utf-8\"))";
    }
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};



/*
  ____  _     _____ 
 | __ )| |   | ____|
 |  _ \| |   |  _|  
 | |_) | |___| |___ 
 |____/|_____|_____|

*/

var BLE_BLOCK_COLOR = "#629978";

Blockly.Blocks['esp32_ble_setup_sender'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/header_ble_setup.png", 100, 60, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_setup_sender_msg + " " + Blockly.Msg.esp32_ble_setup_sender);
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_set_uuid)
            .appendField(new Blockly.FieldTextInput("6E400001-B5A3-F393-E0A9-E50E24DCCA9E"), "uuid");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BLE_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.esp32_ble_setup_sender_TOOLTIP);
        this.setHelpUrl("https://www.uuidgenerator.net/version1");
    }
};

Blockly.Python['esp32_ble_setup_sender'] = function (block) {

    var text_uuid = block.getFieldValue('uuid');

    Blockly.Python.definitions_['esp32_ble_setup_sender_def'] = '' +
        '# Generate UUID via: https://www.uuidgenerator.net/version1\n' +
        'import ble_simple_central, bluetooth, time, machine\n' +
        'from ble_simple_central import BLESimpleCentral\n' +
        '\n' +
        'ble, ble_read, not_found = bluetooth.BLE(), \'\', False\n' +
        'central = BLESimpleCentral(ble, uuid = "' + text_uuid + '")\n' +
        '\n' +
        'def ble_on_rx(v):\n' +
        '    global ble_read\n' +
        '    ble_read = v.decode("utf-8")\n' +
        '\n' +
        'def ble_on_scan(addr_type, addr, name):\n' +
        '    if addr_type is not None:\n' +
        '        print("Found peripheral:", addr_type, addr, name)\n' +
        '        central.connect()\n' +
        '    else:\n' +
        '        global not_found\n' +
        '        not_found = True\n' +
        '        print("\\nNo peripheral found.")\n' +
        '\n' +
        'def ble_scan_and_connect():\n' +
        '    central.scan(callback=ble_on_scan)\n' +
        '    print("Connecting...",end="")\n' +
        '    failed = 0\n' +
        '    while not central.is_connected():\n' +
        '        time.sleep_ms(100)\n' +
        '        if not_found: return\n' +
        '    print("Connected")\n' +
        '\n' +
        'central.on_notify(ble_on_rx)\n' +
        'with_response = False\n' +
        '';
    // TODO: Assemble Python into code variable.
    var code = '' +
        'try: ble_scan_and_connect()\n' +
        'except BaseException as e: print(e)\n' +
        '\n';
    return code;
};

Blockly.Blocks['esp32_ble_send_data'] = {
    init: function () {
        this.appendValueInput("data")
            .setCheck(null)
            .appendField(Blockly.Msg.esp32_ble_send_data_msg);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BLE_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.esp32_ble_send_data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_ble_send_data'] = function (block) {
    var value_data = Blockly.Python.valueToCode(block, 'data', Blockly.Python.ORDER_ATOMIC);
    var code = '';
    let allBlocks = block.workspace.getAllBlocks();
    let isReceiver = allBlocks.findIndex(item => {
        return item.type == "esp32_ble_setup_receiver";
    });

    let isReceiverAndDisabled = allBlocks.findIndex(item => {
        return item.type == "esp32_ble_setup_receiver" && item.disabled == true;
    });

    // TODO: Assemble Python into code variable.
    if (isReceiver == -1 || (isReceiver != -1 && isReceiverAndDisabled != -1)) {
        code = 'central_write_value = str(' + value_data + ')\n' +
            'central.write(central_write_value, with_response)\n' +
            'time.sleep_ms(400 if with_response else 30)\n' +
            '';
    }
    else if (isReceiver != -1 && isReceiverAndDisabled == -1) {
        code = 'central_send_value = str(' + value_data + ')\n' +
            'ble_p.send(central_send_value)\n' +
            'time.sleep_ms(400)\n' +
            '';
    }
    return code;
};





Blockly.Blocks['esp32_ble_setup_receiver'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/header_ble_setup.png", 100, 60, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_setup_receiver_msg + " " + Blockly.Msg.esp32_ble_setup_receiver);
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_set_uuid)
            .appendField(new Blockly.FieldTextInput("6E400001-B5A3-F393-E0A9-E50E24DCCA9E"), "uuid");
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_set_name)
            .appendField(new Blockly.FieldTextInput("coco-ble"), "name")
            .appendField(Blockly.Msg.esp32_ble_set_name_limit);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(BLE_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.esp32_ble_setup_receiver_TOOLTIP);
        this.setHelpUrl("https://www.uuidgenerator.net/version1");
    }
};

Blockly.Python['esp32_ble_setup_receiver'] = function (block) {

    var text_uuid = block.getFieldValue('uuid');
    var text_name = block.getFieldValue('name');
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['esp32_ble_setup_receiver_def'] = '' +
        'import ble_simple_peripheral, machine\n' +
        'from ble_simple_peripheral import BLESimplePeripheral\n' +
        'import bluetooth, time\n' +
        '\n' +
        'ble = bluetooth.BLE()\n' +
        'ble_p = BLESimplePeripheral(ble,uuid="' + text_uuid + '",name="' + text_name + '")\n' +
        'ble_read = \'\'\n' +
        '\n' +
        'def ble_on_rx(v):\n' +
        '    global ble_read\n' +
        '    ble_read = v.decode("utf-8")\n' +
        '\n' +
        '';

    var code = 'ble_p.on_write(ble_on_rx)\n';
    return code;
};

Blockly.Blocks['esp32_ble_get_data'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_get_data_msg);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour(BLE_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.esp32_ble_get_data_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_ble_get_data'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'ble_read';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['esp32_ble_sender_connected'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_sender_connected_msg);
        this.setOutput(true, null);
        this.setColour(BLE_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.esp32_ble_sender_connected_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_ble_sender_connected'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'central.is_connected()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Blocks['esp32_ble_receiver_connected'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_ble_receiver_connected_msg);
        this.setOutput(true, null);
        this.setColour(BLE_BLOCK_COLOR);
        this.setTooltip(Blockly.Msg.esp32_ble_receiver_connected_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['esp32_ble_receiver_connected'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'ble_p.is_connected()';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_NONE];
};

var EXPAND_COLOR = "#3163ed";

Blockly.Blocks['esp32_expand_io_from_digital_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_expand_io_from_digital_pin)
            .appendField(new Blockly.FieldDropdown([
                ["4", "4"],
                ["12", "12"],
                ["13", "13"],
                ["14", "14"],
                ["15", "15"],
                ["16", "16"],
                ["17", "17"],
                ["21", "21"],
                ["22", "22"],
                ["25", "25"],
                ["27", "27"]
            ]), "type")
            .appendField(Blockly.Msg.digital_get_value);
        this.setOutput(true, null);
        this.setColour(EXPAND_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                '4': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "4"),
                '12': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "12"),
                '13': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "13"),
                '14': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "14"),
                '15': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "15"),
                '16': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "16"),
                '17': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "17"),
                '21': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "21"),
                '22': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "22"),
                '25': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "25"),
                '27': Blockly.Msg.esp32_expand_io_from_digital_pin_TOOLTIP.replace('%1', "27")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_expand_io_from_digital_pin'] = function (block) {
    var type = block.getFieldValue('type');
    Blockly.Python.definitions_['import_esp32_expand_io_from_digital_pin_setup'] = '' +
        'from machine import Pin\n' +
        '';
    let aa = 'p' + type + ' = Pin(' + type + ', Pin.IN)\n';
    Blockly.Python.addVariable('p' + type, aa, true);
    var code = 'p' + type + '.value()'

    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Python.ORDER_CONDITIONAL];
};

Blockly.Blocks['esp32_expand_io_set_digital_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_expand_io_set_digital_pin)
            .appendField(new Blockly.FieldDropdown([
                ["4", "4"],
                ["12", "12"],
                ["13", "13"],
                ["14", "14"],
                ["15", "15"],
                ["16", "16"],
                ["17", "17"],
                ["21", "21"],
                ["22", "22"],
                ["25", "25"],
                ["27", "27"]
            ]), "type");
        this.appendDummyInput()
            .appendField(Blockly.Msg.digital_set_as);
        this.appendValueInput("high_low")
            .setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(EXPAND_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                '4': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "4"),
                '12': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "12"),
                '13': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "13"),
                '14': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "14"),
                '15': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "15"),
                '16': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "16"),
                '17': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "17"),
                '21': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "21"),
                '22': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "22"),
                '25': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "25"),
                '27': Blockly.Msg.esp32_expand_io_set_digital_pin_TOOLTIP.replace('%1', "27")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_expand_io_set_digital_pin'] = function (block) {
    var type = block.getFieldValue('type');
    var value_name2 = Blockly.Python.valueToCode(block, 'high_low', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['import_esp32_expand_io_set_digital_pin_setup'] = '' +
        'from machine import Pin\n' +
        '';
    let aa = '_PIN_OUT_' + type + ' = Pin(' + type + ', Pin.OUT)\n';
    Blockly.Python.addVariable('_PIN_OUT_' + type, aa, true);
    var code = '_PIN_OUT_' + type + '.value' + value_name2 + '\n';
    // TODO: Change ORDER_NONE to the correct strength.
    return code;
};

Blockly.Blocks['esp32_expand_io_set_analog_pin'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_expand_io_set_analog_pin)
            .appendField(new Blockly.FieldDropdown([
                ["4", "4"],
                ["12", "12"],
                ["13", "13"],
                ["14", "14"],
                ["15", "15"],
                ["16", "16"],
                ["17", "17"],
                ["21", "21"],
                ["22", "22"],
                ["25", "25"],
                ["27", "27"]
            ]), "type");
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_expand_io_set_analog_pin_digital_set_as);
        this.appendValueInput("digital_pin_input")
            .setCheck(null);
        this.appendDummyInput()
            .appendField(Blockly.Msg.esp32_expand_io_set_analog_pin_digital_set_af);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(EXPAND_COLOR);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('type');
            var TOOLTIPS = {
                '4': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "4"),
                '12': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "12"),
                '13': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "13"),
                '14': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "14"),
                '15': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "15"),
                '16': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "16"),
                '17': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "17"),
                '21': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "21"),
                '22': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "22"),
                '25': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "25"),
                '27': Blockly.Msg.esp32_expand_io_set_analog_pin_TOOLTIP.replace('%1', "27")
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['esp32_expand_io_set_analog_pin'] = function (block) {
    var type = block.getFieldValue('type');

    var value_name1 = Blockly.Python.valueToCode(block, 'digital_pin_input', Blockly.Python.ORDER_ATOMIC);

    Blockly.Python.addVariable('pwm' + type, '', true);
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['import_esp32_expand_io_set_analog_pin_setup'] = '' +
        'from machine import Pin, PWM\n' +
        '';
    var code = 'pwm' + type + ' = PWM(Pin(' + type + '), freq = 80000, duty = 4 * ' + value_name1 + ')\n';
    return code;
};


/**
 * Turtles!
 */
var Turtle_HUE = "#5cb2d6";

Blockly.Blocks['turtle_create'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.TURTLE_CREATE_NE_TURTLE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setOutput(false);
        this.setInputsInline(true);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_CREATE_NE_TURTLE_TLTLE_TOOLTIP);
        this.setHelpUrl('');
    }
};

Blockly.Python['turtle_create'] = function (block) {
    Blockly.Python.definitions_['import_turtle_setup'] = '' +
        'import turtle\n' +
        '';
    // TODO: Assemble Python into code variable.
    var code = 'turtle.initTurtle()\n';
    return code;
};

Blockly.Blocks['turtle_color_set'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                // [Blockly.Msg.image_process_set_filled_screen_color_black, "black"],
                [Blockly.Msg.image_process_set_filled_screen_color_red, "red"],
                [Blockly.Msg.image_process_set_filled_screen_color_blue, "blue"],
                [Blockly.Msg.image_process_set_filled_screen_color_cyan, "cyan"],
                [Blockly.Msg.image_process_set_filled_screen_color_yellow, "yellow"],
                [Blockly.Msg.image_process_set_filled_screen_color_white, "white"]
            ]), "COLOR");
        this.setOutput(true, "String");
        this.setInputsInline(true);
        this.setColour(Turtle_HUE);
        this.setTooltip('');
        this.setHelpUrl('');
    }
}

Blockly.Python['turtle_color_set'] = function (block) {
    var color = block.getFieldValue('COLOR');
    var code = '(\"' + color + '\")';
    // TODO: Assemble Python into code variable.
    return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Blocks['turtle_color'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.TURTLE_MAKE_TURRLE_COLOR);
        this.appendValueInput("COLOR")
            .setCheck(null)
            .appendField("");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setOutput(false);
        this.setInputsInline(true);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_TURRLE_COLOR_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_color'] = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle.pencolor(' + color + ')\n';
    return code;
};

Blockly.Blocks['turtle_forward'] = {
    init: function () {
        this.appendValueInput("DISTANCE")
            .setCheck(null)
            .appendField(Blockly.Msg.TURTLE_MAKE_TURTLE_MOVE_FORWARD_BY);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setOutput(false);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_TURTLE_MOVE_FORWARD_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_forward'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var distance = Blockly.Python.valueToCode(block, 'DISTANCE', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle' + '.forward(' + distance + ')\n';
    return code;
};

Blockly.Blocks['turtle_backward'] = {
    init: function () {
        this.appendValueInput("DISTANCE")
            .setCheck(null)
            .appendField(Blockly.Msg.TURTLE_MAKE_TURTLE_MOVE_BACKWARD_BY);
        this.setPreviousStatement(true);
        this.setInputsInline(true);
        this.setNextStatement(true);
        this.setOutput(false);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_TURTLE_MOVE_BACKWARD_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_backward'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var distance = Blockly.Python.valueToCode(block, 'DISTANCE', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle.backward(' + distance + ')\n';
    return code;
};

Blockly.Blocks['turtle_left'] = {
    init: function () {
        this.appendValueInput("ANGLE")
            .setCheck(null)
            .appendField(Blockly.Msg.TURTLE_MAKE_TURN_LEFT_BY);
        this.appendDummyInput("")
            .appendField(Blockly.Msg.TURTLE_DEGREE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setOutput(false);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_TURN_LEFT_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_left'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle.left(' + angle + ')\n';
    return code;
};

Blockly.Blocks['turtle_right'] = {
    init: function () {
        this.appendValueInput("ANGLE")
            .setCheck(null)
            .appendField(Blockly.Msg.TURTLE_MAKE_TURN_RIGHT_BY);
        this.appendDummyInput("")
            .appendField(Blockly.Msg.TURTLE_DEGREE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setOutput(false);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_TURN_RIGHT_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_right'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle.right(' + angle + ')\n';
    return code;
};

Blockly.Blocks['turtle_pen'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.TURTLE_MAKE_TURRLE_PEN)
            .appendField(new Blockly.FieldDropdown([[Blockly.Msg.TURTLE_PEN_UP, "up"], [Blockly.Msg.TURTLE_PEN_DOWN, "down"]]), "Pen");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Turtle_HUE);
        this.setHelpUrl("");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('Pen');
            var TOOLTIPS = {
                'up': Blockly.Msg.TURTLE_MAKE_TURRLE_PEN_TOOLTIP.replace('%1', Blockly.Msg.TURTLE_PEN_UP),
                'down': Blockly.Msg.TURTLE_MAKE_TURRLE_PEN_TOOLTIP.replace('%1', Blockly.Msg.TURTLE_PEN_DOWN)
            };
            return TOOLTIPS[mode];
        });
    }
};

Blockly.Python['turtle_pen'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var pen = block.getFieldValue('Pen');
    // TODO: Assemble Python into code variable.
    var code = 'turtle.pen' + pen + '()\n';
    return code;
};

Blockly.Blocks['turtle_goto'] = {
    init: function () {
        this.appendValueInput("X")
            .setCheck("Number")
            .appendField(Blockly.Msg.TURTLE_MAKE_TURTLE_GOTO_LOCATION_X);
        this.appendValueInput("Y")
            .setCheck("Number")
            .appendField(", Y:");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_TURTLE_GOTO_LOCATION_X_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['turtle_goto'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var x_coordinate = Blockly.Python.valueToCode(block, 'X', Blockly.Python.ORDER_ATOMIC);
    var y_coordinate = Blockly.Python.valueToCode(block, 'Y', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle.goto(' + x_coordinate + ',' + y_coordinate + ')\n';
    return code;
};

Blockly.Blocks['turtle_set_pos'] = {
    init: function () {
        this.appendValueInput("X")
            .setCheck("Number")
            .appendField(Blockly.Msg.TURTLE_MAKE_TURTLE_SET_POSITION);
        this.appendValueInput("Y")
            .setCheck("Number")
            .appendField(", Y:");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_TURTLE_SET_POSITION_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['turtle_set_pos'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var x_coordinate = Blockly.Python.valueToCode(block, 'X', Blockly.Python.ORDER_ATOMIC);
    var y_coordinate = Blockly.Python.valueToCode(block, 'Y', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle.setPosition(' + x_coordinate + ',' + y_coordinate + ')\n';
    return code;
};

Blockly.Blocks['turtle_setheading'] = {
    init: function () {
        this.appendValueInput("ANGLE")
            .setCheck(null)
            .appendField(Blockly.Msg.TURTLE_MAKE_SET_HEADING);
        this.appendDummyInput("")
            .appendField(Blockly.Msg.TURTLE_DEGREE);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setOutput(false);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_MAKE_SET_HEADING_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_setheading'] = function (block) {
    //var turtle = Blockly.Python.valueToCode(block, 'TURTLE', Blockly.Python.ORDER_ATOMIC);
    var angle = Blockly.Python.valueToCode(block, 'ANGLE', Blockly.Python.ORDER_ATOMIC);
    // TODO: Assemble Python into code variable.
    var code = 'turtle.setheading(' + angle + ')\n';
    return code;
};

Blockly.Blocks['turtle_reset'] = {
    init: function () {
        this.appendDummyInput("")
            .appendField(Blockly.Msg.TURTLE_RESET);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setOutput(false);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_RESET_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_reset'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'turtle.reset()\n';
    return code;
};

Blockly.Blocks['turtle_clear'] = {
    init: function () {
        this.appendDummyInput("")
            .appendField(Blockly.Msg.TURTLE_CLEAR);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setInputsInline(true);
        this.setOutput(false);
        this.setColour(Turtle_HUE);
        this.setTooltip(Blockly.Msg.TURTLE_CLEAR_TOOLTIP);
        this.setHelpUrl('');
    }
};
Blockly.Python['turtle_clear'] = function (block) {
    // TODO: Assemble Python into code variable.
    var code = 'turtle.clear()\n';
    return code;
};
// 室温传感器
Blockly.Blocks['v831_room_water_temperature'] = {
    init: function () {
        this.appendDummyInput("")
            .appendField("IIC" + Blockly.Msg.room_water_temperature_text);

        // this.setInputsInline(true);
        this.setOutput(true);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.room_water_temperature_text);
        this.setHelpUrl('');
    }
};
Blockly.Python['v831_room_water_temperature'] = function (block) {
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_sys'] = 'import sys';
    Blockly.Python.definitions_['v831_import_serial'] = 'import serial';
    Blockly.Python.definitions_['v831_room_water_temperature_init'] = `class Ds18b20():
    SEARCH_ROM = 0xf0
    READ_ROM = 0x33
    MATCH_ROM = 0x55
    SKIP_ROM_BROADCAST = 0xcc
    ALARM_SEARCH = 0xec

    TEMPERATURE_READ = 0x44
    READ_SCRATCHPAD = 0xbe
    WRITE_SCRATCHPAD = 0x4e
    COPY_SCRATCHPAD = 0x48
    RECALL_EEPROM = 0xb8
    READ_POWER_SUPPLY = 0xb4

    def __init__(self, port=None):
        self.ser = None
        if port is not None:
            self.port = port
        else:
            self.port = None
        self.connect()

    def connect(self):
        self.port="/dev/ttyS1"
        self.ser = serial.Serial()
        self.ser.port = self.port
        self.ser.baudrate = 115200
        self.ser.bytesize = 8
        self.ser.parity = 'N'
        self.ser.stopbits = 1
        self.ser.timeout = 0.1

        self.ser.open()
        if not self.ser.is_open:
            print("Failed to open serial port")
            sys.exit(1)

    def close(self):
        self.ser.close()

    def reset(self):
        self.ser.baudrate = 9600
        self.ser.write(b'\\xF0')
        output = self.ser.read()
        if output == b'\\xF0':
            raise Exception("No devices found")
        elif output == b'\\x00':
            raise Exception("Shorted?")
        elif output == b'\\xe0':
            # print("Single device")
            pass
        else:
            # print("Multiple devices?")
            pass
        self.ser.baudrate = 115200

    def send_byte(self, data):
        output = 0
        for i in range(8):
            bit = (data >> i) & 1
            if bit == 1:
                self.ser.write(b'\\xff')
            else:
                self.ser.write(b'\\x00')
            outbit = self.ser.read()
            if outbit == b'\\xFF':
                output += (1 << i)
        return output

    def send_command(self, target, command):
        self.reset()
        self.send_byte(target)
        return self.send_byte(command)

    def do_a_temperature_read(self):
        self.send_command(Ds18b20.SKIP_ROM_BROADCAST, Ds18b20.TEMPERATURE_READ)
        while True:
            if self.send_byte(0xFF) > 0:
                break
            time.sleep(0.5)

    def get_scratchpad(self):
        output = {}
        self.send_command(Ds18b20.SKIP_ROM_BROADCAST, Ds18b20.READ_SCRATCHPAD)
        scratchpad = []
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))
        scratchpad.append(self.send_byte(0xFF))

        output["temperature_lsb"] = scratchpad[0]
        output["temperature_msb"] = scratchpad[1]
        output["th_register"] = scratchpad[2]
        output["tl_register"] = scratchpad[3]
        output["configuration"] = scratchpad[4]
        output["reserved_ff"] = scratchpad[5]
        output["reserved_xx"] = scratchpad[6]
        output["reserved_10"] = scratchpad[7]
        output["crc"] = scratchpad[8]
        r0 = (output["configuration"] >> 5) & 1
        r1 = (output["configuration"] >> 6) & 1
        r = r0 + (r1 << 1)
        output["resolution"] = 9 + r

        return output

    def write_scratchpad(self, th, tl, config):
        self.send_command(Ds18b20.SKIP_ROM_BROADCAST, Ds18b20.WRITE_SCRATCHPAD)
        self.send_byte(th)
        self.send_byte(tl)
        self.send_byte(config)

    def get_temperature(self):
        self.do_a_temperature_read()
        self.send_command(Ds18b20.SKIP_ROM_BROADCAST, Ds18b20.READ_SCRATCHPAD)
        temperature = self.send_byte(0xFF)
        temperature += self.send_byte(0xFF) << 8
        temperature *= 0.0625
        return temperature

    def get_single_rom_code(self):
        rom_code = []
        rom_code_bytes = b''
        self.reset()
        self.send_byte(Ds18b20.READ_ROM)
        for _ in range(8):
            abyte = self.send_byte(0xff)
            rom_code_bytes = bytes([abyte]) + rom_code_bytes
            rom_code = [abyte] + rom_code

        crc = rom_code[0]
        serial = rom_code[1:7]
        serial_bytes = rom_code_bytes[1:7]
        family_code = rom_code[7]
        return serial_bytes

    def get_power_supply(self):
        self.send_command(Ds18b20.SKIP_ROM_BROADCAST, Ds18b20.READ_POWER_SUPPLY)
        if self.send_byte(0xff) == 0xff:
            print("All devices connected to proper power")
        else:
            print("Some devices connected as parasitic")

    def set_accuracy(self, accuracy):
        if accuracy < 9 or accuracy > 12:
            raise Exception("Only an accuracy of 9-12 bits is allowed")
        scratchpad = ds.get_scratchpad() # get the current scratchpad data so we can pass tl and th the same as currently set
        set_accuracy = accuracy - 9
        set_accuracy = set_accuracy << 5
        new_config = (scratchpad["configuration"] & 0b10011111) | set_accuracy
        ds.write_scratchpad(th=scratchpad["th_register"], tl=scratchpad["tl_register"], config=new_config)

ds = Ds18b20("/dev/ttyS1")
`;
    //     Blockly.Python.addFunction("getRoomWaterTemperature", `def getRoomWaterTemperature():
    //     serial_num = ds.get_single_rom_code()
    //     temperature = ds.get_temperature()
    //     return temperature
    // `, true)
    var code = 'ds.get_temperature()';
    return [code, Blockly.Python.ORDER_ATOMIC];
};


Blockly.Blocks['v831_set_real_time_clock'] = {
    init: function () {
        let nowDate = new Date();
        this.appendDummyInput()
            .appendField("IIC" + Blockly.Msg.time_set_current_date_title)
            .appendField(new Blockly.FieldTextInput(nowDate.getFullYear()), "year")
            .appendField(Blockly.Msg.time_get_current_date_y)
            .appendField(new Blockly.FieldTextInput(nowDate.getMonth() + 1), "month")
            .appendField(Blockly.Msg.time_get_current_date_m)
            .appendField(new Blockly.FieldTextInput(nowDate.getDate()), "day")
            .appendField(Blockly.Msg.time_get_current_date_d)
            .appendField(Blockly.Msg.time_get_current_date_week)
            .appendField(new Blockly.FieldTextInput(nowDate.getDay()), "week")
            .appendField(new Blockly.FieldTextInput(nowDate.getHours()), "hour")
            .appendField(Blockly.Msg.time_get_current_date_hour)
            .appendField(new Blockly.FieldTextInput(nowDate.getMinutes()), "minutes")
            .appendField(Blockly.Msg.time_get_current_date_min)
            .appendField(new Blockly.FieldTextInput(nowDate.getSeconds()), "seconds")
            .appendField(Blockly.Msg.time_get_current_date_sec);
        this.setNextStatement(true);
        this.setPreviousStatement(true);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        this.setTooltip(Blockly.Msg.time_set_current_date_title);
    }
};
Blockly.Python['v831_set_real_time_clock'] = function (block) {
    var year = block.getFieldValue('year');
    var month = block.getFieldValue('month');
    var day = block.getFieldValue('day');
    var week = block.getFieldValue('week');
    var hour = block.getFieldValue('hour');
    var minutes = block.getFieldValue('minutes');
    var seconds = block.getFieldValue('seconds');
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_smbus2'] = 'import smbus2';
    Blockly.Python.definitions_['v831_import_math'] = 'import math';
    Blockly.Python.definitions_['v831_import_time'] = 'import time';
    Blockly.Python.definitions_['v831_real_time_clock_init'] = `class DS3231(object):
    # create RTC instance
    def __init__(self):
        self.bus = smbus2.SMBus(2) # 2 indicates /dev/i2c-2
        self.address = 0x68
    
    def bcd_to_int(self,bcd, n=2):
        """Decode n least significant packed binary coded decimal digits to binary.
        Return binary result.
        n defaults to 2 (BCD digits).
        n=0 decodes all digits.
        """
        return int(('%x' % bcd)[-n:])


    def int_to_bcd(self,x, n=2):
        """
        Encode the n least significant decimal digits of x
        to packed binary coded decimal (BCD).
        Return packed BCD value.
        n defaults to 2 (digits).
        n=0 encodes all digits.
        """
        return int(str(x)[-n:], 0x10)
    
    
    def read(self, addr):
        for i in range(0, 3):
            try:
                tmp = self.bus.read_byte_data(self.address, addr)
                time.sleep(0.001) # 1ms
                # print(addr, tmp) # debug
                return tmp
            except Exception:
                time.sleep(0.01)
                continue
        return None

    def write(self, addr, val):
        for i in range(0, 3):
            try:
                self.bus.write_byte_data(self.address, addr, val)
                #time.sleep(0.001) # 1ms
                # print(addr, val) # debug
                return True
            except Exception:
                time.sleep(0.001)
                continue
        return False

    # set times functions ---------------------------------------------------------------------
    def setYear(self, year): 
        # only last two digits (last two digits are used if longer)
        self.write(0x06, self.int_to_bcd(year%100))

    def setMonth(self, month):
        if not 1 <= month <= 12:
            raise ValueError('Month is out of range [1,12].')
        self.write(0x05,self.int_to_bcd(month))
    
    def setDay(self, day):
        if not 1 <= day <= 31:
            raise ValueError('Day is out of range [1,31].')
        self.write(0x04,self.int_to_bcd(day))
    
    def setDayOfWeek(self, dayOfWeek):
        if not 1 <= dayOfWeek <= 7:
            raise ValueError('Day of week is out of range [1,7].')
        self.write(0x03,self.int_to_bcd(dayOfWeek))
        
    def setHour(self, hour):
        if not 0 <= hour < 24:
            raise ValueError('Hour is out of range [0,23].')
        self.write(0x02,self.int_to_bcd(hour)& 0x3F)
        
    def setMinutes(self, minutes):
        if not 0 <= minutes < 59:
            raise ValueError('Minutes is out of range [0,59].')
        self.write(0x01,self.int_to_bcd(minutes))
    
    def setSeconds(self, seconds):
        if not 0 <= seconds < 60:
            raise ValueError('Seconds is out of range [0,59].')
        self.write(0x00,self.int_to_bcd(seconds))
        
    def setDateTime(self, year, month, day, dayOfWeek, hour, minutes, seconds): 
        # set all the date and times (year is last two digits of year)
        self.setYear(year)
        self.setMonth(month)
        self.setDay(day)
        self.setDayOfWeek(dayOfWeek)
        self.setHour(hour)
        self.setMinutes(minutes)
        self.setSeconds(seconds)

    # get times functions -------------------------------------------------
    def getYear(self):
        return self.bcd_to_int(self.read(0x06))
    
    def getMonth(self):
        temp = self.read(0x05)
        return self.bcd_to_int((temp<<4>>4) &0x7F)
        #return temp[0] & 0x7F
    
    def getDay(self):
        # 0 - 31
        return self.bcd_to_int(self.read(0x04))
        
    def getDayOfWeek(self):
        # 1 - 7
        return self.bcd_to_int(self.read(0x03))
    
    def getHour(self):
        temp = self.read(0x02)
        if temp==0x64:    #if hour is 24:00,convert it to 00:00
            temp=0x40
        return self.bcd_to_int((temp<< 4 >>4)& 0x3F)
        #return temp[0] & 0x3F
    
    def getMinutes(self):
        return self.bcd_to_int(self.read(0x01))
    
    def getSeconds(self):
        return self.bcd_to_int(self.read(0x00))
    
    def getDateTime(self): 
        # returns whole date and time as list 
        # (last two digits of year, month, day, day of week, hour, minutes, seconds)
        dateTime = [0, 0, 0, 0, 0, 0, 0]
        dateTime[0] = self.getYear()
        dateTime[1] = self.getMonth()
        dateTime[2] = self.getDay()
        dateTime[3] = self.getDayOfWeek()
        dateTime[4] = self.getHour()
        dateTime[5] = self.getMinutes()
        dateTime[6] = self.getSeconds()
        return dateTime

    def convertToByteType(self,number):
        return bytes([number])

    def decodeToDec(self,byte):
        return ((byte[0] >> 4) * 10) + (byte[0] & 0x0F)

    def encodeToByte(self,dec):
        tens = math.floor(dec / 10)
        ones = dec - tens*10
        return (tens << 4) + ones

    def decodeAlarmType(self,alarmTime):
        if(len(alarmTime) > 4):
            m1Bit = (alarmTime[3] & 0x80) >> 7
        else:
            m1Bit = False
        m2Bit = (alarmTime[2] & 0x80) >> 7
        m3Bit = (alarmTime[1] & 0x80) >> 7
        m4Bit = (alarmTime[0] & 0x80) >> 7
        dayBit = (alarmTime[0] & 0x40) >> 6
        
        if(m1Bit and m2Bit and m3Bit and m4Bit):
            return "everySecond"
        elif(not m1Bit and m2Bit and m3Bit and m4Bit):
            return "everyMinute"
        elif(not m1Bit and not m2Bit and m3Bit and m4Bit):
            return "everyHour"
        elif(not m1Bit and not m2Bit and not m3Bit and m4Bit):
            return "everyDay"
        elif(not dayBit and not m1Bit and not m2Bit and not m3Bit and not m4Bit):
            return "everyMonth"
        elif(dayBit and not m1Bit and not m2Bit and not m3Bit and not m4Bit):
            return "everyWeek"
        else:
            return "noValidAlarmType"
        
    def decodeAlarmTime(self,alarmTime):
        alarmTime[0] = decodeToDec(convertToByteType(alarmTime[0] & 0x3F))
        alarmTime[1] = decodeToDec(convertToByteType(alarmTime[1] & 0x3F))
        alarmTime[2] = decodeToDec(convertToByteType(alarmTime[2] & 0x7F))
        if(len(alarmTime) > 4):
            alarmTime[3] = decodeToDec(convertToByteType(alarmTime[3] & 0x7F))
        return alarmTime

    def encodeAlarmType(self,alarmType):
        if(alarmType == "everySecond"):
            return 15   #0b01111
        elif(alarmType == "everyMinute"):
            return 14   #0b01110
        elif(alarmType == "everyHour"):
            return 12   #0b01100
        elif(alarmType == "everyDay"):
            return 8    #0b01000
        elif(alarmType == "everyMonth"):
            return 0    #0b00000
        elif(alarmType == "everyWeek"):
            return 16   #0b10000
        else:
            raise ValueError("""Not a supported alarmType. Options are: 
            'everySecond' (only Alarm 1), 'everyMinute', 'everyHour', 'everyDay', 'everyMonth', 'everyWeek'""")

    def encodeDateTime(self,day, hour, minutes, seconds, alarmType):
        alarmBits = encodeAlarmType(alarmType)
        alarmTime = [0, 0, 0, 0]
        alarmTime[0] = (encodeToByte(day) & 0x3F) | ((alarmBits & 0x10) << 2) | ((alarmBits & 0x08) << 4)
        alarmTime[1] = (encodeToByte(hour) & 0x3F) | ((alarmBits & 0x04) << 5)
        alarmTime[2] = (encodeToByte(minutes) & 0x7F) | ((alarmBits & 0x02) << 6)
        alarmTime[3] = (encodeToByte(seconds) & 0x7F) | ((alarmBits & 0x01) << 7)
        return alarmTime

        
rtc=DS3231()
`;
    var code = `rtc.setYear(${year})
rtc.setMonth(${month})
rtc.setDay(${day})
rtc.setDayOfWeek(${week})
rtc.setHour(${hour})
rtc.setMinutes(${minutes})
rtc.setSeconds(${seconds})\n`;
    return code;
};
// v831_real_time_clock
Blockly.Blocks['v831_real_time_clock'] = {
    init: function () {
        this.appendDummyInput()
            .appendField("IIC" + Blockly.Msg.RTC_getDateTime)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.time_get_current_date_y, "getYear"],
                [Blockly.Msg.time_get_current_date_m, "getMonth"],
                [Blockly.Msg.time_get_current_date_d, "getDay"],
                [Blockly.Msg.RTC_SETWEEK, "getDayOfWeek"],
                [Blockly.Msg.time_get_current_date_hour, "getHour"],
                [Blockly.Msg.time_get_current_date_min, "getMinutes"],
                [Blockly.Msg.time_get_current_date_sec, "getSeconds"]
            ]), "type");
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setHelpUrl("");
        this.setTooltip(Blockly.Msg.RTC_getDateTime);
    }
};
Blockly.Python['v831_real_time_clock'] = function (block) {
    var dropdown_type = block.getFieldValue('type');
    // TODO: Assemble Python into code variable.
    Blockly.Python.definitions_['v831_import_smbus2'] = 'import smbus2';
    Blockly.Python.definitions_['v831_import_math'] = 'import math';
    Blockly.Python.definitions_['v831_import_time'] = 'import time';
    Blockly.Python.definitions_['v831_real_time_clock_init'] = `class DS3231(object):
    # create RTC instance
    def __init__(self):
        self.bus = smbus2.SMBus(2) # 2 indicates /dev/i2c-2
        self.address = 0x68
    
    def bcd_to_int(self,bcd, n=2):
        """Decode n least significant packed binary coded decimal digits to binary.
        Return binary result.
        n defaults to 2 (BCD digits).
        n=0 decodes all digits.
        """
        return int(('%x' % bcd)[-n:])


    def int_to_bcd(self,x, n=2):
        """
        Encode the n least significant decimal digits of x
        to packed binary coded decimal (BCD).
        Return packed BCD value.
        n defaults to 2 (digits).
        n=0 encodes all digits.
        """
        return int(str(x)[-n:], 0x10)
    
    
    def read(self, addr):
        for i in range(0, 3):
            try:
                tmp = self.bus.read_byte_data(self.address, addr)
                time.sleep(0.001) # 1ms
                # print(addr, tmp) # debug
                return tmp
            except Exception:
                time.sleep(0.01)
                continue
        return None

    def write(self, addr, val):
        for i in range(0, 3):
            try:
                self.bus.write_byte_data(self.address, addr, val)
                #time.sleep(0.001) # 1ms
                # print(addr, val) # debug
                return True
            except Exception:
                time.sleep(0.001)
                continue
        return False

    # set times functions ---------------------------------------------------------------------
    def setYear(self, year): 
        # only last two digits (last two digits are used if longer)
        self.write(0x06, self.int_to_bcd(year%100))

    def setMonth(self, month):
        if not 1 <= month <= 12:
            raise ValueError('Month is out of range [1,12].')
        self.write(0x05,self.int_to_bcd(month))
    
    def setDay(self, day):
        if not 1 <= day <= 31:
            raise ValueError('Day is out of range [1,31].')
        self.write(0x04,self.int_to_bcd(day))
    
    def setDayOfWeek(self, dayOfWeek):
        if not 1 <= dayOfWeek <= 7:
            raise ValueError('Day of week is out of range [1,7].')
        self.write(0x03,self.int_to_bcd(dayOfWeek))
        
    def setHour(self, hour):
        if not 0 <= hour < 24:
            raise ValueError('Hour is out of range [0,23].')
        self.write(0x02,self.int_to_bcd(hour)& 0x3F)
        
    def setMinutes(self, minutes):
        if not 0 <= minutes < 59:
            raise ValueError('Minutes is out of range [0,59].')
        self.write(0x01,self.int_to_bcd(minutes))
    
    def setSeconds(self, seconds):
        if not 0 <= seconds < 60:
            raise ValueError('Seconds is out of range [0,59].')
        self.write(0x00,self.int_to_bcd(seconds))
        
    def setDateTime(self, year, month, day, dayOfWeek, hour, minutes, seconds): 
        # set all the date and times (year is last two digits of year)
        self.setYear(year)
        self.setMonth(month)
        self.setDay(day)
        self.setDayOfWeek(dayOfWeek)
        self.setHour(hour)
        self.setMinutes(minutes)
        self.setSeconds(seconds)

    # get times functions -------------------------------------------------
    def getYear(self):
        return self.bcd_to_int(self.read(0x06))
    
    def getMonth(self):
        temp = self.read(0x05)
        return self.bcd_to_int((temp<<4>>4) &0x7F)
        #return temp[0] & 0x7F
    
    def getDay(self):
        # 0 - 31
        return self.bcd_to_int(self.read(0x04))
        
    def getDayOfWeek(self):
        # 1 - 7
        return self.bcd_to_int(self.read(0x03))
    
    def getHour(self):
        temp = self.read(0x02)
        if temp==0x64:    #if hour is 24:00,convert it to 00:00
            temp=0x40
        return self.bcd_to_int((temp<< 4 >>4)& 0x3F)
        #return temp[0] & 0x3F
    
    def getMinutes(self):
        return self.bcd_to_int(self.read(0x01))
    
    def getSeconds(self):
        return self.bcd_to_int(self.read(0x00))
    
    def getDateTime(self): 
        # returns whole date and time as list 
        # (last two digits of year, month, day, day of week, hour, minutes, seconds)
        dateTime = [0, 0, 0, 0, 0, 0, 0]
        dateTime[0] = self.getYear()
        dateTime[1] = self.getMonth()
        dateTime[2] = self.getDay()
        dateTime[3] = self.getDayOfWeek()
        dateTime[4] = self.getHour()
        dateTime[5] = self.getMinutes()
        dateTime[6] = self.getSeconds()
        return dateTime

    def convertToByteType(self,number):
        return bytes([number])

    def decodeToDec(self,byte):
        return ((byte[0] >> 4) * 10) + (byte[0] & 0x0F)

    def encodeToByte(self,dec):
        tens = math.floor(dec / 10)
        ones = dec - tens*10
        return (tens << 4) + ones

    def decodeAlarmType(self,alarmTime):
        if(len(alarmTime) > 4):
            m1Bit = (alarmTime[3] & 0x80) >> 7
        else:
            m1Bit = False
        m2Bit = (alarmTime[2] & 0x80) >> 7
        m3Bit = (alarmTime[1] & 0x80) >> 7
        m4Bit = (alarmTime[0] & 0x80) >> 7
        dayBit = (alarmTime[0] & 0x40) >> 6
        
        if(m1Bit and m2Bit and m3Bit and m4Bit):
            return "everySecond"
        elif(not m1Bit and m2Bit and m3Bit and m4Bit):
            return "everyMinute"
        elif(not m1Bit and not m2Bit and m3Bit and m4Bit):
            return "everyHour"
        elif(not m1Bit and not m2Bit and not m3Bit and m4Bit):
            return "everyDay"
        elif(not dayBit and not m1Bit and not m2Bit and not m3Bit and not m4Bit):
            return "everyMonth"
        elif(dayBit and not m1Bit and not m2Bit and not m3Bit and not m4Bit):
            return "everyWeek"
        else:
            return "noValidAlarmType"
        
    def decodeAlarmTime(self,alarmTime):
        alarmTime[0] = decodeToDec(convertToByteType(alarmTime[0] & 0x3F))
        alarmTime[1] = decodeToDec(convertToByteType(alarmTime[1] & 0x3F))
        alarmTime[2] = decodeToDec(convertToByteType(alarmTime[2] & 0x7F))
        if(len(alarmTime) > 4):
            alarmTime[3] = decodeToDec(convertToByteType(alarmTime[3] & 0x7F))
        return alarmTime

    def encodeAlarmType(self,alarmType):
        if(alarmType == "everySecond"):
            return 15   #0b01111
        elif(alarmType == "everyMinute"):
            return 14   #0b01110
        elif(alarmType == "everyHour"):
            return 12   #0b01100
        elif(alarmType == "everyDay"):
            return 8    #0b01000
        elif(alarmType == "everyMonth"):
            return 0    #0b00000
        elif(alarmType == "everyWeek"):
            return 16   #0b10000
        else:
            raise ValueError("""Not a supported alarmType. Options are: 
            'everySecond' (only Alarm 1), 'everyMinute', 'everyHour', 'everyDay', 'everyMonth', 'everyWeek'""")

    def encodeDateTime(self,day, hour, minutes, seconds, alarmType):
        alarmBits = encodeAlarmType(alarmType)
        alarmTime = [0, 0, 0, 0]
        alarmTime[0] = (encodeToByte(day) & 0x3F) | ((alarmBits & 0x10) << 2) | ((alarmBits & 0x08) << 4)
        alarmTime[1] = (encodeToByte(hour) & 0x3F) | ((alarmBits & 0x04) << 5)
        alarmTime[2] = (encodeToByte(minutes) & 0x7F) | ((alarmBits & 0x02) << 6)
        alarmTime[3] = (encodeToByte(seconds) & 0x7F) | ((alarmBits & 0x01) << 7)
        return alarmTime

        
rtc=DS3231()
`;
    var code = `rtc.${dropdown_type}()`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};
