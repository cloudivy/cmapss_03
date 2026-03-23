import { useEffect, useRef, useState } from 'react'
import Message from './Message.jsx'

const SUGGESTED = [
  'What is HPC degradation and how is it detected?',
  'Explain the RUL priority levels from ISO 13381-1',
  'What does a borescope inspection involve?',
  'How does the drift validator work?',
]

export default function Chat({ messages, onQuestion, running }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!input.trim() || running) return
    onQuestion(input.trim())
    setInput('')
  }

  return (
    <div className="chat">
      {/* Messages */}
      <div className="messages">
        {messages.map(m => <Message key={m.id} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length <= 1 && (
        <div className="suggestions">
          {SUGGESTED.map(s => (
            <button key={s} className="suggestion-btn" onClick={() => onQuestion(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="input-bar">
        <input
          className="chat-input"
          placeholder="Ask about NASA CMAPSS engines, fault modes, RUL…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={running}
        />
        <button
          className="btn-send"
          onClick={send}
          disabled={running || !input.trim()}
        >
          {running ? '⏳' : '➤'}
        </button>
      </div>
    </div>
  )
}
