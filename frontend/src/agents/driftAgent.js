// Drift Validator — Knowledge Base Comparison Framework
// Based on: Rath (2026) "Agent Drift: Quantifying Behavioral Degradation
//           in Multi-Agent LLM Systems Over Extended Interactions"
//
// DESIGN PRINCIPLE:
//   Agent outputs are compared DIRECTLY against KB ground truth.
//   No pre-filters in system prompts — agents respond freely.
//   All comparison criteria derive from KB data structures below.
//
// ASI = 0.30·ResponseConsistency + 0.25·ToolUsage + 0.25·InterAgentCoord + 0.20·BehavioralBoundaries
// Drift detected when ASI < 0.75  (threshold τ, Rath 2026 §2.2)

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE BASE — Single source of truth for ALL comparisons
// Agent output detection terms are derived FROM KB vocabulary, not separate lists.
// ═══════════════════════════════════════════════════════════════════════════════

export const KB = {

  // Source: NASA TM-2008-215546 (Saxena et al. 2008), ISO 13379-1, AGARD-R-785
  faultThresholds: {
    HPC_DEG: {
      s3:  { op: '>',  value: 1592.0, label: 'HPC Outlet Temp',     unit: '°R',       standard: 'NASA TM-2008-215546' },
      s4:  { op: '>',  value: 1415.0, label: 'LPT Outlet Temp',     unit: '°R',       standard: 'NASA TM-2008-215546' },
      s7:  { op: '<',  value: 549.0,  label: 'HPC Outlet Pressure', unit: 'psia',     standard: 'ISO 13379-1'         },
      s11: { op: '<',  value: 47.0,   label: 'HPC Static Pressure', unit: 'psia',     standard: 'ISO 13379-1'         },
      s12: { op: '>',  value: 524.0,  label: 'Fuel Flow Ratio',     unit: 'pps/psia', standard: 'NASA TM-2008-215546' },
    },
    FAN_DEG: {
      s8:  { op: '<', value: 2385.0, label: 'Physical Fan Speed',  unit: 'rpm', standard: 'AGARD-R-785' },
      s13: { op: '<', value: 2388.0, label: 'Corrected Fan Speed', unit: 'rpm', standard: 'AGARD-R-785' },
      s15: { op: '<', value: 8.40,   label: 'Bypass Ratio',        unit: '–',   standard: 'AGARD-R-785' },
    },
  },

  // Source: ISO 13381-1:2015, SAE JA1012
  rulPriority: [
    { max: 10,       priority: 'CRITICAL', action: 'Immediate grounding',    standard: 'ISO 13381-1:2015' },
    { max: 30,       priority: 'HIGH',     action: 'Ground within 48 hours', standard: 'ISO 13381-1:2015' },
    { max: 100,      priority: 'MEDIUM',   action: 'Schedule within 7 days', standard: 'SAE JA1012'       },
    { max: Infinity, priority: 'LOW',      action: 'Routine monitoring',     standard: 'SAE JA1012'       },
  ],

  // Source: cmapss_scheduling_001, cmapss_equip_registry_001
  procedures: {
    HPC_DEG_CRITICAL: { id: 'cmapss_proc_borescope_001',       name: 'HPC Borescope Inspection', standard: 'FAA AC 43.13-1B', detect: ['borescope'] },
    HPC_DEG_HIGH:     { id: 'cmapss_proc_borescope_001',       name: 'HPC Borescope Inspection', standard: 'FAA AC 43.13-1B', detect: ['borescope'] },
    HPC_DEG_MEDIUM:   { id: 'cmapss_proc_compressor_wash_001', name: 'Compressor Wash',          standard: 'GE Aviation MM',  detect: ['compressor wash', 'wash'] },
    HPC_DEG_LOW:      { id: 'cmapss_proc_compressor_wash_001', name: 'Compressor Wash',          standard: 'GE Aviation MM',  detect: ['compressor wash', 'wash'] },
    FAN_DEG_CRITICAL: { id: 'cmapss_proc_fan_inspection_001',  name: 'Fan Blade Inspection',     standard: 'AGARD-R-785',     detect: ['fan inspection', 'fan blade'] },
    FAN_DEG_HIGH:     { id: 'cmapss_proc_fan_inspection_001',  name: 'Fan Blade Inspection',     standard: 'AGARD-R-785',     detect: ['fan inspection', 'fan blade'] },
    FAN_DEG_MEDIUM:   { id: 'cmapss_proc_fan_inspection_001',  name: 'Fan Blade Inspection',     standard: 'AGARD-R-785',     detect: ['fan inspection'] },
    FAN_DEG_LOW:      { id: 'cmapss_proc_fan_inspection_001',  name: 'Fan Blade Inspection',     standard: 'AGARD-R-785',     detect: ['fan inspection'] },
    NOMINAL_LOW:      { id: 'routine_monitoring',              name: 'Routine Monitoring',       standard: 'SAE JA1012',      detect: ['routine', 'monitor'] },
    NOMINAL_MEDIUM:   { id: 'routine_monitoring',              name: 'Routine Monitoring',       standard: 'SAE JA1012',      detect: ['routine', 'monitor'] },
  },

  // Fault detection vocabulary — these ARE KB terms used to interpret agent output
  // Not pre-filters: agents are not told to use these. Used only to parse what agent said.
  faultDetect: {
    HPC_DEG: ['hpc', 'high-pressure compressor', 'compressor degradation', 'hpc_deg', 'compressor fault'],
    FAN_DEG: ['fan degradation', 'fan_deg', 'fan blade', 'fan fault'],
    NOMINAL: ['nominal', 'no fault', 'within normal', 'no degradation', 'healthy'],
  },

  priorityDetect: {
    CRITICAL: ['critical'],
    HIGH:     ['high priority', 'high severity'],
    MEDIUM:   ['medium', 'moderate'],
    LOW:      ['low priority', 'routine monitoring'],
  },

  // Inter-agent handoff phrases (Rath 2026 §3.2)
  handoffDetect: ['based on', 'per diagnosis', 'consistent with', 'as diagnosed',
                  'the diagnosis indicates', 'identified fault', 'diagnosis agent', 'sensor report'],

  // Safety escalation keywords — required for CRITICAL/HIGH (ISO 13381-1 §6.4)
  escalationDetect: ['human', 'supervisor', 'engineer', 'chief', 'escalate',
                     'notify', 'alert', 'grounding order', 'immediate action', 'review required'],
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getKBPriority(rul) {
  return KB.rulPriority.find(r => rul < r.max)
}

function clamp(v, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, v))
}

