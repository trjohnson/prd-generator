import { useState } from 'react'
import Wizard from './components/Wizard.jsx'
import PRDOutput from './components/PRDOutput.jsx'
import Header from './components/Header.jsx'

const INITIAL_FORM = {
  featureName: '',
  problemStatement: '',
  targetUsers: '',
  useCases: '',
  goals: '',
  successMetrics: '',
  inScope: '',
  outOfScope: '',
}

export default function App() {
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [prd, setPrd] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGenerate = async (data) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/generate-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Generation failed')
      setPrd(json.prd)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setPrd(null)
    setError(null)
    setFormData(INITIAL_FORM)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '32px 16px', maxWidth: 860, width: '100%', margin: '0 auto' }}>
        {prd ? (
          <PRDOutput
            prd={prd}
            featureName={formData.featureName}
            onReset={handleReset}
          />
        ) : (
          <Wizard
            formData={formData}
            setFormData={setFormData}
            onGenerate={handleGenerate}
            loading={loading}
            error={error}
          />
        )}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--color-text-muted)',
        fontSize: '13px',
        borderTop: '1px solid var(--color-border)',
      }}>
        PRD Generator &mdash; Powered by Claude
      </footer>
    </div>
  )
}
