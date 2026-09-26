import { copy } from '../../copy/th'
import { RACE_DURATION_PRESETS_MS, type RaceDurationMs } from '../session/pickerSession'

type RaceDurationPickerProps = {
  value: RaceDurationMs
  onChange: (durationMs: RaceDurationMs) => void
}

/** Native radio buttons styled as segments, so arrow keys and screen readers work for free. */
export function RaceDurationPicker({ value, onChange }: RaceDurationPickerProps) {
  return (
    <fieldset className="duration">
      <legend className="duration__legend">{copy.raceDurationLabel}</legend>
      <div className="duration__options">
        {RACE_DURATION_PRESETS_MS.map((preset) => (
          <label key={preset} className="duration__option">
            <input
              type="radio"
              name="race-duration"
              value={preset}
              checked={preset === value}
              onChange={() => onChange(preset)}
            />
            <span>{copy.raceDuration(preset)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
