import { useState, useCallback } from 'react'
import { ENGINES } from './data/engines.js'
import { generateSensorReport } from './agents/sensorAgent.js'
import { streamDiagnosis } from './agents/diagnosisAgent.js'
import { streamMaintenance } from './agents/maintenanceAgent.js'
import { validateDrift, validateDiagnosisStep, saveRunToMemory, getEngineMemory } from './agents/driftAgent.js'
import Sidebar from './components/Sidebar.jsx'
import Chat from './components/Chat.jsx'
import DriftPanel from './components/DriftPanel.jsx'

let msgId = 0
const newId = () => ++msgId

export default function App() {
  const [apiKey, setApiKey]         = useState('')
  const [keyInput, setKeyInput]     = useState('')
  const [messages, setMessages]     = useState([{
    id: newId(), role: 'system',
    content: '👋 Welcome to the **NASA CMAPSS Predictive Maintenance AI**.\n\nSelect an engine from the sidebar and click **"Analyse"** to run the full 3-agent pipeline:\n1. 🔍 Sensor Monitor\n2. 🧠 Diagnosis Agent (GPT-4o)\n3. 🔧 Maintenance Planner (GPT-4o)\n4. 📊 Drift Validator\n\nOr type a question about any engine.',
    streaming: false,
  }])
  const [driftResult, setDriftResult] = useState(null)
  const [runHistory, setRunHistory]   = useState([])
  const [running, setRunning]         = useState(false)
  const [activeEngine, setActiveEngine] = useState(null)

  // ── Message helpers ────────────────────────────────────────────────────
  const addMsg = useCallback((role, content, label = '') => {
    const id = newId()
    setMessages(prev => [...prev, { id, role, content, label, streaming: false }])
    return id
  }, [])

  const addStreaming = useCallback((role, label = '') => {
    const id = newId()
    setMessages(prev => [...prev, { id, role, content: '', label, streaming: true }])
    return id
  }, [])

  const updateMsg = useCallback((id, content) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content } : m))
  }, [])

  const finishMsg = useCallback((id) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, streaming: false } : m))
  }, [])

  // ── Run full pipeline for an engine ───────────────────────────────────
  const analyseEngine = useCallback(async (engine) => {
    if (running) return
    if (!apiKey) { addMsg('system', '⚠️ Please enter your OpenAI API key first.'); return }

    setRunning(true)
    setActiveEngine(engine.id)
    setDriftResult(null)
    setRunHistory(getEngineMemory(engine.id))

    addMsg('user', `Analyse engine **${engine.name}** (${engine.id}) — RUL: ${engine.rul} cycles, Score: ${engine.anomalyScore}/100`)

    // Step 1 — Sensor Agent (instant)
    addMsg('agent', '⏳ Running Sensor Monitor Agent…', '📡 Sensor Monitor')
    const sensorReport = generateSensorReport(engine)
    setMessages(prev => {
      const last = [...prev]; last[last.length - 1] = { ...last[last.length - 1], content: sensorReport }; return last
    })

    // Step 2 — Diagnosis Agent (streaming)
    const diagId = addStreaming('agent', '🧠 Diagnosis Agent (GPT-4o)')
    let diagnosisText = ''
    try {
      diagnosisText = await streamDiagnosis(apiKey, engine, sensorReport, txt => updateMsg(diagId, txt))
      finishMsg(diagId)
    } catch (e) {
      updateMsg(diagId, `❌ API Error: ${e.message}`)
      finishMsg(diagId)
      setRunning(false)
      return
    }

    // Step 2b — Diagnosis Drift Check (inline, against KB)
    const diagStep  = validateDiagnosisStep(engine, diagnosisText)
    const diagIcon  = diagStep.stepDriftScore === 0 ? '✅' : diagStep.stepDriftScore <= 34 ? '🟡' : diagStep.stepDriftScore <= 67 ? '🟠' : '🔴'
    addMsg('system',
      `${diagIcon} **Diagnosis Step Drift: ${diagStep.stepDriftScore}/100 — ${diagStep.verdict}**\n\n` +
      diagStep.checks.map(c =>
        `${c.passed ? '✅' : '❌'} **${c.name}**\n` +
        `  KB: ${c.kbFact}\n` +
        `  Agent: ${c.agentClaim}` +
        (c.passed ? '' : `\n  ⚠️ ${c.explanation}`)
      ).join('\n\n'),
      '📊 Diagnosis KB Check'
    )

    // Step 3 — Maintenance Agent (streaming)
    const maintId = addStreaming('agent', '🔧 Maintenance Planner (GPT-4o)')
    let maintenanceText = ''
    try {
      maintenanceText = await streamMaintenance(apiKey, engine, diagnosisText, txt => updateMsg(maintId, txt))
      finishMsg(maintId)
    } catch (e) {
      updateMsg(maintId, `❌ API Error: ${e.message}`)
      finishMsg(maintId)
      setRunning(false)
      return
    }

    // Step 4 — Full Drift Validation (ASI framework)
    const drift = validateDrift(engine, diagnosisText, maintenanceText)
    saveRunToMemory(drift)
    setRunHistory(getEngineMemory(engine.id))
    setDriftResult(drift)

    // Step 4b — Maintenance Drift Check (inline, against KB)
    const maintStep  = drift.stepResults.maintenance
    const maintIcon  = maintStep.stepDriftScore === 0 ? '✅' : maintStep.stepDriftScore <= 34 ? '🟡' : maintStep.stepDriftScore <= 67 ? '🟠' : '🔴'
    addMsg('system',
      `${maintIcon} **Maintenance Step Drift: ${maintStep.stepDriftScore}/100 — ${maintStep.verdict}**\n\n` +
      maintStep.checks.map(c =>
        `${c.passed ? '✅' : '❌'} **${c.name}**\n` +
        `  KB: ${c.kbFact}\n` +
        `  Agent: ${c.agentClaim}` +
        (c.passed ? '' : `\n  ⚠️ ${c.explanation}`)
      ).join('\n\n'),
      '📊 Maintenance KB Check'
    )

    const driftColor = drift.driftScore === 0 ? '✅' : drift.driftScore <= 25 ? '🟡' : drift.driftScore <= 50 ? '🟠' : '🔴'
    addMsg('system',
      `${driftColor} **Overall ASI Drift: ${drift.driftScore}/100 — ${drift.verdict}**\n` +
      `ASI = ${drift.ASI} ${drift.ASI >= 0.75 ? '✅ STABLE' : '⚠️ DRIFT DETECTED'} (τ = 0.75)\n\n` +
      `See Drift Panel → for full 12-dimension breakdown and run history.`,
      '📊 Final Drift Score'
    )

    setRunning(false)
  }, [apiKey, running, addMsg, addStreaming, updateMsg, finishMsg])

  // ── Handle free-text questions ────────────────────────────────────────
  const handleQuestion = useCallback(async (question) => {
    if (running || !question.trim()) return
    if (!apiKey) { addMsg('system', '⚠️ Please enter your OpenAI API key first.'); return }

    setRunning(true)
    addMsg('user', question)
    const replyId = addStreaming('agent', '🤖 Assistant')

    try {
      const { default: OpenAI } = await import('openai')
      const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })
      const stream = await client.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are an expert on the NASA CMAPSS turbofan engine dataset and predictive maintenance. Answer concisely and technically.' },
          { role: 'user', content: question },
        ],
        stream: true, max_tokens: 400, temperature: 0.3,
      })
      let full = ''
      for await (const chunk of stream) { full += chunk.choices[0]?.delta?.content ?? ''; updateMsg(replyId, full) }
      finishMsg(replyId)
    } catch (e) {
      updateMsg(replyId, `❌ Error: ${e.message}`)
      finishMsg(replyId)
    }
    setRunning(false)
  }, [apiKey, running, addMsg, addStreaming, updateMsg, finishMsg])

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="header-icon">✈️</span>
          <div>
            <h1>NASA CMAPSS Predictive Maintenance</h1>
            <p>Multi-Agent AI Framework · GPT-4o · RAG · Drift Validation</p>
          </div>
        </div>
        <div className="api-key-box">
          {apiKey ? (
            <div className="key-set">
              <span className="key-dot">🟢</span>
              <span>API Key set</span>
              <button onClick={() => setApiKey('')} className="btn-sm">Change</button>
            </div>
          ) : (
            <div className="key-input-row">
              <input
                type="password"
                placeholder="Enter OpenAI API key…"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && keyInput && setApiKey(keyInput)}
                className="key-input"
              />
              <button
                onClick={() => keyInput && setApiKey(keyInput)}
                className="btn-primary btn-sm"
              >Set Key</button>
            </div>
          )}
        </div>
      </header>

      <div className="main-layout">
        {/* Sidebar */}
        <Sidebar
          engines={ENGINES}
          activeEngine={activeEngine}
          onAnalyse={analyseEngine}
          running={running}
        />

        {/* Chat */}
        <div className="chat-area">
          <Chat
            messages={messages}
            onQuestion={handleQuestion}
            running={running}
          />
        </div>

        {/* Drift Panel */}
        <DriftPanel result={driftResult} runHistory={runHistory} />
      </div>
    </div>
  )
}
