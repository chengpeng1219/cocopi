const PART_KEYS = [
  'screen',
  'camera_back',
  'power_switch_left',
  'right_io',
  'top_sleep_ports',
  'bottom_ports'
];

const TRANSLATIONS = {
  en: {
    cards: {
      screen: 'Front: screen and speaker',
      camera_back: 'Back: camera and P0-P3',
      power_switch_left: 'Left: power switch and M3-M6',
      right_io: 'Right: expansion, battery and USB-C',
      top_sleep_ports: 'Top: back/sleep button',
      bottom_ports: 'Bottom: M1/M2, UART and IIC'
    },
    views: {
      front: 'Front',
      back: 'Back',
      left: 'Left',
      right: 'Right',
      top: 'Top',
      bottom: 'Bottom'
    },
    features: {
      real3d: ['Real 3D', 'Complete hardware model'],
      click: ['Click to inspect', 'Locate parts quickly'],
      views: ['Multiple views', 'Switch freely between six views']
    },
    parts: {
      screen: {
        badge: 'Front view · Core display area',
        name: '2.4-inch embedded IPS display (640×480 canvas)',
        spec: 'disp = display.Display() | SourceHanSansCN CJK font | 4×5 speaker array',
        desc: 'The main display is driven by display.Display() and supports Chinese rendering with Source Han Sans. A 20-hole speaker matrix sits at the upper right and an L-shaped cutout at the lower right.'
      },
      camera_back: {
        badge: 'Back view · Camera module and labels',
        name: 'Rear geared-focus wide-angle camera and port labels',
        spec: 'cam = camera.Camera(640, 480) | P0-P3 labels on top | A0-A3 labels below',
        desc: 'The rear wide-angle camera has a geared focus ring and supports 640×480 live capture. Engraved labels map the P0-P3 and A0-A3 ports around the panel.'
      },
      power_switch_left: {
        badge: 'Left view · Power and motor drivers',
        name: 'Left power switch and four M3-M6 motor ports',
        spec: 'White power switch | Four 2-pin keyed motor ports (M3 / M4 / M5 / M6)',
        desc: 'A white main power switch sits above four vertically arranged 2-pin keyed motor connectors with M3 through M6 labels.'
      },
      right_io: {
        badge: 'Right view · Power and ADB communication',
        name: 'Right expansion switch, battery port and USB-C',
        spec: 'Expansion switch | Dual-pin battery connector | Recessed USB-C ADB interface',
        desc: 'The right side contains the recessed USB-C ADB port, dual-pin battery connector and the expansion board power switch.'
      },
      top_sleep_ports: {
        badge: 'Top view · Back/sleep button and expansion',
        name: 'Top back/sleep button and P0-P3 sensor ports',
        spec: 'White back/sleep button | Four 4-pin keyed sensor ports (P0 / P1 / P2 / P3)',
        desc: 'A white button at the top supports short-press back and long-press sleep. Four keyed 4-pin sensor ports sit in the rear row.'
      },
      bottom_ports: {
        badge: 'Bottom view · Multi-protocol expansion',
        name: 'Bottom M1/M2, UART/IIC and A0-A3 ports',
        spec: 'Upper row: M1 / M2 and UART / IIC | Lower row: A0-A3 | Ventilation pattern',
        desc: 'The bottom uses two rows: M1/M2 motor ports and UART/IIC connectors on top, with four 3-pin analog/servo ports below.'
      }
    }
  },
  'zh-hant': {
    cards: {
      screen: '正視圖：螢幕與揚聲器',
      camera_back: '背視圖：相機與 P0-P3',
      power_switch_left: '左視圖：電源開關與 M3-M6',
      right_io: '右視圖：擴充開關、電池與 USB-C',
      top_sleep_ports: '俯視圖：返回與休眠按鈕',
      bottom_ports: '底視圖：M1/M2、UART 與 IIC'
    },
    views: {
      front: '正視圖',
      back: '背視圖',
      left: '左視圖',
      right: '右視圖',
      top: '俯視圖',
      bottom: '底視圖'
    },
    features: {
      real3d: ['真實三維', '完整硬體外觀'],
      click: ['即點即用', '快速定位部件'],
      views: ['多視角', '六視圖自由切換']
    },
    parts: {
      screen: {
        badge: '正視圖 · 核心顯示區',
        name: '2.4 吋 IPS 內嵌式高畫質螢幕（640×480 畫布）',
        spec: 'disp = display.Display() | SourceHanSansCN 中文字型 | 4×5 揚聲器陣列',
        desc: '位於機身正面中央，透過 display.Display() 驅動並支援思源黑體中文渲染；右上方為 20 孔聲學揚聲器矩陣，右下方為 L 型下沉切角。'
      },
      camera_back: {
        badge: '背視圖 · 視覺模組與絲印',
        name: '背置齒輪調焦廣角相機與端口絲印',
        spec: 'cam = camera.Camera(640, 480) | 上方絲印 P0-P3 | 下方絲印 A0-A3',
        desc: '背面中央為附防滑調焦圈的廣角鏡頭，支援 640×480 即時擷取；上下邊緣刻有 P0-P3 與 A0-A3 端口映射。'
      },
      power_switch_left: {
        badge: '左視圖 · 電源開關與馬達驅動',
        name: '左側電源開關與 M3-M6 四路馬達接口',
        spec: '白色方形電源開關 | 4 × 2Pin 防反插馬達座（M3 / M4 / M5 / M6）',
        desc: '機身左側上方配備白色主機電源開關，下方縱向排列 4 個 2Pin 馬達接口，並帶有清晰的 M3 至 M6 刻印。'
      },
      right_io: {
        badge: '右視圖 · 供電與 ADB 通訊區',
        name: '右側擴充板開關、電池接口與 USB-C',
        spec: '擴充板開關 | 雙圓銅針電池接口 | 下沉式 USB-C ADB 接口',
        desc: '右側整合下沉式 USB-C ADB 接口、雙圓銅針電池接口，以及擴充板獨立電源開關。'
      },
      top_sleep_ports: {
        badge: '俯視圖 · 返回與休眠按鈕',
        name: '頂部返回／休眠按鈕與 P0-P3 感測器接口',
        spec: '白色方形返回／休眠按鈕 | 4 × 4Pin 防反插感測器座（P0 / P1 / P2 / P3）',
        desc: '頂部右側設有白色實體按鈕，短按返回、長按休眠；後排並列 4 個 4Pin 防反插感測器接口。'
      },
      bottom_ports: {
        badge: '底視圖 · 多協議總線擴充區',
        name: '底部 M1/M2、UART/IIC 與 A0-A3 接口',
        spec: '上排：M1 / M2 與 UART / IIC | 下排：A0-A3 | 菱形散熱孔',
        desc: '底部採用雙排布局：上排為 M1、M2 馬達口與 UART、IIC 通訊口，下排為 4 個 3Pin 類比／伺服接口。'
      }
    }
  }
};

const DEFAULT_LABELS = {
  cards: {
    screen: '正视图：屏幕与扬声器',
    camera_back: '背视图：摄像头 & P0-P3',
    power_switch_left: '左视图：电源开关 & M3-M6',
    right_io: '右视图：扩展开关/电池/TypeC',
    top_sleep_ports: '俯视图：返回(休眠)按钮',
    bottom_ports: '底视图：M1/M2/UART/IIC'
  },
  views: {
    front: '正视图',
    back: '背视图',
    left: '左视图',
    right: '右视图',
    top: '俯视图',
    bottom: '底视图'
  },
  features: {
    real3d: ['真实三维', '完整硬件外观'],
    click: ['即点即用', '快速定位部件'],
    views: ['多视角', '六视图自由切换']
  }
};

export function getHardwareLabels(language) {
  return TRANSLATIONS[language] || DEFAULT_LABELS;
}

export function localizeHardwarePart(part, language) {
  const translated = TRANSLATIONS[language]?.parts?.[part.id];
  return translated ? { ...part, ...translated } : part;
}

export function getHardwarePartIds() {
  return PART_KEYS;
}
