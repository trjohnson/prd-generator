export default function StepIndicator({ steps, current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1 1 0' : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 64 }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: 13,
                flexShrink: 0,
                transition: 'all var(--transition)',
                background: done ? 'var(--color-success)' : active ? 'var(--color-accent)' : 'var(--color-border)',
                color: done || active ? '#fff' : 'var(--color-text-secondary)',
              }}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : i + 1}
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-accent)' : done ? 'var(--color-success)' : 'var(--color-text-muted)',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: done ? 'var(--color-success)' : 'var(--color-border)',
                marginBottom: 18,
                transition: 'background var(--transition)',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}
