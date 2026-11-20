/*
 * MaixCAM2（pi2）板載 IMU：傾斜、角速度、航向角。
 *
 * 合約：tools/e2e/contracts/imu-contract.md（動程式碼之前寫成，Q1～Q16 跟使用者逐題定案）。
 * 測試：tools/e2e/test_imu_helper.py（Mac，假 maix）、tools/e2e/probe-imu.py（板上實測數字）。
 *
 * 舊的 3 塊（esp32.js 的 esp32_main_controller_motion_*）外觀不動，產碼改呼叫這裡的 maixImuSetup()；
 * 這個檔案另外新增 3 塊：校準陀螺儀、航向角、航向角歸零。
 *
 * ── 為什麼要背景執行緒（小幫手）──────────────────────────────────────
 * 晶片只回答「現在轉多快」，航向角＝角速度一路累加，沒去讀的那段時間就漏算。
 * 學生的迴圈裡有 sleep，所以要一條執行緒一直讀、一直加，積木只讀它算好的值。
 * 也因此**只有小幫手讀晶片**——兩條執行緒同時讀同一顆晶片會讀到半筆。
 *
 * ── 官方驅動的坑（maix 4.12.5，MaixCDK maix_lsm6dsowtr.cpp）──────────
 * - 晶片還沒有新資料時 read() 回傳**全 0**，不是上一筆 → 加速度三軸全 0 就丟掉
 *   （有重力，加速度不可能三軸都是 0）。官方 calib_gyro 沒處理，所以不用它，自己算平均。
 * - ODR 只支援到 833。實測 208＋拿到一筆後睡半個週期：CPU 7%、一筆不漏。
 * - 加速度單位實際是 m/s²（文件寫 g）。傾斜只用比值，不受影響。
 *
 * ── 軸向（2026-11-12 實測，見合約 4.1）────────────────────────────────
 * 安裝：平放、螢幕朝上、鏡頭朝下。晶片 +Z 朝螢幕那一面，所以右轉（從上看順時針）時
 * Z 軸讀數為負 → 航向角 = −(Z 軸累加)，右轉才是正。傾斜照舊版規則（左右看 X、前後看 Y）。
 */


// 錯誤訊息放進產碼時要變成 Python 字串字面值；JSON 的字串跳脫規則 Python 也吃。
function maixImuPyStr(s) {
    return JSON.stringify(String(s));
}

