import { marked } from 'marked'
import DOMPurify from 'dompurify'

const ROLE_META = {
  user:   { label: 'You',       color: '#58a6ff', bg: '#0d1f33' },
  agent:  { label: 'Agent',     color: '#3fb950', bg: '#0d2111' },
  system: { label: 'System',    color: '#8b949e', bg: '#161b22' },
}

export default function Message({ msg }) {
  const meta = ROLE_META[msg.role] || ROLE_META.system
  const html = DOMPurify.sanitize(marked.parse(msg.content || ''))

  return (
    <div className="message" style={{ background: meta.bg }}>
      <div className="msg-header">
        <span className="msg-role" style={{ color: meta.color }}>
          {msg.label || meta.label}
        </span>
        {msg.streaming && <span className="streaming-dot">●</span>}
      </div>
      <div
        className="msg-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
