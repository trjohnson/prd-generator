import { useState, useRef, useCallback } from 'react'

const ACCEPTED_EXTENSIONS = ['.txt', '.pdf', '.docx', '.xlsx', '.csv']
const MAX_FILE_SIZE_MB = 3
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
const MAX_FILES = 5

const FILE_ICONS = {
  pdf: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="16" rx="1.5" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.2"/>
      <path d="M3 5h11" stroke="#ef4444" strokeWidth="1.2"/>
      <path d="M7 1v4" stroke="#ef4444" strokeWidth="1.2"/>
      <path d="M6 9h8M6 12h5" stroke="#ef4444" strokeWidth="1" strokeLinecap="round"/>
      <text x="5" y="15" fontSize="4" fontWeight="700" fill="#ef4444" fontFamily="sans-serif">PDF</text>
    </svg>
  ),
  docx: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="16" rx="1.5" fill="#dbeafe" stroke="#3b82f6" strokeWidth="1.2"/>
      <path d="M6 8h8M6 11h8M6 14h5" stroke="#3b82f6" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  xlsx: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="16" rx="1.5" fill="#d1fae5" stroke="#10b981" strokeWidth="1.2"/>
      <path d="M3 7h11M3 11h11M7 7v10" stroke="#10b981" strokeWidth="1"/>
    </svg>
  ),
  txt: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="16" rx="1.5" fill="#f3f4f6" stroke="#6b7280" strokeWidth="1.2"/>
      <path d="M6 7h8M6 10h8M6 13h5" stroke="#6b7280" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
  csv: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="1" width="11" height="16" rx="1.5" fill="#d1fae5" stroke="#10b981" strokeWidth="1.2"/>
      <path d="M6 7h8M6 10h8M6 13h5" stroke="#10b981" strokeWidth="1" strokeLinecap="round"/>
    </svg>
  ),
}

const FIELD_LABELS = {
  problemStatement: 'Problem Statement',
  targetUsers: 'Target Users',
  goals: 'Goals',
  successMetrics: 'Success Metrics',
  inScope: 'In Scope',
  outOfScope: 'Out of Scope',
}

function fileExt(name) {
  return name.toLowerCase().split('.').pop()
}

function formatBytes(bytes) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

  // txt, csv
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
        rejected.push(`${f.name}: unsupported file type`)
      } else if (f.size > MAX_FILE_SIZE) {
        rejected.push(`${f.name}: exceeds ${MAX_FILE_SIZE_MB} MB limit`)
      } else {
        accepted.push(f)
      }
    })
    setFileErrors(rejected)
    setFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name))
      const fresh = accepted.filter(f => !existingNames.has(f.name))
      const next = [...prev, ...fresh].slice(0, MAX_FILES)
      return next
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

    try {
      const documents = await Promise.all(
        files.map(async f => {
          const { type, content } = await extractFileContent(f)
          return { name: f.name, type, content }
        })
      )

      const res = await fetch('/api/extract-from-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Extraction failed')

      const populated = Object.entries(json.extracted)
        .filter(([, v]) => v.trim().length > 0)
        .map(([k]) => k)

      setExtractedFields(populated)
      onExtract(json.extracted)
    } catch (err) {
      setError(err.message)
    } finally {
      setAnalyzing(false)
    }
  }

  const analysisComplete = extractedFields !== null

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Upload Source Materials</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Optionally upload existing documents and Claude will extract relevant information to pre-populate your PRD fields. You can edit everything before generating.
      </p>

      {/* Drop zone */}
      {!analysisComplete && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !analyzing && inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '32px 24px',
            textAlign: 'center',
            cursor: analyzing ? 'default' : 'pointer',
            background: dragging ? 'var(--color-accent-light)' : 'var(--color-surface-hover)',
            transition: 'all var(--transition)',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".txt,.pdf,.docx,.xlsx,.csv"
            style={{ display: 'none' }}
            onChange={e => addFiles(e.target.files)}
          />
          <div style={{ marginBottom: 10 }}>
            <UploadIcon />
          </div>
          <p style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            Drag files here or click to browse
          </p>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
            .txt &nbsp;·&nbsp; .pdf &nbsp;·&nbsp; .docx &nbsp;·&nbsp; .xlsx &nbsp;·&nbsp; .csv &nbsp;&nbsp;
            (max {MAX_FILE_SIZE_MB} MB each, up to {MAX_FILES} files)
          </p>
        </div>
      )}

      {/* File errors */}
      {fileErrors.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 13, color: 'var(--color-danger)' }}>
          {fileErrors.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {files.map(f => {
            const ext = fileExt(f.name)
            return (
              <div key={f.name} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
              }}>
                {FILE_ICONS[ext] || FILE_ICONS.txt}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{formatBytes(f.size)}</div>
                </div>
                {!analyzing && !analysisComplete && (
                  <button
                    onClick={() => removeFile(f.name)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: 4,
                      borderRadius: 4,
                      lineHeight: 1,
                      fontSize: 18,
                    }}
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

      {/* Analysis loading */}
      {analyzing && (
        <div style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-accent-light)',
          border: '1px solid #c7d2fd',
          color: 'var(--color-accent)',
          fontSize: 14,
          fontWeight: 500,
        }}>
          <Spinner />
          Extracting information with Claude...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: 16,
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

      {/* Success state */}
      {analysisComplete && (
        <div style={{
          marginTop: 20,
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-success-light)',
          border: '1px solid #6ee7b7',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <CheckIcon />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-success)' }}>
              Extraction complete
            </span>
          </div>
          <p style={{ fontSize: 13, color: '#065f46', marginBottom: 10 }}>
            The following fields have been pre-populated from your documents. You can review and edit them in the next steps.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {extractedFields.map(k => (
              <span key={k} style={{
                padding: '3px 10px',
                borderRadius: 20,
                background: '#d1fae5',
                color: '#065f46',
                fontSize: 12,
                fontWeight: 600,
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
        marginTop: 32,
        paddingTop: 24,
        borderTop: '1px solid var(--color-border)',
      }}>
        <button
          onClick={onNext}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            fontSize: 14,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: 3,
          }}
        >
          Skip this step
        </button>

        {!analysisComplete ? (
          <button
            onClick={handleAnalyze}
            disabled={files.length === 0 || analyzing}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: files.length === 0 || analyzing ? 'var(--color-border)' : 'var(--color-accent)',
              color: files.length === 0 || analyzing ? 'var(--color-text-muted)' : '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: files.length === 0 || analyzing ? 'not-allowed' : 'pointer',
              transition: 'background var(--transition)',
            }}
            onMouseEnter={e => { if (files.length > 0 && !analyzing) e.currentTarget.style.background = 'var(--color-accent-hover)' }}
            onMouseLeave={e => { if (files.length > 0 && !analyzing) e.currentTarget.style.background = 'var(--color-accent)' }}
          >
            Analyze with Claude ✦
          </button>
        ) : (
          <button
            onClick={onNext}
            style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-accent-hover)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)' }}
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}

function UploadIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ margin: '0 auto', display: 'block' }}>
      <circle cx="18" cy="18" r="18" fill="var(--color-accent-light)"/>
      <path d="M18 24V14M14 18l4-4 4 4" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 26h12" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="9" fill="var(--color-success)"/>
      <path d="M5.5 9L8 11.5L12.5 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" fill="none"/>
      <path d="M8 2 A6 6 0 0 1 14 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    </svg>
  )
}
