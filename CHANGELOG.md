# Changelog

## v1.0.14 - 2026-11-23

### 修复 USB ADB 断开后无法重连，并增加调试日志与版本快照

- 修改文件：`src/lib/yaWebAdbClient.js`、`src/lib/debugLog.js`、`src/App.jsx`、`src/components/BlocklySection.jsx`、`src/lib/i18n.jsx`、`tests/yaWebAdbClient.test.js`、`tests/debugLog.test.js`、`scripts/version-snapshot.mjs`
- 有线断开前通过设备端 `systemd-run` 安排重启 `usb-gadget.service`，强制重建 FunctionFS、`adbd` 和 USB 端点。
- 重连时等待设备重新枚举，避免在 USB 重建期间提前进入认证。
- 所有终端输出（包括未显示的 debug 日志）持久化到浏览器本地，并支持导出 JSON。
- 新增 `npm run version:snapshot`，每次修改后将当前源码保存到 `.versions/v版本号-时间/`。
- 新增 `VERSIONS.md`，记录版本快照与恢复命令。
- 验证：运行两次真机 USB gadget 重建检查、`npm test`、`npm run build`。
- 回退方式：恢复 `.versions/v1.0.14-*` 之前的版本快照，或恢复上一版本源码。

## v1.0.13 - 2026-11-16

### 严格按照原型重构创作台

- 修改文件：`src/App.jsx`、`src/components/BlocklySection.jsx`、`src/components/DeviceDrawer.jsx`、`src/index.css`、`package.json`、`package-lock.json`
- 顶部只保留“创作台 / 硬件仿真”两个入口。
- 默认创作台直接显示设备条和三栏积木工作区，不再出现多余区块标题。
- 左侧改为可调宽度的独立积木工具箱，点击分类打开 Blockly 积木列表。
- 中央可在“积木编程 / AI 编程”间切换，AI 助手只在中央显示。
- 右侧只显示 Python 源码，默认只读，通过开关切换编辑状态。
- Python 源码可直接编辑、复制、运行和停止。
- 连通底部 SSH 终端、快捷命令和命令行输入，并支持拖动调整高度。
- 工作区左、中、右三栏支持拖动调整宽度。
- 设备连接改为顶部设备条和右侧抽屉，保留 USB、Wi-Fi、二维码、断开和停止功能。
- 原 Python 示例保留在左侧“快速开始”区域。
- 积木状态自动保存，切换到硬件仿真后返回仍可恢复。
- 未修改 MaixPy 生成规则、USB、无线、停止恢复和 AI 接口。
- 验证：`npm test`、`npm run build`、桌面/移动端截图、积木分类、设备抽屉、硬件切换、状态恢复、左右拖拽、终端拖拽、浏览器异常检查
- 回退方式：恢复原四页导航、BlocklySection Section 卡片布局和 ConnectSection 独立连接页。

## v1.0.12 - 2026-11-16

### 正式实现积木工作区 v3 布局

- 修改文件：`src/App.jsx`、`src/components/BlocklySection.jsx`、`src/index.css`、`package.json`、`package-lock.json`
- 取消 Python 模式页签，Python 源码固定在右侧编辑区。
- AI 助手移动到中央 AI 编程模式，左侧只保留积木工具箱。
- 右侧取消 AI 和设备页签，只保留 Python 源码。
- Python 源码默认只读，通过开关才能切换为可编辑。
- 自定义左侧积木分类面板，点击分类会打开对应 Blockly 积木。
- 左侧、中央和右侧支持拖动调整宽度。
- 积木可编辑区和底部 SSH/运行输出支持拖动调整高度。
- 底部终端、快捷命令和命令行输入仍复用原设备终端功能。
- 设备连接管理保留在工作区右下角。
- 积木工作区状态继续自动保存，切换到其他功能页后可恢复。
- 未修改 MaixPy 生成规则、USB、无线、停止恢复和 AI 接口。
- 验证：`npm test`、`npm run build`、桌面截图、AI 模式检查、编辑开关检查、左右拖拽、终端拖拽、浏览器异常检查
- 回退方式：恢复 BlocklySection 双栏布局、Python 模式页签和右侧 AI/设备面板。

## v1.0.11 - 2026-11-16

### 按 CocoBlockly 样式合并精简工作区

