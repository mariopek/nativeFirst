import { useState } from 'react';
import type {
  ValidationResult,
  CheckResult,
  CheckCategory,
} from '../../lib/aasa-validator';

const EXAMPLES = [
  { domain: 'linear.app', label: 'Linear' },
  { domain: 'apple.com', label: 'Apple' },
  { domain: 'notion.so', label: 'Notion' },
  { domain: 'spotify.com', label: 'Spotify' },
];

const CATEGORY_LABELS: Record<CheckCategory, string> = {
  network: 'Network & Hosting',
  json: 'JSON',
  applinks: 'Universal Links (applinks)',
  webcredentials: 'Shared Web Credentials',
  appclips: 'App Clips',
};

const CATEGORY_ORDER: CheckCategory[] = [
  'network',
  'json',
  'applinks',
  'webcredentials',
  'appclips',
];

export default function AasaValidator() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!domain.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/aasa-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domain.trim() }),
      });

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error || `Server returned ${res.status}`);
      }

      const data = (await res.json()) as ValidationResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Validation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleExample = (d: string) => {
    setDomain(d);
    setTimeout(() => {
      // Submit with the new domain after state flush
      const form = document.getElementById('aasa-form') as HTMLFormElement | null;
      form?.requestSubmit();
    }, 0);
  };

  const handleCopyJson = async () => {
    if (!result?.prettyJson) return;
    try {
      await navigator.clipboard.writeText(result.prettyJson);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const groupedChecks = result
    ? CATEGORY_ORDER.map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        checks: result.checks.filter((c) => c.category === cat),
      })).filter((g) => g.checks.length > 0)
    : [];

  const counts = result
    ? {
        pass: result.checks.filter((c) => c.status === 'pass').length,
        fail: result.checks.filter((c) => c.status === 'fail').length,
        warn: result.checks.filter((c) => c.status === 'warn').length,
        info: result.checks.filter((c) => c.status === 'info').length,
      }
    : null;

  return (
    <div className="space-y-8">
      {/* ── Form ───────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-surface p-6">
        <form id="aasa-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="domain-input"
              className="block text-sm font-display font-semibold text-white mb-2"
            >
              Enter the domain hosting your AASA file
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pr-2.5 border-r border-border pointer-events-none">
                  <span className="text-text-muted text-sm font-mono select-none">https://</span>
                </div>
                <input
                  id="domain-input"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={loading}
                  className="w-full pl-[88px] pr-3 py-3 rounded-lg bg-bg border border-border text-white text-base font-mono placeholder:text-text-muted/60 focus:outline-none focus:border-accent disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !domain.trim()}
                className="px-6 py-3 rounded-lg gradient-brand text-white font-semibold text-sm hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-transform whitespace-nowrap"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Validating...
                  </span>
                ) : (
                  'Validate AASA'
                )}
              </button>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              We fetch <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-bg border border-border text-white">https://[your-domain]/.well-known/apple-app-site-association</code> server-side and run every check Apple does.
            </p>
          </div>

          <div>
            <p className="text-xs text-text-muted mb-2">Or try a real one:</p>
            <div className="flex flex-wrap gap-1.5">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.domain}
                  type="button"
                  onClick={() => handleExample(ex.domain)}
                  disabled={loading}
                  className="text-xs px-2.5 py-1 rounded-md border border-border bg-bg text-text-muted hover:border-accent/40 hover:text-white transition-colors disabled:opacity-40"
                >
                  {ex.label} <span className="text-text-muted/60 font-mono">→ {ex.domain}</span>
                </button>
              ))}
            </div>
          </div>
        </form>
      </section>

      {/* ── Error ──────────────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
          <h3 className="font-display font-semibold text-red-400 mb-1">Couldn't run validation</h3>
          <p className="text-sm text-text-muted">{error}</p>
        </div>
      )}

      {/* ── Result ─────────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-6">
          {/* Verdict banner */}
          <div
            className={`rounded-2xl border p-6 ${
              result.passed
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-red-500/30 bg-red-500/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  result.passed ? 'bg-emerald-500/20' : 'bg-red-500/20'
                }`}
              >
                {result.passed ? (
                  <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  className={`font-display font-bold text-xl mb-1 ${
                    result.passed ? 'text-emerald-300' : 'text-red-300'
                  }`}
                >
                  {result.passed
                    ? 'Universal Links should work'
                    : "Found issues that will break Universal Links"}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-3">
                  Validated{' '}
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline font-mono text-xs break-all"
                  >
                    {result.url}
                  </a>
                </p>
                {counts && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                      {counts.pass} passed
                    </span>
                    {counts.fail > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-semibold">
                        {counts.fail} failed
                      </span>
                    )}
                    {counts.warn > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold">
                        {counts.warn} warning{counts.warn === 1 ? '' : 's'}
                      </span>
                    )}
                    {counts.info > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent-blue/10 border border-accent-blue/30 text-accent-blue font-semibold">
                        {counts.info} info
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Summary stats */}
            {result.fetchSucceeded && (
              <div className="mt-5 pt-5 border-t border-border/40 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Stat label="App configs" value={result.summary.detailsCount} />
                <Stat label="Total app IDs" value={result.summary.totalAppIDs} />
                <Stat
                  label="Components"
                  value={result.summary.totalComponents}
                  hint="iOS 13+ patterns"
                />
                <Stat
                  label="Legacy paths"
                  value={result.summary.totalPaths}
                  hint="iOS < 13 patterns"
                />
              </div>
            )}
          </div>

          {/* Checks grouped by category */}
          <div className="space-y-5">
            {groupedChecks.map((group) => (
              <section
                key={group.category}
                className="rounded-2xl border border-border bg-surface overflow-hidden"
              >
                <header className="px-5 py-3 border-b border-border bg-bg/50">
                  <h4 className="font-display font-semibold text-white text-sm">
                    {group.label}
                  </h4>
                </header>
                <div className="divide-y divide-border">
                  {group.checks.map((check, i) => (
                    <CheckRow key={i} check={check} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Pretty JSON */}
          {result.prettyJson && (
            <section className="rounded-2xl border border-border bg-surface overflow-hidden">
              <header className="px-5 py-3 border-b border-border bg-bg/50 flex items-center justify-between gap-3">
                <h4 className="font-display font-semibold text-white text-sm">
                  Parsed AASA file
                </h4>
                <button
                  onClick={handleCopyJson}
                  type="button"
                  className="text-xs px-3 py-1 rounded-md border border-border bg-bg text-white hover:border-accent hover:text-accent transition-colors font-semibold"
                >
                  {copyStatus === 'copied' ? '✓ Copied' : copyStatus === 'error' ? 'Failed' : 'Copy JSON'}
                </button>
              </header>
              <pre className="p-5 text-xs font-mono text-text overflow-x-auto leading-relaxed max-h-[500px] overflow-y-auto bg-bg">
                <code>{result.prettyJson}</code>
              </pre>
            </section>
          )}

          <p className="text-[11px] text-text-muted/70 leading-relaxed px-1">
            Validated server-side. We don't log domains or store results — every check runs fresh.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-2xl font-display font-bold text-white">{value}</div>
      <div className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
        {label}
      </div>
      {hint && <div className="text-[10px] text-text-muted/60 mt-0.5">{hint}</div>}
    </div>
  );
}

function CheckRow({ check }: { check: CheckResult }) {
  const styles = {
    pass: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ),
      circle: 'bg-emerald-500/15 text-emerald-400',
      label: 'PASS',
      pillClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    fail: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      circle: 'bg-red-500/15 text-red-400',
      label: 'FAIL',
      pillClass: 'bg-red-500/10 text-red-400 border-red-500/30',
    },
    warn: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.732 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      circle: 'bg-amber-500/15 text-amber-300',
      label: 'WARN',
      pillClass: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    },
    info: {
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
      ),
      circle: 'bg-accent-blue/15 text-accent-blue',
      label: 'INFO',
      pillClass: 'bg-accent-blue/10 text-accent-blue border-accent-blue/30',
    },
  };

  const s = styles[check.status];

  return (
    <div className="px-5 py-4 flex gap-4">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${s.circle}`}
      >
        {s.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded border ${s.pillClass}`}
          >
            {s.label}
          </span>
          <span className="text-sm font-medium text-white">{check.name}</span>
        </div>
        {check.details && (
          <p className="text-xs text-text-muted leading-relaxed mb-1.5 break-words">
            {check.details}
          </p>
        )}
        {check.fix && (
          <div className="text-xs text-text-muted leading-relaxed mt-2 pl-3 border-l-2 border-border">
            <span className="font-semibold text-white">Fix: </span>
            {check.fix}
          </div>
        )}
      </div>
    </div>
  );
}
