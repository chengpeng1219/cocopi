/*
 * 共享的界面原语。
 * 只承载视觉样式，不包含任何业务逻辑，便于在各个 section 之间复用。
 */

export const cx = (...values) => values.filter(Boolean).join(' ');

export function Section({ id, index, title, summary, aside, children, className }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cx(
        'rounded-[var(--radius-box)] border border-line bg-surface p-5 shadow-[0_8px_30px_rgba(37,71,135,0.06)] sm:p-7',
        className
      )}
    >
      <header className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-start gap-3.5">
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(37,99,235,0.24)]"
          >
            {index}
          </span>
          <div className="min-w-0">
            <h2
              id={`${id}-title`}
              className="text-[21px] font-semibold leading-tight tracking-tight text-ink"
            >
              {title}
            </h2>
            {summary && (
              <p className="mt-1.5 max-w-[46rem] text-[13px] leading-relaxed text-ink-dim">
                {summary}
              </p>
            )}
          </div>
        </div>
        {aside && <div className="flex flex-wrap items-center gap-2 lg:justify-end">{aside}</div>}
      </header>
      <div className="pt-6">{children}</div>
    </section>
  );
}

export function Panel({ children, className, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={cx(
        'rounded-[var(--radius-box)] border border-line bg-surface p-4',
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function PanelTitle({ icon: Icon, children, aside }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-ink-soft">
        {Icon && <Icon aria-hidden="true" className="h-4 w-4 text-accent" />}
        {children}
      </span>
      {aside}
    </div>
  );
}

const BUTTON_BASE =
  'inline-flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-[var(--radius-control)] px-3 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45';

export const buttonStyles = {
  base: BUTTON_BASE,
  primary: cx(BUTTON_BASE, 'bg-accent text-white hover:bg-accent-strong'),
  secondary: cx(BUTTON_BASE, 'border border-line-strong bg-surface text-ink hover:bg-surface-sunken'),
  quiet: cx(BUTTON_BASE, 'text-ink-soft hover:bg-surface-sunken hover:text-ink'),
  dangerSoft: cx(
    BUTTON_BASE,
    'border border-danger-line bg-danger-soft text-danger hover:bg-danger-hover'
  ),
  warnSoft: cx(
    BUTTON_BASE,
    'border border-warn-line bg-warn-soft text-warn hover:bg-warn-hover'
  ),
  onDark: cx(
    BUTTON_BASE,
    'border border-console-line bg-console-raised text-console-text hover:bg-console-raised-hover'
  )
};

export function Field({ label, children, className }) {
  return (
    <label className={cx('block space-y-1', className)}>
      <span className="block text-[13px] font-semibold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export const inputStyles =
  'w-full rounded-[var(--radius-control)] border border-line-strong bg-surface px-3 py-2 text-[15px] text-ink placeholder:text-ink-dim focus:border-accent focus:outline-none disabled:opacity-60';

export const monoInputStyles = cx(inputStyles, 'font-mono text-[13px]');

export function statusToneClass(tone = 'neutral') {
  const tones = {
    neutral: 'border-line text-ink-soft',
    ok: 'border-ok-line bg-ok-soft text-ok',
    warn: 'border-warn-line bg-warn-soft text-warn',
    accent: 'border-accent-line bg-accent-soft text-accent'
  };
  return tones[tone] || tones.neutral;
}

export function StatusPill({ tone = 'neutral', children }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-semibold',
        statusToneClass(tone)
      )}
    >
      {children}
    </span>
  );
}

/** 浅色错误/警告提示条，替代各处重复的 border + bg + text 组合 */
export function Notice({ tone = 'danger', children, className }) {
  const tones = {
    danger: 'border-danger-line bg-danger-soft text-danger',
    warn: 'border-warn-line bg-warn-soft text-warn'
  };
  return (
    <div
      role="status"
      className={cx(
        'flex items-start gap-1.5 rounded-[var(--radius-control)] border px-3 py-2 text-[12px] leading-relaxed',
        tones[tone] || tones.danger,
        className
      )}
    >
      {children}
    </div>
  );
}

export const LOG_TONE_CLASS = {
  error: 'text-console-danger',
  success: 'text-console-ok',
  cmd: 'text-console-warn font-semibold',
  device: 'text-console-text',
  info: 'text-console-info'
};
