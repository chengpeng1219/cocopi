import { lazy, Suspense } from 'react';
import {
  Box,
  Monitor,
  MousePointer2,
  Play,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useI18n } from '../lib/i18n.jsx';
import {
  getHardwareLabels,
  localizeHardwarePart
} from '../data/hardwarePartsI18n.js';

const CocoPiReal3DViewer = lazy(() => import('./HardwareViewer.jsx'));

const PART_CARDS = [
  { id: 'screen' },
  { id: 'camera_back' },
  { id: 'power_switch_left' },
  { id: 'right_io' },
  { id: 'top_sleep_ports' },
  { id: 'bottom_ports' }
];

const VIEW_BUTTONS = [
  { key: 'front', pos: [0, 0, 6.2], part: 'screen' },
  { key: 'back', pos: [0, 0, -6.2], part: 'camera_back' },
  { key: 'left', pos: [-6.0, 0, 0], part: 'power_switch_left' },
  { key: 'right', pos: [6.0, 0, 0], part: 'right_io' },
  { key: 'top', pos: [0, 5.8, 0.01], part: 'top_sleep_ports' },
  { key: 'bottom', pos: [0, -5.8, 0.01], part: 'bottom_ports' }
];

const FEATURES = [
  { icon: Box, key: 'real3d' },
  { icon: MousePointer2, key: 'click' },
  { icon: Monitor, key: 'views' }
];

export default function OverviewSection({
  selectedPart,
  onSelectPart,
  targetCamPos,
  onFocusPart,
  zoomTrigger,
  onZoom,
  onResetView,
  resetTrigger,
  onStart
}) {
  const { language, t } = useI18n();
  const labels = getHardwareLabels(language);
  const localizedPart = localizeHardwarePart(selectedPart, language);
  return (
    <section
      id="overview"
      aria-label={t('overview.title')}
      className="flex h-full min-h-0 flex-col overflow-y-auto rounded-[var(--radius-box)] border border-accent-line bg-accent-soft p-4 lg:overflow-hidden"
    >
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-12 lg:items-stretch">
        <div className="flex min-h-0 flex-col justify-center gap-3 lg:col-span-5 xl:gap-4">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-surface px-3 py-1 text-[12px] font-semibold text-accent">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {t('overview.eyebrow')}
            </span>
            <h1 className="max-w-xl text-[28px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[34px] xl:text-[38px]">
              {t('overview.headline1')}
              <span className="block text-accent">{t('overview.headline2')}</span>
            </h1>
            <p className="max-w-xl text-[13px] leading-6 text-ink-soft">
              {t('overview.copy')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-center gap-2.5 rounded-[var(--radius-control)] bg-white/70 px-3 py-2.5">
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-ink">
                    {labels.features[key][0]}
                  </span>
                  <span className="block truncate text-[11px] text-ink-dim">
                    {labels.features[key][1]}
                  </span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-accent px-5 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition-colors hover:bg-accent-strong"
            >
              <Play aria-hidden="true" className="h-4 w-4 fill-current" />
              {t('overview.start')}
            </button>
            <span className="text-[12px] text-ink-dim">{t('overview.startHint')}</span>
          </div>

          <div className="border-l-2 border-accent pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-accent">{localizedPart.badge}</span>
              <span className="text-[11px] text-ink-dim">{t('overview.selected')}</span>
            </div>
            <h3 className="mt-1 text-[15px] font-semibold text-ink">{localizedPart.name}</h3>
            <p className="mt-1 break-all font-mono text-[11px] leading-relaxed text-ink-soft">
              {localizedPart.spec}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{localizedPart.desc}</p>
          </div>

          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {PART_CARDS.map((card) => {
              const active = selectedPart.id === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onFocusPart(card.id)}
                  aria-pressed={active}
                  className={`flex min-h-9 items-center rounded-[var(--radius-control)] px-3 py-2 text-left text-[12px] font-medium transition-colors ${
                    active
                      ? 'bg-surface text-accent shadow-[0_1px_3px_rgba(37,99,235,0.12)]'
                      : 'text-ink-soft hover:bg-white/70 hover:text-ink'
                  }`}
                >
                  <span className="truncate">{labels.cards[card.id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-col gap-3 lg:col-span-7">
          <div className="relative min-h-[320px] flex-1">
            <Suspense
              fallback={
                <div className="flex h-full min-h-[320px] w-full items-center justify-center rounded-[var(--radius-box)] border border-accent-line bg-surface text-[13px] font-medium text-ink-dim">
                  {t('overview.loading')}
                </div>
              }
            >
              <CocoPiReal3DViewer
                onSelectPart={onSelectPart}
                targetCamPos={targetCamPos}
                zoomTrigger={zoomTrigger}
                resetTrigger={resetTrigger}
              />
            </Suspense>
            <p className="pointer-events-none absolute bottom-3 left-4 right-4 flex items-center">
              <span className="rounded-[var(--radius-control)] border border-white/80 bg-white/85 px-2.5 py-1 text-[12px] text-ink-soft backdrop-blur-sm">
                {t('overview.controls')}
              </span>
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-[var(--radius-box)] border border-accent-line bg-surface p-1.5 shadow-[0_2px_8px_rgba(37,71,135,0.05)]">
            <div className="flex flex-wrap items-center gap-1">
              {VIEW_BUTTONS.map((view) => (
                <button
                  key={view.key}
                  type="button"
                  onClick={() => onFocusPart(view.part, view.pos)}
                  className="min-h-8 rounded-[6px] px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  {labels.views[view.key]}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5 border-l border-line pl-1.5">
              <button
                type="button"
                onClick={() => onZoom('in')}
                className="rounded-[6px] p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                title={t('overview.zoomIn')}
                aria-label={t('overview.zoomIn')}
              >
                <ZoomIn aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onZoom('out')}
                className="rounded-[6px] p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                title={t('overview.zoomOut')}
                aria-label={t('overview.zoomOut')}
              >
                <ZoomOut aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onResetView}
                className="rounded-[6px] p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                title={t('overview.resetView')}
                aria-label={t('overview.resetView')}
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
