/*
 * MaixCAM2（pi2）的 AI 模型積木。
 *
 * 為什麼獨立成一檔：ai.js 有一萬兩千行，而這批 13 組模型積木用的是同一套
 * 三件套（初始化／加載／取結果）。「取結果」那張欄位對應表在 ai.js 裡已經
 * 抄了兩遍——ai_model_get 與 ai_model_xy，40 行裡 25 行一模一樣。再推 10 組
 * 就是抄 12 遍。抽出來之後那張表只有一份。
 *
 * 積木的 type 名沿用舊的：使用者專案的 XML 存的是 type 名，改了舊專案就打不開。
 *
 * 依據：/Users/buoy/Development/gitrepo/MaixPy 的 examples/vision/ai_vision/
 * 規則：官方有什麼功能就定義什麼積木，不硬套舊積木。
 */


// ─── 共用的三件套 ────────────────────────────────────────────────

/**
 * 「初始化模型」產出的程式碼。
 *
 * detector／list 每一組各自取名，不共用舊版的 m／boxes——同一份程式裡放兩組
 * 模型時才不會互相覆蓋。
 *
 * list 先給空清單：使用者可能先拉「檢測到…」再拉「加載」，少了這行會是
 * NameError，訊息看不出是漏了哪一塊。
 */
function maixNnInit(defKey, detector, list, ctor) {
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`;
    Blockly.Python.definitions_[defKey] = `${detector} = ${ctor}
${list} = []
`;
    return "";
}

/**
 * 「加載模型」＝推論。舊版是 forward 拿原始張量、外接 decoder 解碼、再手動把
 * probs append 進每個 box 三層；v4 全部收在 detect() 裡。
 */
function maixNnDetect(detector, list, img, confTh) {
    return `${list} = ${detector}.detect(${img}, conf_th = ${confTh}, iou_th = 0.45)
`;
}

/**
 * 檢測結果的欄位對應——13 組模型共用這一張表。
 *
 * W／H 這兩個值名會誤導人：頁面標籤寫的是「檢測框終點 X／Y 軸座標」，
 * 產出的也確實是終點（x+w、y+h）。真正的寬高是另外兩個選項（值 "2"／"3"）。
 *
 * label 是取「物體名稱」時要產的運算式：多類別模型傳
 * `${detector}.labels[${v}.class_id]`，單類別的直接傳字面值（例如 '"Face"'）。
 */
function maixNnField(v, type, list, label) {
    switch (type) {
        case "Object":     return label;
        case "X":          return `${v}.x`;
        case "Y":          return `${v}.y`;
        case "W":          return `int(${v}.x + ${v}.w)`;      // 檢測框終點 X 軸座標
        case "H":          return `int(${v}.y + ${v}.h)`;      // 檢測框終點 Y 軸座標
        case "2":          return `${v}.w`;                    // 檢測框的寬度
        case "3":          return `${v}.h`;                    // 檢測框的高度
        case "CX":         return `int(${v}.x + ${v}.w / 2)`;
        case "CY":         return `int(${v}.y + ${v}.h / 2)`;
        case "Confidence": return `(${v}.score * 100)`;
        case "Number":     return `len(${list})`;
        // 下拉只有上面這些值。走到這裡代表積木定義和產碼器對不上，
        // 與其產出跑不動的索引，不如讓它明顯壞掉。
        default:           return v;
    }
}

/** 取積木上那個變數欄位的 Python 名稱。 */
function maixNnVar(block, field) {
    return Blockly.Python.variableDB_.getName(block.getFieldValue(field), Blockly.Variables.NAME_TYPE);
}


// ─── 常見物體檢測（examples/vision/ai_vision/nn_yolov5.py）────────

Blockly.Blocks['ai_model_object_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(Blockly.Msg.ai_models_init_object_model);
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

Blockly.Blocks['ai_model_object_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(Blockly.Msg.ai_models_init_object_model);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_objectrecognition"), "varitem");
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

Blockly.Blocks['ai_model_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/object_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_object_model_get)
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
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('TYPE');
            var TOOLTIPS = {
                'Object': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_name),
                'X': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_x),
                'Y': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_y),
                'W': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_w),
                'H': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_h),
                // 'CX': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_x_center),
                // 'CY': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_y_center),
                // 'Number': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_count),
                // 'Serial': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_index),
                // 'Confidence': Blockly.Msg.ai_model_get_TOOLTIP.replace('%1', Blockly.Msg.ai_models_object_model_confidence)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_look'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_object_model_if);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_look_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_look_attribute'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_look_attribute);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_look_attribute_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python.ai_model_object_init = function (block) {
    // 標籤不寫死在產碼器裡。舊版是 20 類 VOC 的中文清單、隨頁面語言切換；
    // v4 由模型檔自帶（80 類 COCO，英文），用 objectDetector.labels 讀。
    // 依「官方有什麼功能就定義什麼積木」，不做 80→20 的過濾。
    return maixNnInit("import_object", "objectDetector", "objs",
        `nn.YOLOv5(model="/root/models/yolov5s.mud")`);
}

Blockly.Python.ai_model_object_load = function (block) {
    return maixNnDetect("objectDetector", "objs", maixNnVar(block, "varitem"), "0.5");
}

Blockly.Python.ai_model_look = function (block) {
    return ["len(objs)", Blockly.Python.ORDER_ATOMIC];
}

Blockly.Python.ai_model_look_attribute = function (block) {
    return ["objs", Blockly.Python.ORDER_NONE];
}

Blockly.Python.ai_model_get = function (block) {
    var v = maixNnVar(block, "varitem");
    return [maixNnField(v, block.getFieldValue("TYPE"), "objs",
        `objectDetector.labels[${v}.class_id]`), Blockly.Python.ORDER_ATOMIC];
}


// ─── 人臉檢測（examples/vision/ai_vision/nn_facedetector.py）──────

Blockly.Blocks['ai_model_face_recognition_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_title)
            .appendField(Blockly.Msg.ai_models_init_face_model);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('DEGREE');
            var TOOLTIPS = {
                'Human Face Recognition': Blockly.Msg.ai_model_allinit_TOOLTIP.replace('%1', Blockly.Msg.ai_models_init_face_model)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl('');
    }
};

Blockly.Blocks['ai_model_face_recognition_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_load_title)
            .appendField(Blockly.Msg.ai_models_init_face_model);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_facedetection"), "varitem");
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

Blockly.Blocks['ai_model_xy'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(new Blockly.FieldImage("blockly/media/face_recognition_header.png", 45, 45, { alt: "*", flipRtl: "FALSE" }));
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_face_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_object_model_name, "Object"],
                [Blockly.Msg.ai_models_face_model_x, "X"],
                [Blockly.Msg.ai_models_face_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_w, "W"],
                [Blockly.Msg.ai_models_face_model_h, "H"],
                // [Blockly.Msg.ai_models_face_model_x_center, "CX"],
                // [Blockly.Msg.ai_models_face_model_y_center, "CY"],
                [Blockly.Msg.ai_models_face_model_count, "Number"],
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
                'X': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x),
                'Y': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y),
                'W': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_w),
                'H': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_h),
                // 'CX': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_x_center),
                // 'CY': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_y_center),
                'Number': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_count),
                // 'Serial': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_index),
                // 'Confidence': Blockly.Msg.ai_model_xy_TOOLTIP.replace('%1', Blockly.Msg.ai_models_face_model_confidence)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_face'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_face_model_if);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_face_model_if);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_face_attribute'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_model_list);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_model_list);
        this.setHelpUrl("");
    }
};

/** 人臉檢測模型。多關鍵點那組也要用同一個，共用 key 才不會載兩份。 */
function maixFaceDetectorModel() {
    return maixNnInit("import_face_recognition", "faceDetector", "faces",
        `nn.YOLO11(model="/root/models/yolo11s_face.mud")`);
}

Blockly.Python.ai_model_face_recognition_init = function (block) {
    // nn_facedetector.py 用 sys.device_name() 在 maixcam2 與 maixcam 之間選模型；
    // pi2 就是 maixcam2，那個分支恆真，所以直接寫死不繞。
    return maixFaceDetectorModel();
}

Blockly.Python.ai_model_face_recognition_load = function (block) {
    // 人臉的信心門檻 0.4，比物體檢測的 0.5 低——沿用 nn_facedetector.py。
    return maixNnDetect("faceDetector", "faces", maixNnVar(block, "varitem"), "0.4");
}

Blockly.Python.ai_model_face = function (block) {
    return ["len(faces)", Blockly.Python.ORDER_ATOMIC];
}

Blockly.Python['ai_model_face_attribute'] = function (block) {
    return ["faces", Blockly.Python.ORDER_NONE];
};

Blockly.Python.ai_model_xy = function (block) {
    var v = maixNnVar(block, "varitem");
    // 單類別模型，名稱固定。讀 faceDetector.labels 只會拿到同一個值，
    // 還多一個出錯的機會，所以沿用舊版的字面值。
    return [maixNnField(v, block.getFieldValue("TYPE"), "faces", `"Face"`),
        Blockly.Python.ORDER_ATOMIC];
}


// ─── 客製化檢測模型（docs/vision/customize_model_yolov5.md ＋ maixhub_train.md）───

Blockly.Blocks['ai_model_customized_init_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_setup_title);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_init_setup_path)
            .appendField(new Blockly.FieldTextInput("/root/models/yolo11n.mud"), "model_path")
            // MaixHub 訓練出來的 .mud 可能是這三種之一，載入的類別不同，
            // 而 .mud 檔本身看不出是哪一種，只能讓使用者選。
            .appendField(new Blockly.FieldDropdown([
                ["YOLO11", "YOLO11"],
                ["YOLOv8", "YOLOv8"],
                ["YOLOv5", "YOLOv5"]
            ]), "model_kind");
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

Blockly.Blocks['ai_model_customized_load_setup'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_customized_load_setup_title);
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

Blockly.Blocks['ai_model_customized_if_got'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_customized_if_got);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_customized_if_got_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_customized_attribute'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_customized_attribute);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_customized_attribute_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_customized_get_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_customized_get_result_any)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_customized_get_result_name, "classid"],
                [Blockly.Msg.ai_models_customized_get_result_x, "x"],
                [Blockly.Msg.ai_models_customized_get_result_y, "y"],
                [Blockly.Msg.ai_models_customized_get_result_w, "w"],
                [Blockly.Msg.ai_models_customized_get_result_h, "h"],
                // [Blockly.Msg.ai_models_customized_get_result_x_center, "cx"],
                // [Blockly.Msg.ai_models_customized_get_result_y_center, "cy"],
                // [Blockly.Msg.ai_models_customized_get_result_count, "objnum"],
                // [Blockly.Msg.ai_models_customized_get_result_index, "index"],
                [Blockly.Msg.ai_models_customized_get_result_confidence, "value"],
                [Blockly.Msg.ai_models_face_model_ws, "2"],
                [Blockly.Msg.ai_models_face_model_hs, "3"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"]
            ]), "get_results");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        var thisBlock = this;
        this.setTooltip(function () {
            var mode = thisBlock.getFieldValue('get_results');
            var TOOLTIPS = {
                'classid': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_name),
                'x': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_x),
                'y': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_y),
                'w': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_w),
                'h': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_h),
                'cx': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_x_center),
                'cy': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_y_center),
                'objnum': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_count),
                'index': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_index),
                'value': Blockly.Msg.ai_model_customized_get_result_TOOLTIP.replace('%1', Blockly.Msg.ai_models_customized_get_result_confidence)
            };
            return TOOLTIPS[mode];
        });
        this.setHelpUrl("");
    }
};

Blockly.Python['ai_model_customized_init_setup'] = function (block) {
    // 客製化＝使用者自己訓練的模型（MaixHub 網頁上訓練，或自己用 yolov5／v8／11 訓練）。
    //
    // 舊版要使用者填路徑「前綴」，產碼補上 .param／.bin，而且 anchors、輸入尺寸、
    // model_type 全部寫死成 TinyYOLOv2 224x224——換一種模型就不能用。
    // v4 統一成一個 .mud 檔，標籤、mean、scale、輸入尺寸都在裡面。
    //
    // 標籤那個插槽在 v4 沒事做了：填了就用填的，沒填就用 .mud 自帶的。
    // 這樣舊專案的接線不會斷，新使用者也不必再打一遍。
    var labels = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    var path = block.getFieldValue('model_path');
    var kind = block.getFieldValue('model_kind');
    // 標籤放進自己的變數，不去寫 customDetector.labels——那是 C++ 綁定的屬性，
    // 可能唯讀。而且這樣「取結果」那個積木不必知道使用者有沒有填，
    // 一律讀 customLabels 就好，兩個積木之間不用傳狀態。
    var code = maixNnInit("import_customized", "customDetector", "customObjs",
        `nn.${kind}(model="${path}")`);
    Blockly.Python.definitions_["import_customized_labels"] =
        `customLabels = ${labels || "customDetector.labels"}\n`;
    return code;
};

Blockly.Python['ai_model_customized_load_setup'] = function (block) {
    return maixNnDetect("customDetector", "customObjs", maixNnVar(block, 'varitem'), "0.5");
};

Blockly.Python['ai_model_customized_if_got'] = function (block) {
    return ["len(customObjs)", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['ai_model_customized_attribute'] = function (block) {
    return ["customObjs", Blockly.Python.ORDER_NONE];
};

Blockly.Python['ai_model_customized_get_result'] = function (block) {
    var v = maixNnVar(block, 'varitem');
    // 這組的下拉值是小寫的 classid/x/y/w/h/value，跟前兩組不同名但意思一樣，
    // 先正規化再查同一張表——不要為了名字不同再抄一份對應。
    var ALIAS = { classid: "Object", x: "X", y: "Y", w: "W", h: "H", value: "Confidence" };
    var type = block.getFieldValue('get_results');
    return [maixNnField(v, ALIAS[type] || type, "customObjs",
        `customLabels[${v}.class_id]`), Blockly.Python.ORDER_ATOMIC];
};


// ─── 圖像分類（docs/vision/classify.md、examples/…/nn_classifier.py）─────
//
// 這組是**全新的**——舊的 13 組模型積木沒有純分類。
//
// 分類跟檢測是兩件不同的事，官方文件講得很清楚：
//   分類：一張圖 → 一個答案（「這張圖是蘋果」），不知道位置，沒有框
//   檢測：一張圖 → N 個框（「左上角有蘋果、右邊有飛機」），多了位置資訊
// 兩者互補，不是誰取代誰。分類認得 1000 類（ImageNet），檢測只有 80 類（COCO）。

Blockly.Blocks['maixcam2_cls_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_cls_init_title);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_cls_init_title);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_cls_classify'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_cls_classify_title)
            .appendField(new Blockly.FieldVariable("img_classify"), "varitem");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_cls_classify_title);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_cls_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_cls_result_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.maixcam2_cls_result_name, "name"],
                [Blockly.Msg.maixcam2_cls_result_confidence, "confidence"]
            ]), "TYPE");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_cls_result_get);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_cls_init'] = function (block) {
    // 1000 類的 ImageNet 模型，機器上現成，不需要任何平台或訓練。
    // clsResult 先給空清單的理由跟檢測那幾組一樣：使用者可能先拉「取結果」
    // 再拉「分類」，少了這行會是 NameError，訊息看不出漏了哪一塊。
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`;
    Blockly.Python.definitions_['import_classifier'] = `imageClassifier = nn.Classifier(model="/root/models/mobilenetv2.mud")
clsResult = []
`;
    return "";
};

