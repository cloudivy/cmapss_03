// Sensor Agent — pure JS, no API call needed
// Generates structured sensor report from real CMAPSS engine data

export function generateSensorReport(engine) {
  const { id, name, cycle, rul, faultMode, sensors } = engine

  const statusIcon = s => ({ NORMAL: '✅', WARNING: '⚠️', CRITICAL: '🔴' })[s] || '❓'

  const rows = Object.entries(sensors).map(([key, s]) =>
    `| ${key.padEnd(4)} | ${s.label.padEnd(26)} | ${String(s.value).padEnd(10)} | ${s.unit.padEnd(9)} | ${statusIcon(s.status)} ${s.status} |`
  ).join('\n')

  // Fault checks
  const s = sensors
  const hpcChecks = [
    { cond: s.s3.value > 1592.0, msg: `s3 HPC temp ${s.s3.value} °R > 1592.0 °R ⚠️` },
    { cond: s.s4.value > 1415.0, msg: `s4 LPT temp ${s.s4.value} °R > 1415.0 °R ⚠️` },
    { cond: s.s7.value < 549.0,  msg: `s7 HPC pressure ${s.s7.value} psia < 549.0 psia ⚠️` },
    { cond: s.s11.value < 47.0,  msg: `s11 static pressure ${s.s11.value} psia < 47.0 psia ⚠️` },
    { cond: s.s12.value > 524.0, msg: `s12 fuel flow ${s.s12.value} > 524.0 pps/psia ⚠️` },
  ]
  const fanChecks = [
    { cond: s.s8.value < 2385.0,  msg: `s8 fan speed ${s.s8.value} rpm < 2385.0 rpm ⚠️` },
    { cond: s.s13.value < 2387.0, msg: `s13 corr. fan speed ${s.s13.value} rpm < 2387.0 rpm ⚠️` },
    { cond: s.s15.value < 8.40,   msg: `s15 bypass ratio ${s.s15.value} < 8.40 ⚠️` },
  ]

  const hpcTriggered = hpcChecks.filter(c => c.cond)
  const fanTriggered = fanChecks.filter(c => c.cond)

  const rulStatus = rul < 10 ? '🔴 CRITICAL' : rul < 30 ? '🔴 HIGH' : rul < 100 ? '⚠️ MEDIUM' : '✅ LOW'

  return `## Sensor Monitor Report — ${name} (${id})

**Dataset:** NASA CMAPSS FD001 | **Cycle:** ${cycle} | **RUL:** ${rul} cycles | **Priority:** ${rulStatus}

### Sensor Readings
| Sensor | Description                | Value      | Unit      | Status |
|--------|----------------------------|------------|-----------|--------|
${rows}

### HPC Degradation Checks (FD001 fault mode)
${hpcTriggered.length > 0
  ? hpcTriggered.map(c => `- 🔴 ${c.msg}`).join('\n')
  : '- ✅ All HPC sensors within normal range'}

### Fan Degradation Checks
${fanTriggered.length > 0
  ? fanTriggered.map(c => `- 🔴 ${c.msg}`).join('\n')
  : '- ✅ All fan sensors within normal range'}

### Active Fault Mode: **${faultMode}**
### Anomaly Score: **${engine.anomalyScore}/100** [${engine.anomalyLevel}]

*Source: Saxena et al. 2008 — NASA TM-2008-215546*`
}
