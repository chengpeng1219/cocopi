import { lazy, Suspense, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Cpu,
  Gamepad2,
  Lightbulb,
  Mic2,
  Monitor,
  Play,
  PlugZap,
  ShieldCheck,
  Sparkles,
  Terminal,
  Usb,
  Wifi
} from 'lucide-react';
import { HARDWARE_PARTS } from '../data/hardwareParts.js';
import { localizeHardwarePart } from '../data/hardwarePartsI18n.js';
import { USAGE_GUIDE_CONTENT } from '../data/usageGuideContent.js';
import { useI18n } from '../lib/i18n.jsx';

const CocoPiReal3DViewer = lazy(() => import('./HardwareViewer.jsx'));

const CAPABILITY_ICONS = [Camera, Gamepad2, Mic2, Cpu];
const PART_IDS = [
  'screen',
  'camera_back',
  'power_switch_left',
  'right_io',
  'top_sleep_ports',
  'bottom_ports'
];
const PART_VIEW_POSITIONS = {
  screen: [0, 0, 6.2],
  camera_back: [0, 0, -6.2],
  power_switch_left: [-6, 0, 0],
  right_io: [6, 0, 0],
  top_sleep_ports: [0, 5.8, 0.01],
  bottom_ports: [0, -5.8, 0.01]
};

const WEBSITE_ICONS = [Usb, Blocks, Sparkles, Terminal, Play, CircleHelp];

