import { useState } from 'react'
import StepIndicator from './StepIndicator.jsx'
import Step1 from './steps/Step1.jsx'
import Step2 from './steps/Step2.jsx'
import Step3 from './steps/Step3.jsx'
import Step4 from './steps/Step4.jsx'
import Step5 from './steps/Step5.jsx'

const STEPS = [
  'Feature & Problem',
  'Target Users',
  'Goals & Metrics',
  'Scope',
  'Review & Generate',
]

export default function Wizard({ formData, setFormData, onGenerate, loading, error }) {
  const [step, setStep] = useState(0)

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }))

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep(s => Math.max(s - 1, 0))

  const stepProps = { formData, update, onNext: next, onBack: back }

  const stepComponents = [
    <Step1 key={0} {...stepProps} />,
    <Step2 key={1} {...stepProps} />,
    <Step3 key={2} {...stepProps} />,
    <Step4 key={3} {...stepProps} />,
    <Step5 key={4} {...stepProps} onGenerate={() => onGenerate(formData)} loading={loading} error={error} />,
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
