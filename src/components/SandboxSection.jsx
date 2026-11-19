import { Code2, Copy, Check, Loader2, Play, RotateCcw, StopCircle, Wand2 } from 'lucide-react';
import { MAIXPY_PROGRAMS } from '../data/maixpyPrograms.js';
import {
  Notice,
  Panel,
  PanelTitle,
  Section,
  StatusPill,
  buttonStyles,
  cx,
  inputStyles,
  statusToneClass
} from './ui.jsx';

const RUN_LABEL = {
  deploying: '正在启动…',
  stopping: '正在停止…'
};

export default function SandboxSection({
  activeProgram,
  onSelectProgram,
  aiPrompt,
  onAiPromptChange,
  onGenerate,
  onGenerateAndRun,
  isGeneratingAi,
  isProgramBusy,
  connStatus,
  lastRunError,
  onRepair,
  onRepairAndRun,
  editableCode,
  onEditCode,
  programState,
  onRun,
  onStop,
  onResetCode,
  copiedCode,
  onCopyCode
}) {
  const connected = connStatus === 'connected';
  const disconnectedHint = connected ? undefined : '请先在「设备连接」中连接 CocoPi';

  return (
    <Section
      id="tutorials"
      index="03"
      title="Python 沙盒与 AI 代码生成"
      summary="内置官方屏幕显示与摄像头预览程序；AI 生成的代码先通过本地静态检查，再上传到 /root/user_latest_code.py 运行。"
      aside={<StatusPill tone="accent">静态检查 + 真机 py_compile</StatusPill>}
    >
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[13px] font-semibold text-ink-soft">官方参考程序</span>
            <span className="font-mono text-[12px] text-ink-dim">
              /root/{activeProgram.filename}
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {MAIXPY_PROGRAMS.map((program) => {
              const active = activeProgram.id === program.id;
              return (
                <button
                  key={program.id}
                  type="button"
                  onClick={() => onSelectProgram(program)}
                  aria-pressed={active}
                  className={cx(
                    'min-h-9 rounded-[var(--radius-control)] border px-3 text-[13px] font-medium transition-colors',
                    active
                      ? 'border-accent bg-accent-soft text-accent'
                      : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:bg-surface-sunken'
                  )}
                >
                  {program.title.split('：')[1] || program.title}
                </button>
              );
            })}
          </div>

          <Panel className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="accent">{activeProgram.badge}</StatusPill>
              <h3 className="text-[15px] font-semibold text-ink">{activeProgram.title}</h3>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft">{activeProgram.desc}</p>
          </Panel>
        </div>

        <Panel className="space-y-3">
          <PanelTitle
            icon={Wand2}
            aside={<span className="text-[12px] text-ink-dim">密钥仅保存在服务端</span>}
          >
            AI 编程助手
          </PanelTitle>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => onAiPromptChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onGenerate(false);
              }}
              aria-label="AI 编程需求"
              placeholder="例如：在屏幕上用中文字体显示“欢迎来到人工智能实验室”和当前时间"
              className={inputStyles}
            />
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => onGenerate(false)}
                disabled={isGeneratingAi}
                className={buttonStyles.primary}
              >
                {isGeneratingAi ? (
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 aria-hidden="true" className="h-4 w-4" />
                )}
                生成代码
              </button>
              <button
                type="button"
                onClick={() => onGenerate(true)}
                disabled={isGeneratingAi || isProgramBusy || !connected}
                title={disconnectedHint}
                className={cx(buttonStyles.base, statusToneClass('ok'))}
              >
                <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                生成并运行
              </button>
            </div>
          </div>

          {lastRunError && (
            <Notice className="flex-col items-stretch gap-2 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[13px] font-semibold">最近一次设备错误</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onRepair(false)}
                    disabled={isGeneratingAi || isProgramBusy}
                    className={buttonStyles.dangerSoft}
                  >
                    AI 修复
                  </button>
                  <button
                    type="button"
                    onClick={() => onRepair(true)}
                    disabled={isGeneratingAi || isProgramBusy || !connected}
                    title={disconnectedHint}
                    className={cx(buttonStyles.base, statusToneClass('ok'))}
                  >
                    AI 修复并运行
                  </button>
                </div>
              </div>
              <pre className="max-h-28 overflow-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed">
                {lastRunError}
              </pre>
            </Notice>
          )}
        </Panel>

        <div className="overflow-hidden rounded-[var(--radius-box)] border border-console-line bg-console">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-console-line bg-console-raised px-3.5 py-2.5">
            <span className="flex items-center gap-2 font-mono text-[12px] font-semibold text-console-text">
              <Code2 aria-hidden="true" className="h-4 w-4 text-console-accent" />
              Python 代码编辑器
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={onRun}
                disabled={isProgramBusy || !connected}
                title={disconnectedHint}
                className={cx(buttonStyles.base, 'border border-ok bg-ok text-white hover:bg-ok-strong')}
              >
                <Play aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                {RUN_LABEL[programState] || '运行'}
              </button>
              <button
                type="button"
                onClick={onStop}
                disabled={!connected || programState === 'deploying' || programState === 'stopping'}
                title={disconnectedHint}
                className={cx(
                  buttonStyles.base,
                  'border border-warn-line bg-warn-soft text-warn hover:bg-warn-hover'
                )}
              >
                <StopCircle aria-hidden="true" className="h-3.5 w-3.5" />
                停止
              </button>
              <button
                type="button"
                onClick={onResetCode}
                disabled={isProgramBusy}
                className={buttonStyles.onDark}
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                重置源码
              </button>
              <button type="button" onClick={onCopyCode} className={buttonStyles.onDark}>
                {copiedCode ? (
                  <>
                    <Check aria-hidden="true" className="h-3.5 w-3.5" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                    复制
                  </>
                )}
              </button>
            </div>
          </div>

          <textarea
            value={editableCode}
            onChange={(e) => onEditCode(e.target.value)}
            spellCheck={false}
            aria-label="Python 代码编辑器"
            className="console-scroll block min-h-[420px] w-full resize-y bg-console-deep p-4 font-mono text-[12px] leading-relaxed text-console-text focus:outline-none"
          />
        </div>
      </div>
    </Section>
  );
}