Blockly.Python['maixcam2_cls_classify'] = function (block) {
    // classify() 回傳的是照機率排好序的 [(類別編號, 機率), ...]，
    // 不是像 detect() 那樣的物件清單——所以這組不共用 maixNnField。
    return `clsResult = imageClassifier.classify(${maixNnVar(block, 'varitem')})\n`;
};

Blockly.Python['maixcam2_cls_result'] = function (block) {
    // 只取第一名（clsResult[0]）。官方範例也是這樣用：分類的答案就是最像的那個。
    var code = block.getFieldValue('TYPE') === "name"
        ? `imageClassifier.labels[clsResult[0][0]]`
        : `(clsResult[0][1] * 100)`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};


// ─── 自我學習分類（docs/vision/self_learn_classifier.md）───────────
//
// 在裝置上現場訓練：拍幾張當類別、拍幾張當樣本、按一下學習，就能分辨。
// 不需要任何平台，模型 mobilenet_v2_no_top.mud 機器上現成。

Blockly.Blocks['ai_model_self_learning_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_init);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.ai_models_customized_init_setup_name);
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_init);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_load);

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_load);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_recognize_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_recognize_load);

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_recognize_load);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_add_class'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_add_class_category + ',');
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_self_learning"), "varitem");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_add_class_category);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_make_data_set'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_make_data_set);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_self_learning"), "varitem");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_make_data_set);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_picture'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_picture);

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_picture);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_save_modal'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_save_modal);

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_save_modal);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_class_verification'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_class_verification);

        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_self_learning"), "varitem");

        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_class_verification);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['ai_model_self_learning_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_self_learning_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_model_self_learning_result_name, "X"],
                [Blockly.Msg.ai_models_object_model_confidence, "Y"]
            ]), "TYPE");;
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_self_learning_result);
        this.setHelpUrl("");
    }
};

