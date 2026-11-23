import { AlertCircle, QrCode, Square, StopCircle, Usb, Wifi, X } from 'lucide-react';
import {
  Field,
  Notice,
  Panel,
  StatusPill,
  buttonStyles,
  cx,
  inputStyles
} from './ui.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function DeviceDrawer({
  open,
  onClose,
  connStatus,
  deviceInfo,
  connectionTab,
  onSelectConnectionTab,
  isSecureContext,
  onAdbConnect,
  sshIpInput,
  onSshIpChange,
  sshError,
  onSshConnect,
  onOpenQrModal,
  isProgramBusy,
  onStopProgram,
  onDisconnect
}) {
  const { t } = useI18n();
  if (!open) return null;
  const connected = connStatus === 'connected';

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="device-drawer-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col border-l border-line bg-paper shadow-[-20px_0_50px_rgba(22,44,80,0.18)]"
      >
        <header className="flex min-h-16 items-center justify-between border-b border-line bg-surface px-5">
          <div>
            <h2 id="device-drawer-title" className="text-[18px] font-semibold text-ink">
              {t('drawer.title')}
            </h2>
            <p className="mt-0.5 text-[11px] text-ink-dim">
              {t('drawer.subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('drawer.close')}
            className="rounded-[6px] p-2 text-ink-dim hover:bg-surface-sunken hover:text-ink"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
          <div className="flex items-center justify-between gap-3">
            <StatusPill tone={connected ? 'ok' : connStatus === 'connecting' ? 'warn' : 'neutral'}>
              {connected
                ? deviceInfo.portName
                : connStatus === 'connecting'
                ? t('device.connecting')
                : t('device.disconnected')}
            </StatusPill>
            {connected && (
              <button
                type="button"
                onClick={onDisconnect}
                disabled={isProgramBusy}
                className={buttonStyles.dangerSoft}
              >
                <Square aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                {t('drawer.disconnect')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1 rounded-[var(--radius-control)] border border-line bg-surface-sunken p-1">
            <button
              type="button"
              onClick={() => onSelectConnectionTab('usb')}
              disabled={connStatus !== 'disconnected'}
              className={cx(
                'flex min-h-9 items-center justify-center gap-2 rounded-[6px] text-[13px] font-semibold',
                connectionTab === 'usb' ? 'bg-surface text-accent' : 'text-ink-dim'
              )}
            >
              <Usb aria-hidden="true" className="h-4 w-4" />
              {t('drawer.usbTab')}
            </button>
            <button
              type="button"
              onClick={() => onSelectConnectionTab('ssh')}
              disabled={connStatus !== 'disconnected'}
              className={cx(
                'flex min-h-9 items-center justify-center gap-2 rounded-[6px] text-[13px] font-semibold',
                connectionTab === 'ssh' ? 'bg-surface text-accent' : 'text-ink-dim'
              )}
            >
              <Wifi aria-hidden="true" className="h-4 w-4" />
              {t('drawer.sshTab')}
            </button>
          </div>

          <Panel className="space-y-3">
            {connectionTab === 'usb' ? (
              <>
                <p className="text-[13px] leading-relaxed text-ink-soft">
                  {t('drawer.usbHelp')}
                </p>
                {!isSecureContext && (
                  <Notice tone="warn">
                    <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
                    {t('drawer.secureWarning')}
                  </Notice>
                )}
                <button
                  type="button"
                  onClick={onAdbConnect}
                  disabled={connStatus !== 'disconnected'}
                  className={cx(buttonStyles.primary, 'w-full')}
                >
                  <Usb aria-hidden="true" className="h-4 w-4" />
                  {t('drawer.usbConnect')}
                </button>
              </>
            ) : (
              <>
                <Field label={t('drawer.ip')}>
                  <input
                    value={sshIpInput}
                    onChange={(event) => onSshIpChange(event.target.value)}
                    disabled={connStatus === 'connected'}
                    inputMode="decimal"
                    className={cx(inputStyles, 'font-mono text-[13px]')}
                  />
                </Field>
                {sshError && (
                  <Notice>
                    <AlertCircle aria-hidden="true" className="h-3.5 w-3.5" />
                    {sshError}
                  </Notice>
                )}
                <button
                  type="button"
                  onClick={onSshConnect}
                  disabled={connStatus !== 'disconnected'}
                  className={cx(buttonStyles.primary, 'w-full')}
                >
                  <Wifi aria-hidden="true" className="h-4 w-4" />
                  {t('drawer.sshConnect')}
                </button>
                <button
                  type="button"
                  onClick={onOpenQrModal}
                  className={cx(buttonStyles.secondary, 'w-full')}
                >
                  <QrCode aria-hidden="true" className="h-4 w-4" />
                  {t('drawer.qr')}
                </button>
              </>
            )}
          </Panel>

          {connected && (
            <button
              type="button"
              onClick={onStopProgram}
              disabled={isProgramBusy}
              className={cx(buttonStyles.warnSoft, 'w-full')}
            >
              <StopCircle aria-hidden="true" className="h-4 w-4" />
              {t('drawer.stop')}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
