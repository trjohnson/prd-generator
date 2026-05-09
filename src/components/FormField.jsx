import { useState } from 'react'

export default function FormField({ label, hint, value, onChange, multiline = false, rows = 4, placeholder, required, autoPopulated }) {
  const [focused, setFocused] = useState(false)

  const baseStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: `1.5px solid ${focused ? 'var(--color-border-focus)' : autoPopulated ? '#a5b4fc' : 'var(--color-border)'}`,
    outline: 'none',
    fontSize: 14,
    lineHeight: 1.6,
    background: autoPopulated ? '#fafaff' : 'var(--color-surface)',
    transition: 'border-color var(--transition)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
          {label}
          {required && <span style={{ color: 'var(--color-accent)', marginLeft: 3 }}>*</span>}
        </label>
        {autoPopulated && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '2px 8px',
            borderRadius: 20,
            background: 'var(--color-accent-light)',
            color: 'var(--color-accent)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5L4 7.5L8.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            From documents
          </span>
        )}
      </div>
      {hint && <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: -2 }}>{hint}</p>}
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