- 修改文件：`src/App.jsx`、`src/components/BlocklySection.jsx`、`src/index.css`、`package.json`、`package-lock.json`
- 页面从纵向堆叠改为单工作区切换，硬件仿真、设备连接、Python 沙盒和积木编程全部保留。
- 默认打开积木编程工作区，顶部导航负责功能切换。
- 页面品牌调整为 CocoBlockly / COCOPI MODULE，并扩大桌面工作区宽度。
- 积木页合并为左侧积木画布、右侧 Python 源码与设备连接面板。
- 运行、停止、复制、恢复示例和设备管理入口均保留。
- 积木工作区自动保存到浏览器本地存储，切换页面后重新进入可恢复。
- 代码生成继续使用防抖，空工作区不同步残留代码。
- 修复 Blockly 容器定位、确认弹窗、滚动条残留和性能问题。
- 新增 Blockly 主积木和 Python 代码同步测试。
- 未修改 MaixPy 生成规则、USB、无线、停止恢复和 AI 流程。
- 验证：`npm test`、`npm run build`、桌面截图、移动端截图、功能页切换、积木状态恢复、浏览器控制台检查
- 回退方式：恢复 App 的纵向区块布局、BlocklySection 右侧控制面板和原始导航样式。

## v1.0.10 - 2026-11-16

### 修复图形化编程区块布局、性能与代码同步

- 修改文件：`src/App.jsx`、`src/components/BlocklySection.jsx`、`src/lib/maixBlocks.js`、`src/index.css`、`tests/maixBlocks.test.js`
- 积木工作区限制在自身卡片内，不再与顶部导航重叠。
- Blockly 确认弹窗改为居中、带遮罩、圆角和统一按钮样式。
- 关闭 Blockly 工作区滚动条，消除未操作时的滚动条残留。
- Blockly 区块仅在接近视口时加载并保持挂载，避免首屏和普通页面滚动被积木引擎拖慢。
- 积木变更后的代码生成改为 120 毫秒防抖，避免拖动时持续重生成 Python。
- 初始积木加载后自动缩放到完整程序范围。
- 没有“启动”主积木或工作区为空时，Python 预览同步为空，运行按钮同步禁用。
- 未修改 MaixPy 生成规则、设备连接、无线运行、停止恢复或 AI 流程。
- 验证：`npm test`、`npm run build`、桌面截图、弹窗居中检查、滚动条检查、清空积木同步检查、浏览器控制台检查
- 回退方式：恢复 Blockly 容器 CSS、变更监听、空工作区生成逻辑和区块挂载方式。

## v1.0.9 - 2026-11-14

### 新增 MaixCAM2 图形化编程积木

- 修改文件：`src/App.jsx`、`src/components/BlocklySection.jsx`、`src/lib/maixBlocks.js`、`src/index.css`、`vite.config.js`、`README.md`、`tests/maixBlocks.test.js`、`package.json`、`package-lock.json`
- 接入 Blockly 13.4.0，新增可拖拽的 MaixCAM2 图形化编程区块。
- 提供程序、摄像头、屏幕显示、文字与矩形绘制、触摸、延时、逻辑、数学、文本和变量积木。
- 生成代码使用 `app.need_exit()` 安全循环、`camera.Camera()`、`display.Display()` 和触摸屏 API。
- 生成代码不会访问 `/dev/fb*`，不会生成不可退出的 `while True`。
- 积木程序可以直接复用当前 USB 或 Wi-Fi 真机运行流程。
- 桌面端使用双栏积木与代码预览，移动端采用窄屏缩放并保持页面无横向溢出。
- 新增 Blockly 资源文件和生成器测试。
- 验证：`npm test`、`npm run build`、桌面/移动端截图、浏览器控制台检查
- 回退方式：移除 Blockly 区块、Blockly 依赖和媒体资源，并恢复 `App.jsx` 导航与页面渲染。

## v1.0.8 - 2026-11-11

### 修正右视图接口结构

- 修改文件：`src/components/HardwareViewer.jsx`
- USB-C 改为深色内嵌腔体，增加外壳、金属圈、黑色内壁和中心舌片。
- 电池接口改为凹入式结构，浅色内框包住深色槽体，两枚金色触点位于槽内。
- 白色电源开关改为外部竖直滑轨，白色拨片带横向防滑纹，强化上下拨动效果。
- 调整三个部件的相对位置和前后层次，使其更接近参考实物。
- 未修改相机、灯光、页面结构或其他业务功能。
- 验证：`npm test`、`npm run build`、右视图截图、浏览器控制台检查
- 回退方式：恢复 `HardwareViewer.jsx` 中 `rightGroup` 的几何创建代码。

## v1.0.7 - 2026-11-11

### 重新优化右视图接口

- 修改文件：`src/components/HardwareViewer.jsx`
- 左侧凹槽改为内嵌式 USB-C 接口，增加金属边框、黑色内腔和中心舌片。
- 右上方电池接口改为圆角金属框、黑色内腔和两枚金色触点。
- 右下方扩展开关改为黑色凹槽、浅色底座和白色拨动开关。
- 按实物参考调整三个部件的相对位置与朝向。
- 未修改 3D 相机、灯光、页面结构或其他业务功能。
- 验证：`npm test`、`npm run build`、右视图截图、浏览器控制台检查
- 回退方式：恢复 `HardwareViewer.jsx` 的 `rightGroup` 几何创建代码。

