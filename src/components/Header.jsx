export default function Header() {
  return (
    <header style={{
      background: 'rgba(4, 6, 15, 0.95)',
      borderBottom: '1px solid rgba(0, 204, 255, 0.2)',
      padding: '0 24px',
      height: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 0 20px rgba(0, 204, 255, 0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          border: '1px solid rgba(255, 0, 144, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 0 8px rgba(255, 0, 144, 0.4), inset 0 0 8px rgba(255, 0, 144, 0.1)',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect x="2" y="2" width="6" height="6" fill="#ff0090" opacity="0.9"/>
            <rect x="10" y="2" width="6" height="6" fill="#00ccff" opacity="0.7"/>
            <rect x="2" y="10" width="6" height="6" fill="#00ccff" opacity="0.5"/>
            <rect x="10" y="10" width="6" height="6" fill="#ff0090" opacity="0.3"/>
          </svg>
        </div>
        <div>
          <div style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: '0.18em',
            color: '#ff0090',
            textShadow: '0 0 10px #ff0090, 0 0 20px rgba(255, 0, 144, 0.4)',
            animation: 'neon-flicker 8s infinite',
            lineHeight: 1,
          }}>
            PRD GENERATOR
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 9,
            letterSpacing: '0.2em',
            color: 'rgba(0, 204, 255, 0.6)',
            marginTop: 2,
            lineHeight: 1,
          }}>
            BLOODDRAGON.SYS v2.0
          </div>
        </div>
      </div>

      <div style={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: 11,
        color: 'rgba(0, 204, 255, 0.4)',
        letterSpacing: '0.15em',
      }}>
        [ POWERED BY CLAUDE ]
      </div>
    </header>
  )
}
