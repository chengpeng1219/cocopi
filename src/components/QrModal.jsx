import { useEffect, useRef } from 'react';
import { QrCode, X } from 'lucide-react';
import { Field, buttonStyles, cx, inputStyles } from './ui.jsx';
import { useI18n } from '../lib/i18n.jsx';

export default function QrModal({ qrCode, ssid, password, onSsidChange, onPasswordChange, onClose }) {
  const { t } = useI18n();
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="w-full max-w-md space-y-4 rounded-[var(--radius-box)] border border-line bg-surface p-5 shadow-[0_12px_32px_rgba(31,35,40,0.18)]"
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            id="qr-modal-title"
            className="flex items-center gap-2 text-[17px] font-semibold text-ink"
          >
            <QrCode aria-hidden="true" className="h-5 w-5 text-accent" />
            {t('qrcode.title')}
          </h3>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('qrcode.closeAria')}
            className="rounded-[6px] p-1 text-ink-dim transition-colors hover:bg-surface-sunken hover:text-ink"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <Field label={t('qrcode.ssid')}>
            <input
              type="text"
              value={ssid}
              onChange={(e) => onSsidChange(e.target.value)}
              className={inputStyles}
            />
          </Field>
          <Field label={t('qrcode.password')}>
            <input
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className={cx(inputStyles, 'font-mono text-[13px]')}
            />
          </Field>
        </div>

        <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-[var(--radius-box)] border border-line bg-surface p-3">
          <div
            className="grid h-40 w-40 bg-white"
            role="img"
            aria-label="CocoPi Wi-Fi 配网二维码"
            style={{
              gridTemplateColumns: `repeat(${qrCode.size}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${qrCode.size}, minmax(0, 1fr))`
            }}
          >
            {qrCode.modules.flat().map((bit, idx) => (
              <div key={idx} className={bit ? 'bg-ink' : 'bg-white'} />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] leading-relaxed text-ink-dim">
            {t('qrcode.help')}
          </p>
          <button type="button" onClick={onClose} className={buttonStyles.secondary}>
            {t('qrcode.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
