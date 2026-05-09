export default function Header() {
  return (
    <header style={{
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      boxShadow: 'var(--shadow-sm)',
    }}>
      <div style={{
        width: 30,
        height: 30,
        background: 'var(--color-accent)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="5" height="5" rx="1" fill="white"/>
          <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
          <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.7"/>
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.4"/>
        </svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-text-primary)', letterSpacing: '-0.3px' }}>
        PRD Generator
      </span>
    </header>
  )
}
