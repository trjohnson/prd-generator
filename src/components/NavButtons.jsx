export default function NavButtons({ onBack, onNext, nextLabel = 'Continue', disabled = false, isFirst = false }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 36,
      paddingTop: 24,
      borderTop: '1px solid rgba(0, 204, 255, 0.1)',
    }}>
      {!isFirst ? (
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
      ) : <div />}
      <button
        onClick={onNext}
        disabled={disabled}
        style={{
          padding: '10px 26px',
          border: disabled ? '1px solid rgba(0, 204, 255, 0.1)' : '1px solid rgba(255, 0, 144, 0.7)',
          background: 'transparent',
          color: disabled ? 'rgba(120, 153, 187, 0.25)' : '#ff0090',
          fontSize: 12,
          fontFamily: "'Orbitron', monospace",
          letterSpacing: '0.12em',
          cursor: disabled ? 'not-allowed' : 'pointer',
          textShadow: disabled ? 'none' : '0 0 8px rgba(255, 0, 144, 0.6)',
          boxShadow: disabled ? 'none' : '0 0 10px rgba(255, 0, 144, 0.25), inset 0 0 10px rgba(255, 0, 144, 0.04)',
          transition: 'all var(--transition)',
        }}
        onMouseEnter={e => {
          if (!disabled) {
            e.currentTarget.style.background = 'rgba(255, 0, 144, 0.12)'
            e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 144, 0.5), 0 0 40px rgba(255, 0, 144, 0.2), inset 0 0 15px rgba(255, 0, 144, 0.08)'
            e.currentTarget.style.textShadow = '0 0 12px #ff0090'
          }
        }}
        onMouseLeave={e => {
          if (!disabled) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 144, 0.25), inset 0 0 10px rgba(255, 0, 144, 0.04)'
            e.currentTarget.style.textShadow = '0 0 8px rgba(255, 0, 144, 0.6)'
          }
        }}
      >
        {nextLabel}
      </button>
    </div>
  )
}
