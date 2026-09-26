import { DEFAULT_THEME_ID, resolveThemeId, type ThemeId } from '../../themes/registry'
import { MAX_PARTICIPANTS } from '../picker/roster'
import { DEFAULT_RACE_DURATION_MS, RACE_DURATION_PRESETS_MS, type RaceDurationMs } from '../session/pickerSession'

/** What the app remembers between visits. */
export type Preferences = {
  readonly names: readonly string[]
  readonly raceDurationMs: RaceDurationMs
  readonly soundOn: boolean
  readonly themeId: ThemeId
}

export type StorageLike = Pick<Storage, 'getItem' | 'setItem'>

export type PreferencesStore = {
  load(): Preferences
  save(preferences: Preferences): void
}

export const PREFERENCES_KEY = 'ayutthaya-random-picker'
const VERSION = 1

export const DEFAULT_PREFERENCES: Preferences = {
  names: [],
  raceDurationMs: DEFAULT_RACE_DURATION_MS,
  soundOn: false,
  themeId: DEFAULT_THEME_ID,
}

function cleanNames(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((name): name is string => typeof name === 'string')
    .map((name) => name.trim())
    .filter((name) => name.length > 0)
    .slice(0, MAX_PARTICIPANTS)
}

/** Validates each field on its own, so one bad value never discards the rest. */
function parse(raw: string | null): Preferences {
  if (raw === null) return DEFAULT_PREFERENCES
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return DEFAULT_PREFERENCES
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) return DEFAULT_PREFERENCES
  const record = data as Record<string, unknown>
  if (record.version !== VERSION) return DEFAULT_PREFERENCES

  return {
    names: cleanNames(record.names),
    raceDurationMs:
      RACE_DURATION_PRESETS_MS.find((preset) => preset === record.raceDurationMs) ?? DEFAULT_PREFERENCES.raceDurationMs,
    soundOn: typeof record.soundOn === 'boolean' ? record.soundOn : DEFAULT_PREFERENCES.soundOn,
    themeId: resolveThemeId(record.themeId),
  }
}

/**
 * Reads and writes preferences in localStorage. Private browsing, blocked storage, a full
 * quota or corrupted data all degrade to defaults instead of breaking the app.
 */
export function createPreferencesStore(storage: StorageLike | undefined): PreferencesStore {
  return {
    load() {
      try {
        return parse(storage?.getItem(PREFERENCES_KEY) ?? null)
      } catch {
        return DEFAULT_PREFERENCES
      }
    },
    save(preferences) {
      try {
        storage?.setItem(PREFERENCES_KEY, JSON.stringify({ version: VERSION, ...preferences }))
      } catch {
        // Not being able to remember is fine; the app keeps working for this visit.
      }
    },
  }
}

/** `window.localStorage` itself can throw (e.g. when storage is blocked), so guard the lookup. */
export function browserStorage(): StorageLike | undefined {
  try {
    return window.localStorage
  } catch {
    return undefined
  }
}