// 模型與結果變數：訓練模式和識別模式共用同一個 key，所以兩個「加載」積木
// 同時放在盤面上也只會產出一份，不會互相覆蓋。
function maixSelfLearnModel() {
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`;
    Blockly.Python.definitions_['import_self_learn'] =
        `selfLearner = nn.SelfLearnClassifier(model="/root/models/mobilenet_v2_no_top.mud")
selfLearnResult = []
`;
}

Blockly.Python['ai_model_self_learning_init'] = function (block) {
    // 只負責類別名稱。舊版還算了 CLASSNUM 和 SAMPLENUM（用 JSON.parse 去解析
    // 產出的 Python 清單字面值——使用者一接變數就會爆），v4 用不到這兩個。
    var labels = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['import_self_learn_labels'] = `selfLearnLabels = ${labels || "[]"}\n`;
    return "";
};

Blockly.Python['ai_model_self_learning_load'] = function (block) {
    // 訓練模式：建立一個空的分類器，等著 add_class／add_sample／learn。
    maixSelfLearnModel();
    return "";
};

Blockly.Python['ai_model_self_learning_recognize_load'] = function (block) {
    // 識別模式：把之前存起來的類別讀回來。v4 的 load() 會**回傳標籤**，
    // 所以類別名稱跟模型是存在一起的，不必再拉「初始化」積木填一次。
    maixSelfLearnModel();
    Blockly.Python.definitions_['import_self_learn_load'] =
        `selfLearnLabels = selfLearner.load("/root/my_classes.bin")\n`;
    return "";
};

Blockly.Python['ai_model_self_learning_add_class'] = function (block) {
    return `selfLearner.add_class(${maixNnVar(block, 'varitem')})\n`;
};

Blockly.Python['ai_model_self_learning_make_data_set'] = function (block) {
    // 舊版是 `for i in range(5): add_sample_img(同一張圖)`——同一張圖加五次，
    // 對這種比距離的分類器沒有意義。改成呼叫一次，使用者要幾張就拉幾次。
    return `selfLearner.add_sample(${maixNnVar(block, 'varitem')})\n`;
};

Blockly.Python['ai_model_self_learning_picture'] = function (block) {
    return `selfLearner.learn()\n`;
};

Blockly.Python['ai_model_self_learning_save_modal'] = function (block) {
    // 標籤跟模型存在同一個檔，識別模式的 load() 才讀得回來。
    return `selfLearner.save("/root/my_classes.bin", labels=selfLearnLabels)\n`;
};

Blockly.Python['ai_model_self_learning_class_verification'] = function (block) {
    return `selfLearnResult = selfLearner.classify(${maixNnVar(block, 'varitem')})\n`;
};

Blockly.Python['ai_model_self_learning_result'] = function (block) {
    // classify() 回傳照距離排序的 [(類別編號, 距離), ...]。**距離越小越像**，
    // 不是機率——所以「相似度」是 100 減距離，這是舊版就有的表示法。
    var code = block.getFieldValue('TYPE') === 'X'
        ? `selfLearnLabels[selfLearnResult[0][0]]`
        : `(100 - selfLearnResult[0][1])`;
    return [code, Blockly.Python.ORDER_ATOMIC];
};


// ─── 人臉關鍵點（docs/vision/face_detection.md）────────────────────
//
// 人臉檢測那個模型（yolo11s_face.mud）除了框，還會回傳 5 個五官點——
// 「两个眼睛，一个鼻子，一张嘴巴的两个嘴角」。A2 那 5 個積木沒有一個拿得到
// obj.points，所以這裡補兩個，接在同一組 faces 上。
//
// **文件沒有說這 5 個點的順序**，所以積木用序號而不是「左眼／右眼」這種名字。
// 順序由驗證卡在實機上量出來之後再考慮取名——不憑慣例假設。

/** 顏色插槽的共用處理：色票給的是 #RRGGBB，RGB 積木給的是 r,g,b。 */
function maixNnColor(code) {
    if (code.charAt(0) === '#' && code.length === 7) {
        var r = parseInt(code.substring(1, 3), 16),
            g = parseInt(code.substring(3, 5), 16),
            b = parseInt(code.substring(5, 7), 16);
        return `image.Color.from_rgb(${r},${g},${b})`;
    }
    return `image.Color.from_rgb(*${code})`;
}

Blockly.Blocks['maixcam2_face_kp_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_face"), "varitem")
            .appendField(Blockly.Msg.maixcam2_face_kp_draw)
            .appendField(new Blockly.FieldVariable("i"), "faceitem")
            .appendField(Blockly.Msg.maixcam2_face_kp_of);
        this.appendValueInput("COLOR")
            .setCheck(null)
            .appendField(Blockly.Msg.image_process_text_color);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_face_kp_draw);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_face_kp_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "faceitem")
            .appendField(Blockly.Msg.maixcam2_face_kp_get)
            .appendField(new Blockly.FieldNumber(1, 1, 5, 1), "INDEX")
            .appendField(Blockly.Msg.maixcam2_face_kp_axis)
            .appendField(new Blockly.FieldDropdown([["X", "X"], ["Y", "Y"]]), "AXIS");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_face_kp_get);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_face_kp_draw'] = function (block) {
    var canvas = maixNnVar(block, 'varitem');
    var face = maixNnVar(block, 'faceitem');
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    return `${canvas}.draw_keypoints(${face}.points, ${maixNnColor(color)}, size = 4)\n`;
};

Blockly.Python['maixcam2_face_kp_get'] = function (block) {
    // points 是攤平的 [x1, y1, x2, y2, ...]，序號從 1 起算所以要減一。
    var face = maixNnVar(block, 'faceitem');
    var n = Number(block.getFieldValue('INDEX')) - 1;
    var offset = block.getFieldValue('AXIS') === 'X' ? n * 2 : n * 2 + 1;
    return [`${face}.points[${offset}]`, Blockly.Python.ORDER_ATOMIC];
};


// ─── 人臉多關鍵點（docs/vision/face_landmarks.md）──────────────────
//
// 這組跟前面每一組都不一樣：**兩個模型串接**。
//   第一段 yolo11s_face.mud 找出臉在哪
//   第二段 face_landmarks.mud 把每張臉裁出來，算 478 個點
//
// 中間的 img_std（裁出來的標準臉）和 res.valid 檢查都是管線內部的事，
// 不該變成積木暴露給使用者。所以「檢測」那個積木產出一個輔助函式，
// 迴圈與過濾都藏在裡面——跟 v831_draw_rect_corners、textCanvasNewLine 同一種做法。
//
// points 有 478 個，排列是 x0,y0,x1,y1,...,x477,y477。
// 文件另外給了常用子集的索引（5 點是 [468, 473, 4, 61, 291]），但註明
// 「只提供参考，以模型实际输出为准」——所以積木用序號，名字等實機量過再說。

Blockly.Blocks['maixcam2_facelm_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_facelm_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_facelm_init);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_facelm_detect'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_facelm_detect)
            .appendField(new Blockly.FieldVariable("img_facelm"), "varitem")
            .appendField(Blockly.Msg.maixcam2_facelm_max)
            .appendField(new Blockly.FieldNumber(2, 1, 10, 1), "MAXNUM");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_facelm_detect);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_facelm_count'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_facelm_count);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_facelm_count);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_facelm_list'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_facelm_list);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_facelm_list);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_facelm_num'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_facelm_num);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_facelm_num);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_facelm_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_facelm"), "varitem")
            .appendField(Blockly.Msg.maixcam2_facelm_draw)
            .appendField(new Blockly.FieldVariable("i"), "faceitem");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_facelm_draw);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_facelm_point'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "faceitem")
            .appendField(Blockly.Msg.maixcam2_face_kp_get)
            .appendField(new Blockly.FieldNumber(1, 1, 478, 1), "INDEX")
            .appendField(Blockly.Msg.maixcam2_face_kp_axis)
            .appendField(new Blockly.FieldDropdown([["X", "X"], ["Y", "Y"]]), "AXIS");
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_facelm_init);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_facelm_init'] = function (block) {
    maixFaceDetectorModel();      // 第一段：找臉。跟 A2 共用同一份模型
    Blockly.Python.definitions_['import_face_landmarks'] =
        `faceLmModel = nn.FaceLandmarks(model="/root/models/face_landmarks.mud")
faceLandmarks = []
`;
    // 整條管線包成一個函式：裁臉、算點、過濾無效結果、限制張數。
    // 這些都是內部細節，拆成積木只會讓盤面難讀又容易接錯。
    Blockly.Python.definitions_['def_face_landmarks_detect'] = `
def maixFaceLandmarksDetect(img, maxNum):
    global faceLandmarks
    faceLandmarks = []
    objs = faceDetector.detect(img, conf_th = 0.5, iou_th = 0.45, sort = 1)
    count = 0
    for obj in objs:
        img_std = faceLmModel.crop_image(img, obj.x, obj.y, obj.w, obj.h, obj.points)
        if img_std:
            res = faceLmModel.detect(img_std, 0.5, True, False)
            if res and res.valid:
                faceLandmarks.append(res)
        count += 1
        if maxNum > 0 and count >= maxNum:
            break
`;
    return "";
};

Blockly.Python['maixcam2_facelm_detect'] = function (block) {
    return `maixFaceLandmarksDetect(${maixNnVar(block, 'varitem')}, ${block.getFieldValue('MAXNUM')})\n`;
};

Blockly.Python['maixcam2_facelm_count'] = function (block) {
    return ["len(faceLandmarks)", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_facelm_list'] = function (block) {
    return ["faceLandmarks", Blockly.Python.ORDER_NONE];
};

Blockly.Python['maixcam2_facelm_num'] = function (block) {
    // 總點數由模型決定，文件說是 478，但以實機為準——所以讀模型不寫死。
    return ["faceLmModel.landmarks_num", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_facelm_draw'] = function (block) {
    var canvas = maixNnVar(block, 'varitem');
    var face = maixNnVar(block, 'faceitem');
    return `faceLmModel.draw_face(${canvas}, ${face}.points, len(${face}.points_z), ${face}.points_z)\n`;
};

Blockly.Python['maixcam2_facelm_point'] = function (block) {
    // points 攤平成 x0,y0,x1,y1,...；序號從 1 起算所以要減一。
    var face = maixNnVar(block, 'faceitem');
    var n = Number(block.getFieldValue('INDEX')) - 1;
    var offset = block.getFieldValue('AXIS') === 'X' ? n * 2 : n * 2 + 1;
    return [`${face}.points[${offset}]`, Blockly.Python.ORDER_ATOMIC];
};


// ─── 人臉識別（docs/vision/face_recognition.md ＋ projects/app_face_recognizer）───
//
// 跟人臉「檢測」不同：檢測回答『臉在哪』，識別回答『這張臉是誰』。
// 要先註冊（add_face）才認得出來，labels[0] 固定是 unknown。
//
// 舊版是自己手寫的一套，把特徵存成 JSON 塞在 .py 檔裡；v4 有 save_faces／
// load_faces，存的是二進位，所以檔名也從 .py 改成 .bin。

Blockly.Blocks['face_recognition_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face)
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_name);
        this.appendValueInput("class_input")
            .setCheck(null)
            .appendField(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD + ":")
            .appendField(new Blockly.FieldVariable("people_name_list"), "varitem");;
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['face_recognition_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_face_recognition_load);
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_init_source)
            .appendField(new Blockly.FieldVariable("img_recognized_face"), "varitem");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.v831_face_recognition_load_title);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['face_recognition_detection_rectangle'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_face_model_get)
            .appendField(new Blockly.FieldDropdown([
                // [Blockly.Msg.face_information, "rect"],
                [Blockly.Msg.ai_models_face_model_x, "X"],
                [Blockly.Msg.ai_models_face_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_w, "W"],
                [Blockly.Msg.ai_models_face_model_h, "H"],
                // [Blockly.Msg.ai_models_face_model_x_center, "CX"],
                // [Blockly.Msg.ai_models_face_model_y_center, "CY"],
                // [Blockly.Msg.ai_models_face_model_count, "Number"],
                // [Blockly.Msg.ai_models_face_model_index, "Serial"],
                [Blockly.Msg.ai_models_face_model_confidence_1, "Confidence"],
                [Blockly.Msg.ai_models_face_model_ws, "2"],
                [Blockly.Msg.ai_models_face_model_hs, "3"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"],
                [Blockly.Msg.v831_model_face_name, "0"],
                [Blockly.Msg.v831_models_face_model_confidence, "1"],
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

Blockly.Blocks['face_recognition_map_face'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.face_recognition_map_face_canvas)
            .appendField(new Blockly.FieldVariable("img_recognized_face"), "varitem")
            .appendField(Blockly.Msg.face_recognition_map_face_show)
            .appendField(new Blockly.FieldVariable("i"), "varitem1")
            .appendField(Blockly.Msg.face_recognition_map_face_key_point);
        // this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.v831_setting_face_data_save_title);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['face_recognition_if_face'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_face_model_if_new);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_face_model_if_new);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['face_recognition_face_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_attribute_new);
        this.setInputsInline(false);
        this.setOutput(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_attribute_new);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['face_recognition_add'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_setting_face_data_save)
            .appendField(new Blockly.FieldVariable("i"), "varitem").appendField(Blockly.Msg.ai_model_face_gather_1);
        this.appendDummyInput()
            .appendField(Blockly.Msg.SYSTEM_CREATE_F_1)
            .appendField("/root/faces.bin");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.v831_setting_face_data_save_title);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['face_recognition_remove'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.v831_setting_face_data_remove)
        // .appendField(new Blockly.FieldVariable("save_face_data"), "varitem");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.v831_setting_face_data_remove_title);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['face_recognition_data_load'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_model_face_data_load)
        this.appendDummyInput().appendField(Blockly.Msg.SYSTEM_CREATE_F_1)
            .appendField("/root/faces.bin");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_model_face_data_load);
        this.setHelpUrl("");
    }
};

// 註冊人臉要「先算特徵」——recognize() 的第 5、6 個參數。官方 app 用按鈕切換，
// 因為算特徵有成本。這裡一律算：這是教學產品，少一個會忘記勾的開關比較重要。
// 成本有多大等實機量，量到真的慢再加旋鈕。
var MAIX_FACE_DB = "/root/faces.bin";

Blockly.Python['face_recognition_init'] = function (block) {
    // labels[0] 永遠是 "unknown"，之後每註冊一張臉就多一個——所以
    // 「已註冊幾張」是 len(labels) - 1。下面的加人／刪人都靠這個算。
    var listVar = maixNnVar(block, 'varitem');
    var names = Blockly.Python.valueToCode(block, 'class_input', Blockly.Python.ORDER_ATOMIC);
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`;
    Blockly.Python.definitions_['maixcam2_import_os'] = `import os`;
    Blockly.Python.definitions_['import_face_recognizer'] =
`faceRecognizer = nn.FaceRecognizer(detect_model="/root/models/yolov8n_face.mud", feature_model="/root/models/insghtface_webface_r50.mud")
recogFaces = []
faceNameList = ${names || "[]"}
${listVar} = faceNameList
`;
    return "";
};

