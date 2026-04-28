import { useState, useMemo } from 'react';
import {
  REQUIRED_REASON_CATEGORIES,
  COMMON_TRACKING_DOMAINS,
} from '../../lib/privacy-manifest-data';

/**
 * Privacy Manifest Generator
 *
 * Builds a valid PrivacyInfo.xcprivacy file for iOS apps.
 * Covers Required Reasons APIs (5 categories) + Tracking flag + Tracking Domains.
 *
 * NSPrivacyCollectedDataTypes (the App Store nutrition labels) is intentionally
 * out of scope for v1 — Apple already provides a wizard for that in App Store
 * Connect, and indie devs rarely need it in the manifest itself.
 */

type SelectedReasons = Record<string, Set<string>>;

export default function PrivacyManifestGenerator() {
  // Required Reasons APIs — map of category constant → set of selected reason codes
  const [selected, setSelected] = useState<SelectedReasons>({});
  // Tracking flag
  const [tracking, setTracking] = useState(false);
  // Tracking domains (when tracking = true)
  const [trackingDomains, setTrackingDomains] = useState<string[]>([]);
  const [domainInput, setDomainInput] = useState('');
  // Which categories are expanded in the accordion
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(REQUIRED_REASON_CATEGORIES.filter((c) => c.veryCommon).map((c) => c.category))
  );

  // UI feedback
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'downloaded'>('idle');

  // ── Toggle handlers ────────────────────────────────────────────────
  const toggleReason = (category: string, code: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      const codes = new Set(next[category] || []);
      if (codes.has(code)) codes.delete(code);
      else codes.add(code);
      if (codes.size === 0) delete next[category];
      else next[category] = codes;
      return next;
    });
  };

  const toggleCategory = (category: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const addTrackingDomain = () => {
    const value = domainInput.trim().toLowerCase();
    if (!value) return;
    if (trackingDomains.includes(value)) {
      setDomainInput('');
      return;
    }
    setTrackingDomains([...trackingDomains, value]);
    setDomainInput('');
  };

  const removeTrackingDomain = (domain: string) => {
    setTrackingDomains(trackingDomains.filter((d) => d !== domain));
  };

  const addSuggestedDomain = (domain: string) => {
    if (trackingDomains.includes(domain)) return;
    setTrackingDomains([...trackingDomains, domain]);
  };

  // ── XML Generation ─────────────────────────────────────────────────
  const xml = useMemo(() => {
    const lines: string[] = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push(
      '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">'
    );
    lines.push('<plist version="1.0">');
    lines.push('<dict>');

    // NSPrivacyTracking
    lines.push('\t<key>NSPrivacyTracking</key>');
    lines.push(tracking ? '\t<true/>' : '\t<false/>');

    // NSPrivacyTrackingDomains
    lines.push('\t<key>NSPrivacyTrackingDomains</key>');
    if (trackingDomains.length === 0) {
      lines.push('\t<array/>');
    } else {
      lines.push('\t<array>');
      for (const d of trackingDomains) {
        lines.push(`\t\t<string>${escapeXml(d)}</string>`);
      }
      lines.push('\t</array>');
    }

    // NSPrivacyCollectedDataTypes — empty (out of scope for v1, but key required)
    lines.push('\t<key>NSPrivacyCollectedDataTypes</key>');
    lines.push('\t<array/>');

    // NSPrivacyAccessedAPITypes
    lines.push('\t<key>NSPrivacyAccessedAPITypes</key>');
    const selectedCategories = Object.entries(selected).filter(
      ([, codes]) => codes.size > 0
    );
    if (selectedCategories.length === 0) {
      lines.push('\t<array/>');
    } else {
      lines.push('\t<array>');
      for (const [category, codes] of selectedCategories) {
        lines.push('\t\t<dict>');
        lines.push('\t\t\t<key>NSPrivacyAccessedAPIType</key>');
        lines.push(`\t\t\t<string>${category}</string>`);
        lines.push('\t\t\t<key>NSPrivacyAccessedAPITypeReasons</key>');
        lines.push('\t\t\t<array>');
        for (const code of Array.from(codes).sort()) {
          lines.push(`\t\t\t\t<string>${code}</string>`);
        }
        lines.push('\t\t\t</array>');
        lines.push('\t\t</dict>');
      }
      lines.push('\t</array>');
    }

    lines.push('</dict>');
    lines.push('</plist>');
    return lines.join('\n');
  }, [selected, tracking, trackingDomains]);

  // ── Copy / Download ────────────────────────────────────────────────
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(xml);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'PrivacyInfo.xcprivacy';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadStatus('downloaded');
    setTimeout(() => setDownloadStatus('idle'), 2000);
  };

  // ── Summary stats ──────────────────────────────────────────────────
  const totalSelectedReasons = Object.values(selected).reduce(
    (sum, codes) => sum + codes.size,
    0
  );

  return (
    <div className="grid lg:grid-cols-[1fr,minmax(0,1fr)] gap-8 lg:gap-10">
      {/* ── LEFT: form ─────────────────────────────────────────────── */}
      <div className="space-y-8">
        {/* Tracking section */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <header className="mb-5">
            <h3 className="font-display font-bold text-lg text-white mb-1">
              Tracking
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Does your app use data for tracking (linking to other apps, ad networks, identifiers)?
              <strong className="text-white"> If you ship to consumer App Store and have any ads or attribution SDKs, the answer is usually yes.</strong> Indie utility apps with no ads → no.
            </p>
          </header>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={tracking}
              onChange={(e) => setTracking(e.target.checked)}
              className="w-5 h-5 rounded border-border bg-bg text-accent focus:ring-2 focus:ring-accent/40 cursor-pointer"
            />
            <span className="text-sm text-white">
              <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-bg border border-border">NSPrivacyTracking</code>
              {' '}— My app tracks users across other apps or websites
            </span>
          </label>

          {tracking && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="font-display font-semibold text-white text-sm mb-2">
                Tracking domains
              </h4>
              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Domains your app sends tracking data to. Add the SDK domains you actually use — wrong list = App Review rejection.
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTrackingDomain();
                    }
                  }}
                  placeholder="e.g. analytics.example.com"
                  className="flex-1 px-3 py-2 rounded-lg bg-bg border border-border text-sm text-white placeholder:text-text-muted/60 focus:outline-none focus:border-accent"
                />
                <button
                  onClick={addTrackingDomain}
                  type="button"
                  className="px-4 py-2 rounded-lg gradient-brand text-white text-sm font-semibold hover:scale-105 transition-transform"
                >
                  Add
                </button>
              </div>

              {trackingDomains.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {trackingDomains.map((d) => (
                    <span
                      key={d}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-accent/10 border border-accent/30 text-xs text-accent font-mono"
                    >
                      {d}
                      <button
                        onClick={() => removeTrackingDomain(d)}
                        type="button"
                        className="hover:text-white"
                        aria-label={`Remove ${d}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-xs text-text-muted mb-2">Quick-add common SDKs:</p>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TRACKING_DOMAINS.map(({ domain, label }) => (
                  <button
                    key={domain}
                    onClick={() => addSuggestedDomain(domain)}
                    type="button"
                    disabled={trackingDomains.includes(domain)}
                    className="text-[11px] px-2 py-1 rounded-md border border-border bg-bg text-text-muted hover:border-accent/40 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title={label}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Required Reasons APIs section */}
        <section className="rounded-2xl border border-border bg-surface p-6">
          <header className="mb-5">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-1">
              <h3 className="font-display font-bold text-lg text-white">
                Required Reasons APIs
              </h3>
              {totalSelectedReasons > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30 font-semibold">
                  {totalSelectedReasons} reason{totalSelectedReasons === 1 ? '' : 's'} selected
                </span>
              )}
            </div>
            <p className="text-sm text-text-muted leading-relaxed">
              For each Apple framework API your app touches, declare why. Skip even one and App Review bounces you.
              <strong className="text-white"> User Defaults and File Timestamp apply to almost every app — start there.</strong>
            </p>
          </header>

          <div className="space-y-3">
            {REQUIRED_REASON_CATEGORIES.map((cat) => {
              const isOpen = expanded.has(cat.category);
              const count = selected[cat.category]?.size ?? 0;
              return (
                <div
                  key={cat.category}
                  className="rounded-xl border border-border bg-bg overflow-hidden"
                >
                  <button
                    onClick={() => toggleCategory(cat.category)}
                    type="button"
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-surface-2 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-display font-semibold text-white text-sm">
                          {cat.label}
                        </span>
                        {cat.veryCommon && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold uppercase tracking-wider">
                            Very common
                          </span>
                        )}
                        {count > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/30 font-semibold">
                            {count} selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed line-clamp-1">
                        {cat.description}
                      </p>
                    </div>
                    <svg
                      className={`w-4 h-4 text-text-muted flex-shrink-0 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 border-t border-border bg-bg/50">
                      <div className="mb-4 pt-3 text-xs text-text-muted leading-relaxed">
                        <span className="font-semibold text-white">When you need this: </span>
                        {cat.whenYouNeed}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {cat.apis.map((api) => (
                            <code
                              key={api}
                              className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-bg border border-border text-text-muted"
                            >
                              {api}
                            </code>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        {cat.reasons.map((reason) => {
                          const isSelected = selected[cat.category]?.has(reason.code) ?? false;
                          return (
                            <label
                              key={reason.code}
                              className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected
                                  ? 'border-accent/50 bg-accent/5'
                                  : 'border-border bg-bg hover:border-border/60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleReason(cat.category, reason.code)}
                                className="w-4 h-4 rounded border-border bg-bg text-accent focus:ring-2 focus:ring-accent/40 cursor-pointer mt-0.5 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <code className="font-mono text-xs font-bold text-accent">
                                    {reason.code}
                                  </code>
                                  <span className="text-sm text-white">{reason.description}</span>
                                </div>
                                <p className="text-xs text-text-muted leading-relaxed">
                                  <span className="font-semibold">Example:</span> {reason.example}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── RIGHT: live XML preview (sticky on desktop) ────────────── */}
      <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
        <div className="rounded-2xl border border-border bg-surface overflow-hidden">
          <header className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display font-bold text-white text-sm">
                PrivacyInfo.xcprivacy
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Live preview · valid plist XML
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                type="button"
                className="text-xs px-3 py-1.5 rounded-md border border-border bg-bg text-white hover:border-accent hover:text-accent transition-colors font-semibold"
              >
                {copyStatus === 'copied' ? '✓ Copied' : copyStatus === 'error' ? 'Failed' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                type="button"
                className="text-xs px-3 py-1.5 rounded-md gradient-brand text-white font-semibold hover:scale-105 transition-transform"
              >
                {downloadStatus === 'downloaded' ? '✓ Downloaded' : 'Download'}
              </button>
            </div>
          </header>
          <pre className="p-5 text-xs font-mono text-text overflow-x-auto leading-relaxed max-h-[600px] overflow-y-auto bg-bg">
            <code>{xml}</code>
          </pre>
        </div>

        {/* Where to put it */}
        <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-surface to-accent/5 p-5">
          <h4 className="font-display font-bold text-white text-sm mb-2 flex items-center gap-2">
            <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Where to put this
          </h4>
          <ol className="text-xs text-text-muted space-y-2 leading-relaxed list-decimal list-inside">
            <li>Save the file as <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-bg border border-border text-white">PrivacyInfo.xcprivacy</code></li>
            <li>In Xcode, drag it into your <strong className="text-white">app target's main folder</strong> (not a subfolder of your code)</li>
            <li>When prompted, ✓ check <strong className="text-white">"Copy items if needed"</strong> and ✓ your app target under "Add to targets"</li>
            <li>Build &amp; archive — the manifest gets bundled into your <code className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-bg border border-border text-white">.ipa</code> automatically</li>
            <li>If you have SPM dependencies that ship their own privacy manifests, Xcode merges them — no action needed</li>
          </ol>
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-text-muted/70 leading-relaxed px-1">
          Generated client-side, nothing leaves your browser. This tool covers Required Reasons APIs and Tracking — for the full <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-bg border border-border">NSPrivacyCollectedDataTypes</code> (App Store nutrition labels), use Apple's wizard inside App Store Connect.
        </p>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
