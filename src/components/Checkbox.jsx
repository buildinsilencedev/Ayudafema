import { Check } from 'lucide-react'

// Custom-styled checkbox backed by a real <input type="checkbox"> so screen
// readers and keyboard users get proper semantics. The visible circle tracks
// the input's checked state.

export function Checkbox({ id, checked, onChange, label, className = '' }) {
  return (
    <label htmlFor={id} className={`inline-flex items-center cursor-pointer ${className}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className="w-5 h-5 rounded-full flex items-center justify-center border peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2"
        style={{
          borderColor: checked ? 'var(--ok)' : 'var(--ink-softer)',
          background: checked ? 'var(--ok)' : 'transparent',
          color: 'var(--paper)',
          outlineColor: 'var(--accent)',
        }}
      >
        {checked ? <Check size={12} strokeWidth={3} /> : null}
      </span>
      {label ? <span className="sr-only">{label}</span> : null}
    </label>
  )
}