function maixImuSetup() {
    Blockly.Python.definitions_['pi2_imu_helper'] = `import json as _imuJson
import math as _imuMath
import statistics as _imuStats
import threading as _imuThreading
import time as _imuTime
from maix.ext_dev import imu as _maixImuMod

_IMU_CALIB_FILE = "/root/.cocopi_gyro_calib.json"


class _Pi2Imu(_imuThreading.Thread):
    """背景小幫手：一直讀板載 IMU，保存最新讀數、累加航向角。合約見 imu-contract.md。"""

    ODR_HZ = 208
    CALIB_SECONDS = 2.0
    MAX_STILL_SD = 0.5              # 度/秒；靜止實測最大 0.057

    def __init__(self) -> None:
        super().__init__(daemon=True)
        self._sensor = _maixImuMod.IMU("default", gyro_odr=_maixImuMod.GyroOdr.GYRO_ODR_208,
                                       acc_odr=_maixImuMod.AccOdr.ACC_ODR_208)
        self._lock = _imuThreading.Lock()
        self._first = _imuThreading.Event()
        self._acc = (0.0, 0.0, 9.8)
        self._gyro = (0.0, 0.0, 0.0)          # 原始讀數，沒扣零漂
        self._bias = self._load_bias()        # None＝還沒校準
        self._heading = 0.0
        self._prev = None                      # (時刻, 扣過零漂的 gz)
        self._collect = None                   # 校準時收集原始角速度
        self.start()
        self._first.wait(1.0)

    def _load_bias(self):
        try:
            with open(_IMU_CALIB_FILE) as f:
                return tuple(float(v) for v in _imuJson.load(f)["bias"])
        except (OSError, ValueError, KeyError, TypeError):
            return None

    def run(self) -> None:
        half_period = 0.5 / self.ODR_HZ
        while True:
            v = self._sensor.read()
            if len(v) < 6 or (v[0] == 0.0 and v[1] == 0.0 and v[2] == 0.0):
                _imuTime.sleep(0.0002)        # 晶片還沒有新資料（驅動回全 0）
                continue
            now = _imuTime.monotonic()
            with self._lock:
                self._acc = (v[0], v[1], v[2])
                self._gyro = (v[3], v[4], v[5])
                if self._collect is not None:
                    self._collect.append(self._gyro)
                if self._bias is not None:
                    gz = v[5] - self._bias[2]
                    if self._prev is not None:
                        # 梯形法；右轉時 Z 為負，所以減
                        self._heading -= (self._prev[1] + gz) / 2 * (now - self._prev[0])
                    self._prev = (now, gz)
            self._first.set()
            _imuTime.sleep(half_period)

    def _need_bias(self):
        if self._bias is None:
            raise RuntimeError(${maixImuPyStr(Blockly.Msg.maixcam2_imu_err_not_calibrated)})
        return self._bias

    def tilt(self, axis: str) -> float:
        """傾斜角度（度），以水平為 0。axis "x" 看加速度的 Y 分量、"y" 看 X 分量（同舊版）。"""
        with self._lock:
            ax, ay, az = self._acc
        return _imuMath.degrees(_imuMath.atan2(ay if axis == "x" else ax, az))

    def rate(self, axis: str) -> float:
        """角速度（度/秒），扣掉零漂。"""
        with self._lock:
            bias = self._need_bias()
            i = "xyz".index(axis)
            return self._gyro[i] - bias[i]

    def heading(self) -> float:
        with self._lock:
            self._need_bias()
            return self._heading

    def reset_heading(self) -> None:
        with self._lock:
            self._need_bias()
            self._heading = 0.0

    def calibrate(self) -> None:
        print(${maixImuPyStr(Blockly.Msg.maixcam2_imu_msg_calibrating)})
        with self._lock:
            self._collect = []
        _imuTime.sleep(self.CALIB_SECONDS)
        with self._lock:
            samples, self._collect = self._collect, None
        if len(samples) < 10:
            raise RuntimeError("IMU: too few readings during calibration (%d)" % len(samples))
        axes = list(zip(*samples))
        if max(_imuStats.pstdev(a) for a in axes) > self.MAX_STILL_SD:
            raise RuntimeError(${maixImuPyStr(Blockly.Msg.maixcam2_imu_err_moved)})
        bias = tuple(_imuStats.fmean(a) for a in axes)
        with open(_IMU_CALIB_FILE, "w") as f:
            _imuJson.dump({"bias": list(bias), "time": _imuTime.strftime("%Y-%m-%d %H:%M:%S")}, f)
        with self._lock:
            self._bias = bias
            self._prev = None                  # 換了零漂，下一筆重新起算；航向角不動
        print(${maixImuPyStr(Blockly.Msg.maixcam2_imu_msg_calibrated)} + _IMU_CALIB_FILE)


_pi2Imu = _Pi2Imu()
`;
}


Blockly.Blocks['maixcam2_imu_calibrate'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_imu_calibrate);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.maixcam2_imu_calibrate_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_imu_calibrate'] = function (block) {
    maixImuSetup();
    return "_pi2Imu.calibrate()\n";
};

Blockly.Blocks['maixcam2_imu_heading'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_imu_heading);
        this.setOutput(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.maixcam2_imu_heading_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_imu_heading'] = function (block) {
    maixImuSetup();
    return ["round(_pi2Imu.heading(), 2)", Blockly.Python.ORDER_FUNCTION_CALL];
};

Blockly.Blocks['maixcam2_imu_heading_reset'] = {
    init: function () {
        this.appendDummyInput().appendField(Blockly.Msg.maixcam2_imu_heading_reset);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#5fcd8e");
        this.setTooltip(Blockly.Msg.maixcam2_imu_heading_reset_TOOLTIP);
        this.setHelpUrl("");
    }
};

Blockly.Python['maixcam2_imu_heading_reset'] = function (block) {
    maixImuSetup();
    return "_pi2Imu.reset_heading()\n";
};