Blockly.Python['face_recognition_load'] = function (block) {
    // 0.5 檢測門檻、0.45 IOU、0.85 比對門檻（越大越嚴格，越小越容易認錯）。
    return `recogFaces = faceRecognizer.recognize(${maixNnVar(block, 'varitem')}, 0.5, 0.45, 0.85, True, True)\n`;
};

Blockly.Python['face_recognition_if_face'] = function (block) {
    return ["len(recogFaces)", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['face_recognition_face_result'] = function (block) {
    return ["recogFaces", Blockly.Python.ORDER_NONE];
};

Blockly.Python.face_recognition_detection_rectangle = function (block) {
    var v = maixNnVar(block, 'varitem');
    var type = block.getFieldValue('TYPE');
    // "0" 是名稱、"1" 是信心度，這兩個是這組獨有的下拉值；rect 舊版回傳整塊
    // 人臉資料，v4 沒有對應物就回傳物件本身；其餘沿用共用的欄位對應表。
    if (type === "0")   return [`faceRecognizer.labels[${v}.class_id]`, Blockly.Python.ORDER_ATOMIC];
    if (type === "1")   return [`(${v}.score * 100)`, Blockly.Python.ORDER_ATOMIC];
    if (type === "rect") return [v, Blockly.Python.ORDER_ATOMIC];
    if (type === "Serial") return [`${v}.class_id`, Blockly.Python.ORDER_ATOMIC];
    return [maixNnField(v, type, "recogFaces", `faceRecognizer.labels[${v}.class_id]`),
            Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['face_recognition_map_face'] = function (block) {
    // 人臉識別的模型也會回傳 5 個五官點，跟 A6 那組同一回事。
    return `${maixNnVar(block, 'varitem')}.draw_keypoints(${maixNnVar(block, 'varitem1')}.points, image.COLOR_RED, size = 4)\n`;
};

Blockly.Python['face_recognition_add'] = function (block) {
    // 名字從使用者預先列好的清單依序取：第 N 張註冊的臉拿第 N 個名字。
    // 清單用固定的 faceNameList，不用使用者的變數名——「加人」這個積木
    // 看不到「初始化」那個積木填了什麼變數名。初始化會把兩者指向同一份。
    // 這是舊版就有的做法（add_user(CLASSNAMEFACELIST[len(...)])），沿用。
    // 名字用完就不再加，否則 IndexError。
    var v = maixNnVar(block, 'varitem');
    return `if len(faceRecognizer.labels) - 1 < len(faceNameList):
    faceRecognizer.add_face(${v}, faceNameList[len(faceRecognizer.labels) - 1])
    faceRecognizer.save_faces("${MAIX_FACE_DB}")
`;
};

Blockly.Python['face_recognition_remove'] = function (block) {
    // labels[0] 是 unknown，所以最後一張已註冊的臉是索引 len(labels) - 2。
    return `if len(faceRecognizer.labels) > 1:
    faceRecognizer.remove_face(len(faceRecognizer.labels) - 2)
    faceRecognizer.save_faces("${MAIX_FACE_DB}")
`;
};

Blockly.Python['face_recognition_data_load'] = function (block) {
    Blockly.Python.definitions_['maixcam2_import_os'] = `import os`;
    return `if os.path.exists("${MAIX_FACE_DB}"):
    faceRecognizer.load_faces("${MAIX_FACE_DB}")
`;
};


// ─── 人體關鍵點與語義分割 ──────────────────────────────────────────
//
// 這兩組跟常見物體檢測（A1）是同一個形狀：單一模型、detect() 回物件清單、
// 物件有 .x/.y/.w/.h/.class_id/.score。差別只在多出來的東西：
//   人體關鍵點  obj.points   骨架的 17 個關節點（docs/vision/body_key_points.md）
//   語義分割    obj.seg_mask 每個物體的遮罩（docs/vision/segmentation.md）
//
// 所以欄位對應直接沿用 maixNnField，只多加「畫骨架」「畫遮罩」兩個專屬積木。

/** 造一組「初始化／檢測／數量／清單」四件套，省得每組抄一遍。 */
function maixMakeDetectorGroup(prefix, defKey, detector, list, ctor, detectArgs, msg) {
    Blockly.Blocks[prefix + '_init'] = { init: function () {
        this.appendDummyInput().appendField(Blockly.Msg[msg.init]);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg[msg.init]); this.setHelpUrl("");
    }};
    Blockly.Blocks[prefix + '_detect'] = { init: function () {
        this.appendDummyInput().appendField(Blockly.Msg[msg.detect])
            .appendField(new Blockly.FieldVariable(msg.defaultVar), "varitem");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg[msg.detect]); this.setHelpUrl("");
    }};
    Blockly.Blocks[prefix + '_count'] = { init: function () {
        this.appendDummyInput().appendField(Blockly.Msg[msg.count]);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg[msg.count]); this.setHelpUrl("");
    }};
    Blockly.Blocks[prefix + '_list'] = { init: function () {
        this.appendDummyInput().appendField(Blockly.Msg[msg.list]);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg[msg.list]); this.setHelpUrl("");
    }};
    Blockly.Python[prefix + '_init'] = function () {
        return maixNnInit(defKey, detector, list, ctor);
    };
    Blockly.Python[prefix + '_detect'] = function (block) {
        return `${list} = ${detector}.detect(${maixNnVar(block, 'varitem')}${detectArgs})\n`;
    };
    Blockly.Python[prefix + '_count'] = function () {
        return [`len(${list})`, Blockly.Python.ORDER_ATOMIC];
    };
    Blockly.Python[prefix + '_list'] = function () {
        return [list, Blockly.Python.ORDER_NONE];
    };
}

// keypoint_th 是關鍵點自己的門檻，跟框的 conf_th 分開——關節被遮住時
// 它的分數會低，這個值決定要不要畫出來。
maixMakeDetectorGroup('maixcam2_pose', 'import_pose', 'poseDetector', 'poses',
    `nn.YOLO11(model="/root/models/yolo11s_pose.mud")`,
    ', conf_th = 0.5, iou_th = 0.45, keypoint_th = 0.5',
    { init: 'maixcam2_pose_init', detect: 'maixcam2_pose_detect', count: 'maixcam2_pose_count',
      list: 'maixcam2_pose_list', defaultVar: 'img_pose' });

maixMakeDetectorGroup('maixcam2_seg', 'import_seg', 'segDetector', 'segObjs',
    `nn.YOLO11(model="/root/models/yolo11n_seg.mud")`,
    ', conf_th = 0.5, iou_th = 0.45',
    { init: 'maixcam2_seg_init', detect: 'maixcam2_seg_detect', count: 'maixcam2_seg_count',
      list: 'maixcam2_seg_list', defaultVar: 'img_seg' });

Blockly.Blocks['maixcam2_pose_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_pose"), "varitem")
            .appendField(Blockly.Msg.maixcam2_pose_draw)
            .appendField(new Blockly.FieldVariable("i"), "poseitem");
        this.appendValueInput("COLOR").setCheck(null)
            .appendField(Blockly.Msg.image_process_text_color);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_pose_draw); this.setHelpUrl("");
    }
};

/**
 * COCO 的 17 個關節，順序是固定的標準。
 *
 * **第 1 個是鼻子這件事是 2026-08-11 在實機上量到的**（卡 A9-6），
 * 跟 COCO 標準順序相符，所以其餘 16 個照標準列出來。單獨驗過的只有第一個，
 * 但名字錯了在畫面上一望即知（「左手腕」指到腳踝），不會默默錯下去。
 *
 * 左右是**人自己的左右**，不是畫面上的——這是 COCO 的慣例。
 * 面對鏡頭時看起來會左右相反。
 */
function maixPoseKeypointOptions() {
    var opts = [];
    for (var i = 1; i <= 17; i++) opts.push([Blockly.Msg["maixcam2_kp_" + i], String(i)]);
    return opts;
}

Blockly.Blocks['maixcam2_pose_point'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "poseitem")
            .appendField(new Blockly.FieldDropdown(maixPoseKeypointOptions()), "INDEX")
            .appendField(Blockly.Msg.maixcam2_face_kp_axis)
            .appendField(new Blockly.FieldDropdown([["X", "X"], ["Y", "Y"]]), "AXIS");
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_pose_init); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_seg_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_seg"), "varitem")
            .appendField(Blockly.Msg.maixcam2_seg_draw)
            .appendField(new Blockly.FieldVariable("i"), "segitem");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_seg_draw); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_pose_draw'] = function (block) {
    // 半徑 4：範例是「輸入寬度大於 480 就用 8，否則 4」。積木的畫布是 320 寬，
    // 所以固定 4；寫成條件式只會讓產碼多一行看不懂的東西。
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    return `poseDetector.draw_pose(${maixNnVar(block, 'varitem')}, ${maixNnVar(block, 'poseitem')}.points, 4, ${maixNnColor(color)})\n`;
};

