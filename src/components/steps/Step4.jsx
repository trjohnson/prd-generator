import FormField from '../FormField.jsx'
import NavButtons from '../NavButtons.jsx'

export default function Step4({ formData, update, onNext, onBack }) {
  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Scope</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
        Clearly define boundaries. Being explicit about what is NOT included is just as important as what is.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField
          label="In Scope"
          hint="List the features, functionality, and behaviors that will be delivered in this release."
          placeholder="e.g. Daily digest email summarizing all notifications from the past 24 hours; User-configurable digest time; Grouping by project or team..."
          value={formData.inScope}
          onChange={v => update('inScope', v)}
          multiline
          rows={5}
        />
        <FormField
          label="Out of Scope"
          hint="List what will explicitly NOT be included. Capture deliberate decisions to defer or exclude."
          placeholder="e.g. Real-time notification delivery (not changed); Push notification digest (email only for v1); AI-powered prioritization (future phase)..."
          value={formData.outOfScope}
          onChange={v => update('outOfScope', v)}
          multiline
          rows={5}
        />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review →" />
    </div>
  )
}
