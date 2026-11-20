import { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly';
import {
  ArrowUpRight,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Code2,
  Copy,
  FolderOpen,
  Loader2,
  Lock,
  Maximize2,
  Pencil,
  Play,
  Redo2,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  StopCircle,
  Terminal,
  Trash2,
  Undo2,
  Usb
} from 'lucide-react';
import {
  MAIX_THEME,
  createStarterWorkspaceState,
} from '../lib/maixBlocks.js';
import { useI18n } from '../lib/i18n.jsx';
import {
  generateMaixcam2Python,
  getMaixcam2CategoryList,
  getMaixcam2SampleGroups,
  getMaixcam2Toolbox,
  initializeMaixcam2Kit,
  loadMaixcam2Sample,
  scanMaixcam2ToolboxDefinitions
} from '../lib/maixcam2Kit.js';
import Maixcam2ExamplesModal from './Maixcam2ExamplesModal.jsx';
import {
  LOG_TONE_CLASS,
  Notice,
  Panel,
  StatusPill,
  buttonStyles,
  cx,
  inputStyles
} from './ui.jsx';

const BLOCKLY_STORAGE_KEY = 'cocopi-blockly-workspace-v1';
const DEFAULT_CONSOLE_HEIGHT = 190;
const TRASH_FLYOUT_WIDTH = 300;
const CATEGORY_SYMBOLS = ['◇', '▦', '↯', '⑂', '＋', 'T', '◎'];
const QUICK_COMMANDS = [
  {
    labelKey: 'blockly.quickLog',
    cmd: "cat /tmp/cocopi_run.log 2>/dev/null || echo '暂无日志'"
  },
  { labelKey: 'blockly.quickRoot', cmd: 'ls -la /root' },
  {
    labelKey: 'blockly.quickProcess',
    cmd: 'ps w | grep python | grep -v grep || true'
  }
];

function readSavedWorkspaceState() {
  try {
    const saved = localStorage.getItem(BLOCKLY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (_) {
    return null;
  }
}

function persistWorkspaceState(workspace) {
  try {
    localStorage.setItem(
      BLOCKLY_STORAGE_KEY,
      JSON.stringify(Blockly.serialization.workspaces.save(workspace))
    );
  } catch (_) {
    // Local persistence is optional and must not block editing.
  }
}

function resetWorkspaceView(workspace) {
  if (!workspace) return;
  Blockly.svgResize(workspace);
  const startScale = workspace.options?.zoomOptions?.startScale;
  if (Number.isFinite(startScale)) workspace.setScale(startScale);
  workspace.scrollCenter();
}

function constrainTrashFlyout(workspace) {
  const flyout = workspace.trashcan?.flyout;
  if (!flyout || flyout.__cocopiConstrainedWidth) return;
  const originalGetFlyoutScale = flyout.getFlyoutScale.bind(flyout);
  flyout.getFlyoutScale = function getConstrainedFlyoutScale() {
    const baseScale = originalGetFlyoutScale();
    const contents = this.getContents?.() || [];
    const widestBlock = contents.reduce(
      (width, item) =>
        Math.max(width, item.getElement().getBoundingRectangle().getWidth()),
      0
    );
    if (!widestBlock) return baseScale;
    const chromeWidth =
      (this.MARGIN || 20) * 1.5 + (this.tabWidth_ || 0) + 15;
    const constrainedScale =
      (TRASH_FLYOUT_WIDTH - chromeWidth) / Math.max(1, widestBlock);
    return Math.max(0.1, Math.min(baseScale, constrainedScale));
  };
  flyout.__cocopiConstrainedWidth = true;
}

export default function BlocklySection({
  id = 'blocks',
  code,
  onCodeChange,
  connStatus,
  deviceInfo,
  isProgramBusy,
  programState,
  aiPrompt,
  onAiPromptChange,
  onAiGenerate,
  onAiGenerateAndRun,
  isGeneratingAi,
  lastRunError,
  onAiRepair,
  onAiRepairAndRun,
  onRunCode,
  onStop,
  onOpenDevice,
  deviceCwd,
  terminalLogs = [],
  terminalContainerRef,
  onClearLogs,
  onQuickCommand,
  replInput,
  onReplInputChange,
  onSendCommand
}) {
  const { language, t } = useI18n();
  const categories = getMaixcam2CategoryList(language);
  const sampleGroups = getMaixcam2SampleGroups();
  const workspaceGridRef = useRef(null);
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const blocklyWorkspaceRef = useRef(null);
  const copiedTimerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const onCodeChangeRef = useRef(onCodeChange);

  const [mode, setMode] = useState('blocks');
  const [codeEditable, setCodeEditable] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [categoryQuery, setCategoryQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [leftWidth, setLeftWidth] = useState(220);
  const [rightWidth, setRightWidth] = useState(390);
  const [consoleHeight, setConsoleHeight] = useState(DEFAULT_CONSOLE_HEIGHT);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const connected = connStatus === 'connected';
  const filteredCategories = categories
    .map((category, index) => ({ ...category, index }))
    .filter((category) =>
      category.name.toLowerCase().includes(categoryQuery.trim().toLowerCase())
    );

  useEffect(() => {
    onCodeChangeRef.current = onCodeChange;
  }, [onCodeChange]);

  const emitWorkspaceCode = (workspace) => {
    const nextCode = generateMaixcam2Python(workspace);
    onCodeChangeRef.current?.(nextCode);
    persistWorkspaceState(workspace);
  };

  const loadStarterProgram = (workspace) => {
    workspace.clear();
    Blockly.serialization.workspaces.load(
      createStarterWorkspaceState(language),
      workspace
    );
    emitWorkspaceCode(workspace);
    requestAnimationFrame(() => resetWorkspaceView(workspace));
  };

  useEffect(() => {
    if (!containerRef.current) return;

    initializeMaixcam2Kit(language);
    const toolbox = getMaixcam2Toolbox(language);
    const definitionScan = scanMaixcam2ToolboxDefinitions();
    if (
      definitionScan.missingBlocks.length ||
      definitionScan.missingGenerators.length
    ) {
      console.error('[MaixCAM2 Block Kit] missing definitions', definitionScan);
    }
    containerRef.current.innerHTML = '';
    const compactViewport = containerRef.current.clientWidth < 640;
    const workspace = Blockly.inject(containerRef.current, {
      toolbox,
      theme: MAIX_THEME,
      renderer: 'zelos',
      sounds: false,
      comments: false,
      collapse: false,
      trashcan: true,
      maxInstances: { maix_on_start: 1 },
      move: {
        scrollbars: false,
        drag: true,
        wheel: false
      },
      grid: {
        spacing: 24,
        length: 3,
        colour: '#dce5f1',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: false,
        startScale: compactViewport ? 0.6 : 0.82,
        maxScale: compactViewport ? 1.1 : 1.25,
        minScale: compactViewport ? 0.35 : 0.5,
        scaleSpeed: 1.1
      },
      media: `${import.meta.env.BASE_URL}blockly-media/`
    });
    blocklyWorkspaceRef.current = workspace;
    constrainTrashFlyout(workspace);
    if (import.meta.env.DEV) {
      window.__COCOPI_BLOCKLY_WORKSPACE__ = workspace;
    }

    try {
      Blockly.serialization.workspaces.load(
        readSavedWorkspaceState() || createStarterWorkspaceState(language),
        workspace
      );
    } catch (_) {
      Blockly.serialization.workspaces.load(
        createStarterWorkspaceState(language),
        workspace
      );
    }
    emitWorkspaceCode(workspace);
    requestAnimationFrame(() => resetWorkspaceView(workspace));

    const refreshCode = (event) => {
      if (event?.isUiEvent) return;
      const type = event?.type || '';
      const shouldRefresh =
        ['create', 'delete', 'change', 'move'].includes(type) ||
        type.startsWith('var_');
      if (!shouldRefresh) return;
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => emitWorkspaceCode(workspace), 120);
    };
    workspace.addChangeListener(refreshCode);

    const resizeObserver = new ResizeObserver(() => Blockly.svgResize(workspace));
    resizeObserver.observe(containerRef.current.parentElement);

    let panState = null;
    const handleWheel = (event) => {
      if (event.target instanceof Element && event.target.closest('.blocklyFlyout')) {
        return;
      }
      event.preventDefault();
      const multiplier =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? 100
            : 1;
      workspace.scroll(
        workspace.scrollX - event.deltaX * multiplier,
        workspace.scrollY - event.deltaY * multiplier
      );
    };
    const handlePointerDown = (event) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return;
      const target = event.target;
      if (!target.closest('.blocklySvg')) return;
      if (target.closest('.blocklyTrash')) {
        workspace.getToolbox()?.clearSelection();
        setActiveCategory(-1);
        return;
      }
      if (
        target.closest(
          '.blocklyFlyout, .blocklyToolboxDiv, .blocklyZoom, .blocklyScrollbar'
        )
      ) {
        return;
      }

      workspace.hideChaff();
      workspace.getToolbox()?.clearSelection();
      setActiveCategory(-1);

      if (target.closest('.blocklyBlockCanvas, .blocklyBubbleCanvas')) return;
      panState = {
        pointerId: event.pointerId,
        clientX: event.clientX,
        clientY: event.clientY,
        scrollX: workspace.scrollX,
        scrollY: workspace.scrollY
      };
      event.preventDefault();
      event.stopPropagation();
    };
    const handlePointerMove = (event) => {
      if (!panState || event.pointerId !== panState.pointerId) return;
      workspace.scroll(
        panState.scrollX - (event.clientX - panState.clientX),
        panState.scrollY - (event.clientY - panState.clientY)
      );
      event.preventDefault();
      event.stopPropagation();
    };
    const handlePointerUp = (event) => {
      if (!panState || event.pointerId !== panState.pointerId) return;
      panState = null;
    };
    containerRef.current.addEventListener('wheel', handleWheel, {
      capture: true,
      passive: false
    });
    containerRef.current.addEventListener('pointerdown', handlePointerDown, true);
    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);

    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      persistWorkspaceState(workspace);
      containerRef.current?.removeEventListener('wheel', handleWheel, true);
      containerRef.current?.removeEventListener(
        'pointerdown',
        handlePointerDown,
        true
      );
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
      resizeObserver.disconnect();
      workspace.removeChangeListener(refreshCode);
      workspace.dispose();
      blocklyWorkspaceRef.current = null;
      if (import.meta.env.DEV) {
        delete window.__COCOPI_BLOCKLY_WORKSPACE__;
      }
    };
  }, [language]);

  const handleClearWorkspace = () => {
    const workspace = blocklyWorkspaceRef.current;
    if (!workspace) return;
    workspace.hideChaff();
    workspace.clear();
    workspace.clearUndo();
    workspace.trashcan?.emptyContents();
    emitWorkspaceCode(workspace);
    setActiveCategory(-1);
    requestAnimationFrame(() => resetWorkspaceView(workspace));
  };

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(code || '')
      .then(() => {
        setCopied(true);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  const handleCategoryClick = (index) => {
    setMode('blocks');
    setActiveCategory(index);
    blocklyWorkspaceRef.current?.getToolbox()?.selectItemByPosition(index);
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    if (nextMode === 'ai') {
      blocklyWorkspaceRef.current?.getToolbox()?.clearSelection();
      blocklyWorkspaceRef.current?.hideChaff();
    } else {
      requestAnimationFrame(() => {
        if (blocklyWorkspaceRef.current) Blockly.svgResize(blocklyWorkspaceRef.current);
      });
    }
  };

  const toggleTerminal = () => {
    setTerminalCollapsed((collapsed) => !collapsed);
    requestAnimationFrame(() => {
      if (blocklyWorkspaceRef.current) {
        Blockly.svgResize(blocklyWorkspaceRef.current);
      }
    });
  };

  const beginHorizontalResize = (side, event) => {
    if (window.innerWidth < 1280) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const grid = workspaceGridRef.current;
    const startRect = grid.getBoundingClientRect();
    const startLeft = leftWidth;
    const startRight = rightWidth;
    let nextValue = side === 'left' ? startLeft : startRight;
    handle.classList.add('dragging');

    const onMove = (moveEvent) => {
      const minCenter = 480;
      if (side === 'left') {
        const maxLeft = Math.max(
          180,
          startRect.width - startRight - minCenter - 16
        );
        nextValue = Math.max(
          180,
          Math.min(maxLeft, moveEvent.clientX - startRect.left)
        );
        grid.style.setProperty('--blockly-left-width', `${nextValue}px`);
      } else {
        const maxRight = Math.max(
          280,
          startRect.width - startLeft - minCenter - 16
        );
        nextValue = Math.max(
          280,
          Math.min(maxRight, startRect.right - moveEvent.clientX)
        );
        grid.style.setProperty('--blockly-right-width', `${nextValue}px`);
      }
    };
    const onUp = () => {
      handle.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (side === 'left') setLeftWidth(nextValue);
      else setRightWidth(nextValue);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const beginConsoleResize = (event) => {
    if (window.innerWidth < 1280) return;
    event.preventDefault();
    const handle = event.currentTarget;
    const startY = event.clientY;
    let nextHeight = consoleHeight;
    handle.classList.add('dragging');
    const onMove = (moveEvent) => {
      const maxHeight = Math.min(260, Math.floor(window.innerHeight * 0.32));
      nextHeight = Math.max(
        84,
        Math.min(maxHeight, consoleHeight - (moveEvent.clientY - startY))
      );
      editorRef.current?.style.setProperty(
        '--blockly-console-height',
        `${nextHeight}px`
      );
    };
    const onUp = () => {
      handle.classList.remove('dragging');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setConsoleHeight(nextHeight);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
  };

  const handleCodeChange = (event) => {
    if (!codeEditable) return;
    onCodeChange?.(event.target.value);
  };

  const handleCodeKeyDown = (event) => {
    if (!codeEditable || event.key !== 'Tab') return;
    event.preventDefault();
    const target = event.currentTarget;
    const start = target.selectionStart;
    const end = target.selectionEnd;
    const next = `${code.slice(0, start)}    ${code.slice(end)}`;
    onCodeChange?.(next);
    requestAnimationFrame(() => {
      target.selectionStart = target.selectionEnd = start + 4;
    });
  };

  const handleLoadSample = async (title, filename) => {
    const workspace = blocklyWorkspaceRef.current;
    if (!workspace) throw new Error('积木工作区尚未初始化');
    const xmlText = await loadMaixcam2Sample(filename);
    const dom = Blockly.utils.xml.textToDom(xmlText);
    workspace.clear();
    Blockly.Xml.domToWorkspace(dom, workspace);
    const blockCount = workspace.getAllBlocks(false).length;
    if (blockCount === 0) {
      throw new Error(`样例「${title}」没有加载出任何积木`);
    }
    workspace.cleanUp();
    emitWorkspaceCode(workspace);
    requestAnimationFrame(() => resetWorkspaceView(workspace));
    setMode('blocks');
  };

  return (
    <div id={id} className="h-full min-h-0 w-full">
      <div
        ref={workspaceGridRef}
        className="blockly-workspace-grid"
        style={{
          '--blockly-left-width': `${leftWidth}px`,
          '--blockly-right-width': `${rightWidth}px`
        }}
      >
        <Panel className="blockly-left-order flex min-h-0 flex-col !p-0">
          <div className="border-b border-line px-3.5 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[14px] font-semibold text-ink">
                {t('blockly.toolbox')}
              </span>
              <button
                type="button"
                onClick={() => setShowExamples(true)}
                className="inline-flex min-h-7 items-center gap-1 rounded-[6px] border border-line bg-surface px-2 text-[11px] font-semibold text-ink-soft hover:bg-surface-sunken"
              >
                <FolderOpen aria-hidden="true" className="h-3.5 w-3.5" />
                {language === 'en' ? 'Examples' : '样例'}
              </button>
            </div>
            <label className="mt-3 flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface-sunken px-2.5 py-2 text-ink-dim">
              <Search aria-hidden="true" className="h-3.5 w-3.5" />
              <input
                value={categoryQuery}
                onChange={(event) => setCategoryQuery(event.target.value)}
                placeholder={t('blockly.search')}
                aria-label={t('blockly.searchAria')}
                className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-ink-dim"
              />
            </label>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
            {filteredCategories.map((category) => (
              <button
                key={category.name}
                type="button"
                onClick={() => handleCategoryClick(category.index)}
                className={cx(
                  'flex min-h-9 w-full items-center gap-2.5 rounded-[7px] px-2.5 text-left text-[12px] font-semibold transition-colors',
                  activeCategory === category.index && mode === 'blocks'
                    ? 'bg-accent-soft text-accent'
                    : 'text-ink-soft hover:bg-surface-sunken hover:text-ink'
                )}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] text-[11px]"
                  style={{
                    color: category.colour || '#2563eb',
                    backgroundColor: `${category.colour || '#2563eb'}14`
                  }}
                >
                  {CATEGORY_SYMBOLS[category.index] || '◇'}
                </span>
                <span className="truncate">{category.name}</span>
                <span className="ml-auto text-line-strong">›</span>
              </button>
            ))}
            {!filteredCategories.length && (
              <p className="px-3 py-8 text-center text-[12px] text-ink-dim">
                {t('blockly.noMatches')}
              </p>
            )}
          </div>
        </Panel>

        <div
          className="blockly-resize-handle"
          onPointerDown={(event) => beginHorizontalResize('left', event)}
          title={t('blockly.dragLeft')}
        />

        <div
          ref={editorRef}
          className="blockly-editor-card blockly-editor-order overflow-hidden rounded-[var(--radius-box)] border border-line bg-surface"
          style={{ '--blockly-console-height': `${consoleHeight}px` }}
        >
          <div className="flex min-h-12 items-center gap-5 border-b border-line px-3.5">
            <button
              type="button"
              onClick={() => handleModeChange('blocks')}
              className={cx(
                'relative inline-flex min-h-12 items-center gap-2 text-[13px] font-bold transition-colors',
                mode === 'blocks'
                  ? 'text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent'
                  : 'text-ink-dim hover:text-ink'
              )}
            >
              <span aria-hidden="true">▦</span>
              {t('blockly.modeBlocks')}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('ai')}
              className={cx(
                'relative inline-flex min-h-12 items-center gap-2 text-[13px] font-bold transition-colors',
                mode === 'ai'
                  ? 'text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent'
                  : 'text-ink-dim hover:text-ink'
              )}
            >
              <Sparkles aria-hidden="true" className="h-4 w-4" />
              {t('blockly.modeAi')}
            </button>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => blocklyWorkspaceRef.current?.undo(false)}
                className="rounded-[6px] border border-line p-2 text-ink-soft hover:bg-surface-sunken"
                aria-label={t('blockly.undo')}
              >
                <Undo2 aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => blocklyWorkspaceRef.current?.undo(true)}
                className="rounded-[6px] border border-line p-2 text-ink-soft hover:bg-surface-sunken"
                aria-label={t('blockly.redo')}
              >
                <Redo2 aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleClearWorkspace}
                disabled={isProgramBusy}
                className="rounded-[6px] border border-line p-2 text-ink-soft hover:bg-surface-sunken"
                aria-label={t('blockly.reset')}
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => workspaceGridRef.current?.requestFullscreen?.()}
                className="rounded-[6px] border border-line p-2 text-ink-soft hover:bg-surface-sunken"
                aria-label={t('blockly.fullscreen')}
              >
                <Maximize2 aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="blockly-canvas-wrap">
            <div ref={containerRef} className="maix-blockly absolute inset-0" />
            {mode === 'ai' && (
              <div className="blockly-ai-overlay">
                <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
                  <Panel className="w-full space-y-4">
                    <div>
                      <h3 className="flex items-center gap-2 text-[20px] font-semibold text-ink">
                        <Sparkles aria-hidden="true" className="h-5 w-5 text-accent" />
                        {t('blockly.aiAssistant')}
                      </h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-ink-dim">
                        {t('blockly.aiHint')}
                      </p>
                    </div>
                    <textarea
                      value={aiPrompt}
                      onChange={(event) => onAiPromptChange(event.target.value)}
                      className={cx(inputStyles, 'min-h-28 resize-y')}
                      placeholder={t('blockly.aiPromptPlaceholder')}
                      aria-label={t('blockly.aiPromptAria')}
                    />
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'blockly.quickFix', prompt: 'blockly.aiRepairPlaceholder' },
                        { label: 'blockly.quickExplain', prompt: 'blockly.aiExplainPlaceholder' },
                        { label: 'blockly.quickTouch', prompt: 'blockly.aiTouchPlaceholder' }
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => onAiPromptChange(t(item.prompt))}
                          className="rounded-full border border-line bg-surface px-3 py-1 text-[11px] font-medium text-ink-soft hover:bg-surface-sunken"
                        >
                          {t(item.label)}
                        </button>
                      ))}
                    </div>
                    {lastRunError && (
                      <Notice className="flex-col items-stretch gap-2">
                        <span className="font-semibold">{t('blockly.lastError')}</span>
                        <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px]">
                          {lastRunError}
                        </pre>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => onAiRepair(false)}
                            disabled={isGeneratingAi || isProgramBusy}
                            className={buttonStyles.dangerSoft}
                          >
                            {t('blockly.aiRepair')}
                          </button>
                          <button
                            type="button"
                            onClick={onAiRepairAndRun}
                            disabled={isGeneratingAi || isProgramBusy || !connected}
                            className={cx(buttonStyles.base, 'border-ok-line bg-ok-soft text-ok')}
                          >
                            {t('blockly.aiRepairRun')}
                          </button>
                        </div>
                      </Notice>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-ink-dim">
                        {t('blockly.aiResultHint')}
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => onAiGenerate(false)}
                          disabled={isGeneratingAi}
                          className={buttonStyles.primary}
                        >
                          {isGeneratingAi ? (
                            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles aria-hidden="true" className="h-4 w-4" />
                          )}
                          {t('blockly.aiGenerate')}
                        </button>
                        <button
                          type="button"
                          onClick={onAiGenerateAndRun}
                          disabled={isGeneratingAi || isProgramBusy || !connected}
                          className={cx(buttonStyles.base, 'border-ok-line bg-ok-soft text-ok')}
                        >
                          <Play aria-hidden="true" className="h-4 w-4 fill-current" />
                          {t('blockly.aiGenerateRun')}
                        </button>
                      </div>
                    </div>
                  </Panel>
                </div>
              </div>
            )}
          </div>

          {!terminalCollapsed && (
            <div
              className="blockly-console-resizer"
              onPointerDown={beginConsoleResize}
              title={t('blockly.dragTerminal')}
            />
          )}
          <div
            id="blockly-terminal"
            className={cx(
              'blockly-console flex flex-col overflow-hidden border-t border-console-line bg-console',
              terminalCollapsed && 'is-collapsed'
            )}
          >
            <div className="flex items-center gap-3 border-b border-console-line bg-console-raised px-3 py-2">
              <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-console-text">
                <Terminal aria-hidden="true" className="h-4 w-4 text-console-accent" />
                {t('blockly.terminal')}
              </span>
              <span className="text-[12px] font-semibold text-console-dim">
                {t('blockly.output')}
              </span>
              <button
                type="button"
                onClick={toggleTerminal}
                aria-expanded={!terminalCollapsed}
                title={
                  terminalCollapsed
                    ? t('blockly.expandTerminal')
                    : t('blockly.collapseTerminal')
                }
                className="ml-auto inline-flex items-center gap-1 text-[11px] text-console-dim hover:text-console-text"
              >
                {terminalCollapsed ? (
                  <ChevronUp aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {terminalCollapsed
                  ? t('blockly.expandTerminal')
                  : t('blockly.collapseTerminal')}
              </button>
              <button
                type="button"
                onClick={onClearLogs}
                className="inline-flex items-center gap-1 text-[11px] text-console-dim hover:text-console-text"
              >
                <Trash2 aria-hidden="true" className="h-3.5 w-3.5" />
                {t('blockly.clear')}
              </button>
            </div>
            {!terminalCollapsed && (
              <>
                <div
                  ref={terminalContainerRef}
                  className="console-scroll min-h-0 flex-1 overflow-y-auto bg-console-deep px-3 py-2 font-mono text-[11px] leading-relaxed"
                  role="log"
                  aria-live="polite"
                >
                  {terminalLogs.length ? (
                    terminalLogs.map((log, index) => (
                      <div key={index} className="break-all">
                        <span className="mr-2 text-console-dim">[{log.time}]</span>
                        <span className={LOG_TONE_CLASS[log.type] || LOG_TONE_CLASS.info}>
                          {log.text}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-console-dim">{t('blockly.noOutput')}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 overflow-x-auto border-t border-console-line bg-console-raised px-3 py-1">
                  {QUICK_COMMANDS.map((quick) => (
                    <button
                      key={quick.labelKey}
                      type="button"
                      onClick={() => onQuickCommand(quick.cmd)}
                      className="min-h-7 shrink-0 rounded-[6px] px-2 text-[11px] text-console-dim hover:bg-console hover:text-console-text"
                    >
                      {t(quick.labelKey)}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    onSendCommand();
                  }}
                  className="flex items-center gap-2 border-t border-console-line bg-console-raised px-3 py-2"
                >
                  <span className="shrink-0 font-mono text-[11px] font-bold text-console-accent">
                    root@cocopi:{deviceCwd}#
                  </span>
                  <input
                    value={replInput}
                    onChange={(event) => onReplInputChange(event.target.value)}
                    placeholder={t('blockly.shellPlaceholder')}
                    aria-label={t('blockly.shellAria')}
                    className="min-w-0 flex-1 bg-transparent font-mono text-[11px] text-console-text outline-none placeholder:text-console-dim"
                  />
                  <button
                    type="submit"
                    aria-label={t('blockly.sendCommand')}
                    className="rounded-[5px] bg-accent p-1.5 text-white"
                  >
                    <Send aria-hidden="true" className="h-3.5 w-3.5" />
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div
          className="blockly-resize-handle"
          onPointerDown={(event) => beginHorizontalResize('right', event)}
          title={t('blockly.dragRight')}
        />

        <div className="blockly-right-order flex min-w-0 flex-col gap-3">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--radius-box)] border border-console-line bg-console">
            <div className="flex min-h-12 items-center justify-between gap-2 border-b border-console-line bg-console-raised px-3">
              <span className="flex items-center gap-2 font-mono text-[12px] font-semibold text-console-text">
                <Code2 aria-hidden="true" className="h-4 w-4 text-console-accent" />
                {t('blockly.pythonSource')}
              </span>
              <button
                type="button"
                onClick={() => setCodeEditable((value) => !value)}
                aria-pressed={codeEditable}
                className="inline-flex items-center gap-2 text-[11px] font-semibold text-console-dim"
              >
                {codeEditable ? (
                  <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <Lock aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {codeEditable ? t('blockly.editable') : t('blockly.readOnly')}
                <span
                  className={cx(
                    'relative h-4 w-8 rounded-full transition-colors',
                    codeEditable ? 'bg-accent' : 'bg-console-line'
                  )}
                >
                  <span
                    className={cx(
                      'absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform',
                      codeEditable ? 'translate-x-[18px]' : 'translate-x-0.5'
                    )}
                  />
                </span>
              </button>
            </div>
            <div className="flex items-center gap-2 border-b border-console-line bg-console px-3 py-1.5">
              <span className="font-mono text-[11px] text-console-dim">main.py · Python 3</span>
              <button
                type="button"
                onClick={handleCopy}
                className="ml-auto inline-flex items-center gap-1 text-[11px] text-console-dim hover:text-console-text"
              >
                {copied ? (
                  <Check aria-hidden="true" className="h-3.5 w-3.5" />
                ) : (
                  <Copy aria-hidden="true" className="h-3.5 w-3.5" />
                )}
                {copied ? t('blockly.copied') : t('blockly.copy')}
              </button>
              <button
                type="button"
                onClick={() => onRunCode(code)}
                disabled={!connected || isProgramBusy || !(code || '').trim()}
                className={cx(
                  buttonStyles.base,
                  'min-h-7 border border-ok bg-ok px-2 text-white hover:bg-ok-strong'
                )}
              >
                <Play aria-hidden="true" className="h-3.5 w-3.5 fill-current" />
                {programState === 'deploying'
                  ? t('blockly.running')
                  : t('actions.run')}
              </button>
              <button
                type="button"
                onClick={onStop}
                disabled={
                  !connected ||
                  programState === 'deploying' ||
                  programState === 'stopping'
                }
                className={cx(buttonStyles.onDark, 'min-h-7 px-2')}
              >
                <StopCircle aria-hidden="true" className="h-3.5 w-3.5" />
                {t('blockly.stop')}
              </button>
            </div>
            <textarea
              value={code || ''}
              onChange={handleCodeChange}
              onKeyDown={handleCodeKeyDown}
              readOnly={!codeEditable}
              spellCheck={false}
              aria-label={t('blockly.pythonSource')}
              aria-readonly={!codeEditable}
              className="blockly-python-area console-scroll min-h-0 flex-1 resize-none bg-console-deep p-3 font-mono text-[11px] leading-relaxed text-console-text outline-none read-only:cursor-default"
              placeholder={t('blockly.codePlaceholder')}
            />
            <div className="flex items-center justify-between border-t border-console-line bg-console-raised px-3 py-2 text-[11px] text-console-dim">
              <span>Blockly Python Generator</span>
              <span>{t('blockly.synced')} ›</span>
            </div>
          </div>

          <Panel className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                <Usb aria-hidden="true" className="h-4 w-4 text-accent" />
                {t('blockly.deviceConnection')}
              </span>
              <StatusPill tone={connected ? 'ok' : 'neutral'}>
                {connected ? t('blockly.connected') : t('blockly.disconnected')}
              </StatusPill>
            </div>
            <div className="rounded-[var(--radius-control)] border border-line bg-surface-sunken px-3 py-2.5">
              <p className="truncate text-[13px] font-semibold text-ink">
                {connected ? deviceInfo?.portName || 'MaixCAM2' : 'MaixCAM2'}
              </p>
              <p className="mt-0.5 text-[11px] text-ink-dim">
                {connected
                  ? t('blockly.connectionHint')
                  : t('blockly.connectFirst')}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenDevice}
              className={cx(buttonStyles.secondary, 'w-full')}
            >
              {t('blockly.manage')}
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </Panel>
        </div>
      </div>
      <Maixcam2ExamplesModal
        open={showExamples}
        groups={sampleGroups}
        onClose={() => setShowExamples(false)}
        onSelect={handleLoadSample}
      />
    </div>
  );
}
