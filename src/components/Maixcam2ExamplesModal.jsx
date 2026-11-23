import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronRight,
  FileCode2,
  FolderOpen,
  Search,
  X
} from 'lucide-react';
import { useI18n } from '../lib/i18n.jsx';
import {
  translateSampleGroup,
  translateSampleTitle
} from '../data/sampleI18n.js';
import { StatusPill, cx, inputStyles } from './ui.jsx';

export default function Maixcam2ExamplesModal({
  open,
  groups,
  onClose,
  onSelect
}) {
  const { language, t } = useI18n();
  const closeRef = useRef(null);
  const [activeGroup, setActiveGroup] = useState(0);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setError('');
      setLoading('');
    }
  }, [open]);

  const visibleGroups = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return groups.map((group, index) => {
      const title = translateSampleGroup(group.title, language);
      const items = group.items.map(([itemTitle, filename]) => [
        itemTitle,
        filename,
        translateSampleTitle(itemTitle, language)
      ]);
      return {
        ...group,
        title,
        index,
        items: keyword
          ? items.filter(([itemTitle, filename, localizedTitle]) =>
              `${itemTitle} ${localizedTitle} ${filename}`
                .toLowerCase()
                .includes(keyword)
            )
          : items
      };
    });
  }, [groups, language, query]);

  if (!open) return null;
  const current =
    visibleGroups.find((group) => group.index === activeGroup) ||
    visibleGroups.find((group) => group.items.length) ||
    visibleGroups[0];

  const handleSelect = async (title, filename) => {
    setLoading(filename);
    setError('');
    try {
      await onSelect(title, filename);
      onClose();
    } catch (selectError) {
      setError(selectError.message || String(selectError));
    } finally {
      setLoading('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-3 backdrop-blur-[2px] sm:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="maixcam2-examples-title"
        className="flex h-[min(720px,88vh)] w-full max-w-4xl flex-col overflow-hidden rounded-[var(--radius-box)] border border-line bg-surface shadow-[0_20px_60px_rgba(22,44,80,0.24)]"
      >
        <header className="flex min-h-16 items-center justify-between gap-4 border-b border-line px-5">
          <div>
            <h2
              id="maixcam2-examples-title"
              className="text-[18px] font-semibold text-ink"
            >
              {t('samples.title')}
            </h2>
            <p className="mt-0.5 text-[12px] text-ink-dim">
              {t('samples.hint')}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t('samples.close')}
            className="rounded-[6px] p-2 text-ink-dim hover:bg-surface-sunken hover:text-ink"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[210px_1fr]">
          <aside className="min-h-0 overflow-y-auto border-b border-line bg-surface-sunken p-3 md:border-b-0 md:border-r">
            <div className="mb-3 flex items-center gap-2">
              <Search aria-hidden="true" className="h-4 w-4 text-ink-dim" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('samples.search')}
                aria-label={t('samples.searchAria')}
                className={cx(inputStyles, 'py-1.5 text-[13px]')}
              />
            </div>
            <div className="flex gap-1 overflow-x-auto md:block md:space-y-1">
              {visibleGroups.map((group) => {
                const selected = current?.index === group.index;
                return (
                  <button
                    key={group.title}
                    type="button"
                    onClick={() => setActiveGroup(group.index)}
                    className={cx(
                      'flex min-h-9 shrink-0 items-center gap-2 rounded-[6px] px-2.5 text-left text-[12px] font-semibold transition-colors md:w-full',
                      selected
                        ? 'bg-surface text-accent shadow-[0_1px_2px_rgba(31,35,40,0.08)]'
                        : 'text-ink-soft hover:bg-surface'
                    )}
                  >
                    <FolderOpen aria-hidden="true" className="h-4 w-4" />
                    <span className="truncate">{group.title}</span>
                    <span className="ml-auto text-[10px] text-ink-dim">
                      {group.items.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
            {error && (
              <div className="mb-3 rounded-[8px] border border-danger-line bg-danger-soft px-3 py-2 text-[12px] text-danger">
                {error}
              </div>
            )}
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-[15px] font-semibold text-ink">
                {current?.title || t('samples.title')}
              </h3>
              <StatusPill tone="accent">
                {t('samples.count', { count: current?.items.length || 0 })}
              </StatusPill>
            </div>
            <div className="space-y-2">
              {current?.items.map(([title, filename, localizedTitle]) => (
                <button
                  key={filename}
                  type="button"
                  disabled={Boolean(loading)}
                  onClick={() => handleSelect(title, filename)}
                  className="flex w-full items-center gap-3 rounded-[8px] border border-line bg-surface px-3.5 py-3 text-left transition-colors hover:border-accent-line hover:bg-accent-soft disabled:cursor-wait disabled:opacity-60"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-surface-sunken text-accent">
                    <FileCode2 aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                      {loading === filename
                        ? t('samples.loading')
                        : localizedTitle}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[10px] text-ink-dim">
                      samples/{filename}
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-ink-dim"
                  />
                </button>
              ))}
              {!current?.items.length && (
                <p className="py-12 text-center text-[13px] text-ink-dim">
                  {t('samples.noMatches')}
                </p>
              )}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-line px-5 py-3 text-[11px] text-ink-dim">
          <span>MaixPy 4.12.5 · MaixCAM2</span>
          <span>{t('samples.localLibrary')}</span>
        </footer>
      </section>
    </div>
  );
}
