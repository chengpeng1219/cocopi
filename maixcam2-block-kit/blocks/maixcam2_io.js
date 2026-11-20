/*
 * MaixCAM2（pi2）的輸入積木：實體按鍵與觸控螢幕。
 *
 * 為什麼需要這一組：舊機（V831）有 A/B/C/D 四顆實體按鍵，走 GPIO。
 * pi2 上那些 GPIO 腳位不存在，舊積木一跑就 TypeError
 * （見 tools/e2e/contracts/parked-cards.md）。產品面已定：
 * 舊的 GPIO 按鍵積木要刪掉，改成**觸控螢幕**加上**機身唯一那顆實體按鍵**。
 *
 * 這一組不刪舊積木，只是把新的加進來——刪積木會讓既有專案匯入時掉積木。
 *
 * 依據：
 *   docs/doc/zh/peripheral/key.md   ＋ examples/peripheral/key/key_input.py
 *   docs/doc/zh/vision/touchscreen.md
 */


// ─── 實體按鍵 ────────────────────────────────────────────────────
//
// v4 的 key API 是**回呼式**的（按下時呼叫你的函式），但積木要的是
// 「現在按著沒有」這種可以插進「如果」的值。所以架一層：回呼只負責更新
// 一個變數，積木讀那個變數。
//
// ⚠ 副作用：一旦自己建立 key.Key(callback)，**按鍵原本「按一下結束程式」的
//   預設行為就會被取消**（文件明講）。這是 v4 的設計，不是我們改的。

function maixKeySetup() {
    Blockly.Python.definitions_['maixcam2_import_key'] = `from maix import key`;
    Blockly.Python.definitions_['maixcam2_key_state'] = `_maixKeyPressed = False

def _maixOnKey(key_id, state):
    global _maixKeyPressed
    _maixKeyPressed = (state == key.State.KEY_PRESSED)

_maixKeyObj = key.Key(_maixOnKey)
`;
}

Blockly.Blocks['maixcam2_key_pressed'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_key_pressed);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_key_pressed);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_key_pressed'] = function (block) {
    maixKeySetup();
    return ["_maixKeyPressed", Blockly.Python.ORDER_ATOMIC];
};


// ─── 觸控螢幕 ────────────────────────────────────────────────────
//
// ts.read() 回傳 (x, y, pressed)，是輪詢式的，跟積木天生合得來。
//
// 每個積木各自呼叫一次 read()：換來每個積木都能單獨使用，不必先拉一個
// 「讀取觸控」積木——那種積木學生一定會忘記拉。
//
// **底層 API 只有「現在按著嗎」。** 點擊、長按、拖曳、捲動都不是 API 提供的，
// 是官方範例在迴圈裡用狀態變數兜出來的（見 examples/vision/touchscreen/）。
// 這裡把那些模式做成積木，因為用現有的「是否按下」拼不出來：
// 按一秒會觸發三十次，學生必定踩到。
//
// **5 毫秒的讀數快取是為了邊緣偵測。** 「剛按下」要比較這一幀和上一幀，
// 一圈裡讀兩次就壞掉——第二次看到的「上一幀」已經被第一次更新掉了。
// 加了快取之後，同一圈裡所有觸控積木拿到同一筆讀數，狀態一圈只前進一次。
// 一圈實測 30～100 毫秒（見 probe-fps.py），遠大於 5，所以跨圈一定重讀。

