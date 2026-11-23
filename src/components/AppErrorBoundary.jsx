import { Component } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useI18n } from '../lib/i18n.jsx';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ui] section failed', error, errorInfo);
  }

  componentDidUpdate(previousProps) {
    if (
      this.state.error &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex h-full min-h-[260px] flex-col items-center justify-center rounded-[var(--radius-box)] border border-danger-line bg-danger-soft p-6 text-center">
        <AlertTriangle aria-hidden="true" className="h-7 w-7 text-danger" />
        <h2 className="mt-3 text-[16px] font-semibold text-ink">
          {this.props.title}
        </h2>
        <p className="mt-1 max-w-md text-[12px] leading-relaxed text-ink-soft">
          {this.props.message}
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-[var(--radius-control)] bg-accent px-4 text-[12px] font-semibold text-white hover:bg-accent-strong"
        >
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          {this.props.retryLabel}
        </button>
      </div>
    );
  }
}

export default function AppErrorBoundary({ children, resetKey }) {
  const { t } = useI18n();
  return (
    <ErrorBoundary
      resetKey={resetKey}
      title={t('errorBoundary.title')}
      message={t('errorBoundary.message')}
      retryLabel={t('errorBoundary.retry')}
    >
      {children}
    </ErrorBoundary>
  );
}
