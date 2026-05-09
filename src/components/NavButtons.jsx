export default function NavButtons({ onBack, onNext, nextLabel = 'Continue', disabled = false, isFirst = false }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 32,
      paddingTop: 24,
      borderTop: '1px solid var(--color-border)',
    }}>
      {!isFirst ? (
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
            transition: 'all var(--transition)',
          }}
          onMouseEnter={e => { e.target.style.background = 'var(--color-surface-hover)'; e.target.style.color = 'var(--color-text-primary)' }}
          onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--color-text-secondary)' }}
        >
          ← Back
        </button>
      ) : <div />}
      <button
        onClick={onNext}
        disabled={disabled}
        style={{
          padding: '10px 24px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: disabled ? 'var(--color-border)' : 'var(--color-accent)',
          color: disabled ? 'var(--color-text-muted)' : '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all var(--transition)',
        }}
        onMouseEnter={e => { if (!disabled) e.target.style.background = 'var(--color-accent-hover)' }}
        onMouseLeave={e => { if (!disabled) e.target.style.background = 'var(--color-accent)' }}
      >
        {nextLabel}
      </button>
    </div>
  )
}
