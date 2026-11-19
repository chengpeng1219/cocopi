# CocoPi Portal

CocoPi Portal 是一个单页智能硬件实训控制台，提供 3D 硬件认知、ADB 有线连接、SSH 22 端口局域网连接、真机终端、MaixPy 代码沙盒、AI 代码生成和 MaixCAM2 图形化编程。

## 技术栈

- React 19 + Vite 6
- Tailwind CSS 4
- Three.js
- Node.js 服务端（AI 与设备 SSH 代理）
- Node.js 内置测试运行器

## 本地运行

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

打开终端输出的 localhost 地址。开发环境中的 Vite 服务会直接提供 `/api/ai/chat`。

`.env.local` 只应配置服务端变量：

```dotenv
AI_BASE_URL=https://onehub.cocorobo.cn/v1
AI_API_KEY=replace-with-your-key
AI_MODEL=deepseek-chat
```

不要再次使用 `VITE_AI_API_KEY`。所有 `VITE_` 变量都可能被写入浏览器构建产物。旧变量名仍由服务端代理兼容读取，但建议立即迁移并轮换旧密钥。

## 常用命令

```powershell
npm run dev       # Vite 开发服务，包含 AI 与设备 SSH 代理
npm run api       # 独立服务端，监听 127.0.0.1:8787
npm run build     # 生产构建
npm run preview   # 预览构建产物
npm test          # 协议、二维码、终端和解析测试
```

## 设备连接

### 有线 ADB

1. 使用 Chrome 或 Edge。
2. 页面必须通过 HTTPS 或 localhost 打开，WebUSB 才会启用。
3. 在 CocoPi 上开启 USB 调试并连接 Type-C 数据线。
4. 点击“连接 CocoPi 有线设备”，在设备屏幕点击允许。

有线连接基于官方 `@yume-chan/adb`（ya-webadb）实现，由浏览器生成并保存 ADB RSA 主机身份。终端使用 ADB subprocess，用户脚本由设备端部署器写入 `/root/user_latest_code.py` 并后台启动。

运行程序时把当前编辑器内容写入设备实际支持的 `/root/user_latest_code.py`，停止 `launcher.service` 和后台语音/模型服务后执行该文件。脚本启动成功后返回真实 PID，停止时清理用户程序并通过 systemd 恢复 launcher。

每次推送代码前，前端会通过 systemd 停止 `launcher.service`、停止占用屏幕和摄像头的 `/maixapp/apps/` 程序，再由用户脚本自行初始化 `display.Display()`。平台不会额外启动显示探测进程，避免与用户脚本争抢 VO 和摄像头资源。

再次推送新程序时，系统会先终止上一套用户程序和它的进程组，再完成显示资源刷新和新程序启动，因此不需要手动停止后才能切换程序。

“停止程序”会终止用户程序和后台语音/模型服务，再通过 `systemctl start launcher.service` 恢复 CocoPi 桌面。

停止流程只匹配平台启动的用户程序，并依次发送 `SIGINT`、`SIGTERM`、`SIGKILL`，确认进程完全退出后才启动 launcher。它不会强制结束 launcher 本身或其他 MaixApp，也不会反复重启桌面服务，避免出现 `VO init failed`、`Open display failed` 或恢复后跳红屏。

### 局域网 SSH 22

局域网连接不再依赖 `ws_agent.py` 或 `8181`。浏览器把 SSH 请求发送给本项目服务端，Node 服务端再通过 TCP 连接设备的 `22` 端口：

```text
浏览器 -> /api/device/ssh/exec -> Node SSH 客户端 -> 设备 192.168.0.64:22
```

板端只要求默认开放的 SSH 服务，不需要安装额外代理。连接时可输入用户名和密码；如果希望服务端统一管理凭据，可以在 `.env.local` 配置 `COCOPI_SSH_USER` 和 `COCOPI_SSH_PASSWORD`，页面中密码留空即可。

注意：

- 浏览器不能直接打开原始 SSH 连接，因此生产环境必须运行 `npm run api` 或配置 Nginx 转发 `/api/device/ssh/`。
- 密码只会发送到同源 Node 服务端，不会写入浏览器构建产物、日志或 localStorage。
- 服务端仅允许连接私有 IPv4 地址，避免把 SSH 接口变成任意网络转发器。
- 通过 HTTPS 访问页面时，SSH 密码也受 HTTPS 保护；局域网 HTTP 部署只建议用于受控实验环境。

## Linux Shell 终端

页面中的终端直接接受 Linux Shell 命令，例如：

```text
ls -la /root
cat /tmp/cocopi_run.log
ps w | grep python
ip addr
cd /tmp
pwd
```

`cd` 后的当前目录会保留并在提示符中显示。USB 模式直接通过 ADB shell 执行；SSH 模式通过服务端 SSH 执行 `/bin/sh` 命令，用户输入不会作为 Python 代码执行。

## MaixCAM2 图形化编程

页面内置 Blockly 积木编辑器，提供摄像头、屏幕显示、文字与矩形绘制、触摸、延时、逻辑、数学、文本和变量积木。生成的代码：

