import OpenAI from 'openai'
import { MAINTENANCE_SYSTEM_PROMPT } from '../data/engines.js'

export async function streamMaintenance(apiKey, engine, diagnosis, onChunk) {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true })

  const userMsg = `Engine: ${engine.name} (${engine.id})
RUL: ${engine.rul} cycles | Fault: ${engine.faultMode} | Score: ${engine.anomalyScore}/100

## Diagnosis Result
${diagnosis}

Generate the maintenance work order.`

  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: MAINTENANCE_SYSTEM_PROMPT },
      { role: 'user',   content: userMsg },
    ],
    stream: true,
    max_tokens: 700,
    temperature: 0.2,
  })

  let full = ''
  for await (const chunk of stream) {
    full += chunk.choices[0]?.delta?.content ?? ''
    onChunk(full)
  }
  return full
}
