import { useState, useRef, useCallback } from 'react'

const ACCEPTED_EXTENSIONS = ['.txt', '.pdf', '.docx', '.xlsx', '.csv']
const MAX_FILE_SIZE_MB = 3
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
const MAX_CHARS_PER_DOC = 24_000
const MAX_BODY_BYTES = 4_000_000 // stay under Vercel's 4.5 MB request body limit
const FETCH_TIMEOUT_MS = 25_000
const MAX_FILES = 5

const FIELD_LABELS = {
  problemStatement: 'PROBLEM STATEMENT',
  targetUsers: 'TARGET USERS',
  goals: 'GOALS',
  successMetrics: 'SUCCESS METRICS',
  inScope: 'IN SCOPE',
  outOfScope: 'OUT OF SCOPE',
}

function fileExt(name) {
  return name.toLowerCase().split('.').pop()
}

function formatBytes(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)}KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function fileTypeColor(ext) {
  if (ext === 'pdf') return '#ff4466'
  if (ext === 'docx') return '#00ccff'
  if (ext === 'xlsx' || ext === 'csv') return '#00ff99'
  return '#7899bb'
}

async function extractFileContent(file) {
  const ext = fileExt(file.name)

  if (ext === 'pdf') {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return { type: 'pdf', content: btoa(binary) }
  }

  if (ext === 'docx') {
    const mod = await import('mammoth')
    const mammoth = mod.default || mod
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return { type: 'text', content: result.value }
  }

  if (ext === 'xlsx') {
    const mod = await import('xlsx')
    const XLSX = mod.default || mod
    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const text = workbook.SheetNames.map(sheetName => {
      const sheet = workbook.Sheets[sheetName]
      return `Sheet: ${sheetName}\n${XLSX.utils.sheet_to_csv(sheet)}`
    }).join('\n\n')
    return { type: 'text', content: text }
  }

  const text = await file.text()
  return { type: 'text', content: text }
}