- 使用 `camera.Camera()`、`display.Display()` 和 `touchscreen.TouchScreen()`。
- 使用 `while not app.need_exit():`，不会生成不可退出的 `while True`。
- 不访问 `/dev/fb*` 或其他 framebuffer 设备。
- 可以直接通过当前 USB 或 SSH 连接运行。

创作台顶部提供“添加设备、保存、上传、运行、重启”操作：

- “保存”会把当前 Python 程序下载到本地 `.py` 文件，同时保留浏览器草稿。
- “上传”只写入并检查设备上的 `/root/user_latest_code.py`，不会启动程序。
- “重启”会在确认后向已连接设备发送重启命令。
- 语言菜单支持简体中文、香港繁体中文和 English，选择结果会写入 `?lang=` 与浏览器本地存储。

## AI 代理

生产环境需要单独运行：

```powershell
npm run api
```

默认只监听 `127.0.0.1:8787`。Nginx 将 `/api/ai/` 转发给该服务。代理执行以下限制：

- 密钥仅在服务端使用
- 请求体和 Nginx 均限制为 64 KB，提示词最大 4000 字符
- 单 IP 每分钟最多 20 次请求
- 固定 AI 上游地址，不接受客户端传入任意 URL
- 单次上游超时 45 秒，Nginx 代理读取超时 120 秒
- 经本机 Nginx 转发时使用 `X-Real-IP` 区分客户端；本机回环代理默认可信

## CocoPi 知识库与代码检查

知识源位于 `knowledge-source/`：

- `examples/` 保存设备可运行样例，并作为 AI 模板候选。
- `errors/` 保存错误特征、原因和修复方法。
- MaixPy 官方 API 文档来自 `wiki.sipeed.com`。

重新生成索引：

```powershell
npm run knowledge:build
```

AI 生成流程会：

1. 根据用户需求检索相关 API、样例和错误知识。
2. 将检索结果加入生成上下文。
3. 对结果执行本地静态检查。
4. 静态检查失败时自动请求 AI 再修复一次。
5. 下发前在设备端执行 `python -m py_compile`。
6. 真机失败后保留过滤后的有效 traceback，并提供“AI 修复代码”按钮。

## 部署

1. 执行 `npm run build`。
2. 配置 `.env.local` 或系统环境变量。
3. 启动 `npm run api`，建议使用进程管理器守护。
4. 使用 `nginx.https.conf.example` 作为 HTTPS 部署模板。
5. 将 `dist/` 上传到 Nginx 静态目录。

WebUSB 只支持安全上下文，生产环境应使用 HTTPS。HTTP 配置适合局域网浏览，但无法使用有线 WebUSB。SSH 连接需要 Node 服务端能直接访问设备的 `22` 端口；如果 Node 部署在公网服务器而设备在校园局域网，需要先建立内网穿透或 VPN。

## 目录结构

```text
src/
  App.jsx                    状态与业务编排（连接、终端、下发、AI 流程）
  components/ui.jsx          视觉原语：Section / Panel / 按钮与输入样式
  components/OverviewSection.jsx   3D 硬件区
  components/ConnectSection.jsx    连接与终端
  components/SandboxSection.jsx    官方示例、AI 助手与代码编辑器
  components/BlocklySection.jsx    MaixCAM2 图形化积木编辑器
  components/QrModal.jsx     Wi-Fi 配网二维码弹窗
  components/HardwareViewer.jsx    Three.js 3D 硬件模型
  data/hardwareParts.js      硬件部件说明
  data/maixpy.js             AI 提示词与本地降级模板
  data/maixpyPrograms.js     官方示例程序
  lib/yaWebAdbClient.js      ya-webadb 连接、Shell 与设备脚本执行
  lib/deviceSshClient.js     浏览器到 SSH 代理的连接封装
  lib/qr.js                  Wi-Fi 配网二维码
  lib/terminalLog.js         终端输出的噪声过滤、去重与行数上限
  lib/aiClient.js            同源 AI 请求客户端
  lib/maixBlocks.js         MaixCAM2 积木定义、主题和 Python 生成器
server/
  index.js                   独立 AI 与 SSH 服务入口
  aiProxy.js                 代理与限流逻辑
  deviceSsh.js               SSH 22 代理与局域网地址校验
tests/                       自动测试
```

## 界面样式约定

- 所有颜色取自 `src/index.css` 里的 `@theme` token：`paper / surface / line / ink*` 为中性层，`accent` 是唯一强调色，`ok / warn / danger` 只表达状态，`console*` 用于终端和代码编辑器。
- 圆角只用 `--radius-box`（卡片 10px）和 `--radius-control`（控件 8px），不再混用 `rounded-3xl` 之类的大圆角。
- 字号梯度：页面主标题 28px / 区块标题 20px / 卡片标题 15px / 正文 15px / 说明 13px 或 12px。
- 装饰只用细边框和单层轻投影，不使用渐变、发光或多层阴影。
- 新增界面元素请复用 `components/ui.jsx` 中的 `Section`、`Panel`、`buttonStyles` 等，避免在业务组件里重复写颜色。

## 已知限制

- Windows WebUSB 驱动、ADB 固件行为和真实设备授权仍需在不同电脑上持续验证。
- 当前项目没有账号、权限、课程资源和数据库模块。
