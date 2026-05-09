import FormField from '../FormField.jsx'
import NavButtons from '../NavButtons.jsx'

export default function Step1({ formData, update, onNext, onBack, autoPopulated, clearAutoPopulated }) {
  const canContinue = formData.featureName.trim() && formData.problemStatement.trim()

  const handleChange = (field, value) => {
    clearAutoPopulated(field)
    update(field, value)
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Feature Name & Problem Statement</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Start by naming your feature and clearly articulating the problem it solves.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField
          label="Feature Name"
          hint="A short, descriptive name for the feature or product."
          placeholder="e.g. Smart Notification Digest"
          value={formData.featureName}
          onChange={v => handleChange('featureName', v)}
          required
        />
        <FormField
          label="Problem Statement"
          hint="Describe the pain point or opportunity. Who is affected and why does it matter?"
          placeholder="e.g. Users receive too many notifications and miss critical updates, leading to alert fatigue and disengagement..."
          value={formData.problemStatement}
          onChange={v => handleChange('problemStatement', v)}
          multiline
          rows={5}
          required
          autoPopulated={autoPopulated.problemStatement}
        />
      </div>
      <NavButtons
        isFirst
        onNext={onNext}
        disabled={!canContinue}
        nextLabel="Continue →"
      />
    </div>
  )
}