export default function Step0({ onNext, onExtract }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [extractedFields, setExtractedFields] = useState(null)
  const [fileErrors, setFileErrors] = useState([])
  const inputRef = useRef(null)

  const addFiles = useCallback((incoming) => {
    const rejected = []
    const accepted = []
    Array.from(incoming).forEach(f => {
      const ext = '.' + fileExt(f.name)
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        rejected.push(`${f.name} — unsupported type`)
      } else if (f.size > MAX_FILE_SIZE) {
        rejected.push(`${f.name} — exceeds ${MAX_FILE_SIZE_MB}MB limit`)
      } else {
        accepted.push(f)
      }
    })
    setFileErrors(rejected)
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      return [...prev, ...accepted.filter(f => !existingNames.has(f.name))].slice(0, MAX_FILES)
    })
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }, [addFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false)
  }, [])

  const removeFile = (name) => {
    setFiles(prev => prev.filter(f => f.name !== name))
    if (extractedFields) setExtractedFields(null)
  }

  const handleAnalyze = async () => {
    setAnalyzing(true)
    setError(null)
    setExtractedFields(null)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      // Extract content from each file
      const documents = await Promise.all(
        files.map(async f => {
          const { type, content } = await extractFileContent(f)
          // Truncate long text documents before sending
          const trimmed =
            type === 'text' && content.length > MAX_CHARS_PER_DOC
              ? content.slice(0, MAX_CHARS_PER_DOC) + '\n[content truncated]'
              : content
          return { name: f.name, type, content: trimmed }
        })
      )

      // Estimate encoded body size and reject before wasting a round-trip
      const body = JSON.stringify({ documents })
      if (body.length > MAX_BODY_BYTES) {
        throw new Error('Combined file content is too large to process. Try uploading fewer files or use smaller documents.')
      }

      const res = await fetch('/api/extract-from-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const json = await res.json()

      if (res.status === 413) {
        throw new Error(json.error || 'Files are too large. Try uploading fewer or smaller documents.')
      }
      if (res.status === 504) {
        throw new Error(json.error || 'Analysis timed out. Try with fewer or smaller files.')
      }
      if (!res.ok) {
        throw new Error(json.error || 'Extraction failed. Please try again.')
      }

      const populated = Object.entries(json.extracted)
        .filter(([, v]) => v.trim().length > 0)
        .map(([k]) => k)

      setExtractedFields(populated)
      onExtract(json.extracted)
    } catch (err) {
      clearTimeout(timeoutId)
      if (err.name === 'AbortError') {
        setError('Analysis is taking too long. Try uploading fewer or smaller files. Large documents may exceed the server time limit.')
      } else {
        setError(err.message)
      }
    } finally {
      setAnalyzing(false)
    }
  }

  const analysisComplete = extractedFields !== null

  return (
    <div>
      <h2 style={{
        fontFamily: "'Orbitron', monospace",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: '#00ccff',
        textShadow: '0 0 10px rgba(0, 204, 255, 0.6)',
        marginBottom: 8,
      }}>
        Upload Source Materials
      </h2>
      <p style={{ color: 'rgba(120, 153, 187, 0.55)', fontSize: 12, fontFamily: "'Share Tech Mono', monospace", marginBottom: 28, letterSpacing: '0.04em' }}>
        // Upload existing docs. Claude will extract and pre-populate your PRD fields. Optional.
      </p>

      {/* Drop zone */}
      {!analysisComplete && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !analyzing && inputRef.current?.click()}
          style={{
            border: `1px dashed ${dragging ? '#00ccff' : 'rgba(0, 204, 255, 0.25)'}`,
            padding: '36px 24px',
            textAlign: 'center',
            cursor: analyzing ? 'default' : 'pointer',
            background: dragging ? 'rgba(0, 204, 255, 0.04)' : 'rgba(0, 0, 0, 0.3)',
            transition: 'all var(--transition)',
            boxShadow: dragging ? '0 0 20px rgba(0, 204, 255, 0.1), inset 0 0 20px rgba(0, 204, 255, 0.03)' : 'none',
            position: 'relative',
          }}
        >
          {/* Drop zone corner accents */}
          {['tl', 'tr', 'bl', 'br'].map(pos => (
            <div key={pos} style={{
              position: 'absolute',
              width: 10, height: 10,
              top: pos.startsWith('t') ? 0 : 'auto',
              bottom: pos.startsWith('b') ? 0 : 'auto',
              left: pos.endsWith('l') ? 0 : 'auto',
              right: pos.endsWith('r') ? 0 : 'auto',
              borderTop: pos.startsWith('t') ? `1px solid ${dragging ? '#00ccff' : 'rgba(0, 204, 255, 0.4)'}` : 'none',
              borderBottom: pos.startsWith('b') ? `1px solid ${dragging ? '#00ccff' : 'rgba(0, 204, 255, 0.4)'}` : 'none',
              borderLeft: pos.endsWith('l') ? `1px solid ${dragging ? '#00ccff' : 'rgba(0, 204, 255, 0.4)'}` : 'none',
              borderRight: pos.endsWith('r') ? `1px solid ${dragging ? '#00ccff' : 'rgba(0, 204, 255, 0.4)'}` : 'none',
            }} />
          ))}

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.docx,.xlsx,.csv"
            style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)}
          />

          <UploadIcon dragging={dragging} />

          <p style={{
            fontFamily: "'Orbitron', monospace",
            fontWeight: 600,
            fontSize: 12,
            letterSpacing: '0.1em',
            color: dragging ? '#00ccff' : 'rgba(120, 153, 187, 0.7)',
            textShadow: dragging ? '0 0 8px rgba(0, 204, 255, 0.6)' : 'none',
            marginTop: 14,
            marginBottom: 8,
            transition: 'all var(--transition)',
          }}>
            {dragging ? 'RELEASE TO UPLOAD' : 'DRAG FILES HERE OR CLICK TO BROWSE'}
          </p>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: 'rgba(160, 185, 210, 0.75)', letterSpacing: '0.06em' }}>
            .TXT &nbsp;·&nbsp; .PDF &nbsp;·&nbsp; .DOCX &nbsp;·&nbsp; .XLSX &nbsp;·&nbsp; .CSV
            &nbsp;&nbsp;|&nbsp;&nbsp; MAX {MAX_FILE_SIZE_MB}MB &nbsp;·&nbsp; UP TO {MAX_FILES} FILES
          </p>
        </div>
      )}

      {/* File errors */}
      {fileErrors.length > 0 && (
        <div style={{ marginTop: 10, fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: '#ff4466', textShadow: '0 0 6px rgba(255, 68, 102, 0.4)' }}>
          {fileErrors.map((e, i) => <div key={i}>⚠ {e}</div>)}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {files.map(f => {
            const ext = fileExt(f.name)
            const color = fileTypeColor(ext)
            return (
              <div key={f.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                border: `1px solid ${color}33`,
                background: `${color}08`,
                boxShadow: `0 0 8px ${color}0a`,
              }}>
                <span style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  color,
                  textShadow: `0 0 6px ${color}`,
                  minWidth: 36,
                }}>
                  {ext.toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--color-text-primary)' }}>
                    {f.name}
                  </div>
                  <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: 'rgba(120, 153, 187, 0.4)', marginTop: 2 }}>
                    {formatBytes(f.size)}
                  </div>
                </div>
                {!analyzing && !analysisComplete && (
                  <button
                    onClick={() => removeFile(f.name)}
                    style={{
                      background: 'none',
                      border: '1px solid rgba(255, 68, 102, 0.3)',
                      color: 'rgba(255, 68, 102, 0.5)',
                      cursor: 'pointer',
                      padding: '2px 7px',
                      fontFamily: 'monospace',
                      fontSize: 14,
                      lineHeight: 1,
                      transition: 'all var(--transition)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#ff4466'; e.currentTarget.style.color = '#ff4466'; e.currentTarget.style.boxShadow = '0 0 6px rgba(255, 68, 102, 0.3)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255, 68, 102, 0.3)'; e.currentTarget.style.color = 'rgba(255, 68, 102, 0.5)'; e.currentTarget.style.boxShadow = 'none' }}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Analyzing state */}
      {analyzing && (
        <div style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          border: '1px solid rgba(0, 204, 255, 0.3)',
          background: 'rgba(0, 204, 255, 0.04)',
          color: '#00ccff',
          fontFamily: "'Orbitron', monospace",
          fontSize: 11,
          letterSpacing: '0.12em',
          textShadow: '0 0 8px rgba(0, 204, 255, 0.5)',
          boxShadow: '0 0 12px rgba(0, 204, 255, 0.08)',
        }}>
          <Spinner />
          EXTRACTING DATA WITH CLAUDE...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16,
          padding: '12px 14px',
          border: '1px solid rgba(255, 68, 102, 0.4)',
          background: 'rgba(255, 68, 102, 0.07)',
          color: '#ff4466',
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 13,
          textShadow: '0 0 6px rgba(255, 68, 102, 0.3)',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Success state */}
      {analysisComplete && (
        <div style={{
          marginTop: 20,
          padding: '18px',
          border: '1px solid rgba(0, 204, 255, 0.3)',
          background: 'rgba(0, 204, 255, 0.03)',
          boxShadow: '0 0 16px rgba(0, 204, 255, 0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <CheckIcon />
            <span style={{
              fontFamily: "'Orbitron', monospace",
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.14em',
              color: '#00ccff',
              textShadow: '0 0 8px rgba(0, 204, 255, 0.6)',
            }}>
              EXTRACTION COMPLETE
            </span>
          </div>
          <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: 'rgba(120, 153, 187, 0.6)', marginBottom: 12, letterSpacing: '0.04em' }}>
            // Fields pre-populated from your documents. Review and edit in the next steps.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {extractedFields.map(k => (
              <span key={k} style={{
                padding: '3px 10px',
                border: '1px solid rgba(255, 0, 144, 0.4)',
                background: 'rgba(255, 0, 144, 0.07)',
                color: '#ff0090',
                fontFamily: "'Orbitron', monospace",
                fontSize: 9,
                letterSpacing: '0.1em',
                textShadow: '0 0 6px rgba(255, 0, 144, 0.5)',
              }}>
                {FIELD_LABELS[k] || k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 36,
        paddingTop: 24,
        borderTop: '1px solid rgba(0, 204, 255, 0.1)',
      }}>
        <button
          onClick={onNext}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(160, 185, 210, 0.7)',
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 13,
            cursor: 'pointer',
            padding: 0,
            letterSpacing: '0.06em',
            transition: 'color var(--transition)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'rgba(160, 185, 210, 1)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(160, 185, 210, 0.7)' }}
        >
          skip this step →
        </button>

        {!analysisComplete ? (
          <button
            onClick={handleAnalyze}
            disabled={files.length === 0 || analyzing}
            style={{
              padding: '10px 26px',
              border: files.length === 0 || analyzing ? '1px solid rgba(0, 204, 255, 0.1)' : '1px solid rgba(0, 204, 255, 0.6)',
              background: 'transparent',
              color: files.length === 0 || analyzing ? 'rgba(120, 153, 187, 0.25)' : '#00ccff',
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              letterSpacing: '0.14em',
              cursor: files.length === 0 || analyzing ? 'not-allowed' : 'pointer',
              textShadow: files.length === 0 || analyzing ? 'none' : '0 0 8px rgba(0, 204, 255, 0.6)',
              boxShadow: files.length === 0 || analyzing ? 'none' : '0 0 12px rgba(0, 204, 255, 0.25), inset 0 0 10px rgba(0, 204, 255, 0.03)',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => {
              if (files.length > 0 && !analyzing) {
                e.currentTarget.style.background = 'rgba(0, 204, 255, 0.07)'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 204, 255, 0.4), inset 0 0 15px rgba(0, 204, 255, 0.05)'
              }
            }}
            onMouseLeave={e => {
              if (files.length > 0 && !analyzing) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 204, 255, 0.25), inset 0 0 10px rgba(0, 204, 255, 0.03)'
              }
            }}
          >
            ✦ ANALYZE WITH CLAUDE
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              padding: '10px 26px',
              border: '1px solid rgba(255, 0, 144, 0.7)',
              background: 'transparent',
              color: '#ff0090',
              fontFamily: "'Orbitron', monospace",
              fontSize: 11,
              letterSpacing: '0.14em',
              cursor: 'pointer',
              textShadow: '0 0 8px rgba(255, 0, 144, 0.6)',
              boxShadow: '0 0 12px rgba(255, 0, 144, 0.25), inset 0 0 10px rgba(255, 0, 144, 0.03)',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 0, 144, 0.1)'; e.currentTarget.style.boxShadow = '0 0 22px rgba(255, 0, 144, 0.5), inset 0 0 15px rgba(255, 0, 144, 0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = '0 0 12px rgba(255, 0, 144, 0.25), inset 0 0 10px rgba(255, 0, 144, 0.03)' }}
          >
            CONTINUE →
          </button>
        )}
      </div>
    </div>
  )
}

function UploadIcon({ dragging }) {
  const color = dragging ? '#00ccff' : 'rgba(0, 204, 255, 0.35)'
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" style={{ margin: '0 auto', display: 'block' }}>
      <rect x="1" y="1" width="38" height="38" stroke={color} strokeWidth="1" opacity="0.6"/>
      <path d="M20 28V14M14 20l6-6 6 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 32h16" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="3" y="3" width="6" height="6" fill={color} opacity="0.15"/>
      <rect x="31" y="3" width="6" height="6" fill={color} opacity="0.15"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="0.5" y="0.5" width="15" height="15" stroke="#00ccff" strokeOpacity="0.6"/>
      <path d="M4 8L7 11L12 5" stroke="#00ccff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5" stroke="rgba(0,204,255,0.2)" strokeWidth="2" fill="none"/>
      <path d="M7 2 A5 5 0 0 1 12 7" stroke="#00ccff" strokeWidth="2" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
