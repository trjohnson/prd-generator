import { useState } from 'react'

export default function FormField({ label, hint, value, onChange, multiline = false, rows = 4, placeholder, required, autoPopulated }) {
  const [focused, setFocused] = useState(false)

  const borderColor = focused
    ? '#00ccff'
    : autoPopulated
    ? 'rgba(255, 0, 144, 0.45)'
    : 'rgba(0, 204, 255, 0.15)'

  const boxShadow = focused
    ? '0 0 10px rgba(0, 204, 255, 0.35), inset 0 0 10px rgba(0, 204, 255, 0.04)'
    : autoPopulated
    ? '0 0 6px rgba(255, 0, 144, 0.15)'
    : 'none'

  const baseStyle = {
    width: '100%',
    padding: '10px 12px',
    border: `1px solid ${borderColor}`,
    outline: 'none',
    fontSize: 13,
    lineHeight: 1.7,
    background: 'rgba(0, 0, 0, 0.45)',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
    color: 'var(--color-text-primary)',
    boxShadow,
    fontFamily: "'Share Tech Mono', monospace",
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <label style={{
          fontFamily: "'Orbitron', monospace",
          fontWeight: 600,
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: autoPopulated ? '#ff0090' : 'rgba(0, 204, 255, 0.8)',
          textShadow: autoPopulated ? '0 0 6px rgba(255, 0, 144, 0.5)' : '0 0 6px rgba(0, 204, 255, 0.3)',
        }}>
          {label}
          {required && <span style={{ color: '#ff0090', marginLeft: 4, textShadow: '0 0 6px #ff0090' }}>*</span>}
        </label>
        {autoPopulated && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            border: '1px solid rgba(255, 0, 144, 0.4)',
            background: 'rgba(255, 0, 144, 0.07)',
            color: '#ff0090',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            letterSpacing: '0.08em',
            textShadow: '0 0 6px rgba(255, 0, 144, 0.6)',
            boxShadow: '0 0 6px rgba(255, 0, 144, 0.1)',
          }}>
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M1 4L3 6L7 2" stroke="#ff0090" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            EXTRACTED
          </span>
        )}
      </div>
      {hint && (
        <p style={{
          fontSize: 12,
          color: 'rgba(120, 153, 187, 0.5)',
          marginTop: -2,
          fontFamily: "'Share Tech Mono', monospace",
          letterSpacing: '0.03em',
        }}>
          {hint}
        </p>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={rows}
          style={baseStyle}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={baseStyle}
        />
      )}
    </div>
  )
}
