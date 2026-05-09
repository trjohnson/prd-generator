const REVIEW_FIELDS = [
  { label: 'Feature Name', key: 'featureName' },
  { label: 'Problem Statement', key: 'problemStatement' },
  { label: 'Target Users', key: 'targetUsers' },
  { label: 'Use Cases', key: 'useCases' },
  { label: 'Goals', key: 'goals' },
  { label: 'Success Metrics', key: 'successMetrics' },
  { label: 'In Scope', key: 'inScope' },
  { label: 'Out of Scope', key: 'outOfScope' },
]

export default function Step5({ formData, onBack, onGenerate, loading, error }) {
  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#00ccff',
        textShadow: '0 0 10px rgba(0, 204, 255, 0.6)',
        marginBottom: 6,
      }}>
        Review &amp; Generate
      </h2>
      <p style={{ color: 'rgba(120, 153, 187, 0.55)', fontSize: 12, fontFamily: "'Share Tech Mono', monospace", marginBottom: 28, letterSpacing: '0.04em' }}>
        // Confirm data integrity before initiating generation sequence.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {REVIEW_FIELDS.map(({ label, key }) => {
          const val = formData[key]
          return (
            <div key={key} style={{
              padding: '12px 14px',
              background: val ? 'rgba(0, 204, 255, 0.03)' : 'rgba(0, 0, 0, 0.2)',
              border: `1px solid ${val ? 'rgba(0, 204, 255, 0.2)' : 'rgba(0, 204, 255, 0.07)'}`,
              boxShadow: val ? '0 0 8px rgba(0, 204, 255, 0.04)' : 'none',
            }}>
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 9,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.14em',
                color: val ? '#00ccff' : 'rgba(120, 153, 187, 0.25)',
                textShadow: val ? '0 0 6px rgba(0, 204, 255, 0.5)' : 'none',
                marginBottom: 6,
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 13,
                color: val ? 'var(--color-text-primary)' : 'rgba(120, 153, 187, 0.25)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}>
                {val || <em style={{ fontStyle: 'normal', opacity: 0.5 }}>// not provided</em>}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{
          marginTop: 20,
          padding: '12px 14px',
          background: 'rgba(255, 68, 102, 0.08)',
          border: '1px solid rgba(255, 68, 102, 0.4)',
          color: '#ff4466',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 13,
          textShadow: '0 0 6px rgba(255, 68, 102, 0.4)',
        }}>
          ⚠ {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 36,
        paddingTop: 24,
        borderTop: '1px solid rgba(0, 204, 255, 0.1)',
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            border: '1px solid rgba(0, 204, 255, 0.2)',
            background: 'transparent',
            color: 'rgba(120, 153, 187, 0.6)',
            fontSize: 12,
            fontFamily: "'Orbitron', monospace",
            letterSpacing: '0.1em',
            cursor: 'pointer',
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.5)'
            e.currentTarget.style.color = '#00ccff'
            e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 204, 255, 0.2)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.2)'
            e.currentTarget.style.color = 'rgba(120, 153, 187, 0.6)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          ← BACK
        </button>

        <button
          onClick={onGenerate}
          disabled={loading}
          style={{
            padding: '12px 32px',
            border: loading ? '1px solid rgba(0, 204, 255, 0.1)' : '1px solid rgba(255, 0, 144, 0.8)',
            background: loading ? 'rgba(0,0,0,0.2)' : 'transparent',
            color: loading ? 'rgba(120, 153, 187, 0.3)' : '#ff0090',
            fontSize: 13,
            fontFamily: "'Orbitron', monospace",
            fontWeight: 700,
            letterSpacing: '0.15em',
            cursor: loading ? 'not-allowed' : 'pointer',
            textShadow: loading ? 'none' : '0 0 10px rgba(255, 0, 144, 0.8)',
            boxShadow: loading ? 'none' : '0 0 15px rgba(255, 0, 144, 0.35), 0 0 30px rgba(255, 0, 144, 0.15), inset 0 0 15px rgba(255, 0, 144, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.background = 'rgba(255, 0, 144, 0.12)'
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 144, 0.65), 0 0 50px rgba(255, 0, 144, 0.3), inset 0 0 20px rgba(255, 0, 144, 0.08)'
              e.currentTarget.style.textShadow = '0 0 14px #ff0090'
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 0, 144, 0.35), 0 0 30px rgba(255, 0, 144, 0.15), inset 0 0 15px rgba(255, 0, 144, 0.04)'
              e.currentTarget.style.textShadow = '0 0 10px rgba(255, 0, 144, 0.8)'
            }
          }}
        >
          {loading ? (
            <>
              <Spinner />
              GENERATING...
            </>
          ) : (
            '✦ GENERATE PRD'
          )}
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5" stroke="rgba(255,0,144,0.25)" strokeWidth="2" fill="none"/>
      <path d="M7 2 A5 5 0 0 1 12 7" stroke="#ff0090" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