## v1.0.6 - 2026-11-11

### 优化硬件实体仿真模型显示

- 修改文件：`src/components/HardwareViewer.jsx`
- 增加环境贴图、冷色轮廓光和暖色补光，改善塑料、金属和屏幕材质的真实感。
- 主光源启用高分辨率阴影，并加入接触阴影，使设备与背景之间更有空间层次。
- 黑色外壳改为带清漆的物理材质，降低噪点并增强细腻高光。
- 屏幕增加玻璃反射层，金属接口和摄像头镜片增强环境反射。
- 调整相机、FOV 和移动端画布高度，窄屏下可完整显示模型。
- 未修改页面结构、设备连接、运行、停止或其他业务逻辑。
- 验证：`npm test`、`npm run build`、桌面/移动端截图、画布像素分布检查、浏览器控制台检查
- 回退方式：恢复 `HardwareViewer.jsx` 的灯光、材质、环境贴图和相机参数。

## v1.0.5 - 2026-11-11

### 优化页面显示

- 修改文件：`src/App.jsx`、`src/components/ui.jsx`、`src/components/OverviewSection.jsx`、`src/components/HardwareViewer.jsx`、`src/index.css`
- 参考界面统一为白色卡片、浅蓝背景和蓝色强调色。
- 顶部导航增加功能图标，并扩大页面内容宽度。
- 区块标题改为编号圆标，增强层级识别。
- 重构 3D 硬件区，增加产品说明、功能要点、开始体验入口、选中部件信息和底部视图工具条。
- 3D 画布改为浅蓝背景并扩大展示高度。
- 连接区与沙盒区通过共享区块样式同步获得新的视觉层级。
- 未修改连接、运行、停止、无线、终端过滤和 AI 业务逻辑。
- 验证：`npm test`、`npm run build`、320–1440 px 响应式检查、浏览器控制台检查
- 回退方式：恢复 `Section`、`OverviewSection`、`HardwareViewer`、`App` 头部和 `index.css` 的旧版样式。

## v1.0.4 - 2026-11-11

### 优化点击运行到设备运行的速度

- 修改文件：`src/App.jsx`、`src/lib/maixRuntime.js`、`tests/maixRuntime.test.js`
- 无线源码分块从 256 字符提升到 512 字符，压缩后单条消息仍小于 1 KB。
- 无线分块改为每 4 条批量发送，同时保留索引和逐块确认，避免乱序写入。
- 支持板端将多个分块确认合并在同一条返回消息中。
- USB 首次运行不再固定等待 2 秒显示释放，改为等待 0.5 秒。
- USB 运行新程序替换旧程序时仍保留完整 2 秒显示释放等待。
- 未修改停止恢复、无线启动方式、AI 和其他设备行为。
- 验证：`npm test`、`npm run build`
- 回退方式：恢复 256 字符分块与逐块等待，并恢复 USB 固定 2 秒等待。

## v1.0.3 - 2026-11-11

### 隐藏终端运行过程信息

- 修改文件：`src/App.jsx`、`package.json`、`package-lock.json`
- `[静态检查]` 普通警告不再显示。
- 断开前检测到运行程序、停止过程提示不再显示。
- launcher 恢复成功及其完整系统命令不再显示。
- 程序正常结束后恢复 launcher 的提示不再显示。
- 停止失败、运行失败、程序已停止等关键结果继续显示。
- 未修改停止流程、USB、无线、AI 或其他设备行为。
- 验证：`npm test`、`npm run build`
- 回退方式：将 `appendLog` 的 `debug` 类型过滤移除，并恢复上述日志类型为 `info`。

## v1.0.2 - 2026-11-11

### 终端信息分级

- 修改文件：`src/App.jsx`、`src/lib/terminalLog.js`、`tests/terminalLog.test.js`
- 平台普通进度信息不再全部显示。
- 设备日志只保留错误、异常、应用启动标记和关键运行信息。
- Shell 命令输出使用独立类型，仍完整显示，避免影响终端使用。
- 验证：`npm test`、`npm run build`
- 回退方式：恢复 `App.jsx` 的 `appendLog` 与 `appendShellOutput`，并移除 `isImportantDeviceOutput`。

## v1.0.1 - 2026-11-11

### 断开连接前停止运行程序

- 修改文件：`src/App.jsx`
- 断开连接时检查 `programState` 和 `runningPidRef`。
- 检测到运行中程序时先执行停止，并等待停止结果。
- 25 秒内未确认停止时取消断开，保留设备连接。
- 未修改无线运行、USB 启动、停止桌面恢复和 AI 流程。
- 验证：`npm test`、`npm run build`
- 回退方式：恢复 `handleDisconnect` 为直接关闭 WebSocket/ADB 的版本。