Blockly.Python['maixcam2_pose_point'] = function (block) {
    var v = maixNnVar(block, 'poseitem');
    var n = Number(block.getFieldValue('INDEX')) - 1;
    return [`${v}.points[${block.getFieldValue('AXIS') === 'X' ? n * 2 : n * 2 + 1}]`,
            Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_seg_draw'] = function (block) {
    // threshold=127：遮罩是灰階的機率圖，這個值決定哪些像素算「屬於這個物體」。
    return `segDetector.draw_seg_mask(${maixNnVar(block, 'varitem')}, ${maixNnVar(block, 'segitem')}.x, ${maixNnVar(block, 'segitem')}.y, ${maixNnVar(block, 'segitem')}.seg_mask, threshold=127)\n`;
};

/** 造一個「從 i 取〔欄位〕」的積木。欄位對應共用 maixNnField，不再抄一份。 */
function maixMakeGetBlock(type, defaultItem, detector, list) {
    Blockly.Blocks[type] = { init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable(defaultItem), "varitem")
            .appendField(Blockly.Msg.ai_models_object_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_object_model_name, "Object"],
                [Blockly.Msg.ai_models_object_model_x, "X"],
                [Blockly.Msg.ai_models_object_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_ws, "2"],
                [Blockly.Msg.ai_models_face_model_hs, "3"],
                [Blockly.Msg.ai_models_object_model_w, "W"],
                [Blockly.Msg.ai_models_object_model_h, "H"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"],
                [Blockly.Msg.ai_models_object_model_confidence, "Confidence"]
            ]), "TYPE");
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_object_model_get); this.setHelpUrl("");
    }};
    Blockly.Python[type] = function (block) {
        var v = maixNnVar(block, 'varitem');
        return [maixNnField(v, block.getFieldValue("TYPE"), list,
                `${detector}.labels[${v}.class_id]`), Blockly.Python.ORDER_ATOMIC];
    };
}

maixMakeGetBlock('maixcam2_pose_get', 'i', 'poseDetector', 'poses');
maixMakeGetBlock('maixcam2_seg_get',  'i', 'segDetector',  'segObjs');


Blockly.Blocks['maixcam2_pose_valid'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "poseitem")
            .appendField(new Blockly.FieldDropdown(maixPoseKeypointOptions()), "INDEX")
            .appendField(Blockly.Msg.maixcam2_pose_valid);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_pose_valid); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_pose_valid'] = function (block) {
    // keypoint_th 沒有把偵測不到的關節濾掉，而是回傳 (0, 0)——2026-08-11 實機
    // 量到的（卡 A9-8：「沒有識別到的點好像都集中在左上角的 (0,0)」）。
    //
    // 所以拿關節座標去畫東西之前要先問這一句，否則被遮住的關節會全部
    // 堆在畫面左上角。這個積木就是為了那件事存在的。
    var v = maixNnVar(block, 'poseitem');
    var n = Number(block.getFieldValue('INDEX')) - 1;
    return [`(${v}.points[${n * 2}] != 0 or ${v}.points[${n * 2 + 1}] != 0)`,
            Blockly.Python.ORDER_ATOMIC];
};


// ─── 人臉表情情緒（docs/vision/face_emotion.md）────────────────────
//
// 三個物件串接，是這批裡最複雜的一組：
//   faceDetector          找臉（跟 A2／A6／A7 共用同一份模型）
//   faceLmModel           **空模型**，只為了借它的 crop_image 把臉裁成標準大小
//   emotionClassifier     face_emotion.mud，對裁好的灰階臉做分類
//
// 那個空模型不是筆誤：官方範例的註解寫得很清楚——
//   "we only use one of it's function to crop face from image, wo we not init model actually"
// 裁臉這件事需要五官點才能對齊，而那個邏輯放在 FaceLandmarks 裡，
// 所以借它的方法但不載入權重。
//
// 中間的裁圖、轉灰階、softmax 都藏進輔助函式，跟 A7 一樣。
// 結果存成 (臉的框, 分類結果) 的配對，因為畫框要用前者、顯示表情要用後者。

Blockly.Blocks['maixcam2_emotion_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_emotion_init);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_emotion_init); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_emotion_detect'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_emotion_detect)
            .appendField(new Blockly.FieldVariable("img_emotion"), "varitem");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_emotion_detect); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_emotion_count'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_emotion_count);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_emotion_count); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_emotion_list'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_emotion_list);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_emotion_list); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_emotion_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "varitem")
            .appendField(Blockly.Msg.ai_models_object_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.maixcam2_emotion_name, "name"],
                [Blockly.Msg.maixcam2_emotion_score, "score"],
                [Blockly.Msg.ai_models_object_model_x, "X"],
                [Blockly.Msg.ai_models_object_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_ws, "W"],
                [Blockly.Msg.ai_models_face_model_hs, "H"]
            ]), "TYPE");
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_emotion_init); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_emotion_init'] = function (block) {
    maixFaceDetectorModel();       // 第一段：找臉，跟人臉那幾組共用
    Blockly.Python.definitions_['import_emotion'] =
`faceLmModel = nn.FaceLandmarks(model="")
emotionClassifier = nn.Classifier(model="/root/models/face_emotion.mud")
emotionResults = []
`;
    Blockly.Python.definitions_['def_emotion_detect'] = `
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
`;
    return "";
};

Blockly.Python['maixcam2_emotion_detect'] = function (block) {
    return `maixEmotionDetect(${maixNnVar(block, 'varitem')})\n`;
};

Blockly.Python['maixcam2_emotion_count'] = function () {
    return ["len(emotionResults)", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_emotion_list'] = function () {
    return ["emotionResults", Blockly.Python.ORDER_NONE];
};

Blockly.Python['maixcam2_emotion_get'] = function (block) {
    // 清單裡每一項是 (臉的框, 分類結果) 的配對：畫框要用前者，表情用後者。
    // 分類結果是照機率排好序的 [(編號, 機率), ...]，取第一名。
    var v = maixNnVar(block, 'varitem');
    var MAP = {
        name:  `emotionClassifier.labels[${v}[1][0][0]]`,
        score: `(${v}[1][0][1] * 100)`,
        X:     `${v}[0].x`,
        Y:     `${v}[0].y`,
        W:     `${v}[0].w`,
        H:     `${v}[0].h`
    };
    return [MAP[block.getFieldValue("TYPE")] || v, Blockly.Python.ORDER_ATOMIC];
};


// ─── 手部關鍵點與手勢辨識（examples/vision/ai_vision/nn_hand_landmarks.py）───
//
// 這一組取代舊版的「猜拳識別」。官方沒有猜拳模型，但有手部關鍵點模型
// （21 點）＋ 預設映像自帶的手勢分類器，涵蓋範圍比猜拳大得多——
// 石頭剪刀布只是其中三種。依「官方有什麼功能就定義什麼積木」的規則，
// 不硬套舊積木的形狀。
//
// **點的順序還沒在實機上量過**，所以下拉用序號不用名字。這是 A6 的教訓：
// 憑 MediaPipe 的慣例猜順序，猜錯了會默默錯下去。驗過再改名。
//
// points 的排法跟人體關鍵點**不一樣**：
//   points[0..7]              8 個值（手部方框的四個角）
//   points[8 + i*3 + 0/1/2]   第 i 個關鍵點的 x / y / z（共 21 點）
// 人體那組是 points[i*2]、points[i*2+1]，沒有前面那 8 個值，也沒有 z。

maixMakeDetectorGroup('maixcam2_hand', 'import_hand', 'handDetector', 'hands',
    `nn.HandLandmarks(model="/root/models/hand_landmarks.mud")`,
    ', conf_th = 0.7, iou_th = 0.45, conf_th2 = 0.8',
    { init: 'maixcam2_hand_init', detect: 'maixcam2_hand_detect', count: 'maixcam2_hand_count',
      list: 'maixcam2_hand_list', defaultVar: 'img_hand' });

maixMakeGetBlock('maixcam2_hand_get', 'i', 'handDetector', 'hands');

/** 21 個手部關鍵點，先用序號——實機驗過順序再改成名字。 */
function maixHandKeypointOptions() {
    var opts = [];
    for (var i = 1; i <= 21; i++) opts.push([String(i), String(i)]);
    return opts;
}

Blockly.Blocks['maixcam2_hand_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_hand"), "varitem")
            .appendField(Blockly.Msg.maixcam2_hand_draw)
            .appendField(new Blockly.FieldVariable("i"), "handitem");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_hand_draw); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_hand_point'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "handitem")
            .appendField(Blockly.Msg.maixcam2_hand_point)
            .appendField(new Blockly.FieldDropdown(maixHandKeypointOptions()), "INDEX")
            .appendField(Blockly.Msg.maixcam2_hand_of)
            .appendField(new Blockly.FieldDropdown([["X", "X"], ["Y", "Y"]]), "AXIS");
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_hand_point); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_hand_side'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "handitem")
            .appendField(Blockly.Msg.maixcam2_hand_side);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_hand_side); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_hand_draw'] = function (block) {
    // draw_hand 要 class_id（左右手決定骨架顏色）、points、點半徑、線寬。
    // box=True 會連手部方框一起畫。
    return `handDetector.draw_hand(${maixNnVar(block, 'varitem')}, `
        + `${maixNnVar(block, 'handitem')}.class_id, `
        + `${maixNnVar(block, 'handitem')}.points, 4, 10, box=True)\n`;
};

Blockly.Python['maixcam2_hand_point'] = function (block) {
    var v = maixNnVar(block, 'handitem');
    var n = parseInt(block.getFieldValue('INDEX'), 10) - 1;
    var off = 8 + n * 3 + (block.getFieldValue('AXIS') === 'X' ? 0 : 1);
    return [`${v}.points[${off}]`, Blockly.Python.ORDER_MEMBER];
};

Blockly.Python['maixcam2_hand_side'] = function (block) {
    return [`handDetector.labels[${maixNnVar(block, 'handitem')}.class_id]`,
            Blockly.Python.ORDER_MEMBER];
};


// ─── 手勢辨識 ──────────────────────────────────────────────────────
//
// 官方的 nn API **沒有**手勢分類，這是預設映像自帶的 app
// （/maixapp/apps/gesture_classifier）裡的 LinearSVC，權重已經訓練好。
//
// 官方 app 開機要等 10 秒，因為它載了 629 KB 的 trainSets.npz 重建 scaler。
// **那一步是多餘的**——LinearSVC.load() 已經把 scaler 的 mean/std 存回來了。
// 跳過之後實測：import 0.72s、載權重 0.13s、每次預測 2.4ms。