function maixTouchSetup() {
    // **一定要用別名。** ai.js 有二十幾處寫 `definitions_['v831_import_time'] = "import time"`
    // （Python 標準庫的 time），排在我們後面就把 `from maix import time` 整個蓋掉，
    // 執行時是 `AttributeError: module 'time' has no attribute 'ticks_ms'`
    // ——2026-08-17 卡 S7 實機踩到。共用命名空間的產碼，誰後寫誰贏。
    Blockly.Python.definitions_['maixcam2_import_touch'] =
        `from maix import touchscreen\nfrom maix import time as _maixTime`;
    Blockly.Python.definitions_['maixcam2_touch_obj'] = `_maixTouch = touchscreen.TouchScreen()
_maixTouchCache = [0, 0, False, -1000]   # x, y, pressed, 讀取時刻(ms)
_maixTouchPrev = False                   # 上一圈的按下狀態
_maixTouchDown = False                   # 這一圈剛按下
_maixTouchUp = False                     # 這一圈剛放開
_maixTouchStart = [0, 0]                 # 按下那一刻的座標
_maixTouchTime = 0                       # 按下那一刻的時間

def _maixTouchPoint():
    # ts.read() 回傳的是**實體面板**的座標，但所有繪圖積木用的是**畫布**座標。
    # disp.show() 等比縮放置中顯示，所以要反算回畫布座標。
    #
    # 2026-08-11 之後邏輯畫面改成跟面板一樣大（640x480），兩者相等時
    # s = 1、偏移 = 0，這段算下來是恆等式。但**不能因此拿掉**：豎屏會對調
    # 長寬、使用者也可能自己開別的尺寸，那時候換算還是要的。
    #
    # 尺寸從全域讀而不是寫死：使用者可能把畫布開成別的大小。
    # 沒有螢幕初始化積木時退回預設值，不讓積木單獨使用時 NameError。
    global _maixTouchPrev, _maixTouchDown, _maixTouchUp, _maixTouchTime
    now = _maixTime.ticks_ms()
    if now - _maixTouchCache[3] < 5:
        return _maixTouchCache[0], _maixTouchCache[1], _maixTouchCache[2]
    tx, ty, pressed = _maixTouch.read()
    g = globals()
    pw = g["DISP_W"] if "DISP_W" in g else 640
    ph = g["DISP_H"] if "DISP_H" in g else 480
    cw = g["CAM_W"] if "CAM_W" in g else 640
    ch = g["CAM_H"] if "CAM_H" in g else 480
    s = min(pw / cw, ph / ch)
    x = int((tx - (pw - cw * s) / 2) / s)
    y = int((ty - (ph - ch * s) / 2) / s)
    _maixTouchDown = pressed and not _maixTouchPrev
    _maixTouchUp = _maixTouchPrev and not pressed
    if _maixTouchDown:
        _maixTouchStart[0], _maixTouchStart[1] = x, y
        _maixTouchTime = now
    _maixTouchPrev = pressed
    _maixTouchCache[0], _maixTouchCache[1] = x, y
    _maixTouchCache[2], _maixTouchCache[3] = pressed, now
    return x, y, pressed

def _maixTouchInArea(x, y, w, h):
    tx, ty, pressed = _maixTouchPoint()
    return pressed and x <= tx < x + w and y <= ty < y + h

def _maixTouchJustDown():
    _maixTouchPoint()          # 先讓狀態前進，再讀旗標
    return _maixTouchDown

def _maixTouchJustUp():
    # 手指離開的那一幀。**這才是「點擊」**——按下就觸發的按鈕，
    # 手指滑開也算按到，而且按住不放會一直觸發。
    _maixTouchPoint()
    return _maixTouchUp

def _maixTouchHold(sec):
    _x, _y, pressed = _maixTouchPoint()
    return pressed and _maixTime.ticks_ms() - _maixTouchTime >= sec * 1000

def _maixTouchDrag(axis):
    # 從按下那一刻到現在移動了多少。放開就回 0——沒在拖就沒有位移。
    x, y, pressed = _maixTouchPoint()
    if not pressed:
        return 0
    return x - _maixTouchStart[0] if axis == 0 else y - _maixTouchStart[1]
`;
}

/**
 * 捲動：把每一圈的手指位移累加成一個偏移量。
 *
 * 跟「拖曳位移」的差別是**累加**——拖曳算的是「這次按下到現在」，
 * 放開就歸零；捲動要記住放開之前捲到哪，下次接著捲。
 *
 * 用逐圈差值（上一圈的 y 減這一圈的 y）而不是「按下點到現在」，
 * 這樣不必另外記住「按下時捲到哪」，少一個狀態變數。
 */
function maixScrollSetup() {
    maixTouchSetup();
    Blockly.Python.definitions_['maixcam2_scroll_obj'] = `_maixScroll = 0
_maixScrollLast = None       # 上一圈的手指 y；None 代表沒在按

def _maixScrollUpdate(limit):
    global _maixScroll, _maixScrollLast
    _x, y, pressed = _maixTouchPoint()
    if pressed:
        if _maixScrollLast is not None:
            # 手指往上滑（y 變小）→ 捲動量變大 → 內容往上跑
            _maixScroll += _maixScrollLast - y
        _maixScrollLast = y
    else:
        _maixScrollLast = None
    # 夾在 0～limit 之間，滑不出內容之外
    if _maixScroll < 0:
        _maixScroll = 0
    elif _maixScroll > limit:
        _maixScroll = limit
`;
}

