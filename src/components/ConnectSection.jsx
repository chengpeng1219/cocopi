import {
  AlertCircle,
  QrCode,
  Send,
  Smartphone,
  Square,
  StopCircle,
  Terminal,
  Trash2,
  Usb,
  Wifi
} from 'lucide-react';
import {
  Field,
  LOG_TONE_CLASS,
  Notice,
  Panel,
  PanelTitle,
  Section,
  StatusPill,
  buttonStyles,
  cx,
  inputStyles
} from './ui.jsx';

const QUICK_COMMANDS = [
  { label: '查看运行日志', cmd: "cat /tmp/cocopi_run.log 2>/dev/null || echo '暂无日志'" },
  { label: '列出 /root', cmd: 'ls -la /root' },
  { label: '查看 Python 进程', cmd: 'ps w | grep python | grep -v grep || true' }
];

export default function ConnectSection({
  connStatus,
  deviceInfo,
  isProgramBusy,
  onStopProgram,
  onDisconnect,
  connectionTab,
  onSelectConnectionTab,
  isSecureContext,
  onAdbConnect,
  sshIpInput,
  onSshIpChange,
  sshPortInput,
  onSshPortChange,
  sshUserInput,
  onSshUserChange,
  sshPasswordInput,
  onSshPasswordChange,
  sshError,
  onSshConnect,
  onOpenQrModal,
  deviceCwd,
  terminalLogs,
  terminalContainerRef,
  onClearLogs,
  onQuickCommand,
  replInput,
  onReplInputChange,
  onSendCommand
}) {
  const connected = connStatus === 'connected';

  const renderStatus = () => {
    if (connStatus === 'connecting') return <StatusPill tone="warn">正在连接…</StatusPill>;
    if (connected) return <StatusPill tone="ok">{deviceInfo.portName}</StatusPill>;
    return <StatusPill>设备未连接</StatusPill>;
  };

  return (
    <Section
      id="connect"
      index="02"
      title="设备连接管理"
      summary="Type-C 数据线直连 ADB（WebUSB，需要 HTTPS 或 localhost），或通过项目服务端连接设备 SSH 22 端口。"
      aside={
        <>
          {renderStatus()}
          {connected && (
            <>
              <button
                type="button"
                onClick={onStopProgram}
                disabled={isProgramBusy}
                className={buttonStyles.warnSoft}
              >
                <StopCircle aria-hidden="true" className="h-4 w-4" />
                停止运行中程序
              </button>
              <button
                type="button"
                onClick={onDisconnect}
                disabled={isProgramBusy}
                className={buttonStyles.dangerSoft}
              >
                <Square aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                断开连接
              </button>
            </>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* 连接方式与终端 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-stretch">
          {/* 连接方式：左栏 */}
          <div className="lg:col-span-4">
            <div
              role="tablist"
              aria-label="连接方式"
              className="grid grid-cols-2 gap-1 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={connectionTab === 'usb'}
                onClick={() => onSelectConnectionTab('usb')}
                disabled={connStatus !== 'disconnected'}
                className={cx(
                  'flex min-h-9 items-center justify-center gap-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  connectionTab === 'usb'
                    ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(31,35,40,0.08)]'
                    : 'text-ink-dim hover:text-ink'
                )}
              >
                <Usb aria-hidden="true" className="h-4 w-4" />
                有线 (ADB)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={connectionTab === 'ssh'}
                onClick={() => onSelectConnectionTab('ssh')}
                disabled={connStatus !== 'disconnected'}
                className={cx(
                  'flex min-h-9 items-center justify-center gap-2 rounded-[6px] text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                  connectionTab === 'ssh'
                    ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(31,35,40,0.08)]'
                    : 'text-ink-dim hover:text-ink'
                )}
              >
                <Wifi aria-hidden="true" className="h-4 w-4" />
                SSH (22)
              </button>
            </div>

            {connectionTab === 'usb' ? (
              <Panel className="mt-3 space-y-3">
                <PanelTitle
                  icon={Smartphone}
                  aside={<StatusPill tone="accent">WebUSB</StatusPill>}
                >
                  ADB Interface
                </PanelTitle>

                <p className="text-[13px] leading-relaxed text-ink-soft">
                  将 Type-C 数据线插入机身右侧下沉式接口，点击下方按钮并在浏览器弹窗中选中{' '}
                  <strong className="font-semibold text-ink">cocopi2</strong>。
                </p>

                {!isSecureContext && (
                  <Notice tone="warn">
                    <AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>当前页面不是安全上下文，WebUSB 需要 HTTPS 或 localhost 才能工作。</span>
                  </Notice>
                )}

                <button
                  type="button"
                  onClick={onAdbConnect}
                  disabled={connStatus !== 'disconnected'}
                  className={cx(buttonStyles.primary, 'w-full py-2.5')}
                >
                  <Usb aria-hidden="true" className="h-4 w-4" />
                  连接 CocoPi 有线设备
                </button>
              </Panel>
            ) : (
              <Panel className="mt-3 space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  <Field label="局域网 IP" className="col-span-2">
                    <input
                      type="text"
                      value={sshIpInput}
                      onChange={(e) => onSshIpChange(e.target.value)}
                      disabled={connStatus === 'connected'}
                      placeholder="192.168.1.108"
                      className={cx(inputStyles, 'font-mono text-[13px]')}
                    />
                  </Field>
                  <Field label="端口">
                    <input
                      type="text"
                      value={sshPortInput}
                      onChange={(e) => onSshPortChange(e.target.value)}
                      disabled={connStatus === 'connected'}
                      placeholder="22"
                      className={cx(inputStyles, 'font-mono text-[13px]')}
                    />
                  </Field>
                </div>

                <Field label="SSH 用户名">
                  <input
                    type="text"
                    value={sshUserInput}
                    onChange={(e) => onSshUserChange(e.target.value)}
                    disabled={connStatus === 'connected'}
                    autoComplete="username"
                    className={cx(inputStyles, 'font-mono text-[13px]')}
                  />
                </Field>

                <Field label="SSH 密码">
                  <input
                    type="password"
                    value={sshPasswordInput}
                    onChange={(e) => onSshPasswordChange(e.target.value)}
                    disabled={connStatus === 'connected'}
                    autoComplete="current-password"
                    placeholder="留空则使用服务端环境变量"
                    className={cx(inputStyles, 'font-mono text-[13px]')}
                  />
                </Field>

                {sshError && (
                  <Notice>
                    <AlertCircle aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{sshError}</span>
                  </Notice>
                )}

                <button
                  type="button"
                  onClick={onSshConnect}
                  disabled={connStatus !== 'disconnected'}
                  className={cx(buttonStyles.primary, 'w-full py-2.5')}
                >
                  <Wifi aria-hidden="true" className="h-4 w-4" />
                  连接 SSH (22)
                </button>

                <button
                  type="button"
                  onClick={onOpenQrModal}
                  className={cx(buttonStyles.secondary, 'w-full py-2')}
                >
                  <QrCode aria-hidden="true" className="h-4 w-4" />
                  生成 Wi-Fi 配网二维码
                </button>
              </Panel>
            )}
          </div>

          {/* 终端：右栏 */}
          <div className="flex h-[340px] flex-col overflow-hidden rounded-[var(--radius-box)] border border-console-line bg-console lg:col-span-8 lg:h-[430px]">
            <div className="flex items-center justify-between border-b border-console-line bg-console-raised px-3.5 py-2.5">
              <span className="flex items-center gap-2 font-mono text-[12px] font-semibold text-console-text">
                <Terminal aria-hidden="true" className="h-4 w-4 text-console-accent" />
                CocoPi Linux Shell
              </span>
              <button
                type="button"
                onClick={onClearLogs}
                className="flex items-center gap-1 text-[12px] text-console-dim transition-colors hover:text-console-text"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                清空
              </button>
            </div>

            <div
              ref={terminalContainerRef}
              className="console-scroll flex-1 overflow-y-auto bg-console-deep px-3 py-2 font-mono text-[12px] leading-[1.55]"
              role="log"
              aria-live="polite"
            >
              {terminalLogs.map((log, index) => (
                <div key={index} className="break-all">
                  <span className="mr-2 text-console-dim">[{log.time}]</span>
                  <span className={LOG_TONE_CLASS[log.type] || LOG_TONE_CLASS.info}>{log.text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto border-t border-console-line bg-console-raised px-3 py-1.5">
              {QUICK_COMMANDS.map((quick) => (
                <button
                  key={quick.label}
                  type="button"
                  onClick={() => onQuickCommand(quick.cmd)}
                  className="min-h-8 shrink-0 rounded-[6px] px-2 text-[12px] text-console-dim transition-colors hover:bg-console hover:text-console-text"
                >
                  {quick.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSendCommand();
              }}
              className="flex items-center gap-2 border-t border-console-line bg-console-raised px-3 py-2"
            >
              <span className="shrink-0 font-mono text-[11px] font-bold text-console-accent">
                root@cocopi:{deviceCwd}#
              </span>
              <input
                type="text"
                value={replInput}
                onChange={(e) => onReplInputChange(e.target.value)}
                aria-label="Linux Shell 命令"
                placeholder="输入 Linux 命令，例如 ls -la /root"
                className="min-w-0 flex-1 bg-transparent font-mono text-[12px] text-console-text placeholder:text-console-dim focus:outline-none"
              />
              <button
                type="submit"
                aria-label="发送 Linux 命令"
                className="rounded-[6px] bg-accent p-2 text-white transition-colors hover:bg-accent-strong"
              >
                <Send aria-hidden="true" className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </Section>
  );
}
