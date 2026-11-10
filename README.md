# CocoPi Portal

CocoPi Portal 是一个单页智能硬件实训控制台，提供 3D 硬件认知、ADB 有线连接、8181 无线连接、真机终端、MaixPy 代码沙盒和 AI 代码生成。

## 技术栈

- React 19 + Vite 6
- Tailwind CSS 4
- Three.js
- Node.js AI 代理（无额外服务端框架）
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
npm run dev       # Vite 开发服务，包含 AI 代理
npm run api       # 独立 AI 代理，监听 127.0.0.1:8787
npm run build     # 生产构建
npm run preview   # 预览构建产物
npm test          # 协议、二维码、遥测和解析测试
```

## 设备连接

### 有线 ADB

1. 使用 Chrome 或 Edge。
2. 页面必须通过 HTTPS 或 localhost 打开，WebUSB 才会启用。
3. 在 CocoPi 上开启 USB 调试并连接 Type-C 数据线。
4. 点击“连接 CocoPi 有线设备”，在设备屏幕点击允许。

有线连接基于官方 `@yume-chan/adb`（ya-webadb）实现，由浏览器生成并保存 ADB RSA 主机身份。文件上传使用 ADB Sync，终端使用 ADB subprocess，程序进程通过远端进程对象管理。

运行程序时把当前编辑器内容上传为设备实际支持的 `/root/user_latest_code.py`，停止 `launcher.service` 和后台语音/模型服务后执行该文件；停止时结束远端进程并通过 `systemctl start launcher.service` 恢复真正的 CocoPi 桌面。

每次推送代码前，前端会自动进入 MaixPy 开发模式：停止 launcher daemon、停止占用屏幕和摄像头的 `/maixapp/apps/` 程序，并通过独立的 `display.Display()` 进程验证显示资源已经释放。只有验证通过后才会启动用户脚本。

再次推送新程序时，系统会先终止上一套用户程序和它的进程组，再完成显示资源刷新和新程序启动，因此不需要手动停止后才能切换程序。

“停止程序”会按已记录的 PID 终止整个进程组；如果 PID 已不可用，则回退为扫描 `user_latest_code.py` 等运行入口。停止后会自动恢复 CocoPi launcher daemon。

### Wi-Fi 8181

板端需要预先运行 `ws_agent.py`，并监听 `8181`。当前前端直接使用 `ws://`，因此：

- 局域网 HTTP 页面可连接普通板端 WebSocket。
- HTTPS 页面不能直接连接普通 `ws://`，需要给板端配置 WSS 或通过可信反向代理转发。
- 无线通道目前不包含内建认证，建议只在受控实验局域网使用。
- 较大的 Python 脚本会先 gzip 压缩并编码成单个紧凑消息，避免大段明文源码触发板端代理的缓冲区问题。

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

`cd` 后的当前目录会保留并在提示符中显示。USB 模式直接通过 ADB shell 执行；Wi-Fi 模式通过板端代理调用 `/bin/sh`，用户输入不会作为 Python 代码执行。

## AI 代理

生产环境需要单独运行：

```powershell
npm run api
```

默认只监听 `127.0.0.1:8787`。Nginx 将 `/api/ai/` 转发给该服务。代理执行以下限制：

- 密钥仅在服务端使用
- 请求体最大 16 KB，提示词最大 4000 字符
- 单 IP 每分钟最多 20 次请求
- 固定 AI 上游地址，不接受客户端传入任意 URL
- 45 秒上游超时

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

WebUSB 只支持安全上下文，生产环境应使用 HTTPS。HTTP 配置适合局域网浏览，但无法使用有线 WebUSB。

## 目录结构

```text
src/
  App.jsx                    主页面与业务编排
  components/HardwareViewer  Three.js 3D 硬件模型
  data/hardwareParts.js      硬件部件说明
  data/maixpy.js             AI 提示词与本地降级模板
  data/maixpyPrograms.js     官方示例程序
  lib/yaWebAdbClient.js      ya-webadb 连接、上传、Shell 与进程管理
  lib/deviceProbes.js        遥测与目录探测
  lib/qr.js                  Wi-Fi 配网二维码
  lib/aiClient.js            同源 AI 请求客户端
server/
  index.js                   独立 AI 代理入口
  aiProxy.js                 代理与限流逻辑
tests/                       自动测试
```

## 已知限制

- V831 没有统一稳定的 NPU 占用接口，页面会显示 `N/A`，不会伪造数据。
- Windows WebUSB 驱动、ADB 固件行为和真实设备授权仍需连接 CocoPi 真机验证。
- 当前项目没有账号、权限、课程资源和数据库模块。
