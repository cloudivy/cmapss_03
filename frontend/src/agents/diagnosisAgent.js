import OpenAI from 'openai'
import { DIAGNOSIS_SYSTEM_PROMPT } from '../data/engines.js'

export async function streamDiagnosis(apiKey, engine, sensorReport, onChunk) {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  const userMsg = `Engine: ${engine.name} (${engine.id})
Dataset: NASA CMAPSS ${engine.subset}
Cycle: ${engine.cycle} | True RUL: ${engine.rul} cycles
Fault Mode (ground truth): ${engine.faultMode}
Anomaly Score: ${engine.anomalyScore}/100 [${engine.anomalyLevel}]

${sensorReport}

Provide your diagnosis.`

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: DIAGNOSIS_SYSTEM_PROMPT },
      { role: 'user',   content: userMsg },
    ],
    stream: true,
    max_tokens: 600,
    temperature: 0.2,
  })

  let full = ''
  for await (const chunk of stream) {
    full += chunk.choices[0]?.delta?.content ?? ''
    onChunk(full)
  }
  return full
}
