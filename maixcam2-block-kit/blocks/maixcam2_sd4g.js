/*
 * 文生圖／圖生圖（lcm-lora-sdv1-5），4G 版 MaixCAM2 才跑得動。
 *
 * 為什麼另開一個檔、不塞進 maixcam2_llm4g.js：那支講的是語音問答（Qwen、
 * SenseVoice），這支是完全不同的一顆模型和一套依賴（torch／diffusers）。
 * 分類同樣掛在「大模型（需 4G）」底下，所以 index.js 的 added: 不必動。
 *
 * ⚠ 前提沿用 4G 那一套（板子要 4G、AI ISP 要關、模型要先在機器上），
 *   實作直接叫 maix4gGuard()——同一份程式碼，不另外抄一遍。
 *
 * 2026-09-19 在 4G 板（MaixPy 4.12.5、CMM 3072MB）實測：
 *
 *   import maix.sdv1_5              54.5 秒   ← 這一類最大的問題，見下
 *   init(txt2img, img2img 一起)      9.7 秒
 *   每張圖                           2.3 秒
 *   init 後                         CMM 1.30 GiB / 3072、**Linux 746 MB / 955**
 *
 * **瓶頸在 Linux 側不在 CMM**（torch 吃的是 Linux heap，只剩約 210 MB）。
 * `deinit()` 還得了 CMM，還不了 Linux——套件已經 import 進來了。
 *
 * **為什麼不用背景執行緒載入。** 官方文件建議 importlib ＋ threading 把 import
 * 丟到背景（dlm_lora_sdv1_5.md），但那句話的前提是「**開發時**想快點進到介面」。
 * 做成積木的話，初始化會立刻回來、真正的一分鐘跑到第一次畫圖——學生看到的是
 * 「畫一張圖要一分鐘」，比「載入要一分鐘」更難懂，而且那是偷偷做事
 *（這個 repo 講過三次「不要偷偷 XX」）。所以老實等，並把進度印到 REPL。
 *
 * 依據：
 *   docs/superpowers/specs/2026-09-17-4g-llm-cards.md     決定（輸入輸出都是畫布、種子插槽）
 *   docs/superpowers/specs/2026-09-19-4g-quality-gate.md   品質判定：及格，256 一種、不做下拉
 *   tools/e2e/probe-sd4g-quality.py                        板子上跑成功過的那份呼叫順序
 *   MaixPy/docs/doc/zh/mllm/dlm_lora_sdv1_5.md            官方用法
 */


/*
   ___                       __  __
  / __| ___ _ _  ___ _ _ __ |  \/  |___ __| |___ _ _
 | (_ |/ -_) ' \/ -_) '_/ _`| |\/| / _ \/ _` / -_) |
  \___|\___|_||_\___|_| \__,_|_|  |_\___/\__,_\___|_|

   文生圖／圖生圖　lcm-lora-sdv1-5
*/