Blockly.Blocks['maixcam2_touch_pressed'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_touch_pressed);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_touch_pressed);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_touch_x'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_touch_x);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_touch_x);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_touch_y'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_touch_y);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_touch_y);
        this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_touch_in_area'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_touch_in_area);
        this.appendValueInput("POSA").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_touch_area_pos);
        this.appendValueInput("SIZE").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_touch_area_size);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_touch_in_area);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_touch_pressed'] = function (block) {
    maixTouchSetup();
    return ["_maixTouchPoint()[2]", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_touch_x'] = function (block) {
    maixTouchSetup();
    return ["_maixTouchPoint()[0]", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_touch_y'] = function (block) {
    maixTouchSetup();
    return ["_maixTouchPoint()[1]", Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_touch_in_area'] = function (block) {
    // 座標與尺寸都是「x,y」形式的兩個值，跟畫矩形那些積木同一套插槽，
    // 所以直接展開成四個參數。
    maixTouchSetup();
    var pos = Blockly.Python.valueToCode(block, 'POSA', Blockly.Python.ORDER_ATOMIC) || "0,0";
    var size = Blockly.Python.valueToCode(block, 'SIZE', Blockly.Python.ORDER_ATOMIC) || "0,0";
    return [`_maixTouchInArea(${pos}, ${size})`, Blockly.Python.ORDER_ATOMIC];
};


// ─── 觸控的進階動作 ────────────────────────────────────────────────
//
// 這六塊全部建立在同一筆讀數上（見上面的 5 毫秒快取）。
// 一塊「簡單的積木」值不值得做，看的是「用現有的拼不拼得出來」：
// 「剛按下」需要記住上一圈的狀態，用「是否按下」拼不出來，所以值得。

/** 只有一句話的值積木：欄位都一樣，只差訊息鍵和產出的運算式。 */
function maixMakeTouchFlag(type, msgKey, code) {
    Blockly.Blocks[type] = { init: function () {
        this.appendDummyInput().appendField(Blockly.Msg[msgKey]);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg[msgKey]); this.setHelpUrl("");
    }};
    Blockly.Python[type] = function () {
        maixTouchSetup();
        return [code, Blockly.Python.ORDER_ATOMIC];
    };
}

maixMakeTouchFlag('maixcam2_touch_down', 'maixcam2_touch_down', '_maixTouchJustDown()');
maixMakeTouchFlag('maixcam2_touch_up', 'maixcam2_touch_up', '_maixTouchJustUp()');

Blockly.Blocks['maixcam2_touch_hold'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_touch_hold);
        this.appendValueInput("SEC").setCheck(null);
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_touch_hold_unit);
        this.setInputsInline(true);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_touch_hold); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_touch_drag'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_touch_drag)
            .appendField(new Blockly.FieldDropdown([["X", "X"], ["Y", "Y"]]), "AXIS");
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_touch_drag); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_scroll_update'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_scroll_update);
        this.appendValueInput("LIMIT").setCheck(null);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null); this.setNextStatement(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_scroll_update); this.setHelpUrl("");
    }
};

Blockly.Blocks['maixcam2_scroll_value'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_scroll_value);
        this.setOutput(true, null);
        this.setColour("#d42b03");
        this.setTooltip(Blockly.Msg.maixcam2_scroll_value); this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_touch_hold'] = function (block) {
    maixTouchSetup();
    var sec = Blockly.Python.valueToCode(block, 'SEC', Blockly.Python.ORDER_ATOMIC) || 1;
    return [`_maixTouchHold(${sec})`, Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_touch_drag'] = function (block) {
    maixTouchSetup();
    return [`_maixTouchDrag(${block.getFieldValue('AXIS') === 'X' ? 0 : 1})`,
            Blockly.Python.ORDER_ATOMIC];
};

Blockly.Python['maixcam2_scroll_update'] = function (block) {
    maixScrollSetup();
    // 上限給 0 也不會壞：夾住之後捲動量永遠是 0，畫面就是不動。
    var limit = Blockly.Python.valueToCode(block, 'LIMIT', Blockly.Python.ORDER_ATOMIC) || 0;
    return `_maixScrollUpdate(${limit})\n`;
};

Blockly.Python['maixcam2_scroll_value'] = function () {
    maixScrollSetup();
    return ['_maixScroll', Blockly.Python.ORDER_ATOMIC];
};
