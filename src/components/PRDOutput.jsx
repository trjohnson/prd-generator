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
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{
              padding: '3px 10px',
              borderRadius: 20,
              background: 'var(--color-success-light)',
              color: 'var(--color-success)',
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
            }}>
              PRD GENERATED
            </div>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.4px' }}>{featureName}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginTop: 4 }}>
            Product Requirements Document
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={onReset}
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            ← New PRD
          </button>
          <button
            onClick={handleExportMD}
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text-primary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <MarkdownIcon /> Export MD
          </button>
          <button
            onClick={handleExportPDF}
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <PDFIcon /> Export PDF
          </button>
        </div>
      </div>

      <div
        ref={contentRef}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: '40px 48px',
          boxShadow: 'var(--shadow-sm)',
          lineHeight: 1.7,
        }}
        className="prd-content"
      >
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 4 }}>{featureName}</h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>Product Requirements Document</p>
        </div>

        {elements.map(el => {
          if (el.type === 'h2') {
            return (
              <div key={el.key} style={{ marginTop: 36, marginBottom: 12 }}>
                <h2 style={{
                  fontSize: 16,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-accent)',
                  paddingBottom: 8,
                  borderBottom: '2px solid var(--color-accent-light)',
                }}>
                  {el.content}
                </h2>
              </div>
            )
          }
          if (el.type === 'h3') {
            return (
              <h3 key={el.key} style={{ fontSize: 15, fontWeight: 700, marginTop: 20, marginBottom: 8, color: 'var(--color-text-primary)' }}>
                {el.content}
              </h3>
            )
          }
          if (el.type === 'ul') {
            return (
              <ul key={el.key} style={{ paddingLeft: 20, marginBottom: 12 }}>
                {el.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 14, marginBottom: 6, color: 'var(--color-text-primary)' }}>
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            )
          }
          if (el.type === 'p') {
            return (
              <p key={el.key} style={{ fontSize: 14, marginBottom: 12, color: 'var(--color-text-primary)' }}>
                {renderInline(el.content)}
              </p>
            )
          }
          return null
        })}
      </div>
    </div>
  )
}

function MarkdownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M3.5 9V5l2 2.5 2-2.5v4M9 9V5m0 4l1.5-2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PDFIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="8" height="11" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M5 1v3h5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M4 7h6M4 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