Blockly.Blocks['maixcam2_gesture_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_gesture_init);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_gesture_init); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_gesture_recognize'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_gesture_recognize)
            .appendField(new Blockly.FieldVariable("i"), "handitem")
            .appendField(Blockly.Msg.maixcam2_gesture_in)
            .appendField(new Blockly.FieldVariable("img_hand"), "varitem");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_gesture_recognize); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_gesture_result'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_gesture_result)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.maixcam2_gesture_result_name, "NAME"],
                [Blockly.Msg.ai_models_object_model_confidence, "CONF"]
            ]), "TYPE");
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_gesture_result); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_gesture_init'] = function () {
    Blockly.Python.definitions_['maixcam2_import_gesture'] = `import sys as _maixSys
if "/maixapp/apps/gesture_classifier" not in _maixSys.path:
    _maixSys.path.insert(0, "/maixapp/apps/gesture_classifier")
import numpy as _maixNp
from LinearSVC import LinearSVC as _MaixLinearSVC`;
    Blockly.Python.definitions_['maixcam2_gesture_clf'] = `_gestureClf = _MaixLinearSVC.load("/maixapp/apps/gesture_classifier/clf_dump.npz")
_gestureNames = ("one", "five", "fist", "ok", "heartSingle", "yearh", "three",
                 "four", "six", "Iloveyou", "gun", "thumbUp", "nine", "pink")
_gestureName = ""
_gestureConf = 0

def _maixGesture(obj, img):
    # 跟官方 app 的 preprocess 完全一致，改一個字預測就全錯：
    #   1. 取 21 點的 x,y（丟掉 z）
    #   2. 全部減去第 0 點（手腕），變成相對向量——手在畫面哪裡就不影響結果
    #   3. 除以畫面寬高正規化——手離鏡頭遠近就不影響結果
    #   4. 右手把 x 取負做鏡像，左右手才能共用同一組特徵
    lm = _maixNp.array(obj.points[8:8 + 21 * 3]).reshape((21, -1))[:, :2]
    v = (lm[1:] - lm[0]).astype("float64") / (img.width(), img.height())
    if obj.class_id != 0:
        v[:, 0] *= -1
    idx, conf = _gestureClf.predict_with_confidence(
        _gestureClf.scaler.transform(_maixNp.array([v.flatten()])))
    return _gestureNames[idx[0]], conf[0] * 100
`;
    return "";
};

Blockly.Python['maixcam2_gesture_recognize'] = function (block) {
    return `_gestureName, _gestureConf = _maixGesture(${maixNnVar(block, 'handitem')}, `
        + `${maixNnVar(block, 'varitem')})\n`;
};

Blockly.Python['maixcam2_gesture_result'] = function (block) {
    return [block.getFieldValue('TYPE') === 'NAME' ? '_gestureName' : '_gestureConf',
            Blockly.Python.ORDER_ATOMIC];
};


// ─── 帶旋轉角度的檢測 OBB（examples/vision/ai_vision/nn_yolo11_obb.py）───
//
// 跟一般檢測的差別：框會跟著物體轉。一般的框永遠是正的，斜放的東西會框到
// 一堆空白；OBB 的框貼著物體的方向。
//
// **這個模型認的是航拍影像的東西**（DOTA 資料集：飛機、船、油罐、球場、
// 橋、車輛……）。拿相機對著桌面什麼都不會偵測到，要對著衛星或航拍照片。
// 這是模型的訓練資料決定的，不是積木的問題——驗證卡上寫清楚怎麼測。
//
// obj.angle 的單位是「π 弧度」，乘 180 才是度數（官方範例就是這樣印的）。

maixMakeDetectorGroup('maixcam2_obb', 'import_obb', 'obbDetector', 'obbObjs',
    `nn.YOLO11(model="/root/models/yolo11n_obb.mud")`,
    ', conf_th = 0.5, iou_th = 0.45',
    { init: 'maixcam2_obb_init', detect: 'maixcam2_obb_detect', count: 'maixcam2_obb_count',
      list: 'maixcam2_obb_list', defaultVar: 'img_obb' });

maixMakeGetBlock('maixcam2_obb_get', 'i', 'obbDetector', 'obbObjs');

Blockly.Blocks['maixcam2_obb_angle'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "obbitem")
            .appendField(Blockly.Msg.maixcam2_obb_angle);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_obb_angle); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_obb_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_obb"), "varitem")
            .appendField(Blockly.Msg.maixcam2_obb_draw)
            .appendField(new Blockly.FieldVariable("i"), "obbitem");
        this.appendValueInput("COLOR").setCheck(null)
            .appendField(Blockly.Msg.image_process_text_color);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_obb_draw); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_obb_angle'] = function (block) {
    // angle 的單位是 π 弧度，乘 180 得到度數
    return [`(${maixNnVar(block, 'obbitem')}.angle * 180)`, Blockly.Python.ORDER_MULTIPLICATIVE];
};

Blockly.Python['maixcam2_obb_draw'] = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    // close=True 把四個角連成封閉的框；draw_pose 本來是畫骨架的，
    // 官方範例就是拿它畫旋轉框——四個角當成四個「關節」。
    return `obbDetector.draw_pose(${maixNnVar(block, 'varitem')}, `
        + `${maixNnVar(block, 'obbitem')}.get_obb_points(), 4, ${maixNnColor(color)}, close=True)\n`;
};


// ─── 單目深度估計（examples/vision/ai_vision/nn_depth_anything_v2.py）───
//
// 一張普通相片就能估出「哪裡近、哪裡遠」，不需要雙鏡頭或雷射。
// 輸出是一張用顏色表上色的圖：同一個顏色代表同樣的距離。
//
// **只能產生深度圖，取不到單點的數值。** get_depth() 回傳的 Tensor 在
// Python 這端沒有公開任何方法（實測 dir() 是空的），讀不出數字。
// 官方範例也只是顯示那張圖。

Blockly.Blocks['maixcam2_depth_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_depth_init);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_depth_init); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_depth_image'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_depth_image)
            .appendField(new Blockly.FieldVariable("img_depth"), "varitem")
            .appendField(Blockly.Msg.maixcam2_depth_cmap)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.maixcam2_cmap_turbo, "TURBO"],
                [Blockly.Msg.maixcam2_cmap_inferno, "INFERNO"],
                [Blockly.Msg.maixcam2_cmap_jet, "JET"],
                [Blockly.Msg.maixcam2_cmap_greys, "GREYS"],
                [Blockly.Msg.maixcam2_cmap_thermal, "THERMAL_IRONBOW"],
                [Blockly.Msg.maixcam2_cmap_viridis, "VIRIDIS"]
            ]), "CMAP");
        this.setInputsInline(true);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_depth_image); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_depth_init'] = function () {
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`;
    // dual_buff=False 是刻意的。預設 True 會讓 CPU 和 NPU 平行跑，
    // 但**回傳的是上一幀的結果**——第一次呼叫沒有「上一幀」，就回傳 None，
    // 積木接到 None 直接 AttributeError（2026-08-12 實機踩到）。
    // 官方範例用 `if res:` 擋掉，但值積木不能「有時候不回傳」。
    //
    // 實測代價只有 7%：dual_buff=True 8.4 fps／False 7.8 fps，
    // 而 None 從 33 次出現 1 次變成 0 次。換得值。
    Blockly.Python.definitions_['import_depth'] =
        `depthModel = nn.DepthAnything(model="/root/models/depth_anything_v2_vits.mud", dual_buff=False)\n`;
    return "";
};

Blockly.Python['maixcam2_depth_image'] = function (block) {
    var v = maixNnVar(block, 'varitem');
    // FIT_CONTAIN：相機是 640x480、模型只吃 322x238，等比縮放不變形。
    //
    // 回傳的深度圖是**模型的尺寸**（322x238），比畫布小。直接交給顯示積木
    // 會縮在左上角一小塊——所以這裡放大回來源影像的大小，讓它跟其他繪圖、
    // 顯示積木接得上。官方範例是 disp.show(res) 讓 show() 自己縮，
    // 那條路繞過了畫布，積木用不了。
    return [`depthModel.get_depth_image(${v}, image.Fit.FIT_CONTAIN, `
        + `image.CMap.${block.getFieldValue('CMAP')}).resize(${v}.width(), ${v}.height())`,
            Blockly.Python.ORDER_MEMBER];
};


// ─── OCR 文字辨識（examples/vision/ai_vision/nn_pp_ocr.py）──────────
//
// 兩個跟其他模型不一樣的地方，踩到都會直接拋例外：
//
//   1. **模型吃 BGR888，相機給的是 RGB888。**
//      不轉會拋 `image format not match, input_type: BGR888`。
//      所以檢測積木裡插了 to_format()——不是多餘的。
//
//   2. **輸入尺寸要正好 640x480。** 相機改成裝置原生之後剛好是這個尺寸，
//      所以現在不用另外 resize；但要記得這件事是相依的。
//
// 顯示中文不用換字型：產碼預設載的 SourceHanSansCN 是完整的中日韓字型，
// 涵蓋 OCR 會輸出的字。官方範例另外載 ppocr_keys_v1.ttf，我們不需要，
// 也避免跟「更換字型」那個積木打架。

maixMakeDetectorGroup('maixcam2_ocr', 'import_ocr', 'ocrModel', 'ocrObjs',
    `nn.PP_OCR("/root/models/pp_ocr.mud")`, '',
    { init: 'maixcam2_ocr_init', detect: 'maixcam2_ocr_detect', count: 'maixcam2_ocr_count',
      list: 'maixcam2_ocr_list', defaultVar: 'img_ocr' });

// 覆寫工廠產生的檢測——OCR 要先轉格式，工廠沒有這個概念。
Blockly.Python['maixcam2_ocr_detect'] = function (block) {
    return `ocrObjs = ocrModel.detect(${maixNnVar(block, 'varitem')}`
        + `.to_format(image.Format.FMT_BGR888))\n`;
};

Blockly.Blocks['maixcam2_ocr_text'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "ocritem")
            .appendField(Blockly.Msg.maixcam2_ocr_text);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_ocr_text); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_ocr_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "ocritem")
            .appendField(Blockly.Msg.ai_models_object_model_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_object_model_x, "X"],
                [Blockly.Msg.ai_models_object_model_y, "Y"],
                [Blockly.Msg.ai_models_object_model_confidence, "SCORE"]
            ]), "TYPE");
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.ai_models_object_model_get); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_ocr_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_ocr"), "varitem")
            .appendField(Blockly.Msg.maixcam2_ocr_draw)
            .appendField(new Blockly.FieldVariable("i"), "ocritem");
        this.appendValueInput("COLOR").setCheck(null)
            .appendField(Blockly.Msg.image_process_text_color);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_ocr_draw); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_ocr_all'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_ocr_all);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_ocr_all); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_ocr_text'] = function (block) {
    return [`${maixNnVar(block, 'ocritem')}.char_str()`, Blockly.Python.ORDER_MEMBER];
};

Blockly.Python['maixcam2_ocr_get'] = function (block) {
    var v = maixNnVar(block, 'ocritem');
    // box 是四個角（x1..x4／y1..y4），第一個角當作「位置」。
    var MAP = { X: `${v}.box.x1`, Y: `${v}.box.y1`, SCORE: `(${v}.score * 100)` };
    return [MAP[block.getFieldValue('TYPE')], Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_ocr_draw'] = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    // 文字框是四個角，不是正矩形——文字可能是斜的。draw_keypoints 把四個點
    // 連起來，跟官方範例一樣。
    return `${maixNnVar(block, 'varitem')}.draw_keypoints(`
        + `${maixNnVar(block, 'ocritem')}.box.to_list(), ${maixNnColor(color)}, 4, -1, 1)\n`;
};

Blockly.Python['maixcam2_ocr_all'] = function () {
    // 把所有文字段接成一串，中間用空白隔開——「拍一張照把字唸出來」這種
    // 用法不必自己拉迴圈。
    return [`" ".join([_o.char_str() for _o in ocrObjs])`, Blockly.Python.ORDER_MEMBER];
};


// ─── 人體姿態分類（examples/vision/ai_vision/nn_yolo11_pose_cls.py）───
//
// 跟「人體關鍵點」（A9）不是同一件事：那組給你 17 個關節的座標，
// 這組直接回答「這是什麼姿勢」——直立／坐下／躺下，加上舉左手／舉雙手／
// 雙手比心／大字型。
//
// **它不是模型，是幾何規則。** 算肢體向量的夾角再套門檻，沒有訓練、
// 沒有權重檔。實作在預設映像自帶的 app 裡（約 200 行），直接 import——
// 跟手勢分類同一個套路，比手抄一遍安全得多（抄錯一個門檻就默默給錯答案）。
//
// 這組**依賴 A9 的積木**：要先拉「初始化人體關鍵點檢測」和「檢測人體關鍵點」，
// 它吃的是那邊產生的 poses 裡的每一個人。
//
// 輸出語言由裝置的 /boot/configs maix_language_locale 決定（實測是 en），
// i18n 沒有提供改 locale 的 API，所以在這裡做一張對照表轉成中文，
// 對不到的原樣放行——裝置若設成 zh，輸出本來就是中文，會直接通過。

Blockly.Blocks['maixcam2_posecls_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_posecls_init);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_posecls_init); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_posecls_of'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.ai_models_from)
            .appendField(new Blockly.FieldVariable("i"), "poseitem")
            .appendField(Blockly.Msg.maixcam2_posecls_of);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_posecls_of); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_posecls_init'] = function () {
    Blockly.Python.definitions_['maixcam2_import_posecls'] = `import sys as _maixSys
