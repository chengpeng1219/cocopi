export const HARDWARE_PARTS = {
  screen: {
    id: 'screen',
    name: '2.4寸 IPS 内嵌式高清彩屏 (640×480 画布适配)',
    camPos: [0, 0, 6.2],
    badge: '正视图 · 核心显示区',
    spec: 'disp = display.Display() | SourceHanSansCN 中文字体 | 4×5 扬声器阵列',
    desc: '位于机身正面中央，通过 display.Display() 驱动并支持思源黑体中文渲染；右上角为 20 孔声学扬声器矩阵，右下角为 L 型下沉切角。'
  },
  camera_back: {
    id: 'camera_back',
    name: '背置齿轮调焦广角摄像头 & 端口丝印',
    camPos: [0, 0, -6.2],
    badge: '背视图 · 视觉模组与丝印',
    spec: 'cam = camera.Camera(640, 480) | 顶部丝印 P0~P3 | 底部丝印 A0~A3',
    desc: '背面中央为带防滑调焦圈的广角镜头，支持 640×480 高清实时采集；上下边缘凹刻了顶部 P0~P3 与底部 A0~A3 端口映射。'
  },
  power_switch_left: {
    id: 'power_switch_left',
    name: '左侧电源开关 & M3~M6 四路电机接口',
    camPos: [-6.0, 0, 0],
    badge: '左视图 · 电源开关与电机驱动',
    spec: '白色方形电源开关 | 4 × 2Pin 白色防反插电机座 (M3 / M4 / M5 / M6)',
    desc: '机身左侧上方配备白色主板电源开关，左侧竖排 4 个 2Pin 白色电机驱动接口，机身带有清晰的 M3、M4、M5、M6 凹刻丝印。'
  },
  right_io: {
    id: 'right_io',
    name: '右侧扩展板开关 + 电池接口 + Type-C 接口',
    camPos: [6.0, 0, 0],
    badge: '右视图 · 供电与 ADB 通信区',
    spec: '白色扩展板开关 | 双圆铜针电池接口 | 下沉式 Type-C (ADB Interface)',
    desc: '机身右侧集成三大接口：左下角 L 型深槽内的金属 Type-C 口（用于 ADB 有线连接）、中部双圆铜针电池接口，以及右下角的白色扩展板独立电源开关。'
  },
  top_sleep_ports: {
    id: 'top_sleep_ports',
    name: '顶部返回(休眠)按钮 & P0~P3 传感器接口',
    camPos: [0, 5.8, 0.01],
    badge: '俯视图 · 返回(休眠)键与扩展槽',
    spec: '白色方形返回/休眠按钮 | 4 × 4Pin 白色传感器母座 (P0 / P1 / P2 / P3)',
    desc: '机身顶部偏右设有一颗白色方形物理按钮（短按返回、长按休眠）；后排并列 4 个 4Pin 白色防反插传感器接口。'
  },
  bottom_ports: {
    id: 'bottom_ports',
    name: '底部 M1/M2、UART/IIC 与 A0~A3 接口阵列',
    camPos: [0, -5.8, 0.01],
    badge: '底视图 · 多协议总线扩展区',
    spec: '上排: M1 / M2 (2Pin) + UART / IIC (4Pin) | 下排: A0~A3 (3Pin) | 菱形散热孔',
    desc: '机身底部采用双排接口布局：上排包含 M1、M2 电机口与 UART、IIC 通信口（左右两侧各 3 个菱形散热孔）；下排为 4 个 3Pin 模拟量/舵机口。'
  }
};