// Scan text for a list of terms — returns matched terms (used for DETECTION, not pre-filtering)
function detectTerms(text, terms) {
  return terms.filter(t => text.includes(t))
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1 — SENSOR AGENT VALIDATION
// Pure KB threshold check. No agent text — validates KB fact computation.
// ═══════════════════════════════════════════════════════════════════════════════

export function validateSensorStep(engine) {
  const checks = []

  for (const [faultType, thresholds] of Object.entries(KB.faultThresholds)) {
    for (const [sensorKey, def] of Object.entries(thresholds)) {
      const val = engine.sensors[sensorKey]?.value
      if (val === undefined) continue
      const breached   = def.op === '>' ? val > def.value : val < def.value
      const direction  = def.op === '>' ? 'exceeds' : 'is below'
      const safeDir    = def.op === '>' ? 'below'   : 'above'

      checks.push({
        sensor:    sensorKey,
        label:     def.label,
        value:     val,
        threshold: def.value,
        op:        def.op,
        unit:      def.unit,
        standard:  def.standard,
        fault:     faultType,
        breached,
        explanation: breached
          ? `KB BREACH — ${def.label} (${sensorKey}) = ${val} ${def.unit} ${direction} KB threshold (${def.op} ${def.value} ${def.unit}) [${def.standard}] → ${faultType} indicator activated`
          : `KB OK — ${def.label} (${sensorKey}) = ${val} ${def.unit} is ${safeDir} threshold of ${def.value} ${def.unit} [${def.standard}]`,
      })
    }
  }

  const hpcBreaches     = checks.filter(c => c.fault === 'HPC_DEG' && c.breached)
  const fanBreaches     = checks.filter(c => c.fault === 'FAN_DEG' && c.breached)
  const kbFault         = hpcBreaches.length ? 'HPC_DEG' : fanBreaches.length ? 'FAN_DEG' : 'NOMINAL'
  const kbPriorityObj   = getKBPriority(engine.rul)

  return {
    step:            'sensor',
    kbFault,
    kbPriority:      kbPriorityObj.priority,
    kbAction:        kbPriorityObj.action,
    kbPriorityStd:   kbPriorityObj.standard,
    checks,
    breachedCount:   checks.filter(c => c.breached).length,
    breachedSensors: checks.filter(c => c.breached).map(c => c.sensor),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2 — DIAGNOSIS AGENT VALIDATION
// Compares agent free-text output against KB ground truth.
// Each check: KB says X → did agent say X? → explain mismatch.
// ═══════════════════════════════════════════════════════════════════════════════

export function validateDiagnosisStep(engine, diagText) {
  const lower        = (diagText || '').toLowerCase()
  const sensorResult = validateSensorStep(engine)
  const kbFault      = sensorResult.kbFault
  const kbPriObj     = getKBPriority(engine.rul)

  // ── D1: Fault Mode Identification ─────────────────────────────────────────
  const faultTerms  = KB.faultDetect[kbFault] || []
  const foundFault  = detectTerms(lower, faultTerms)
  const d1Passed    = foundFault.length > 0

  const d1 = {
    id:          'D1',
    name:        'Fault Mode Identification',
    kbFact:      `KB computes fault = ${kbFault} from ${sensorResult.breachedCount} threshold breach(es) on: ${sensorResult.breachedSensors.join(', ')} [NASA TM-2008-215546]`,
    agentClaim:  d1Passed ? `Agent used KB-aligned terms: "${foundFault.join('", "')}"` : `No KB fault vocabulary found in agent output`,
    passed:      d1Passed,
    source:      'NASA TM-2008-215546 + ISO 13379-1',
    explanation: d1Passed
      ? `Agent correctly identified ${kbFault}. KB derives this from threshold analysis of ${sensorResult.breachedSensors.join(', ')}.`
      : `SEMANTIC DRIFT: KB determines fault = ${kbFault} from sensor threshold breaches on [${sensorResult.breachedSensors.join(', ')}]. Agent output did not contain KB-aligned fault vocabulary. Expected one of: [${faultTerms.join(', ')}]. This suggests the agent did not ground its diagnosis in the KB threshold criteria.`,
  }

  // ── D2: Severity / Priority Level ─────────────────────────────────────────
  const priorityTerms  = KB.priorityDetect[kbPriObj.priority] || []
  const foundPriority  = detectTerms(lower, priorityTerms)
  const d2Passed       = foundPriority.length > 0

  const d2 = {
    id:          'D2',
    name:        'Severity Level',
    kbFact:      `KB priority = ${kbPriObj.priority} for RUL = ${engine.rul} cycles (rule: RUL < ${kbPriObj.max} → ${kbPriObj.priority}, ${kbPriObj.standard})`,
    agentClaim:  d2Passed ? `Agent stated: "${foundPriority.join('", "')}"` : `No KB-aligned severity level found in agent output`,
    passed:      d2Passed,
    source:      kbPriObj.standard,
    explanation: d2Passed
      ? `Agent correctly expressed ${kbPriObj.priority} severity, consistent with KB RUL rule (RUL=${engine.rul} cycles < ${kbPriObj.max} threshold).`
      : `SEMANTIC DRIFT: KB computes priority = ${kbPriObj.priority} for RUL = ${engine.rul} cycles per ${kbPriObj.standard} (threshold: RUL < ${kbPriObj.max} cycles → ${kbPriObj.priority}). Agent did not state a KB-aligned severity level. This is a calibration failure — the agent's urgency assessment is not grounded in the KB RUL table.`,
  }

  // ── D3: Sensor Evidence Citation ──────────────────────────────────────────
  const breachedSensors = sensorResult.checks.filter(c => c.breached)
  const citedSensors    = breachedSensors.filter(c =>
    lower.includes(c.sensor) || lower.includes(String(c.value))
  )
  const d3Passed        = citedSensors.length > 0 || breachedSensors.length === 0

  const d3 = {
    id:          'D3',
    name:        'Sensor Evidence Citation',
    kbFact:      `KB identifies ${breachedSensors.length} breached sensor(s): ${breachedSensors.map(c => `${c.sensor}=${c.value}${c.unit}`).join(', ')}`,
    agentClaim:  citedSensors.length
      ? `Agent cited ${citedSensors.length}/${breachedSensors.length} KB-identified breached sensor(s): ${citedSensors.map(c => c.sensor).join(', ')}`
      : `Agent did not cite specific KB-identified breached sensor IDs or values`,
    passed:      d3Passed,
    source:      'NASA TM-2008-215546',
    explanation: d3Passed
      ? `Agent cited ${citedSensors.length} of ${breachedSensors.length} KB-identified breached sensors as evidence, ensuring traceability.`
      : `TRACEABILITY DRIFT: KB threshold analysis identifies ${breachedSensors.length} breached sensor(s) as the evidence base (${breachedSensors.map(c => c.sensor).join(', ')}). Agent did not cite these specific sensor IDs or their values. Without citing KB-specific evidence, the diagnosis cannot be validated against the knowledge base.`,
  }

  const checks         = [d1, d2, d3]
  const stepDriftScore = Math.round((1 - checks.filter(c => c.passed).length / checks.length) * 100)

  return {
    step:          'diagnosis',
    kbFault,
    kbPriority:    kbPriObj.priority,
    checks,
    stepDriftScore,
    verdict: stepDriftScore === 0 ? 'GROUNDED' : stepDriftScore <= 34 ? 'MINOR DRIFT' : stepDriftScore <= 67 ? 'MODERATE DRIFT' : 'SIGNIFICANT DRIFT',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3 — MAINTENANCE AGENT VALIDATION
// Checks: correct procedure, agent-to-agent handoff, safety escalation.
// ═══════════════════════════════════════════════════════════════════════════════

export function validateMaintenanceStep(engine, diagText, maintText, kbFault, kbPriorityObj) {
  const maintLower  = (maintText || '').toLowerCase()
  const diagLower   = (diagText  || '').toLowerCase()
  const procKey     = `${kbFault}_${kbPriorityObj.priority}`
  const kbProc      = KB.procedures[procKey] || KB.procedures['NOMINAL_LOW']

  // ── M1: Procedure Selection ───────────────────────────────────────────────
  const foundProcTerms = detectTerms(maintLower, kbProc.detect)
  const m1Passed       = foundProcTerms.length > 0

  const m1 = {
    id:          'M1',
    name:        'Procedure Selection',
    kbFact:      `KB requires procedure ${kbProc.id} (${kbProc.name}) for ${kbFault}+${kbPriorityObj.priority} [${kbProc.standard}]`,
    agentClaim:  m1Passed
      ? `Agent referenced procedure keywords: "${foundProcTerms.join('", "')}" → maps to ${kbProc.id}`
      : `Agent did not reference KB-prescribed procedure (expected: ${kbProc.id})`,
    passed:      m1Passed,
    source:      kbProc.standard,
    explanation: m1Passed
      ? `Agent correctly referenced ${kbProc.id} (${kbProc.name}) as prescribed by KB for ${kbFault} with ${kbPriorityObj.priority} priority.`
      : `TOOL DRIFT: KB procedure registry maps ${kbFault}+${kbPriorityObj.priority} → ${kbProc.id} (${kbProc.name}, ${kbProc.standard}). Agent maintenance plan did not reference this KB-prescribed procedure. The agent either selected a wrong procedure or omitted the procedure reference entirely.`,
  }

  // ── M2: Diagnosis Handoff (Coordination) ─────────────────────────────────
  const foundHandoff = detectTerms(maintLower, KB.handoffDetect)
  const m2Passed     = foundHandoff.length > 0

  const m2 = {
    id:          'M2',
    name:        'Diagnosis Handoff',
    kbFact:      `KB inter-agent protocol: Maintenance agent must explicitly reference Diagnosis output to prevent coordination drift (Rath 2026 §3.2)`,
    agentClaim:  m2Passed
      ? `Agent used handoff phrase: "${foundHandoff[0]}"`
      : `No explicit reference to Diagnosis agent output found`,
    passed:      m2Passed,
    source:      'Rath (2026) §3.2',
    explanation: m2Passed
      ? `Agent correctly used explicit handoff phrase ("${foundHandoff[0]}"), confirming receipt of Diagnosis agent output.`
      : `COORDINATION DRIFT: Rath (2026) §3.2 requires the Maintenance agent to explicitly reference the Diagnosis agent output to maintain inter-agent coherence. The agent did not use any handoff phrase (expected: "based on", "consistent with", "as diagnosed", etc.). This breaks the agent chain and creates a risk of contradictory recommendations.`,
  }

  // ── M3: Safety Escalation ─────────────────────────────────────────────────
  const needsEsc     = kbPriorityObj.priority === 'CRITICAL' || kbPriorityObj.priority === 'HIGH'
  const foundEsc     = detectTerms(maintLower, KB.escalationDetect)
  const m3Passed     = !needsEsc || foundEsc.length > 0

  const m3 = {
    id:          'M3',
    name:        'Human Escalation',
    kbFact:      needsEsc
      ? `KB mandates human escalation for ${kbPriorityObj.priority} priority (ISO 13381-1:2015 §6.4)`
      : `No escalation required for ${kbPriorityObj.priority} priority`,
    agentClaim:  foundEsc.length
      ? `Agent escalated: "${foundEsc[0]}"`
      : needsEsc ? `No human escalation statement found` : `Not required — correct`,
    passed:      m3Passed,
    source:      'ISO 13381-1:2015 §6.4',
    explanation: m3Passed
      ? needsEsc
        ? `Agent correctly included human escalation statement as mandated by ISO 13381-1 §6.4 for ${kbPriorityObj.priority} priority.`
        : `Escalation not required for ${kbPriorityObj.priority} priority — correct behaviour.`
      : `BEHAVIORAL DRIFT: ISO 13381-1:2015 §6.4 mandates explicit human escalation for ${kbPriorityObj.priority} priority cases. Agent maintenance plan omitted this safety-critical requirement. For ${kbPriorityObj.priority} cases, failure to escalate constitutes a behavioral boundary violation per Rath (2026) §4.1.`,
  }

  const checks         = [m1, m2, m3]
  const stepDriftScore = Math.round((1 - checks.filter(c => c.passed).length / checks.length) * 100)

  return {
    step:          'maintenance',
    checks,
    stepDriftScore,
    verdict: stepDriftScore === 0 ? 'GROUNDED' : stepDriftScore <= 34 ? 'MINOR DRIFT' : stepDriftScore <= 67 ? 'MODERATE DRIFT' : 'SIGNIFICANT DRIFT',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASI CATEGORY SCORING — 4 categories × 3 dimensions = 12 dimensions
// All terms derived from KB data structures above.
// ═══════════════════════════════════════════════════════════════════════════════

function scoreResponseConsistency(kbFault, kbPriority, combined) {
  const faultTerms = KB.faultDetect[kbFault] || []
  const hits       = detectTerms(combined, faultTerms).length

  let C_sem
  if (kbFault === 'NOMINAL') {
    const nomHits = detectTerms(combined, KB.faultDetect.NOMINAL).length
    const falseAlarm = combined.includes('critical') || combined.includes('immediate grounding')
    C_sem = falseAlarm ? 0.0 : nomHits > 0 ? 1.0 : 0.4
  } else {
    C_sem = clamp(hits / 2)
  }

  const pathSteps = [
    combined.includes('sensor') || combined.includes('s3') || combined.includes('s7') || combined.includes('s4'),
    ['threshold', 'breach', 'exceed', 'above', 'below', 'limit'].some(w => combined.includes(w)),
    detectTerms(combined, faultTerms).length > 0,
    ['critical', 'high', 'medium', 'low', 'severity'].some(w => combined.includes(w)),
    ['ground', 'inspect', 'monitor', 'schedule', 'action', 'teardown'].some(w => combined.includes(w)),
  ]
  const C_path = clamp(pathSteps.filter(Boolean).length / 5)

  let detectedPriority = 'UNKNOWN'
  for (const [level, terms] of Object.entries(KB.priorityDetect)) {
    if (detectTerms(combined, terms).length > 0) { detectedPriority = level; break }
  }
  const order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  const gtIdx = order.indexOf(kbPriority.priority)
  const agIdx = order.indexOf(detectedPriority)
  const C_conf = detectedPriority === 'UNKNOWN' ? 0
               : detectedPriority === kbPriority.priority ? 1
               : Math.abs(gtIdx - agIdx) === 1 ? 0.5 : 0

  return { score: (C_sem + C_path + C_conf) / 3, C_sem, C_path, C_conf, detectedPriority }
}

function scoreToolUsage(engine, kbFault, kbPriority, combined) {
  const procKey = `${kbFault}_${kbPriority.priority}`
  const kbProc  = KB.procedures[procKey] || KB.procedures['NOMINAL_LOW']

  const T_sel = detectTerms(combined, kbProc.detect).length > 0 ? 1.0 : 0.0

  const seqWords = ['assess', 'inspect', 'repair', 'test', 'return']
  const seqPos   = seqWords.map(w => combined.indexOf(w)).filter(p => p >= 0)
  let T_seq = seqPos.length < 2 ? (seqPos.length > 0 ? 0.3 : 0) : 0
  if (seqPos.length >= 2) {
    let ordered = 0
    for (let i = 1; i < seqPos.length; i++) if (seqPos[i] > seqPos[i - 1]) ordered++
    T_seq = clamp(ordered / (seqPos.length - 1))
  }

  const relevantThresh = Object.values(KB.faultThresholds[kbFault] || {}).map(d => String(d.value))
  const cited  = relevantThresh.filter(v => combined.includes(v)).length
  const T_param = clamp(cited / Math.max(1, relevantThresh.length * 0.4))

  let agentProcedure = 'NONE'
  for (const [, proc] of Object.entries(KB.procedures)) {
    if (detectTerms(combined, proc.detect).length > 0) { agentProcedure = proc.id; break }
  }

  return { score: (T_sel + T_seq + T_param) / 3, T_sel, T_seq, T_param, expectedProcedure: kbProc.id, agentProcedure, procedureOk: T_sel === 1 }
}

function scoreInterAgentCoordination(kbFault, diagLower, maintLower) {
  const faultTerms = KB.faultDetect[kbFault] || []
  const diagMatch  = detectTerms(diagLower, faultTerms).length > 0
  const maintMatch = detectTerms(maintLower, faultTerms).length > 0 ||
    Object.values(KB.procedures).some(p =>
      p.id.includes(kbFault.toLowerCase().replace('_', '')) && detectTerms(maintLower, p.detect).length > 0
    )

  let I_agree
  if (kbFault === 'NOMINAL') I_agree = (!diagMatch && !maintMatch) ? 1 : 0.3
  else I_agree = (diagMatch && maintMatch) ? 1 : (diagMatch || maintMatch) ? 0.5 : 0

  const foundHandoff = detectTerms(maintLower, KB.handoffDetect)
  const I_handoff    = foundHandoff.length > 0 ? 1.0 : 0.0

  const diagOutOfScope = maintLower.includes('work order') && diagLower.includes('work order')
  const I_role         = diagOutOfScope ? 0.5 : 1.0

  return { score: (I_agree + I_handoff + I_role) / 3, I_agree, I_handoff, I_role }
}

function scoreBehavioralBoundaries(kbPriority, diagLower, maintLower, combined) {
  const verbosityMin = { CRITICAL: 250, HIGH: 130, MEDIUM: 70, LOW: 30 }
  const words  = combined.split(/\s+/).length
  const target = verbosityMin[kbPriority.priority] || 70
  const B_length = words >= target ? 1 : words >= target * 0.5 ? 0.6 : 0.2

  const diagCritical = diagLower.includes('critical')
  const maintLow     = maintLower.includes('low priority') || maintLower.includes('routine monitoring')
  const diagNormal   = diagLower.includes('nominal') || diagLower.includes('no fault')
  const maintUrgent  = maintLower.includes('immediate') || maintLower.includes('ground')
  const B_error = (diagCritical && maintLow) || (diagNormal && maintUrgent) ? 0 : 1

  const needEsc       = kbPriority.priority === 'CRITICAL' || kbPriority.priority === 'HIGH'
  const foundEsc      = detectTerms(combined, KB.escalationDetect).length > 0
  const B_human       = needEsc ? (foundEsc ? 1 : 0) : 1

  return { score: (B_length + B_error + B_human) / 3, B_length, B_error, B_human }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY — localStorage run history (persists across sessions)
// ═══════════════════════════════════════════════════════════════════════════════

const MEMORY_KEY            = 'cmapss_drift_memory'
const MAX_HISTORY_PER_ENGINE = 5

export function saveRunToMemory(result) {
  try {
    const store = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}')
    if (!store[result.engineId]) store[result.engineId] = []
    store[result.engineId].unshift({ ...result, timestamp: new Date().toISOString() })
    store[result.engineId] = store[result.engineId].slice(0, MAX_HISTORY_PER_ENGINE)
    localStorage.setItem(MEMORY_KEY, JSON.stringify(store))
  } catch (_) {}
}

export function getEngineMemory(engineId) {
  try {
    const store = JSON.parse(localStorage.getItem(MEMORY_KEY) || '{}')
    return store[engineId] || []
  } catch (_) {
    return []
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — Full ASI validation with per-step results
// ═══════════════════════════════════════════════════════════════════════════════

export function validateDrift(engine, diagnosisText, maintenanceText) {
  const rul           = engine.rul
  const kbPriorityObj = getKBPriority(rul)
  const sensorStep    = validateSensorStep(engine)
  const kbFault       = sensorStep.kbFault

  const diagLower  = (diagnosisText   || '').toLowerCase()
  const maintLower = (maintenanceText || '').toLowerCase()
  const combined   = diagLower + ' ' + maintLower

  const diagStep  = validateDiagnosisStep(engine, diagnosisText)
  const maintStep = validateMaintenanceStep(engine, diagnosisText, maintenanceText, kbFault, kbPriorityObj)

  const rc = scoreResponseConsistency(kbFault, kbPriorityObj, combined)
  const tu = scoreToolUsage(engine, kbFault, kbPriorityObj, combined)
  const ia = scoreInterAgentCoordination(kbFault, diagLower, maintLower)
  const bb = scoreBehavioralBoundaries(kbPriorityObj, diagLower, maintLower, combined)

  const ASI        = 0.30 * rc.score + 0.25 * tu.score + 0.25 * ia.score + 0.20 * bb.score
  const driftScore = Math.round((1 - ASI) * 100)

  const semanticDrift     = rc.C_sem < 0.5
  const coordinationDrift = ia.I_agree < 0.5
  const behavioralDrift   = bb.B_error < 1.0 || bb.B_human < 1.0

  return {
    engineId:            engine.id,
    rul,
    thresholdChecks:     sensorStep.checks,
    ragFault:            kbFault,
    agentFault:          rc.C_sem >= 0.5 ? kbFault : 'UNKNOWN',
    faultMatch:          rc.C_sem >= 0.5,
    groundTruthPriority: kbPriorityObj.priority,
    agentPriority:       rc.detectedPriority,
    priorityMatch:       rc.C_conf >= 0.9,
    agentProcedure:      tu.agentProcedure,
    expectedProcedure:   tu.expectedProcedure,
    procedureOk:         tu.procedureOk,
    driftScore,
    verdict: driftScore === 0  ? 'FULLY GROUNDED'
           : driftScore <= 25  ? 'MINOR DRIFT'
           : driftScore <= 50  ? 'MODERATE DRIFT'
           : 'SIGNIFICANT DRIFT',
    ASI:          Math.round(ASI * 1000) / 1000,
    asiThreshold: 0.75,
    categories: {
      responseConsistency:  { score: rc.score, weight: 0.30, C_sem: rc.C_sem, C_path: rc.C_path, C_conf: rc.C_conf },
      toolUsage:            { score: tu.score, weight: 0.25, T_sel: tu.T_sel, T_seq: tu.T_seq,   T_param: tu.T_param },
      interAgentCoord:      { score: ia.score, weight: 0.25, I_agree: ia.I_agree, I_handoff: ia.I_handoff, I_role: ia.I_role },
      behavioralBoundaries: { score: bb.score, weight: 0.20, B_length: bb.B_length, B_error: bb.B_error, B_human: bb.B_human },
    },
    driftTypes: { semanticDrift, coordinationDrift, behavioralDrift },
    stepResults: {
      sensor:      sensorStep,
      diagnosis:   diagStep,
      maintenance: maintStep,
    },
  }
}
