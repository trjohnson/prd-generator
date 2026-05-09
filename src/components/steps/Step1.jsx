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
      <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00ccff', textShadow: '0 0 10px rgba(0, 204, 255, 0.6)', marginBottom: 8 }}>Feature Name &amp; Problem Statement</h2>
      <p style={{ color: 'rgba(120, 153, 187, 0.55)', fontSize: 12, fontFamily: "'Share Tech Mono', monospace", marginBottom: 28, letterSpacing: '0.04em' }}>
        // Name your feature and articulate the problem it solves.
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
