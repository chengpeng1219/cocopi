import { lazy, Suspense } from 'react';
import {
  Box,
  Monitor,
  MousePointer2,
  Play,
  Rotate3d,
  Sparkles,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { Section } from './ui.jsx';
import { useI18n } from '../lib/i18n.jsx';

const CocoPiReal3DViewer = lazy(() => import('./HardwareViewer.jsx'));

const PART_CARDS = [
  { id: 'screen', label: '正视图：屏幕与扬声器' },
  { id: 'camera_back', label: '背视图：摄像头 & P0-P3' },
  { id: 'power_switch_left', label: '左视图：电源开关 & M3-M6' },
  { id: 'right_io', label: '右视图：扩展开关/电池/TypeC' },
  { id: 'top_sleep_ports', label: '俯视图：返回(休眠)按钮' },
  { id: 'bottom_ports', label: '底视图：M1/M2/UART/IIC' }
];

const VIEW_BUTTONS = [
  { label: '正视图', pos: [0, 0, 6.2], part: 'screen' },
  { label: '背视图', pos: [0, 0, -6.2], part: 'camera_back' },
  { label: '左视图', pos: [-6.0, 0, 0], part: 'power_switch_left' },
  { label: '右视图', pos: [6.0, 0, 0], part: 'right_io' },
  { label: '俯视图', pos: [0, 5.8, 0.01], part: 'top_sleep_ports' },
  { label: '底视图', pos: [0, -5.8, 0.01], part: 'bottom_ports' }
];

const FEATURES = [
  { icon: Box, title: '真实三维', detail: '完整硬件外观' },
  { icon: MousePointer2, title: '即点即用', detail: '快速定位部件' },
  { icon: Monitor, title: '多视角', detail: '六视图自由切换' }
];

export default function OverviewSection({
  selectedPart,
  onSelectPart,
  targetCamPos,
  onFocusPart,
  zoomTrigger,
  onZoom,
  onResetView,
  resetTrigger
}) {
  const { t } = useI18n();
  return (
    <Section
      id="overview"
      index="01"
      title={t('overview.title')}
      summary={t('overview.summary')}
      aside={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-surface px-3 py-1 text-[12px] font-medium text-accent">
          <Rotate3d aria-hidden="true" className="h-4 w-4" />
          {t('overview.badge')}
        </span>
      }
      className="overflow-hidden border-accent-line !bg-accent-soft"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
        <div className="space-y-6 lg:col-span-5">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-surface px-3 py-1 text-[12px] font-semibold text-accent">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {t('overview.eyebrow')}
            </span>
            <h1 className="max-w-xl text-[34px] font-bold leading-[1.15] tracking-tight text-ink sm:text-[40px]">
              {t('overview.headline1')}
              <span className="block text-accent">{t('overview.headline2')}</span>
            </h1>
            <p className="max-w-xl text-[14px] leading-7 text-ink-soft">
              {t('overview.copy')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="flex items-center gap-2.5 rounded-[var(--radius-control)] bg-white/70 px-3 py-2.5">
                <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-ink">{title}</span>
                  <span className="block truncate text-[11px] text-ink-dim">{detail}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="#connect"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-accent px-5 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] transition-colors hover:bg-accent-strong"
            >
              <Play aria-hidden="true" className="h-4 w-4 fill-current" />
              {t('overview.start')}
            </a>
            <span className="text-[12px] text-ink-dim">{t('overview.startHint')}</span>
          </div>

          <div className="border-l-2 border-accent pl-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-accent">{selectedPart.badge}</span>
              <span className="text-[11px] text-ink-dim">{t('overview.selected')}</span>
            </div>
            <h3 className="mt-1 text-[16px] font-semibold text-ink">{selectedPart.name}</h3>
            <p className="mt-1.5 break-all font-mono text-[12px] leading-relaxed text-ink-soft">
              {selectedPart.spec}
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{selectedPart.desc}</p>
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
                  <span className="truncate">{card.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative">
            <Suspense
              fallback={
                <div className="flex h-[360px] w-full items-center justify-center rounded-[var(--radius-box)] border border-accent-line bg-surface text-[13px] font-medium text-ink-dim lg:h-[460px]">
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

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-box)] border border-accent-line bg-surface p-1.5 shadow-[0_2px_8px_rgba(37,71,135,0.05)]">
            <div className="flex flex-wrap items-center gap-1">
              {VIEW_BUTTONS.map((view) => (
                <button
                  key={view.label}
                  type="button"
                  onClick={() => onFocusPart(view.part, view.pos)}
                  className="min-h-8 rounded-[6px] px-2.5 text-[12px] font-medium text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                >
                  {view.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5 border-l border-line pl-1.5">
              <button
                type="button"
                onClick={() => onZoom('in')}
                className="rounded-[6px] p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                title="放大模型"
                aria-label="放大模型"
              >
                <ZoomIn aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onZoom('out')}
                className="rounded-[6px] p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                title="缩小模型"
                aria-label="缩小模型"
              >
                <ZoomOut aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onResetView}
                className="rounded-[6px] p-2 text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                title="复位视角"
                aria-label="复位视角"
              >
                <RotateCcw aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
