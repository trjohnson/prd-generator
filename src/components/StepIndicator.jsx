export default function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', paddingBottom: 4 }}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1 1 0' : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 72 }}>
              <div style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Orbitron', monospace",
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
                transition: 'all 200ms ease',
                border: done
                  ? '1px solid rgba(255, 0, 144, 0.8)'
                  : active
                  ? '1px solid rgba(0, 204, 255, 0.9)'
                  : '1px solid rgba(0, 204, 255, 0.25)',
                background: done
                  ? 'rgba(255, 0, 144, 0.1)'
                  : active
                  ? 'rgba(0, 204, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.3)',
                color: done ? '#ff0090' : active ? '#00ccff' : 'rgba(120, 153, 187, 0.6)',
                boxShadow: done
                  ? '0 0 10px rgba(255, 0, 144, 0.5), 0 0 20px rgba(255, 0, 144, 0.2)'
                  : active
                  ? '0 0 12px rgba(0, 204, 255, 0.6), 0 0 24px rgba(0, 204, 255, 0.25), inset 0 0 8px rgba(0, 204, 255, 0.05)'
                  : 'none',
                textShadow: done
                  ? '0 0 8px #ff0090'
                  : active
                  ? '0 0 8px #00ccff'
                  : 'none',
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="#ff0090" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: active
                  ? '#00ccff'
                  : done
                  ? 'rgba(255, 0, 144, 0.8)'
                  : 'rgba(160, 185, 210, 0.75)',
                textShadow: active ? '0 0 6px rgba(0, 204, 255, 0.7)' : 'none',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}>
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 1,
                marginBottom: 22,
                background: done
                  ? 'linear-gradient(90deg, rgba(255, 0, 144, 0.6), rgba(0, 204, 255, 0.4))'
                  : 'rgba(0, 204, 255, 0.08)',
                boxShadow: done ? '0 0 4px rgba(255, 0, 144, 0.3)' : 'none',
                transition: 'all 200ms ease',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