if "/maixapp/apps/human_pose_classifier" not in _maixSys.path:
    _maixSys.path.insert(0, "/maixapp/apps/human_pose_classifier")
from PoseEstimation import PoseEstimation as _MaixPoseEstimation`;
    Blockly.Python.definitions_['maixcam2_posecls_obj'] = `_poseClassifier = _MaixPoseEstimation()

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
    return "\\n".join(_poseNames.get(s, s) for s in raw.split("\\n") if s)
`;
    return "";
};

Blockly.Python['maixcam2_posecls_of'] = function (block) {
    return [`_maixPoseCls(${maixNnVar(block, 'poseitem')})`, Blockly.Python.ORDER_MEMBER];
};


// ─── 自我學習追蹤（examples/vision/ai_vision/nn_self_learn_tracker.py）───
//
// 跟前面所有檢測模型的差別：**它沒有預先訓練的類別**。框一個東西給它，
// 之後就一直追那個東西——杯子、書、一隻手都可以，不必先有模型認得它。
// 官方叫 SOT（單目標追蹤），一次只追一個。
//
// MaixCAM2 用的演算法是 MixFormerV2（NanoTrack 是舊機 MaixCAM 的，
// 這台不支援），要 MaixPy >= 4.12。建構子那兩個數字取自官方 app：
//   update_interval=200    每 200 幀把目前看到的樣子也學進去，物體轉了角度
//                          還追得住（初始的樣子會保留，兩份一起用）
//   lost_find_interval=60  連續 60 幀找不到就改變搜尋範圍重找
//
// **產碼刻意不用 nn.Object 存結果，而是拆成 trackX/trackY/… 幾個數字。**
// 理由跟深度估計那邊一樣（A14 的教訓）：值積木不能「有時候不回傳」。
// 追蹤器還沒學過目標時不能呼叫 track()，那一幀就沒有結果——如果結果存在
// 一個物件裡，取 X 的積木就會拿到 None 然後 AttributeError。存成數字，
// 沒追到就是保留上一次的值，程式不會斷。
//
// 學習跟追蹤分成兩個積木也是刻意的：什麼時候學（按按鍵？點螢幕？）是使用者
// 的事，官方 app 用拖曳框選，但那是它的 UI，不是 API 的一部分。

Blockly.Blocks['maixcam2_track_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_track_init);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_track_init); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_track_learn'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_track_learn)
            .appendField(new Blockly.FieldVariable("img_track"), "varitem");
        this.appendValueInput("X").setCheck(null).appendField("x");
        this.appendValueInput("Y").setCheck(null).appendField("y");
        this.appendValueInput("W").setCheck(null).appendField(Blockly.Msg.ai_models_face_model_ws);
        this.appendValueInput("H").setCheck(null).appendField(Blockly.Msg.ai_models_face_model_hs);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_track_learn); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_track_track'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_track_track)
            .appendField(new Blockly.FieldVariable("img_track"), "varitem");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_track_track); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_track_learned'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_track_learned);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_track_learned); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_track_found'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_track_found);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_track_found); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_track_get'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_track_get)
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.ai_models_object_model_x, "X"],
                [Blockly.Msg.ai_models_object_model_y, "Y"],
                [Blockly.Msg.ai_models_face_model_ws, "W"],
                [Blockly.Msg.ai_models_face_model_hs, "H"],
                [Blockly.Msg.ai_models_object_model_x_center, "CX"],
                [Blockly.Msg.ai_models_object_model_y_center, "CY"],
                [Blockly.Msg.ai_models_object_model_confidence, "SCORE"]
            ]), "TYPE");
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_track_get); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_track_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_track"), "varitem")
            .appendField(Blockly.Msg.maixcam2_track_draw);
        this.appendValueInput("COLOR").setCheck(null)
            .appendField(Blockly.Msg.image_process_text_color);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_track_draw); this.setHelpUrl("");
    }
};

/** 追蹤器的信心門檻，跟官方 app 的 MaixCAM2 分支一致。 */
var MAIX_TRACK_TH = 0.5;

Blockly.Python['maixcam2_track_init'] = function () {
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`;
    Blockly.Python.definitions_['import_track'] =
        `trackModel = nn.MixFormerV2("/root/models/mixformer_v2.mud", 200, 60)
trackLearned = False
trackFound = False
trackX = 0
trackY = 0
trackW = 0
trackH = 0
trackScore = 0
`;
    return "";
};

Blockly.Python['maixcam2_track_learn'] = function (block) {
    var O = Blockly.Python.ORDER_ATOMIC;
    // 先落到暫存變數再判斷，值積木只算一次——寬高接的可能是「觸控 X 減起點 X」
    // 這種運算式，算兩次就多讀一次觸控。
    // 寬或高不是正數時不呼叫 init()：官方 app 也擋這一步（往左上拖會拖出負的）。
    return `_tx = ${Blockly.Python.valueToCode(block, 'X', O) || 0}
_ty = ${Blockly.Python.valueToCode(block, 'Y', O) || 0}
_tw = ${Blockly.Python.valueToCode(block, 'W', O) || 0}
_th = ${Blockly.Python.valueToCode(block, 'H', O) || 0}
if _tw > 0 and _th > 0:
    trackModel.init(${maixNnVar(block, 'varitem')}, _tx, _ty, _tw, _th)
    trackLearned = True
`;
};

Blockly.Python['maixcam2_track_track'] = function (block) {
    // 沒學過目標就不能追——MixFormerV2 的 track() 要有 init() 過的模板。
    return `if trackLearned:
    _to = trackModel.track(${maixNnVar(block, 'varitem')}, ${MAIX_TRACK_TH})
    if _to is None:
        trackFound = False
    else:
        trackX, trackY, trackW, trackH = _to.x, _to.y, _to.w, _to.h
        trackScore = _to.score * 100
        trackFound = _to.score >= ${MAIX_TRACK_TH}
`;
};

