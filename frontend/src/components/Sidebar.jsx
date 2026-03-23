export default function Sidebar({ engines, activeEngine, onAnalyse, running }) {
  const levelColor = l => ({ NORMAL: '#3fb950', WARNING: '#d29922', CRITICAL: '#f85149' })[l] || '#8b949e'
  const levelBg    = l => ({ NORMAL: '#0d2818', WARNING: '#2a1f04', CRITICAL: '#2a0d0d' })[l] || '#161b22'

  return (
    <aside className="sidebar">
      <div className="sidebar-title">
        <span>🚀 Fleet Monitor</span>
        <span className="sidebar-sub">NASA CMAPSS FD001</span>
      </div>

      {engines.map(eq => {
        const isActive = activeEngine === eq.id
        const color = levelColor(eq.anomalyLevel)
        const bg    = levelBg(eq.anomalyLevel)
        const rulPct = Math.max(0, Math.min(100, Math.round(eq.rul / 3.6)))

        return (
          <div
            key={eq.id}
            className={`engine-card ${isActive ? 'engine-card-active' : ''}`}
            style={{ borderColor: isActive ? color : 'transparent', background: isActive ? bg : undefined }}
          >
            {/* Card header */}
            <div className="engine-card-header">
              <div>
                <div className="engine-id">{eq.id}</div>
                <div className="engine-name">{eq.name}</div>
              </div>
              <span className="level-badge" style={{ color, borderColor: color }}>
                {eq.anomalyLevel}
              </span>
            </div>

            {/* RUL gauge */}
            <div className="rul-section">
              <div className="rul-label">
                <span>RUL</span>
                <span style={{ color }} className="rul-value">{eq.rul} cycles</span>
              </div>
              <div className="rul-bar-bg">
                <div
                  className="rul-bar-fill"
                  style={{ width: `${rulPct}%`, background: color }}
                />
              </div>
            </div>

            {/* Key sensors */}
            <div className="sensor-grid">
              {['s3', 's7', 's8', 's12'].map(key => {
                const s = eq.sensors[key]
                const sc = levelColor(s.status)
                return (
                  <div key={key} className="sensor-mini">
                    <span className="sensor-mini-key">{key}</span>
                    <span className="sensor-mini-val" style={{ color: sc }}>{s.value}</span>
                    <span className="sensor-mini-unit">{s.unit}</span>
                  </div>
                )
              })}
            </div>

            {/* Fault badge */}
            <div className="fault-row">
              <span className="fault-label">Fault:</span>
              <span className="fault-value" style={{ color }}>
                {eq.faultMode === 'NOMINAL' ? '✅ NOMINAL' : `⚠️ ${eq.faultMode}`}
              </span>
            </div>

            {/* Score bar */}
            <div className="score-row">
              <span className="score-label">Score: {eq.anomalyScore}/100</span>
              <div className="score-bar-bg">
                <div
                  className="score-bar-fill"
                  style={{ width: `${eq.anomalyScore}%`, background: color }}
                />
              </div>
            </div>

            {/* Analyse button */}
            <button
              className="btn-analyse"
              style={{ borderColor: color, color }}
              onClick={() => onAnalyse(eq)}
              disabled={running}
            >
              {running && activeEngine === eq.id ? '⏳ Analysing…' : '▶ Analyse'}
            </button>
          </div>
        )
      })}

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          Source: Saxena et al. 2008<br/>NASA TM-2008-215546
        </div>
      </div>
    </aside>
  )
}
