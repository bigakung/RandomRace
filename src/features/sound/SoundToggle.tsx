import { copy } from '../../copy/th'

type SoundToggleProps = {
  on: boolean
  supported: boolean
  onChange: (on: boolean) => void
}

export function SoundToggle({ on, supported, onChange }: SoundToggleProps) {
  if (!supported) return null
  return (
    <button
      type="button"
      className="sound-toggle"
      // A toggle keeps one label; aria-pressed announces whether sound is on.
      aria-pressed={on}
      aria-label={copy.sound}
      title={on ? copy.soundOff : copy.soundOn}
      onClick={() => onChange(!on)}
    >
      <span aria-hidden="true">{on ? '🔊' : '🔇'}</span>
    </button>
  )
}
