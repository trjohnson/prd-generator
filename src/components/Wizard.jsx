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
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 6 }}>
          Generate a PRD
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
          Answer a few questions and get a professional product requirements document in seconds.
        </p>
      </div>
      <StepIndicator steps={STEPS} current={step} />
      <div style={{
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '32px',
        marginTop: 24,
        boxShadow: 'var(--shadow-sm)',
      }}>
        {stepComponents[step]}
      </div>
    </div>
  )
}
