import FormField from '../FormField.jsx'
import NavButtons from '../NavButtons.jsx'

export default function Step1({ formData, update, onNext }) {
  const canContinue = formData.featureName.trim() && formData.problemStatement.trim()

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
          onChange={v => update('featureName', v)}
          required
        />
        <FormField
          label="Problem Statement"
          hint="Describe the pain point or opportunity. Who is affected and why does it matter?"
          placeholder="e.g. Users receive too many notifications and miss critical updates, leading to alert fatigue and disengagement..."
          value={formData.problemStatement}
          onChange={v => update('problemStatement', v)}
          multiline
          rows={5}
          required
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
