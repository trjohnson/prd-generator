import FormField from '../FormField.jsx'
import NavButtons from '../NavButtons.jsx'

export default function Step2({ formData, update, onNext, onBack, autoPopulated, clearAutoPopulated }) {
  const handleChange = (field, value) => {
    clearAutoPopulated(field)
    update(field, value)
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Orbitron', monospace", fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#00ccff', textShadow: '0 0 10px rgba(0, 204, 255, 0.6)', marginBottom: 8 }}>Target Users &amp; Use Cases</h2>
      <p style={{ color: 'rgba(120, 153, 187, 0.55)', fontSize: 12, fontFamily: "'Share Tech Mono', monospace", marginBottom: 28, letterSpacing: '0.04em' }}>
        // Define who this is for and the scenarios where it delivers value.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <FormField
          label="Target Users"
          hint="Define the primary (and secondary) user personas. Include relevant characteristics, behaviors, or roles."
          placeholder="e.g. Power users who manage multiple projects simultaneously; Mobile-first users who check the app frequently throughout the day..."
          value={formData.targetUsers}
          onChange={v => handleChange('targetUsers', v)}
          multiline
          rows={4}
          autoPopulated={autoPopulated.targetUsers}
        />
        <FormField
          label="Use Cases"
          hint="List the key scenarios or jobs-to-be-done. What are users trying to accomplish?"
          placeholder="e.g. 1. A manager wants a daily digest of team activity instead of real-time pings. 2. A developer wants to batch low-priority notifications..."
          value={formData.useCases}
          onChange={v => handleChange('useCases', v)}
          multiline
          rows={5}
        />
      </div>
      <NavButtons onBack={onBack} onNext={onNext} nextLabel="Continue →" />
    </div>
  )
}
