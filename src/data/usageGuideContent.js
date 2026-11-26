export const USAGE_GUIDE_CONTENT = {
  'zh-hans': {
    eyebrow: 'CocoPi2 使用说明',
    title: '从开箱到运行，快速掌握 CocoPi2',
    summary:
      'CocoPi2 是面向人工智能、机器视觉、语音交互和硬件控制学习的 MaixCAM2 实训设备。你可以直接在网页中完成设备连接、积木编程、AI 编程、程序运行和日志排查。',
    heroPills: ['AI 视觉', '触摸屏交互', '图形化编程', 'USB / Wi-Fi'],
    back: '返回硬件仿真',
    start: '进入创作台',
    nav: {
      intro: '产品介绍',
      hardware: '硬件使用',
      quickStart: '首次上手',
      website: '网站使用',
      faq: '故障排查'
    },
    intro: {
      title: '一台设备，覆盖采集、显示、交互与推理',
      body:
        '机身集成屏幕、摄像头、麦克风、扬声器和多组扩展接口。配合 MaixPy、Blockly 和 AI 助手，可以从最基础的点灯、延时一直做到人体关键点、文字识别、语音对话和自学习模型。',
      highlights: [
        {
          title: '视觉采集与显示',
          text: '摄像头实时读取画面，屏幕同步显示文字、图形、图像和 AI 识别结果。'
        },
        {
          title: '触摸、按键与传感器',
          text: '支持屏幕触摸、实体按键、IMU 姿态和多类 P/A 扩展接口。'
        },
        {
          title: '语音与音频',
          text: '可通过麦克风录音、识别语音、进行关键词检测，并通过扬声器播放提示音或语音。'
        },
        {
          title: 'AI 模型与硬件控制',
          text: '覆盖视觉推理、LLM 对话、目标跟踪、OCR、手势、表情和电机扩展。'
        }
      ]
    },
    hardware: {
      title: '认识 CocoPi2 的硬件',
      body: '点击机身模型或下方部件卡片，可查看每一个接口和硬件区域的实际用途。',
      hint: '左侧电源开关控制主机供电；右侧深槽中的 Type-C 用于 ADB 有线连接。',
      partNote: '当前选中部件'
    },
    quickStart: {
      title: '首次使用步骤',
      steps: [
        {
          title: '确认供电',
          text: '检查电池接口或供电状态，打开机身左侧白色电源开关，等待桌面启动。'
        },
        {
          title: '连接电脑',
          text: '使用支持数据传输的 Type-C 线连接机身右侧下沉式接口。仅充电线无法进行 ADB 通信。'
        },
        {
          title: '打开网页并连接设备',
          text: '进入创作台，打开设备面板。优先选择“有线 ADB”；已配置局域网时也可以使用 SSH 22。'
        },
        {
          title: '选择程序或样例',
          text: '可以加载 MaixCAM2 样例、拖拽积木，或者用 AI 编程按自然语言生成程序。'
        },
        {
          title: '运行和停止',
          text: '运行前会释放桌面和摄像头资源。点击停止后系统会结束程序并恢复 CocoPi 桌面。'
        }
      ]
    },
    ports: {
      title: '接口速查',
      groups: [
        {
          title: '显示与视觉',
          items: [
            '正面 2.4 英寸 IPS 屏幕：显示画面、文字、图形和触摸交互。',
            '背部广角摄像头：支持 640×480 实时采集，可旋转调焦圈调整清晰度。'
          ]
        },
        {
          title: '输入与音频',
          items: [
            '触摸屏：读取按下、松开、按住、拖拽和区域点击。',
            '麦克风与扬声器：录音、语音识别、关键词检测、播放提示音和语音。'
          ]
        },
        {
          title: '扩展接口',
          items: [
            'P0-P3：顶部四路 4Pin 防反插传感器接口。',
            'A0-A3：底部四路 3Pin 模拟量或舵机接口。',
            'M1-M6：六路 2Pin 电机输出接口。',
            'UART / IIC：底部通信扩展接口。'
          ]
        },
        {
          title: '供电与通信',
          items: [
            '左侧白色开关：主机电源。',
            '右侧白色开关：扩展板电源。',
            'Type-C：数据通信与 ADB 有线连接。',
            '顶部白色按键：短按返回，长按休眠。'
          ]
        }
      ]
    },
    website: {
      title: '网站使用说明',
      body: '网站分为“硬件仿真”和“创作台”。硬件仿真用于认识设备，创作台用于连接真机、搭建积木和运行代码。',
      steps: [
        {
          title: '连接设备',
          text: '点击右上角设备入口。USB 连接需要 Chrome 或 Edge，并通过 HTTPS 或 localhost 打开网页。'
        },
        {
          title: '选择积木或样例',
          text: '左侧工具箱按逻辑、时间、基础硬件、媒体处理和人工智能分类。也可以从“样例”载入完整程序。'
        },
        {
          title: '使用 AI 编程',
          text: '在 AI 编程模式输入需求，生成或修复代码。未连接设备时仍可进入 AI 模式，但生成和运行前需要先连接。'
        },
        {
          title: '保存与导入',
          text: '顶部可以导入或保存 XML 积木程序和 Python 代码，作品会同时保存在浏览器本地。'
        },
        {
          title: '运行程序',
          text: '点击运行后，设备会进入开发模式并启动程序。右侧源码区会同步显示最终 Python 代码。'
        },
        {
          title: '停止与查看日志',
          text: '点击停止会结束程序并恢复桌面。底部运行输出区会自动保存调试日志；出现问题时打开日志文件即可排查。'
        }
      ]
    },
    faq: {
      title: '常见问题',
      items: [
        {
          question: '浏览器找不到 CocoPi2',
          answer:
            '确认使用 Chrome 或 Edge、网页为 HTTPS 或 localhost，并更换支持数据传输的 Type-C 线。'
        },
        {
          question: '提示 ADB 接口被占用',
          answer:
            '关闭其他打开了 WebUSB 的标签页，以及 MaixVision、CocoBuddy 或本机 ADB 工具后重试。'
        },
        {
          question: '无线 SSH 连接失败',
          answer:
            '确认电脑和设备处在同一局域网，输入设备当前 IPv4 地址，并确认设备已开机且 SSH 服务正常。'
        },
        {
          question: '运行程序后屏幕没有变化',
          answer:
            '查看运行输出中的错误。摄像头和屏幕会被桌面程序占用，平台在运行前会停止 launcher；程序自身仍需初始化 display 和 camera。'
        },
        {
          question: '有线停止后无法立即重连',
          answer:
            '设备会重建 USB ADB 端点，通常需要几秒钟。等待“USB 端点重建完成”后再次连接即可，无需拔线。'
        }
      ]
    },
    safety: {
      title: '使用注意事项',
      items: [
        '插拔扩展线前先关闭对应电源，避免电机、舵机或传感器接口短路。',
        '使用合规电源和电池，不要在设备运行时覆盖散热区域。',
        '摄像头调焦时轻转外圈，不要直接按压镜头。',
        '程序占用摄像头或屏幕时，先停止程序再打开其他应用。'
      ]
    }
  },
  'zh-hant': {
    eyebrow: 'CocoPi2 使用說明',
    title: '從開箱到執行，快速掌握 CocoPi2',
    summary:
      'CocoPi2 是面向人工智慧、機器視覺、語音互動與硬體控制學習的 MaixCAM2 實訓裝置。你可以在網頁中完成裝置連線、積木程式設計、AI 程式設計、程式執行與日誌排查。',
    heroPills: ['AI 視覺', '觸控螢幕互動', '圖形化程式設計', 'USB / Wi-Fi'],
    back: '返回硬體模擬',
    start: '進入創作台',
    nav: {
      intro: '產品介紹',
      hardware: '硬體使用',
      quickStart: '首次上手',
      website: '網站使用',
      faq: '故障排查'
    },
    intro: {
      title: '一台裝置，涵蓋擷取、顯示、互動與推理',
      body:
        '機身整合螢幕、相機、麥克風、揚聲器與多組擴充介面。搭配 MaixPy、Blockly 與 AI 助手，可以從基礎延時、顯示一路做到人體關鍵點、文字辨識、語音對話與自學習模型。',
      highlights: [
        { title: '視覺擷取與顯示', text: '相機即時讀取畫面，螢幕同步顯示文字、圖形、影像與 AI 辨識結果。' },
        { title: '觸控、按鍵與感測器', text: '支援螢幕觸控、實體按鍵、IMU 姿態與多類 P/A 擴充介面。' },
        { title: '語音與音訊', text: '可錄音、辨識語音、偵測關鍵詞並透過揚聲器播放提示音或語音。' },
        { title: 'AI 模型與硬體控制', text: '涵蓋視覺推理、LLM 對話、目標追蹤、OCR、手勢、表情與馬達擴充。' }
      ]
    },
    hardware: {
      title: '認識 CocoPi2 的硬體',
      body: '點擊機身模型或下方部件卡片，可查看每個介面與硬體區域的實際用途。',
      hint: '左側電源開關控制主機供電；右側深槽中的 Type-C 用於 ADB 有線連線。',
      partNote: '目前選取部件'
    },
    quickStart: {
      title: '首次使用步驟',
      steps: [
        { title: '確認供電', text: '檢查電池介面或供電狀態，打開機身左側白色電源開關，等待桌面啟動。' },
        { title: '連接電腦', text: '使用支援資料傳輸的 Type-C 線連接右側下沉式介面。僅充電線無法進行 ADB 通訊。' },
        { title: '開啟網頁並連接裝置', text: '進入創作台並打開裝置面板。優先選擇有線 ADB，也可以使用區域網路 SSH 22。' },
        { title: '選擇程式或範例', text: '可載入 MaixCAM2 範例、拖曳積木，或使用 AI 以自然語言產生程式。' },
        { title: '執行與停止', text: '執行前會釋放桌面與相機資源。停止後會結束程式並恢復 CocoPi 桌面。' }
      ]
    },
    ports: {
      title: '介面速查',
      groups: [
        { title: '顯示與視覺', items: ['正面 2.4 吋 IPS 螢幕：顯示畫面、文字、圖形與觸控互動。', '背部廣角相機：支援 640×480 即時擷取與旋轉調焦。'] },
        { title: '輸入與音訊', items: ['觸控螢幕：讀取按下、放開、長按、拖曳與區域點擊。', '麥克風與揚聲器：錄音、語音辨識、關鍵詞偵測與語音播放。'] },
        { title: '擴充介面', items: ['P0-P3：頂部四路 4Pin 防反插感測器介面。', 'A0-A3：底部四路 3Pin 類比或伺服介面。', 'M1-M6：六路 2Pin 馬達輸出介面。', 'UART / IIC：底部通訊擴充介面。'] },
        { title: '供電與通訊', items: ['左側白色開關：主機電源。', '右側白色開關：擴充板電源。', 'Type-C：資料通訊與 ADB 有線連線。', '頂部白色按鍵：短按返回、長按休眠。'] }
      ]
    },
    website: {
      title: '網站使用說明',
      body: '網站分為「硬體模擬」與「創作台」。硬體模擬用來認識裝置，創作台用來連接真機、建立積木與執行程式。',
      steps: [
        { title: '連接裝置', text: '點擊右上角裝置入口。USB 連線需要 Chrome 或 Edge，並透過 HTTPS 或 localhost 開啟。' },
        { title: '選擇積木或範例', text: '左側工具箱依邏輯、時間、基礎硬體、媒體處理與人工智慧分類，也可載入完整範例。' },
        { title: '使用 AI 程式設計', text: '輸入需求後產生或修復程式。未連接時仍可進入 AI 模式，但產生與執行前需先連接。' },
        { title: '儲存與匯入', text: '頂部可匯入或儲存 XML 積木程式與 Python 程式，作品會同步保存在瀏覽器。' },
        { title: '執行程式', text: '點擊執行後，裝置會進入開發模式並啟動程式，右側同步顯示 Python 原始碼。' },
        { title: '停止與查看日誌', text: '停止會結束程式並恢復桌面。底部執行輸出會自動保存偵錯日誌。' }
      ]
    },
    faq: {
      title: '常見問題',
      items: [
        { question: '瀏覽器找不到 CocoPi2', answer: '確認使用 Chrome 或 Edge、網頁為 HTTPS 或 localhost，並使用支援資料傳輸的 Type-C 線。' },
        { question: '提示 ADB 介面被佔用', answer: '關閉其他 WebUSB 分頁以及 MaixVision、CocoBuddy 或本機 ADB 工具後重試。' },
        { question: '無線 SSH 連線失敗', answer: '確認電腦與裝置在同一區域網路，輸入目前 IPv4 位址，並確認 SSH 服務正常。' },
        { question: '執行程式後螢幕沒有變化', answer: '查看執行輸出中的錯誤。相機與螢幕可能被桌面程式佔用，程式本身仍需初始化 display 與 camera。' },
        { question: '有線停止後無法立即重連', answer: '裝置會重建 USB ADB 端點，通常需要幾秒鐘，等待完成後再連線即可。' }
      ]
    },
    safety: {
      title: '使用注意事項',
      items: [
        '插拔擴充線前先關閉對應電源，避免馬達、伺服或感測器介面短路。',
        '使用合規電源與電池，執行時不要覆蓋散熱區域。',
        '相機調焦時輕轉外圈，不要直接按壓鏡頭。',
        '程式佔用相機或螢幕時，先停止程式再開啟其他應用。'
      ]
    }
  },
  en: {
    eyebrow: 'CocoPi2 User Guide',
    title: 'From unboxing to your first program',
    summary:
      'CocoPi2 is a MaixCAM2 learning device for AI, computer vision, voice interaction and hardware control. Use this portal to connect the device, build block programs, generate code with AI, run programs and inspect logs.',
    heroPills: ['AI vision', 'Touch display', 'Block coding', 'USB / Wi-Fi'],
    back: 'Back to hardware',
    start: 'Open studio',
    nav: {
      intro: 'Product',
      hardware: 'Hardware',
      quickStart: 'Quick start',
      website: 'Using the site',
      faq: 'Troubleshooting'
    },
    intro: {
      title: 'One device for capture, display, interaction and inference',
      body:
        'The device combines a display, camera, microphone, speaker and expansion ports. With MaixPy, Blockly and the AI assistant, projects can range from a simple delay to pose detection, OCR, voice interaction and self-learning models.',
      highlights: [
        { title: 'Vision and display', text: 'Read live camera frames and show text, graphics, images and AI results on the display.' },
        { title: 'Touch, buttons and sensors', text: 'Use the touch screen, physical buttons, IMU and P/A expansion ports.' },
        { title: 'Voice and audio', text: 'Record audio, recognize speech, detect keywords and play sounds or synthesized speech.' },
        { title: 'AI and hardware control', text: 'Explore vision inference, LLM chat, tracking, OCR, gestures, emotion and motors.' }
      ]
    },
    hardware: {
      title: 'Get to know the hardware',
      body: 'Click the model or a part card to inspect the purpose of each interface and hardware area.',
      hint: 'The left switch controls main power. The recessed USB-C port on the right is used for wired ADB.',
      partNote: 'Selected part'
    },
    quickStart: {
      title: 'First-time setup',
      steps: [
        { title: 'Check power', text: 'Check the battery connection, turn on the white power switch on the left and wait for the desktop.' },
        { title: 'Connect to a computer', text: 'Use a data-capable USB-C cable in the recessed right-side port. Charge-only cables cannot carry ADB.' },
        { title: 'Connect from the site', text: 'Open the studio and device panel. Prefer wired ADB, or use LAN SSH port 22 when configured.' },
        { title: 'Choose a sample or blocks', text: 'Load a MaixCAM2 sample, drag blocks or use AI coding to generate a program from text.' },
        { title: 'Run and stop', text: 'Running releases the desktop and camera resources. Stopping ends the program and restores the desktop.' }
      ]
    },
    ports: {
      title: 'Port reference',
      groups: [
        { title: 'Display and vision', items: ['Front 2.4-inch IPS display for graphics, text and touch.', 'Rear wide-angle camera with 640×480 live capture and focus ring.'] },
        { title: 'Input and audio', items: ['Touch screen supports press, release, hold, drag and region taps.', 'Microphone and speaker support recording, recognition, keyword detection and playback.'] },
        { title: 'Expansion', items: ['P0-P3: four keyed 4-pin sensor ports on top.', 'A0-A3: four 3-pin analog or servo ports below.', 'M1-M6: six 2-pin motor outputs.', 'UART / IIC: communication ports on the bottom.'] },
        { title: 'Power and communication', items: ['Left white switch: main power.', 'Right white switch: expansion power.', 'USB-C: data and wired ADB.', 'Top white button: short press back, long press sleep.'] }
      ]
    },
    website: {
      title: 'Using the portal',
      body: 'The site has a hardware view for learning the device and a studio for connecting, building blocks and running programs.',
      steps: [
        { title: 'Connect a device', text: 'Open the device panel from the top bar. WebUSB requires Chrome or Edge and an HTTPS or localhost page.' },
        { title: 'Choose blocks or a sample', text: 'The left toolbox contains logic, time, hardware, media and AI categories. Samples load complete programs.' },
        { title: 'Use AI coding', text: 'Enter a request to generate or repair code. AI mode is accessible without a device, but generation and running require a connection.' },
        { title: 'Save and import', text: 'Save or import XML block projects and Python files. Drafts are also stored in the browser.' },
        { title: 'Run a program', text: 'Running switches the device into development mode. The final Python source appears on the right.' },
        { title: 'Stop and inspect logs', text: 'Stopping restores the desktop. The output panel automatically saves diagnostic logs for troubleshooting.' }
      ]
    },
    faq: {
      title: 'Troubleshooting',
      items: [
        { question: 'The browser cannot find CocoPi2', answer: 'Use Chrome or Edge on HTTPS or localhost and make sure the USB-C cable supports data.' },
        { question: 'The ADB interface is busy', answer: 'Close other WebUSB tabs and MaixVision, CocoBuddy or local ADB tools, then retry.' },
        { question: 'SSH connection fails', answer: 'Keep the computer and device on the same LAN, verify the current IPv4 address and confirm SSH is running.' },
        { question: 'The display does not change after running', answer: 'Check the run output. The program must initialize display and camera after the launcher releases those resources.' },
        { question: 'Wired reconnect is delayed', answer: 'The device rebuilds its USB ADB endpoint after stopping. Wait a few seconds and reconnect without unplugging.' }
      ]
    },
    safety: {
      title: 'Safety notes',
      items: [
        'Turn off the relevant power before connecting motors, servos or sensors.',
        'Use a compliant power supply and do not cover ventilation while running.',
        'Rotate the focus ring gently and never press directly on the camera lens.',
        'Stop programs that use the camera or display before opening another application.'
      ]
    }
  }
};
