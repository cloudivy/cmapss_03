// DriftPanel — KB Comparison Drift Display
// Based on: Rath (2026) "Agent Drift: Quantifying Behavioral Degradation
//           in Multi-Agent LLM Systems Over Extended Interactions"

import { getAllMemory } from '../agents/driftAgent.js'

function MemoryLogPanel() {
  const allMemory = getAllMemory()
  const engines   = Object.keys(allMemory)
  if (engines.length === 0) return null

  const scoreColor = s => s === 0 ? '#3fb950' : s <= 25 ? '#d29922' : s <= 50 ? '#f0883e' : '#f85149'
  const scoreIcon  = s => s === 0 ? '✅' : s <= 25 ? '🟡' : s <= 50 ? '🟠' : '🔴'

  return (
    <div className="memory-log">
      <div className="memory-log-title">🗂️ Memory Log — All Stored Runs</div>
      {engines.map(engineId => (
        <div key={engineId} className="memory-engine-block">
          <div className="memory-engine-header">{engineId}</div>
          {allMemory[engineId].map((run, i) => {
            const ts = run.timestamp ? new Date(run.timestamp).toLocaleString() : `Run ${i + 1}`
            const sr = run.stepResults
            return (
              <div key={i} className="memory-run-row">
                <div className="memory-run-top">
                  <span className="memory-run-ts">{i === 0 ? '🔵 Latest' : ts}</span>
                  <span className="memory-run-score" style={{ color: scoreColor(run.driftScore) }}>
                    {scoreIcon(run.driftScore)} {run.driftScore}/100
                  </span>
                  <span className="memory-run-asi">ASI {run.ASI}</span>
                  <span className="memory-run-verdict" style={{ color: scoreColor(run.driftScore) }}>{run.verdict}</span>
                </div>
                <div className="memory-run-steps">
                  <span className="memory-step">
                    📡 Sensor: {sr?.sensor?.breachedCount ?? '—'} breach(es)
                  </span>
                  <span className="memory-step" style={{ color: scoreColor(sr?.diagnosis?.stepDriftScore ?? 0) }}>
                    🧠 Diag: {sr?.diagnosis?.stepDriftScore ?? '—'}/100
                  </span>
                  <span className="memory-step" style={{ color: scoreColor(sr?.maintenance?.stepDriftScore ?? 0) }}>
                    🔧 Maint: {sr?.maintenance?.stepDriftScore ?? '—'}/100
                  </span>
                </div>
                {sr?.diagnosis?.checks && (
                  <div className="memory-run-checks">
                    {[...(sr.diagnosis.checks || []), ...(sr.maintenance.checks || [])].map(c => (
                      <span key={c.id} className={`memory-check-badge ${c.passed ? 'check-pass' : 'check-fail'}`}
                        title={c.passed ? `${c.id}: OK` : c.explanation}>
                        {c.passed ? '✅' : '❌'} {c.id}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default function DriftPanel({ result, runHistory = [] }) {
  if (!result) return (
    <aside className="drift-panel">
      <div className="drift-title">📊 Drift Validator</div>
      <div className="drift-empty">
        <p>Drift report appears here after analysis.</p>
        <p className="drift-hint">
          Each agent's output is compared directly against the KB (NASA/ISO/FAA).
          No pre-filters — agents respond freely. Drift = deviation from KB ground truth.
        </p>
        <p className="drift-hint">
          ASI Framework (Rath 2026) — 12 dimensions × 4 categories. τ = 0.75 drift threshold.
        </p>
      </div>
      <MemoryLogPanel />
    </aside>
  )

  const scoreColor = result.driftScore === 0   ? '#3fb950'
    : result.driftScore <= 25 ? '#d29922'
    : result.driftScore <= 50 ? '#f0883e'
    : '#f85149'

  const asiColor = result.ASI >= 0.75 ? '#3fb950' : result.ASI >= 0.5 ? '#f0883e' : '#f85149'
  const pct = v => `${Math.round(v * 100)}%`

  // ── Step Timeline ──────────────────────────────────────────────────────────
  function StepTimeline() {
    const steps = [
      { label: '📡 Sensor', key: 'sensor',      score: null,  checks: result.stepResults.sensor.checks },
      { label: '🧠 Diagnosis',  key: 'diagnosis',   score: result.stepResults.diagnosis.stepDriftScore,   verdict: result.stepResults.diagnosis.verdict },
      { label: '🔧 Maintenance', key: 'maintenance', score: result.stepResults.maintenance.stepDriftScore, verdict: result.stepResults.maintenance.verdict },
    ]

    return (
      <div className="step-timeline">
        <div className="step-timeline-title">Step-Level KB Comparison</div>
        {steps.map((s, i) => {
          const breachedCount = s.key === 'sensor' ? result.stepResults.sensor.breachedCount : null
          const drift = s.score
          const col = drift === null ? '#58a6ff'
            : drift === 0   ? '#3fb950'
            : drift <= 34   ? '#d29922'
            : drift <= 67   ? '#f0883e'
            : '#f85149'

          return (
            <div key={s.key} className="step-row">
              <div className="step-connector">{i > 0 && <div className="step-line" />}</div>
              <div className="step-badge" style={{ borderColor: col, color: col }}>
                <span className="step-label">{s.label}</span>
                {drift !== null
                  ? <span className="step-score" style={{ color: col }}>{drift}/100 — {s.verdict}</span>
                  : <span className="step-score" style={{ color: col }}>{breachedCount} KB breach(es) detected</span>
                }
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Explanation Card ───────────────────────────────────────────────────────
  function ExplanationCard({ check }) {
    const col = check.passed ? '#3fb950' : '#f85149'
    return (
      <div className={`exp-card ${check.passed ? 'exp-pass' : 'exp-fail'}`}>
        <div className="exp-card-header">
          <span className="exp-icon">{check.passed ? '✅' : '❌'}</span>
          <span className="exp-id">{check.id}</span>
          <span className="exp-name">{check.name}</span>
          <span className="exp-source">{check.source}</span>
        </div>
        <div className="exp-kb-fact">
          <span className="exp-label">KB says:</span> {check.kbFact}
        </div>
        <div className="exp-agent-claim">
          <span className="exp-label">Agent said:</span> {check.agentClaim}
        </div>
        {!check.passed && (
          <div className="exp-explanation">
            <span className="exp-label">Why this is drift:</span> {check.explanation}
          </div>
        )}
      </div>
    )
  }

  // ── Step Checks Section ────────────────────────────────────────────────────
  function StepChecksSection({ title, stepResult }) {
    if (!stepResult || !stepResult.checks) return null
    return (
      <div className="step-checks-section">
        <div className="step-checks-title">{title}</div>
        {stepResult.checks.map(c => <ExplanationCard key={c.id} check={c} />)}
      </div>
    )
  }

  // ── Dim bar ────────────────────────────────────────────────────────────────
  function DimBar({ label, value, tooltip }) {
    const col = value >= 0.75 ? '#3fb950' : value >= 0.5 ? '#d29922' : '#f85149'
    return (
      <div className="dim-row" title={tooltip}>
        <span className="dim-label">{label}</span>
        <div className="dim-bar-bg">
          <div className="dim-bar-fill" style={{ width: pct(value), background: col }} />
        </div>
        <span className="dim-val" style={{ color: col }}>{pct(value)}</span>
      </div>
    )
  }

  function CategoryBlock({ title, cat, dims }) {
    const catColor = cat.score >= 0.75 ? '#3fb950' : cat.score >= 0.5 ? '#f0883e' : '#f85149'
    return (
      <div className="asi-category">
        <div className="asi-cat-header">
          <span className="asi-cat-title">{title}</span>
          <span className="asi-cat-weight">w={cat.weight}</span>
          <span className="asi-cat-score" style={{ color: catColor }}>{pct(cat.score)}</span>
        </div>
        {dims.map(d => <DimBar key={d.key} label={d.key} value={cat[d.key]} tooltip={d.tooltip} />)}
      </div>
    )
  }

  const { categories: C, driftTypes: DT, stepResults: SR } = result

  // ── Run History ────────────────────────────────────────────────────────────
  function RunHistory() {
    if (!runHistory || runHistory.length === 0) return null
    return (
      <div className="run-history">
        <div className="run-history-title">Run History — {result.engineId}</div>
        <div className="run-history-list">
          {runHistory.map((r, i) => {
            const col = r.driftScore === 0 ? '#3fb950' : r.driftScore <= 25 ? '#d29922' : r.driftScore <= 50 ? '#f0883e' : '#f85149'
            const ts  = r.timestamp ? new Date(r.timestamp).toLocaleTimeString() : `Run ${runHistory.length - i}`
            const trend = i < runHistory.length - 1
              ? r.driftScore < runHistory[i + 1].driftScore ? '↓' : r.driftScore > runHistory[i + 1].driftScore ? '↑' : '→'
              : '—'
            const trendColor = trend === '↓' ? '#3fb950' : trend === '↑' ? '#f85149' : '#8b949e'
            return (
              <div key={i} className="run-history-row">
                <span className="run-ts">{i === 0 ? '🔵 Latest' : ts}</span>
                <span className="run-score" style={{ color: col }}>{r.driftScore}/100</span>
                <span className="run-asi">ASI {r.ASI}</span>
                <span className="run-trend" style={{ color: trendColor }}>{trend}</span>
              </div>
            )
          })}
        </div>
        {runHistory.length >= 2 && (() => {
          const latest   = runHistory[0].driftScore
          const previous = runHistory[1].driftScore
          const delta    = latest - previous
          const trendMsg = delta < 0 ? `↓ Improved by ${Math.abs(delta)} points vs last run`
                         : delta > 0 ? `↑ Increased by ${delta} points vs last run`
                         : '→ No change vs last run'
          const trendCol = delta < 0 ? '#3fb950' : delta > 0 ? '#f85149' : '#8b949e'
          return <div className="run-trend-summary" style={{ color: trendCol }}>{trendMsg}</div>
        })()}
      </div>
    )
  }

  return (
    <aside className="drift-panel">
      <div className="drift-title">📊 Drift Validator</div>
      <div className="drift-engine">{result.engineId}</div>

      {/* ── Drift Score ──────────────────────────────────────────────────── */}
      <div className="drift-score-section">
        <div className="drift-score-label">Overall Drift Score</div>
        <div className="drift-score-val" style={{ color: scoreColor }}>{result.driftScore}/100</div>
        <div className="drift-bar-bg">
          <div className="drift-bar-fill" style={{ width: `${result.driftScore}%`, background: scoreColor }} />
        </div>
        <div className="drift-verdict" style={{ color: scoreColor }}>
          {result.driftScore === 0 ? '✅' : result.driftScore <= 25 ? '🟡' : result.driftScore <= 50 ? '🟠' : '🔴'} {result.verdict}
        </div>
      </div>

      {/* ── ASI Score ────────────────────────────────────────────────────── */}
      <div className="asi-score-section">
        <div className="asi-score-row">
          <span className="asi-score-label">Agent Stability Index</span>
          <span className="asi-score-val" style={{ color: asiColor }}>{result.ASI.toFixed(3)}</span>
        </div>
        <div className="drift-bar-bg">
          <div className="drift-bar-fill" style={{ width: `${result.ASI * 100}%`, background: asiColor }} />
          <div className="asi-threshold-marker" style={{ left: '75%' }} title="Drift threshold τ = 0.75 (Rath 2026)" />
        </div>
        <div className="asi-threshold-label">
          τ = 0.75 {result.ASI < 0.75 ? '⚠️ DRIFT DETECTED' : '✅ STABLE'}
        </div>
      </div>

      {/* ── Drift Type Classification ────────────────────────────────────── */}
      <div className="drift-types-section">
        <div className="drift-types-title">Drift Taxonomy (Rath 2026 §2.3)</div>
        <div className="drift-type-row">
          <span className={`drift-type-badge ${DT.semanticDrift     ? 'drift-active' : 'drift-ok'}`}>{DT.semanticDrift     ? '⚠️' : '✅'} Semantic</span>
          <span className={`drift-type-badge ${DT.coordinationDrift ? 'drift-active' : 'drift-ok'}`}>{DT.coordinationDrift ? '⚠️' : '✅'} Coordination</span>
          <span className={`drift-type-badge ${DT.behavioralDrift   ? 'drift-active' : 'drift-ok'}`}>{DT.behavioralDrift   ? '⚠️' : '✅'} Behavioral</span>
        </div>
      </div>

      {/* ── Step Timeline ────────────────────────────────────────────────── */}
      <StepTimeline />

      {/* ── Per-Step KB Comparison with Explanations ─────────────────────── */}
      <StepChecksSection title="🧠 Diagnosis — KB Comparison" stepResult={SR.diagnosis} />
      <StepChecksSection title="🔧 Maintenance — KB Comparison" stepResult={SR.maintenance} />

      {/* ── 4 ASI Categories / 12 Dimensions ────────────────────────────── */}
      <div className="asi-categories">
        <div className="asi-categories-title">ASI Breakdown — 12 Dimensions</div>
        <CategoryBlock
          title="Response Consistency" cat={C.responseConsistency}
          dims={[
            { key: 'C_sem',  tooltip: 'Semantic vocabulary alignment with KB fault ontology' },
            { key: 'C_path', tooltip: 'Diagnostic pathway: sensor→breach→fault→severity→action' },
            { key: 'C_conf', tooltip: 'Priority calibration vs RUL ground truth' },
          ]}
        />
        <CategoryBlock
          title="Tool Usage Patterns" cat={C.toolUsage}
          dims={[
            { key: 'T_sel',   tooltip: 'Correct procedure selected from KB procedure registry' },
            { key: 'T_seq',   tooltip: 'Procedure steps in KB-defined order' },
            { key: 'T_param', tooltip: 'KB sensor threshold values cited' },
          ]}
        />
        <CategoryBlock
          title="Inter-Agent Coordination" cat={C.interAgentCoord}
          dims={[
            { key: 'I_agree',   tooltip: 'Diagnosis and Maintenance agree on fault mode' },
            { key: 'I_handoff', tooltip: 'Maintenance explicitly references Diagnosis output' },
            { key: 'I_role',    tooltip: 'Each agent stays within defined operational scope' },
          ]}
        />
        <CategoryBlock
          title="Behavioral Boundaries" cat={C.behavioralBoundaries}
          dims={[
            { key: 'B_length', tooltip: 'Output verbosity proportional to fault severity' },
            { key: 'B_error',  tooltip: 'No cross-agent contradictions' },
            { key: 'B_human',  tooltip: 'Human escalation for CRITICAL/HIGH (ISO 13381-1 §6.4)' },
          ]}
        />
      </div>

      {/* ── KB Sensor Threshold Checks ───────────────────────────────────── */}
      <div className="drift-thresholds">
        <div className="drift-thresh-title">KB Sensor Threshold Analysis</div>
        {result.thresholdChecks.map(c => (
          <div key={`${c.fault}-${c.sensor}`} className="drift-thresh-row">
            <span className="drift-thresh-sensor">{c.sensor}</span>
            <span className="drift-thresh-family">{c.fault}</span>
            <span className="drift-thresh-val">{c.value ?? '—'}</span>
            <span className={`drift-thresh-status ${c.breached ? 'triggered' : 'ok'}`}>
              {c.breached ? '⚠️ BREACH' : '✅ OK'}
            </span>
          </div>
        ))}
      </div>

      {/* ── Run History ──────────────────────────────────────────────────── */}
      <RunHistory />

      {/* ── Full Memory Log ──────────────────────────────────────────────── */}
      <MemoryLogPanel />

      <div className="drift-source">
        ASI: Rath (2026) arXiv:2601.04070<br />
        KB: NASA TM-2008-215546 · ISO 13381-1:2015 · SAE JA1012 · FAA AC 43.13-1B
      </div>
    </aside>
  )
}