Blockly.Python['maixcam2_track_learned'] = function () {
    return ['trackLearned', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_track_found'] = function () {
    return ['trackFound', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_track_get'] = function (block) {
    var MAP = {
        X: 'trackX', Y: 'trackY', W: 'trackW', H: 'trackH',
        CX: 'int(trackX + trackW / 2)', CY: 'int(trackY + trackH / 2)',
        SCORE: 'trackScore'
    };
    return [MAP[block.getFieldValue('TYPE')], Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_track_draw'] = function (block) {
    var color = Blockly.Python.valueToCode(block, 'COLOR', Blockly.Python.ORDER_ATOMIC);
    // 線寬 2：跟繪圖積木的空心圖形一致（2026-08-11 實機決定，1 在這片面板上
    // 右邊和下邊會發灰）。追丟時畫的是上一次的位置，要不要畫由使用者用
    //「追蹤到目標？」自己決定。
    return `${maixNnVar(block, 'varitem')}.draw_rect(trackX, trackY, trackW, trackH, `
        + `${maixNnColor(color)}, 2)\n`;
};


// ─── 軌跡追蹤與計數（examples/vision/tracker/tracker_bytetrack*.py）───
//
// 檢測只回答「畫面裡有幾個人」，**軌跡追蹤回答「這是剛剛那個人嗎」**。
// 每個物體拿到一個編號，跨幀不變，所以才能算「總共走過去幾個人」——
// 不然每一幀都重數一次，一個人站著不動也會被算幾百次。
//
// 這組**跟自我學習追蹤不是同一件事**：那個一次追一個、要先框選；
// 這個一次追全部、靠檢測模型認得的類別。
//
// 用的是官方的 `maix.tracker.ByteTracker`，接在「常見物體檢測」的 objs 上——
// 所以這組要跟那組積木一起拉（跟姿態分類依賴人體關鍵點一樣）。
// 這也是官方文件建議的用法：換掉檢測模型就能追別的東西。
//
// 建構子那五個數字取自官方範例，含意見 tracker_bytetrack.py 的 configs 段。
// 其中 max_history_num=5 決定「走過的路」畫幾個點，也決定計數能回看幾幀。

/** 追蹤器參數，跟官方範例的 configs 一致。 */
var MAIX_BT_ARGS = '120, 0.4, 0.6, 0.8, 5';

/** 計數線的寬容帶高度（像素）。太窄會漏掉走太快的人——一幀就跳過去了。 */
var MAIX_BT_BAND = 40;

Blockly.Blocks['maixcam2_bytetrack_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_bytetrack_init);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_bytetrack_init); this.setHelpUrl("");
    }
};

/** 只追某幾類。值是模型標籤裡的英文名，顯示的是中文。 */
function maixTrackClassOptions() {
    return [
        [Blockly.Msg.maixcam2_bytetrack_all, ""],
        [Blockly.Msg.maixcam2_bytetrack_person, "person"],
        [Blockly.Msg.maixcam2_bytetrack_car, "car"],
        [Blockly.Msg.maixcam2_bytetrack_cat, "cat"],
        [Blockly.Msg.maixcam2_bytetrack_dog, "dog"],
        [Blockly.Msg.maixcam2_bytetrack_bottle, "bottle"]
    ];
}

Blockly.Blocks['maixcam2_bytetrack_update'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_bytetrack_update)
            .appendField(new Blockly.FieldDropdown(maixTrackClassOptions()), "CLASS");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_bytetrack_update); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_bytetrack_draw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_track"), "varitem")
            .appendField(Blockly.Msg.maixcam2_bytetrack_draw);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_bytetrack_draw); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_bytetrack_count'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.image_process_text_on_canvas)
            .appendField(new Blockly.FieldVariable("img_track"), "varitem")
            .appendField(Blockly.Msg.maixcam2_bytetrack_count);
        this.appendValueInput("Y").setCheck(null).appendField("y");
        this.appendDummyInput()
            .appendField(new Blockly.FieldDropdown([
                [Blockly.Msg.maixcam2_bytetrack_down, "DOWN"],
                [Blockly.Msg.maixcam2_bytetrack_up, "UP"]
            ]), "DIR");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_bytetrack_count); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_bytetrack_total'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_bytetrack_total);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_bytetrack_total); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_bytetrack_alive'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_bytetrack_alive);
        this.setOutput(true, null); this.setColour("#ee783a");
        this.setTooltip(Blockly.Msg.maixcam2_bytetrack_alive); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_bytetrack_reset'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_bytetrack_reset);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_bytetrack_reset); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_bytetrack_init'] = function () {
    Blockly.Python.definitions_['v831_import_from_maix_tracker'] = `from maix import tracker`;
    Blockly.Python.definitions_['v831_import_from_maix_image'] = `from maix import image`;
    Blockly.Python.definitions_['import_bytetrack'] =
        `byteTracker = tracker.ByteTracker(${MAIX_BT_ARGS})
tracks = []
btTotal = 0
_btCountedIds = []

# 編號輪流用這幾個顏色，同一個編號永遠同一色，看得出誰是誰。
_btColors = [(255, 0, 0), (0, 255, 0), (0, 0, 255), (255, 255, 0),
             (0, 255, 255), (255, 0, 255), (255, 128, 0), (128, 0, 255)]


def _maixTrackUpdate(names):
    # 用**名字**過濾而不是編號：編號是模型內部的順序，換一個模型就變了；
    # 名字（labels）是穩定的。names 空字串代表全部都追。
    new = []
    for _o in objs:
        if names and objectDetector.labels[_o.class_id] not in names:
            continue
        new.append(tracker.Object(_o.x, _o.y, _o.w, _o.h, _o.class_id, _o.score))
    return byteTracker.update(new)


def _maixTrackDraw(img):
    for _t in tracks:
        if _t.lost:
            continue
        _c = _btColors[_t.id % len(_btColors)]
        _c = image.Color.from_rgb(_c[0], _c[1], _c[2])
        _o = _t.history[-1]
        img.draw_rect(_o.x, _o.y, _o.w, _o.h, _c, 2)
        img.draw_string(_o.x, _o.y, str(_t.id), _c, 1.3)
        # history 是這個編號最近走過的位置，畫成一串點就是軌跡。
        for _h in _t.history:
            img.draw_circle(_h.x + _h.w // 2, _h.y + _h.h // 2, 2, _c, -1)


def _maixTrackSide(o, top, bottom):
    # 物體中心落在帶子的哪一邊：-1 在上面、0 在帶子裡、1 在下面
    _cy = o.y + o.h // 2
    if _cy < top:
        return -1
    if _cy > bottom:
        return 1
    return 0


def _maixTrackCount(img, line_y, want):
    # 「跨過去了」的判斷：現在在線的另一邊，而且**最近幾幀曾經在帶子裡**。
    # 少了後面那半，站在線下面不動的人每一幀都會被算一次。
    # 每個編號只算一次，記在 _btCountedIds 裡。
    global btTotal
    _top = line_y - ${MAIX_BT_BAND} // 2
    _bottom = line_y + ${MAIX_BT_BAND} // 2
    img.draw_line(0, line_y, img.width(), line_y, image.COLOR_YELLOW, 2)
    for _t in tracks:
        if _t.lost or _t.id in _btCountedIds:
            continue
        if _maixTrackSide(_t.history[-1], _top, _bottom) != want:
            continue
        for _o in _t.history[::-1][1:]:
            if _maixTrackSide(_o, _top, _bottom) == 0:
                btTotal += 1
                _btCountedIds.append(_t.id)
                break
    # 算過的編號留太多會一直長大，砍掉舊的。編號是遞增的，砍掉的不會再出現。
    if len(_btCountedIds) > 500:
        del _btCountedIds[:300]
`;
    return "";
};

Blockly.Python['maixcam2_bytetrack_update'] = function (block) {
    var cls = block.getFieldValue('CLASS');
    return `tracks = _maixTrackUpdate(${cls ? `("${cls}",)` : '()'})\n`;
};

Blockly.Python['maixcam2_bytetrack_draw'] = function (block) {
    return `_maixTrackDraw(${maixNnVar(block, 'varitem')})\n`;
};

Blockly.Python['maixcam2_bytetrack_count'] = function (block) {
    var y = Blockly.Python.valueToCode(block, 'Y', Blockly.Python.ORDER_ATOMIC) || 240;
    return `_maixTrackCount(${maixNnVar(block, 'varitem')}, ${y}, `
        + `${block.getFieldValue('DIR') === 'DOWN' ? '1' : '-1'})\n`;
};

Blockly.Python['maixcam2_bytetrack_total'] = function () {
    return ['btTotal', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_bytetrack_alive'] = function () {
    return ['len([_t for _t in tracks if not _t.lost])', Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_bytetrack_reset'] = function () {
    return `btTotal = 0\ndel _btCountedIds[:]\n`;
};


// ─── YOLO-World：用文字說要找什麼（docs/yolo-world-on-pi2.md）───────
//
// 前面所有檢測模型認得的東西都是訓練時就寫死的。YOLO-World 不是——
// 它認的東西寫在一個 8 KB 的**特徵檔**裡，換一個檔就換一整組詞，
// 模型本身完全不動。
//
// **這台編不了新詞。** 把英文字編成特徵檔要跑一個 254 MB 的語言模型，
// 這塊板子 Linux RAM 只有 446 MB，載到一半就 std::bad_alloc
// （原廠自己的 yoloworld app 也是同一條死路）。但特徵檔只有 8 KB，
// 在哪台機器編的不重要——已經在電腦上編好，放在
// tools/e2e/assets/yolo-world/，推進 /root/models/ 就能用。
//
// 所以積木給的是**下拉選單**而不是文字輸入框：能選的就是已經編好的那幾組。
// 打字輸入會讓人以為隨便打什麼都行，那是騙人的。
//
// 挑詞的原則：**全部避開 COCO 80 類**（見 docs/model-labels.md）。
// 選到 A1 也認得的詞，這組積木就白做了——A1 更快也更準。

/** 已經編好的詞組。值就是檔名的一部分：yolo-world_4_class_<值>.bin */
function maixYWorldSets() {
    return [
        [Blockly.Msg.maixcam2_yworld_set_wear, "wear"],
        [Blockly.Msg.maixcam2_yworld_set_stationery, "stationery"]
    ];
}

maixMakeDetectorGroup('maixcam2_yworld', 'import_yworld', 'yworldDetector', 'yworldObjs',
    '', ', conf_th = 0.5, iou_th = 0.45',
    { init: 'maixcam2_yworld_init', detect: 'maixcam2_yworld_detect',
      count: 'maixcam2_yworld_count', list: 'maixcam2_yworld_list',
      defaultVar: 'img_yworld' });

maixMakeGetBlock('maixcam2_yworld_get', 'i', 'yworldDetector', 'yworldObjs');

// 覆寫工廠產的初始化——它產不出帶下拉的積木，也不知道特徵檔這回事。
Blockly.Blocks['maixcam2_yworld_init'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_yworld_init)
            .appendField(new Blockly.FieldDropdown(maixYWorldSets()), "SET");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_yworld_init); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_yworld_switch'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_yworld_switch)
            .appendField(new Blockly.FieldDropdown(maixYWorldSets()), "SET");
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#ee783a"); this.setTooltip(Blockly.Msg.maixcam2_yworld_switch); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_yworld_init'] = function (block) {
    Blockly.Python.definitions_['v831_import_from_maix_nn'] = `from maix import nn`;
    Blockly.Python.definitions_['maixcam2_yworld_helper'] = `import os as _maixOs

YWORLD_MODEL = "/root/models/yolo-world_4_class.mud"


def _maixYWorldFiles(name):
    # 特徵檔不是系統內建的，是我們自己編好推上來的。重刷系統就沒了，
    # 所以這裡先確認再用——不然 nn.YOLOWorld 會拋一串看不懂的底層訊息。
    base = "/root/models/yolo-world_4_class_" + name
    if not _maixOs.path.exists(base + ".bin"):
        raise FileNotFoundError(
            "找不到 " + base + ".bin。這組詞的特徵檔要先推進裝置，"
            "在電腦上跑：adb push tools/e2e/assets/yolo-world/. /root/models/")
    return base + ".bin", base + ".txt"
`;
    // dual_buff=False：實測 16.9 fps 就是這個設定量到的。預設的 True 會讓
    // detect() 回傳上一幀的結果，快一點但沒量過，也沒驗過第一幀會不會是 None
    //（深度估計那次就是踩這個，A14）。先用量過的那個。
    Blockly.Python.definitions_['import_yworld'] =
        `yworldDetector = nn.YOLOWorld(YWORLD_MODEL, `
        + `*_maixYWorldFiles("${block.getFieldValue('SET')}"), dual_buff=False)
yworldObjs = []
`;
    return "";
};

Blockly.Python['maixcam2_yworld_switch'] = function (block) {
    // load() 實測 0.06 秒，放在迴圈裡按鍵切換也不會有可見的頓挫。
    return `yworldDetector.load(YWORLD_MODEL, `
        + `*_maixYWorldFiles("${block.getFieldValue('SET')}"))\n`;
};
