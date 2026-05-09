import FormField from '../FormField.jsx'
import NavButtons from '../NavButtons.jsx'

export default function Step4({ formData, update, onNext, onBack, autoPopulated, clearAutoPopulated }) {
  const handleChange = (field, value) => {
    clearAutoPopulated(field)
    update(field, value)
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00ccff', textShadow: '0 0 10px rgba(0, 204, 255, 0.6)', marginBottom: 8 }}>Scope</h2>
      <p style={{ color: 'rgba(120, 153, 187, 0.55)', fontSize: 12, fontFamily: "'Share Tech Mono', monospace", marginBottom: 28, letterSpacing: '0.04em' }}>
        // Define boundaries. What's in. What's out. No ambiguity.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField
          label="In Scope"
          hint="List the features, functionality, and behaviors that will be delivered in this release."
          placeholder="e.g. Daily digest email summarizing all notifications from the past 24 hours; User-configurable digest time; Grouping by project or team..."
          value={formData.inScope}
          onChange={v => handleChange('inScope', v)}
          multiline
          rows={5}
          autoPopulated={autoPopulated.inScope}
        />
        <FormField
          label="Out of Scope"
          hint="List what will explicitly NOT be included. Capture deliberate decisions to defer or exclude."
          placeholder="e.g. Real-time notification delivery (not changed); Push notification digest (email only for v1); AI-powered prioritization (future phase)..."
          value={formData.outOfScope}
          onChange={v => handleChange('outOfScope', v)}
          multiline
          rows={5}
          autoPopulated={autoPopulated.outOfScope}
        />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Review →" />
    </div>
  )
}
