import { copy } from '../../copy/th'
import { THEME_COPY, THEME_IDS, type ThemeId } from '../../themes/registry'

type ThemePickerProps = {
  value: ThemeId
  onChange: (themeId: ThemeId) => void
}

/** Native radio buttons styled as cards, so arrow keys and screen readers work for free. Only
 * shown on the Roster screen, so the Theme cannot change mid-Race — cosmetic only, like sound. */
export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <fieldset className="theme-picker">
      <legend className="theme-picker__legend">{copy.themeLabel}</legend>
      <div className="theme-picker__options">
        {THEME_IDS.map((id) => {
          const { name, description } = THEME_COPY[id].label
          return (
            <label key={id} className="theme-picker__option">
              <input type="radio" name="theme" value={id} checked={id === value} onChange={() => onChange(id)} />
              <span className="theme-picker__name">{name}</span>
              <span className="theme-picker__description">{description}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
