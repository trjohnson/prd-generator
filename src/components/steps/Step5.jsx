import NavButtons from '../NavButtons.jsx'

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
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Review & Generate</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Review your inputs below, then click Generate to create your PRD using Claude.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {REVIEW_FIELDS.map(({ label, key }) => {
          const val = formData[key]
          return (
            <div key={key} style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: val ? 'var(--color-accent-light)' : 'var(--color-surface-hover)',
              border: `1px solid ${val ? '#c7d2fd' : 'var(--color-border)'}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: val ? 'var(--color-accent)' : 'var(--color-text-muted)', marginBottom: 4 }}>
                {label}
              </div>
              <div style={{ fontSize: 14, color: val ? 'var(--color-text-primary)' : 'var(--color-text-muted)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {val || <em>Not provided</em>}
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div style={{
          marginTop: 20,
          padding: '12px 14px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-danger-light)',
          border: '1px solid #fca5a5',
          color: 'var(--color-danger)',
          fontSize: 14,
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 32,
        paddingTop: 24,
        borderTop: '1px solid var(--color-border)',
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '10px 20px',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--color-border)',
            background: 'transparent',
            color: 'var(--color-text-secondary)',
            fontSize: 14,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          ← Back
        </button>
        <button
          onClick={onGenerate}
          disabled={loading}
          style={{
            padding: '11px 28px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: loading ? 'var(--color-border)' : 'var(--color-accent)',
            color: loading ? 'var(--color-text-muted)' : '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            transition: 'background var(--transition)',
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--color-accent-hover)' }}
          onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--color-accent)' }}
        >
          {loading ? (
            <>
              <Spinner />
              Generating PRD...
            </>
          ) : (
            'Generate PRD ✦'
          )}
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="none"/>
      <path d="M8 2 A6 6 0 0 1 14 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