export default function UsageGuidePage({ onBack, onOpenStudio }) {
  const { language } = useI18n();
  const content = USAGE_GUIDE_CONTENT[language] || USAGE_GUIDE_CONTENT['zh-hans'];
  const [selectedPart, setSelectedPart] = useState(HARDWARE_PARTS.screen);
  const [targetCamPos, setTargetCamPos] = useState([2.8, 1.8, 5.2]);
  const introRef = useRef(null);
  const hardwareRef = useRef(null);
  const quickStartRef = useRef(null);
  const websiteRef = useRef(null);
  const faqRef = useRef(null);
  const navRefs = {
    intro: introRef,
    hardware: hardwareRef,
    quickStart: quickStartRef,
    website: websiteRef,
    faq: faqRef
  };

  const focusPart = (id) => {
    const part = HARDWARE_PARTS[id];
    if (!part) return;
    setSelectedPart(part);
    setTargetCamPos(PART_VIEW_POSITIONS[id] || part.camPos);
  };

  const scrollTo = (key) => {
    navRefs[key]?.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };

  return (
    <div className="min-h-full bg-paper pb-10 text-ink">
      <section className="overflow-hidden rounded-[8px] border border-accent-line bg-[#edf6fb] text-ink">
        <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-12">
          <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:col-span-5 lg:px-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-accent-line bg-surface px-3 py-1 text-[12px] font-semibold text-accent">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
              {content.eyebrow}
            </div>
            <h1 className="mt-5 max-w-xl text-[30px] font-bold leading-[1.18] sm:text-[38px]">
              {content.title}
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-7 text-ink-soft">
              {content.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {content.heroPills.map((pill, index) => {
                const Icon = [Camera, Monitor, Blocks, Wifi][index] || CheckCircle2;
                return (
                  <span
                    key={pill}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/80 px-3 py-1.5 text-[12px] text-ink-soft"
                  >
                    <Icon aria-hidden="true" className="h-3.5 w-3.5 text-accent" />
                    {pill}
                  </span>
                );
              })}
            </div>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={onOpenStudio}
                className="inline-flex min-h-10 items-center gap-2 rounded-[8px] bg-accent px-5 text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.18)] hover:bg-accent-strong"
              >
                <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                {content.start}
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex min-h-10 items-center gap-2 rounded-[8px] border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft hover:bg-surface-sunken hover:text-ink"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                {content.back}
              </button>
            </div>
          </div>
          <div className="relative min-h-[360px] p-4 sm:p-6 lg:col-span-7 lg:min-h-[520px] lg:p-8">
            <Suspense
              fallback={
                <div className="flex h-full min-h-[320px] items-center justify-center rounded-[8px] bg-[#eef5ff] text-[13px] font-semibold text-[#51657d]">
                  Loading CocoPi2 model...
                </div>
              }
            >
              <CocoPiReal3DViewer
                onSelectPart={setSelectedPart}
                targetCamPos={targetCamPos}
                zoomTrigger={null}
                resetTrigger={0}
              />
            </Suspense>
            <div className="absolute bottom-7 left-7 right-7 rounded-[8px] border border-white/90 bg-white/95 p-3.5 shadow-[0_10px_28px_rgba(43,74,112,0.12)] backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                {content.hardware.partNote}
              </p>
              <p className="mt-1 text-[14px] font-semibold text-ink">
                {localizeHardwarePart(selectedPart, language).name}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-ink-soft">
                {localizeHardwarePart(selectedPart, language).desc}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-accent-line bg-white/60 sm:grid-cols-4">
          {[
            ['2.4"', 'IPS 640×480'],
            ['AI', 'Vision / Audio / LLM'],
            ['354', 'Blockly types'],
            ['USB / Wi-Fi', 'ADB / SSH 22']
          ].map(([value, label]) => (
            <div key={label} className="border-r border-line px-5 py-4 last:border-r-0">
              <p className="text-[20px] font-bold text-ink">{value}</p>
              <p className="mt-0.5 text-[11px] text-ink-dim">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <nav className="sticky top-0 z-20 -mx-[10px] mt-3 overflow-x-auto border-y border-line bg-paper/95 px-[10px] py-2 backdrop-blur">
        <div className="mx-auto flex min-w-max items-center gap-1">
          {Object.entries(content.nav).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => scrollTo(key)}
              className="min-h-8 rounded-[6px] px-3 text-[12px] font-semibold text-ink-soft hover:bg-surface hover:text-accent"
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <section ref={introRef} className="scroll-mt-16 px-2 py-10 sm:px-5">
        <div className="mx-auto max-w-[1260px]">
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent">
                CocoPi2 / MaixCAM2
              </p>
              <h2 className="mt-2 max-w-xl text-[26px] font-bold leading-tight text-ink">
                {content.intro.title}
              </h2>
            </div>
            <p className="max-w-3xl text-[14px] leading-7 text-ink-soft">
              {content.intro.body}
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {content.intro.highlights.map((item, index) => {
              const Icon = CAPABILITY_ICONS[index];
              return (
                <div
                  key={item.title}
                  className="border-t-2 border-accent/60 bg-surface px-4 py-4 shadow-[0_1px_2px_rgba(20,40,70,0.05)]"
                >
                  <Icon aria-hidden="true" className="h-5 w-5 text-accent" />
                  <h3 className="mt-3 text-[14px] font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-ink-soft">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={hardwareRef} className="scroll-mt-16 bg-surface px-2 py-12 sm:px-5">
        <div className="mx-auto max-w-[1260px]">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#d97706]">
                Hardware
              </p>
              <h2 className="mt-2 text-[26px] font-bold text-ink">{content.hardware.title}</h2>
              <p className="mt-2 max-w-3xl text-[13px] leading-6 text-ink-soft">
                {content.hardware.body}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-[8px] border border-[#f5c26b] bg-[#fff8e8] px-3 py-2 text-[12px] text-[#8a5a00]">
              <Lightbulb aria-hidden="true" className="h-4 w-4 shrink-0" />
              {content.hardware.hint}
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PART_IDS.map((id) => {
              const part = localizeHardwarePart(HARDWARE_PARTS[id], language);
              const active = selectedPart.id === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => focusPart(id)}
                  className={`group min-h-[150px] rounded-[8px] border p-4 text-left transition-colors ${
                    active
                      ? 'border-accent bg-accent-soft'
                      : 'border-line bg-paper hover:border-accent-line hover:bg-accent-soft/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-accent">{part.badge}</span>
                    <ChevronRight
                      aria-hidden="true"
                      className="h-4 w-4 text-ink-dim transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                  <h3 className="mt-2 text-[14px] font-semibold leading-5 text-ink">{part.name}</h3>
                  <p className="mt-2 text-[12px] leading-5 text-ink-soft">{part.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={quickStartRef} className="scroll-mt-16 px-2 py-12 sm:px-5">
        <div className="mx-auto max-w-[1260px]">
          <div className="grid gap-8 lg:grid-cols-[0.65fr_1.35fr]">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#0f9f7f]">
                Quick start
              </p>
              <h2 className="mt-2 text-[26px] font-bold text-ink">{content.quickStart.title}</h2>
              <div className="mt-5 flex items-center gap-3 rounded-[8px] bg-[#0f9f7f] px-4 py-5 text-white">
                <PlugZap aria-hidden="true" className="h-8 w-8 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold">Power → USB-C → WebUSB</p>
                  <p className="mt-1 text-[11px] leading-5 text-white/80">
                    {content.quickStart.steps[1].text}
                  </p>
                </div>
              </div>
            </div>
            <ol className="space-y-2">
              {content.quickStart.steps.map((step, index) => (
                <li key={step.title} className="flex gap-3 rounded-[8px] border border-line bg-surface p-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[12px] font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-[13px] font-semibold text-ink">{step.title}</h3>
                    <p className="mt-1 text-[12px] leading-5 text-ink-soft">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-[#edf4f1] px-2 py-12 sm:px-5">
        <div className="mx-auto max-w-[1260px]">
          <h2 className="text-[26px] font-bold text-ink">{content.ports.title}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {content.ports.groups.map((group, index) => {
              const Icon = [Monitor, Gamepad2, Blocks, Usb][index];
              return (
                <div key={group.title} className="rounded-[8px] border border-[#cfe3dd] bg-white p-4">
                  <Icon aria-hidden="true" className="h-5 w-5 text-[#0f9f7f]" />
                  <h3 className="mt-3 text-[14px] font-semibold text-ink">{group.title}</h3>
                  <ul className="mt-2 space-y-2">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2 text-[12px] leading-5 text-ink-soft">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#0f9f7f]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={websiteRef} className="scroll-mt-16 bg-surface px-2 py-12 sm:px-5">
        <div className="mx-auto max-w-[1260px]">
          <div className="max-w-3xl">
            <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-accent">
              Web workflow
            </p>
            <h2 className="mt-2 text-[26px] font-bold text-ink">{content.website.title}</h2>
            <p className="mt-2 text-[13px] leading-6 text-ink-soft">{content.website.body}</p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {content.website.steps.map((step, index) => {
              const Icon = WEBSITE_ICONS[index];
              return (
                <div key={step.title} className="rounded-[8px] border border-line bg-paper p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[7px] bg-accent-soft text-accent">
                      <Icon aria-hidden="true" className="h-4 w-4" />
                    </span>
                    <span className="font-mono text-[11px] font-bold text-ink-dim">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-3 text-[14px] font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[12px] leading-5 text-ink-soft">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section ref={faqRef} className="scroll-mt-16 px-2 py-12 sm:px-5">
        <div className="mx-auto grid max-w-[1260px] gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-[26px] font-bold text-ink">{content.faq.title}</h2>
            <div className="mt-5 divide-y divide-line border-y border-line">
              {content.faq.items.map((item) => (
                <details key={item.question} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center gap-3 text-[13px] font-semibold text-ink">
                    <CircleHelp aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
                    {item.question}
                    <ChevronRight
                      aria-hidden="true"
                      className="ml-auto h-4 w-4 shrink-0 text-ink-dim transition-transform group-open:rotate-90"
                    />
                  </summary>
                  <p className="ml-7 mt-2 text-[12px] leading-6 text-ink-soft">{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="rounded-[8px] border border-[#e8c46f] bg-[#fff8e8] p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="h-5 w-5 text-[#b16b00]" />
              <h2 className="text-[16px] font-semibold text-[#6d4700]">{content.safety.title}</h2>
            </div>
            <ul className="mt-4 space-y-3">
              {content.safety.items.map((item) => (
                <li key={item} className="flex gap-2 text-[12px] leading-6 text-[#775821]">
                  <CheckCircle2 aria-hidden="true" className="mt-1 h-3.5 w-3.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-[1260px] flex-col items-center justify-between gap-3 border-t border-line px-4 py-6 sm:flex-row">
        <p className="text-[12px] text-ink-dim">CocoPi2 / MaixCAM2</p>
        <button
          type="button"
          onClick={onOpenStudio}
          className="inline-flex min-h-9 items-center gap-2 rounded-[7px] bg-accent px-4 text-[13px] font-semibold text-white hover:bg-accent-strong"
        >
          {content.start}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
