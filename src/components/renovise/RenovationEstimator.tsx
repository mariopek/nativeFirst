import { useState, useCallback } from 'react';
import {
  ROOMS, SCOPES, ROOM_KEYS, SCOPE_KEYS,
  calculateEstimate, resolveRegion,
  formatCurrency, formatRange, formatTimeline,
  type RoomKey, type ScopeKey, type EstimateResult,
} from '../../lib/renovise-data';

type Step = 'room' | 'scope' | 'details' | 'results';
const STEPS: Step[] = ['room', 'scope', 'details', 'results'];
const STEP_LABELS = ['Room', 'Scope', 'Details', 'Results'];

export default function RenovationEstimator() {
  const [step, setStep] = useState<Step>('room');
  const [room, setRoom] = useState<RoomKey | null>(null);
  const [scope, setScope] = useState<ScopeKey | null>(null);
  const [sqft, setSqft] = useState<string>('');
  const [zip, setZip] = useState<string>('');
  const [result, setResult] = useState<EstimateResult | null>(null);

  const currentStepIndex = STEPS.indexOf(step);

  const handleRoomSelect = useCallback((key: RoomKey) => {
    setRoom(key);
    setStep('scope');
  }, []);

  const handleScopeSelect = useCallback((key: ScopeKey) => {
    setScope(key);
    setStep('details');
  }, []);

  const handleCalculate = useCallback(() => {
    if (!room || !scope || !sqft) return;
    const sqftNum = parseInt(sqft, 10);
    if (isNaN(sqftNum) || sqftNum <= 0) return;
    const estimate = calculateEstimate(room, scope, sqftNum, zip || undefined);
    setResult(estimate);
    setStep('results');
  }, [room, scope, sqft, zip]);

  const handleStartOver = useCallback(() => {
    setRoom(null);
    setScope(null);
    setSqft('');
    setZip('');
    setResult(null);
    setStep('room');
  }, []);

  const goBack = useCallback(() => {
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  }, [step]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="rounded-2xl border border-[#222] bg-[#111] overflow-hidden">
        {/* US Market Badge + Progress Bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex justify-end mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1a1a1a] border border-[#222] text-[10px] font-semibold text-[#888] uppercase tracking-wider">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              US Market Only
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  i <= currentStepIndex
                    ? 'bg-[#ff6e00] text-white'
                    : 'bg-[#1a1a1a] text-[#888]'
                }`}>
                  {i < currentStepIndex ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors ${
                    i < currentStepIndex ? 'bg-[#ff6e00]' : 'bg-[#222]'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={`text-xs ${i <= currentStepIndex ? 'text-[#e0e0e0]' : 'text-[#888]'}`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="px-6 pb-8">
          {/* Back Button */}
          {step !== 'room' && step !== 'results' && (
            <button
              onClick={goBack}
              className="inline-flex items-center gap-1.5 text-sm text-[#888] hover:text-[#e0e0e0] mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          )}

          {/* Step 1: Room Selection */}
          {step === 'room' && (
            <div>
              <h3 className="font-bold text-xl text-white mb-1" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
                What are you renovating?
              </h3>
              <p className="text-sm text-[#888] mb-6">Select the room or area you want to estimate.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ROOM_KEYS.map((key) => {
                  const r = ROOMS[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handleRoomSelect(key)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-[#222] bg-[#0a0a0a] hover:border-[#ff6e00]/60 hover:bg-[#ff6e00]/5 transition-all duration-200 group"
                    >
                      <span className="text-2xl">{r.icon}</span>
                      <span className="text-sm font-medium text-[#e0e0e0] group-hover:text-white">
                        {r.displayName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Scope Selection */}
          {step === 'scope' && room && (
            <div>
              <h3 className="font-bold text-xl text-white mb-1" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
                What level of renovation?
              </h3>
              <p className="text-sm text-[#888] mb-6">
                Choose the scope for your {ROOMS[room].displayName.toLowerCase()} project.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SCOPE_KEYS.map((key) => {
                  const s = SCOPES[key];
                  return (
                    <button
                      key={key}
                      onClick={() => handleScopeSelect(key)}
                      className="flex flex-col items-start gap-2 p-5 rounded-xl border border-[#222] bg-[#0a0a0a] hover:border-[#ff6e00]/60 hover:bg-[#ff6e00]/5 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{s.icon}</span>
                        <span className="font-semibold text-[#e0e0e0] group-hover:text-white">
                          {s.displayName}
                        </span>
                      </div>
                      <p className="text-xs text-[#888] leading-relaxed">{s.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {s.characteristics.slice(0, 3).map((c) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#888]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 'details' && room && scope && (
            <div>
              <h3 className="font-bold text-xl text-white mb-1" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
                Project details
              </h3>
              <p className="text-sm text-[#888] mb-6">
                {ROOMS[room].displayName} &middot; {SCOPES[scope].displayName}
              </p>

              {/* Square Footage */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#888] mb-2">
                  Square Footage
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={sqft}
                  onChange={(e) => setSqft(e.target.value)}
                  placeholder="Enter square footage"
                  className="w-full px-4 py-3 rounded-xl border border-[#222] bg-[#0a0a0a] text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#ff6e00] focus:border-transparent transition-colors"
                />
                <div className="flex gap-2 mt-3">
                  {(Object.entries(ROOMS[room].defaultSizes) as [string, { sqft: number; label: string }][]).map(([size, preset]) => (
                    <button
                      key={size}
                      onClick={() => setSqft(String(preset.sqft))}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                        sqft === String(preset.sqft)
                          ? 'border-[#ff6e00] bg-[#ff6e00]/10 text-[#ff6e00]'
                          : 'border-[#222] bg-[#0a0a0a] text-[#888] hover:border-[#444] hover:text-[#e0e0e0]'
                      }`}
                    >
                      <div className="font-bold">{size}</div>
                      <div className="text-[10px] opacity-75">{preset.label}</div>
                      <div className="text-[10px] opacity-50">{preset.sqft} sqft</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* ZIP Code */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#888] mb-2">
                  ZIP Code <span className="text-[#555]">(optional — adjusts for local pricing)</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={5}
                  value={zip}
                  onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="e.g. 10001"
                  className="w-full px-4 py-3 rounded-xl border border-[#222] bg-[#0a0a0a] text-white placeholder-[#555] focus:outline-none focus:ring-2 focus:ring-[#ff6e00] focus:border-transparent transition-colors"
                />
                {zip.length >= 3 && (() => {
                  const region = resolveRegion(zip);
                  if (region) {
                    return (
                      <p className="text-xs text-[#888] mt-2">
                        Pricing for <span className="text-[#ff6e00] font-medium">{region.name}</span> — {region.multiplier.toFixed(2)}x national average
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={!sqft || parseInt(sqft, 10) <= 0}
                className="w-full py-4 rounded-xl font-semibold text-white text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundImage: (!sqft || parseInt(sqft, 10) <= 0)
                    ? 'none'
                    : 'linear-gradient(135deg, #ff6e00, #ff8c00)',
                  backgroundColor: (!sqft || parseInt(sqft, 10) <= 0) ? '#222' : undefined,
                }}
              >
                Calculate Estimate
              </button>
            </div>
          )}

          {/* Step 4: Results */}
          {step === 'results' && result && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-xl text-white" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
                    Your Estimate
                  </h3>
                  <p className="text-sm text-[#888]">
                    {ROOMS[result.room].icon} {ROOMS[result.room].displayName} &middot; {SCOPES[result.scope].displayName} &middot; {result.sqft.toLocaleString()} sqft
                    {result.region && <> &middot; {result.region.name}</>}
                  </p>
                </div>
                <button
                  onClick={handleStartOver}
                  className="text-xs text-[#888] hover:text-[#ff6e00] border border-[#222] hover:border-[#ff6e00]/40 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Start Over
                </button>
              </div>

              {/* Cost Tiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <CostTierCard label="Budget" range={result.budget} color="#888" />
                <CostTierCard label="Mid-Range" range={result.midRange} color="#ff6e00" featured />
                <CostTierCard label="Premium" range={result.premium} color="#ffd600" />
              </div>

              {/* Cost Breakdown */}
              <div className="mb-8">
                <h4 className="font-semibold text-sm text-white mb-4" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
                  Cost Breakdown
                </h4>
                <div className="space-y-3">
                  {result.breakdown.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-[#e0e0e0]">{item.label}</span>
                        <span className="text-xs text-[#888]">
                          {item.pct}% &middot; ~{formatCurrency(Math.round(result.midRange.center * item.pct / 100))}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#1a1a1a] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${item.pct}%`,
                            backgroundImage: 'linear-gradient(135deg, #ff6e00, #ff8c00)',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ROI + Timeline + Region */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                <div className="p-4 rounded-xl border border-[#222] bg-[#0a0a0a]">
                  <p className="text-xs text-[#888] mb-1">Resale ROI</p>
                  <p className="text-lg font-bold text-[#00e676]">{result.roi.pct}%</p>
                  <p className="text-[10px] text-[#555] mt-1">{result.roi.source}</p>
                </div>
                <div className="p-4 rounded-xl border border-[#222] bg-[#0a0a0a]">
                  <p className="text-xs text-[#888] mb-1">Timeline</p>
                  <p className="text-lg font-bold text-[#00b0ff]">{formatTimeline(result.timeline)}</p>
                  <p className="text-[10px] text-[#555] mt-1">Typical duration</p>
                </div>
                {result.region && (
                  <div className="p-4 rounded-xl border border-[#222] bg-[#0a0a0a] col-span-2 sm:col-span-1">
                    <p className="text-xs text-[#888] mb-1">Regional Pricing</p>
                    <p className="text-lg font-bold text-[#ff6e00]">{result.region.multiplier.toFixed(2)}x</p>
                    <p className="text-[10px] text-[#555] mt-1">{result.region.name}</p>
                  </div>
                )}
              </div>

              {/* Tips */}
              <div className="mb-8">
                <h4 className="font-semibold text-sm text-white mb-3" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
                  Good to Know
                </h4>
                <div className="space-y-2">
                  {result.tips.slice(0, 3).map((tip) => (
                    <div key={tip} className="flex items-start gap-2 text-xs text-[#888]">
                      <span className="text-[#ff6e00] mt-0.5 flex-shrink-0">*</span>
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* App CTA */}
              <div className="rounded-xl p-6 text-center" style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,110,0,0.1), rgba(255,140,0,0.05))' }}>
                <div className="flex justify-center mb-3">
                  <img
                    src="/images/apps/renovise-icon.svg"
                    alt="Renovise app icon"
                    width="48"
                    height="48"
                    className="w-12 h-12 rounded-xl"
                  />
                </div>
                <h4 className="font-bold text-white mb-1" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
                  Want the full breakdown?
                </h4>
                <p className="text-xs text-[#888] mb-4 max-w-md mx-auto">
                  Renovise gives you detailed materials lists, component-level costs, shopping breakdowns, and contractor comparison tools — all on your iPhone.
                </p>
                <a
                  href="https://apps.apple.com/app/renovise/id6759835211"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white transition-all hover:scale-105"
                  style={{ backgroundImage: 'linear-gradient(135deg, #ff6e00, #ff8c00)' }}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Download on the App Store
                </a>
                <p className="text-[10px] text-[#555] mt-2">Available in the US App Store</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CostTierCard({ label, range, color, featured }: {
  label: string;
  range: { lo: number; hi: number; center: number };
  color: string;
  featured?: boolean;
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      featured
        ? 'border-[#ff6e00]/40 bg-[#ff6e00]/5'
        : 'border-[#222] bg-[#0a0a0a]'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-xs font-medium text-[#888]">{label}</span>
        {featured && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#ff6e00]/20 text-[#ff6e00] font-bold uppercase">Most Common</span>}
      </div>
      <p className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display, system-ui)' }}>
        {formatCurrency(range.center)}
      </p>
      <p className="text-xs text-[#555]">
        {formatRange(range.lo, range.hi)}
      </p>
    </div>
  );
}
