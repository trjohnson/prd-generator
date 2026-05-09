import { useState } from 'react'
import StepIndicator from './StepIndicator.jsx'
import Step0 from './steps/Step0.jsx'
import Step1 from './steps/Step1.jsx'
import Step2 from './steps/Step2.jsx'
import Step3 from './steps/Step3.jsx'
import Step4 from './steps/Step4.jsx'
import Step5 from './steps/Step5.jsx'

const STEPS = [
  'Source Materials',
  'Feature & Problem',
  'Target Users',
  'Goals & Metrics',
  'Scope',
  'Review & Generate',
]

const EMPTY_AUTO_POPULATED = {
  problemStatement: false,
  targetUsers: false,
  goals: false,
  successMetrics: false,
  inScope: false,
  outOfScope: false,
}

export default function Wizard({ formData, setFormData, onGenerate, loading, error }) {
  const [step, setStep] = useState(0)
  const [autoPopulated, setAutoPopulated] = useState(EMPTY_AUTO_POPULATED)

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const clearAutoPopulated = (field) => {
    if (autoPopulated[field]) {
      setAutoPopulated(prev => ({ ...prev, [field]: false }))
    }
  }

  const handleExtract = (extracted) => {
    const newAutoPopulated = { ...EMPTY_AUTO_POPULATED }
    setFormData(prev => {
      const next = { ...prev }
      for (const [key, val] of Object.entries(extracted)) {
        if (val && val.trim()) {
          next[key] = val
          newAutoPopulated[key] = true
        }
      }
      return next
    })
    setAutoPopulated(newAutoPopulated)
  }

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const sharedProps = { formData, update, onNext: next, onBack: back, autoPopulated, clearAutoPopulated }

  const stepComponents = [
    <Step0 key={0} onNext={next} onExtract={handleExtract} />,
    <Step1 key={1} {...sharedProps} />,
    <Step2 key={2} {...sharedProps} />,
    <Step3 key={3} {...sharedProps} />,
    <Step4 key={4} {...sharedProps} />,
    <Step5 key={5} formData={formData} update={update} onNext={next} onBack={back} onGenerate={() => onGenerate(formData)} loading={loading} error={error} />,
  ]

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 22,
          fontWeight: 800,
          letterSpacing: '0.12em',
          marginBottom: 10,
          color: '#ff0090',
          textShadow: '0 0 16px rgba(255, 0, 144, 0.7), 0 0 32px rgba(255, 0, 144, 0.3)',
          textTransform: 'uppercase',
          animation: 'neon-flicker 10s infinite',
        }}>
          Generate a PRD
        </h1>
        <p style={{
          color: 'rgba(120, 153, 187, 0.6)',
          fontSize: 12,
          fontFamily: "'Share Tech Mono', monospace",
          letterSpacing: '0.06em',
        }}>
          // Input data. Let Claude do the rest.
        </p>
      </div>

      <StepIndicator steps={STEPS} current={step} />

      <div style={{
        background: 'rgba(8, 13, 28, 0.92)',
        border: '1px solid rgba(0, 204, 255, 0.15)',
        padding: '32px',
        marginTop: 28,
        boxShadow: '0 0 30px rgba(0, 204, 255, 0.04), inset 0 0 40px rgba(0, 0, 0, 0.5)',
        position: 'relative',
      }}>
        {/* corner accents */}
        <div style={{ position: 'absolute', top: -1, left: -1, width: 12, height: 12, borderTop: '2px solid #00ccff', borderLeft: '2px solid #00ccff' }} />
        <div style={{ position: 'absolute', top: -1, right: -1, width: 12, height: 12, borderTop: '2px solid #00ccff', borderRight: '2px solid #00ccff' }} />
        <div style={{ position: 'absolute', bottom: -1, left: -1, width: 12, height: 12, borderBottom: '2px solid #00ccff', borderLeft: '2px solid #00ccff' }} />
        <div style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderBottom: '2px solid #00ccff', borderRight: '2px solid #00ccff' }} />

        {stepComponents[step]}
      </div>
    </div>
  )
}
