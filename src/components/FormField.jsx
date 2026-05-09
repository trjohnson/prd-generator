import { useState } from 'react'

export default function FormField({ label, hint, value, onChange, multiline = false, rows = 4, placeholder, required }) {
  const [focused, setFocused] = useState(false)

  const baseStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    border: `1.5px solid ${focused ? 'var(--color-border-focus)' : 'var(--color-border)'}`,
    outline: 'none',
    fontSize: 14,
    lineHeight: 1.6,
    background: 'var(--color-surface)',
    transition: 'border-color var(--transition)',
    color: 'var(--color-text-primary)',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
        {label}
        {required && <span style={{ color: 'var(--color-accent)', marginLeft: 3 }}>*</span>}
      </label>
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
