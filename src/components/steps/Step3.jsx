import FormField from '../FormField.jsx'
import NavButtons from '../NavButtons.jsx'

export default function Step3({ formData, update, onNext, onBack, autoPopulated, clearAutoPopulated }) {
  const handleChange = (field, value) => {
    clearAutoPopulated(field)
    update(field, value)
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Goals & Success Metrics</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Define what success looks like. Good metrics are specific and measurable.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField
          label="Goals"
          hint="What business and user outcomes do you want to achieve with this feature?"
          placeholder="e.g. Reduce notification-driven churn by improving signal-to-noise ratio; Increase daily active usage among power users..."
          value={formData.goals}
          onChange={v => handleChange('goals', v)}
          multiline
          rows={4}
          autoPopulated={autoPopulated.goals}
        />
        <FormField
          label="Success Metrics"
          hint="How will you measure whether those goals were achieved? Include KPIs, targets, and timeframes."
          placeholder="e.g. 20% reduction in notification opt-outs within 60 days; NPS score increase of +10 among power users..."
          value={formData.successMetrics}
          onChange={v => handleChange('successMetrics', v)}
          multiline
          rows={5}
          autoPopulated={autoPopulated.successMetrics}
        />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue →" />
    </div>
  )
}
