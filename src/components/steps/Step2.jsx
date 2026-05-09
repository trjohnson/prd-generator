import FormField from '../FormField.jsx'
import NavButtons from '../NavButtons.jsx'

export default function Step2({ formData, update, onNext, onBack }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Target Users & Use Cases</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Describe who will use this feature and the specific scenarios where it provides value.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField
          label="Target Users"
          hint="Define the primary (and secondary) user personas. Include relevant characteristics, behaviors, or roles."
          placeholder="e.g. Power users who manage multiple projects simultaneously; Mobile-first users who check the app frequently throughout the day..."
          value={formData.targetUsers}
          onChange={v => update('targetUsers', v)}
          multiline
          rows={4}
        />
        <FormField
          label="Use Cases"
          hint="List the key scenarios or jobs-to-be-done. What are users trying to accomplish?"
          placeholder="e.g. 1. A manager wants a daily digest of team activity instead of real-time pings. 2. A developer wants to batch low-priority notifications..."
          value={formData.useCases}
          onChange={v => update('useCases', v)}
          multiline
          rows={5}
        />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue →" />
    </div>
  )
}
