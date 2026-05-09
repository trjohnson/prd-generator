import { useRef } from 'react'
import { exportToPDF } from '../utils/exportPDF.js'

function parseMarkdown(text) {
  const lines = text.split('\n')
  const elements = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('## ')) {
      elements.push({ type: 'h2', content: line.slice(3), key: i })
    } else if (line.startsWith('### ')) {
      elements.push({ type: 'h3', content: line.slice(4), key: i })
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      elements.push({ type: 'ul', items, key: i })
      continue
    } else if (line.trim() === '') {
      // skip blank
    } else {
      elements.push({ type: 'p', content: line, key: i })
    }
    i++
  }
  return elements
}

function renderInline(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: '#00ccff', fontWeight: 700 }}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

const BTN_BASE = {
  padding: '9px 16px',
  border: '1px solid',
  background: 'transparent',
  fontSize: 11,
  fontFamily: "'Orbitron', monospace",
  letterSpacing: '0.1em',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 160ms ease',
}

export default function PRDOutput({ prd, featureName, onReset }) {
  const contentRef = useRef(null)
  const elements = parseMarkdown(prd)

  const handleExportMD = () => {
    const blob = new Blob([prd], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${featureName.replace(/\s+/g, '-').toLowerCase()}-prd.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => {
    exportToPDF(contentRef.current, featureName)
  }

  return (
    <div>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{
              padding: '3px 12px',
              border: '1px solid rgba(0, 204, 255, 0.5)',
              background: 'rgba(0, 204, 255, 0.07)',
              color: '#00ccff',
              fontFamily: "'Orbitron', monospace",
              fontSize: 9,
              letterSpacing: '0.2em',
              textShadow: '0 0 8px rgba(0, 204, 255, 0.6)',
              boxShadow: '0 0 8px rgba(0, 204, 255, 0.1)',
            }}>
              ✦ GENERATION COMPLETE
            </span>
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#ff0090',
            textShadow: '0 0 16px rgba(255, 0, 144, 0.6), 0 0 32px rgba(255, 0, 144, 0.25)',
            marginBottom: 4,
          }}>
            {featureName}
          </h1>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(120, 153, 187, 0.5)', fontSize: 12, letterSpacing: '0.08em' }}>
            // Product Requirements Document
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onReset}
            style={{ ...BTN_BASE, borderColor: 'rgba(0, 204, 255, 0.2)', color: 'rgba(120, 153, 187, 0.6)' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.5)'; e.currentTarget.style.color = '#00ccff'; e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 204, 255, 0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0, 204, 255, 0.2)'; e.currentTarget.style.color = 'rgba(120, 153, 187, 0.6)'; e.currentTarget.style.boxShadow = 'none' }}
          >
            ← NEW PRD
          </button>
          <button
            onClick={handleExportMD}
            style={{ ...BTN_BASE, borderColor: 'rgba(0, 204, 255, 0.35)', color: '#00ccff', textShadow: '0 0 6px rgba(0, 204, 255, 0.4)', boxShadow: '0 0 8px rgba(0, 204, 255, 0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0, 204, 255, 0.07)'; e.currentTarget.style.boxShadow = '0 0 14px rgba(0, 204, 255, 0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 8px rgba(0, 204, 255, 0.1)' }}
          >
            <MarkdownIcon /> EXPORT MD
          </button>
          <button
            onClick={handleExportPDF}
            style={{ ...BTN_BASE, borderColor: 'rgba(255, 0, 144, 0.7)', color: '#ff0090', textShadow: '0 0 8px rgba(255, 0, 144, 0.6)', boxShadow: '0 0 10px rgba(255, 0, 144, 0.2), inset 0 0 8px rgba(255, 0, 144, 0.03)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 0, 144, 0.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 0, 144, 0.5), inset 0 0 15px rgba(255, 0, 144, 0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 10px rgba(255, 0, 144, 0.2), inset 0 0 8px rgba(255, 0, 144, 0.03)' }}
          >
            <PDFIcon /> EXPORT PDF
          </button>
        </div>
      </div>

      {/* PRD content card */}
      <div style={{ position: 'relative' }}>
        {/* corner accents */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 14, height: 14, borderTop: '2px solid rgba(255, 0, 144, 0.6)', borderLeft: '2px solid rgba(255, 0, 144, 0.6)', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: -1, right: -1, width: 14, height: 14, borderTop: '2px solid rgba(255, 0, 144, 0.6)', borderRight: '2px solid rgba(255, 0, 144, 0.6)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 14, height: 14, borderBottom: '2px solid rgba(255, 0, 144, 0.6)', borderLeft: '2px solid rgba(255, 0, 144, 0.6)', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 14, height: 14, borderBottom: '2px solid rgba(255, 0, 144, 0.6)', borderRight: '2px solid rgba(255, 0, 144, 0.6)', zIndex: 1 }} />

        <div
          ref={contentRef}
          style={{
            background: '#06090f',
            border: '1px solid rgba(255, 0, 144, 0.2)',
            padding: '40px 48px',
            boxShadow: '0 0 30px rgba(255, 0, 144, 0.04)',
            lineHeight: 1.75,
          }}
        >
          {/* PRD title header */}
          <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid rgba(255, 0, 144, 0.15)' }}>
            <h1 style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: 22,
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#ff0090',
              textShadow: '0 0 16px rgba(255, 0, 144, 0.6), 0 0 32px rgba(255, 0, 144, 0.25)',
              marginBottom: 6,
            }}>
              {featureName}
            </h1>
            <p style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(120, 153, 187, 0.5)', fontSize: 12, letterSpacing: '0.1em' }}>
              PRODUCT REQUIREMENTS DOCUMENT
            </p>
          </div>

          {elements.map(el => {
            if (el.type === 'h2') {
              return (
                <div key={el.key} style={{ marginTop: 40, marginBottom: 16 }}>
                  <h2 style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                    color: '#00ccff',
                    textShadow: '0 0 10px rgba(0, 204, 255, 0.7), 0 0 20px rgba(0, 204, 255, 0.3)',
                    paddingBottom: 10,
                    borderBottom: '1px solid rgba(0, 204, 255, 0.2)',
                    boxShadow: '0 1px 0 rgba(0, 204, 255, 0.05)',
                  }}>
                    // {el.content}
                  </h2>
                </div>
              )
            }
            if (el.type === 'h3') {
              return (
                <h3 key={el.key} style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#ff0090',
                  textShadow: '0 0 8px rgba(255, 0, 144, 0.5)',
                  marginTop: 22,
                  marginBottom: 10,
                }}>
                  {el.content}
                </h3>
              )
            }
            if (el.type === 'ul') {
              return (
                <ul key={el.key} style={{ paddingLeft: 0, marginBottom: 14, listStyle: 'none' }}>
                  {el.items.map((item, j) => (
                    <li key={j} style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 13,
                      marginBottom: 8,
                      color: 'var(--color-text-primary)',
                      paddingLeft: 16,
                      position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: '#ff0090', textShadow: '0 0 6px rgba(255, 0, 144, 0.5)' }}>›</span>
                      {renderInline(item)}
                    </li>
                  ))}
                </ul>
              )
            }
            if (el.type === 'p') {
              return (
                <p key={el.key} style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 13,
                  marginBottom: 12,
                  color: 'var(--color-text-primary)',
                  lineHeight: 1.8,
                }}>
                  {renderInline(el.content)}
                </p>
              )
            }
            return null
          })}
        </div>
      </div>
    </div>
  )
}

function MarkdownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3.5 9V5l2 2.5 2-2.5v4M9 9V5m0 4l1.5-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PDFIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 1v3h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