// 三塊積木共用的定義。誰先用誰插入，definitions_ 同 key 只會出現一次。
function maixSdBase() {
    maix4gGuard();
    Blockly.Python.definitions_['maixcam2_import_sd'] = `from maix import image as _maixSdImage`;
    Blockly.Python.definitions_['maixcam2_sd'] = `_MAIX_SD_MODEL = "/root/models/lcm-lora-sdv1-5-maixcam2/model.mud"
# 中間檔放 /tmp（tmpfs，在記憶體裡），不磨 SD 卡也不留垃圾給下一支程式。
_MAIX_SD_OUT = "/tmp/_maix_sd_out.jpg"
_MAIX_SD_IN = "/tmp/_maix_sd_in.jpg"
_maixSd = None


def _maixSdNeed():
    if _maixSd is None:
        raise RuntimeError("要先放「初始化文生圖模型」那塊積木。")


def _maixSdInit():
    global _maixSd
    _maix4gCheck()
    _maixLlmCheck(_MAIX_SD_MODEL, "文生圖模型")
    # import 要五十幾秒（torch、diffusers 很大），沒有畫面會像當掉，所以先印一行。
    print("[文生圖] 載入中，大約一分鐘（要先載入 torch）…", flush=True)
    from maix import sdv1_5 as _maixSdMod
    _maixSd = _maixSdMod.SDV1_5(_MAIX_SD_MODEL)
    # 文生圖與圖生圖一起開。2026-09-19 實測兩個一起載 CMM 只用 1.30 GiB / 3072，
    # 放得下，所以不做「也要圖生圖」的勾選。
    _maixSd.init(txt2img=True, img2img=True)
    print("[文生圖] 載入好了，之後每張圖大約兩秒。", flush=True)


def _maixSdPaste(img, path):
    """把生成的圖畫到使用者的畫布上。

    圖是 256×256，畫布通常是 640×480，所以畫在左上角、**不縮放**——
    要放大要縮小是看得見的決定，應該由積木給，不是藏在這裡。
    """
    img.draw_image(0, 0, _maixSdImage.load(path))


def _maixSdDraw(img, prompt, seed):
    _maixSdNeed()
    _maixSd.refer(prompt=prompt, seed=int(seed), save_path=_MAIX_SD_OUT)
    _maixSdPaste(img, _MAIX_SD_OUT)


def _maixSdRedraw(img, prompt, seed):
    _maixSdNeed()
    # 底圖就是使用者畫布上現在的東西。存成檔是因為 refer() 只吃路徑；
    # 用 save() 不用 to_jpeg()——**to_jpeg() 在這版韌體會 SIGBUS**。
    img.save(_MAIX_SD_IN)
    _maixSd.refer(prompt=prompt, init_image_path=_MAIX_SD_IN,
                  seed=int(seed), save_path=_MAIX_SD_OUT)
    _maixSdPaste(img, _MAIX_SD_OUT)
    # 圖生圖會在 save_path 旁邊多吐一個 <名字>_grid.png（把底圖和結果並排），
    # 每跑一次就多一個檔。/tmp 在記憶體裡，不清會愈積愈多。
    _maixSdGrid = _MAIX_SD_OUT.rsplit(".", 1)[0] + "_grid.png"
    if _maixOs.path.exists(_maixSdGrid):
        _maixOs.remove(_maixSdGrid)
`;
}


Blockly.Blocks['maixcam2_sd_init'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_sd_init);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_sd_init_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_sd_init'] = function () {
    maixSdBase();
    return '_maixSdInit()\n';
};


Blockly.Blocks['maixcam2_sd_draw'] = {
    init: function () {
        this.appendValueInput("PROMPT").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_sd_draw);
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_sd_draw_to)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("SEED").setCheck("Number")
            .appendField(Blockly.Msg.maixcam2_sd_seed);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_sd_draw_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_sd_draw'] = function (block) {
    maixSdBase();
    var img = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var prompt = Blockly.Python.valueToCode(block, 'PROMPT', Blockly.Python.ORDER_ATOMIC) || '""';
    var seed = Blockly.Python.valueToCode(block, 'SEED', Blockly.Python.ORDER_ATOMIC) || '1';
    return `_maixSdDraw(${img}, ${prompt}, ${seed})\n`;
};


Blockly.Blocks['maixcam2_sd_redraw'] = {
    init: function () {
        this.appendDummyInput()
            .appendField(Blockly.Msg.maixcam2_sd_redraw)
            .appendField(new Blockly.FieldVariable("canvas"), "varitem");
        this.appendValueInput("PROMPT").setCheck(null)
            .appendField(Blockly.Msg.maixcam2_sd_redraw_to);
        this.appendValueInput("SEED").setCheck("Number")
            .appendField(Blockly.Msg.maixcam2_sd_seed);
        this.setInputsInline(true);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#4fa8d8");
        this.setTooltip(Blockly.Msg.maixcam2_sd_redraw_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_sd_redraw'] = function (block) {
    maixSdBase();
    var img = Blockly.Python.variableDB_.getName(block.getFieldValue('varitem'), Blockly.Variables.NAME_TYPE);
    var prompt = Blockly.Python.valueToCode(block, 'PROMPT', Blockly.Python.ORDER_ATOMIC) || '""';
    var seed = Blockly.Python.valueToCode(block, 'SEED', Blockly.Python.ORDER_ATOMIC) || '1';
    return `_maixSdRedraw(${img}, ${prompt}, ${seed})\n`;
};
