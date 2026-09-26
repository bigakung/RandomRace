import { describe, expect, it } from 'vitest'
import { DEFAULT_PREFERENCES, PREFERENCES_KEY, createPreferencesStore, type StorageLike } from './preferences'

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Record<string, string> } {
  const data = { ...initial }
  return {
    data,
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value
    },
  }
}

const throwingStorage: StorageLike = {
  getItem: () => {
    throw new Error('SecurityError')
  },
  setItem: () => {
    throw new Error('QuotaExceededError')
  },
}

function stored(value: unknown) {
  return memoryStorage({ [PREFERENCES_KEY]: JSON.stringify(value) })
}

describe('preferences store', () => {
  it('returns defaults when nothing is stored', () => {
    expect(createPreferencesStore(memoryStorage()).load()).toEqual(DEFAULT_PREFERENCES)
    expect(DEFAULT_PREFERENCES).toEqual({ names: [], raceDurationMs: 10_000, soundOn: false, themeId: 'ayutthaya' })
  })

  it('round-trips saved preferences', () => {
    const storage = memoryStorage()
    const store = createPreferencesStore(storage)
    const preferences = { names: ['สมชาย', 'วิชัย'], raceDurationMs: 60_000, soundOn: true, themeId: 'ayutthaya' } as const
    store.save(preferences)
    expect(createPreferencesStore(storage).load()).toEqual(preferences)
  })

  it('never throws when storage is unavailable', () => {
    const store = createPreferencesStore(throwingStorage)
    expect(store.load()).toEqual(DEFAULT_PREFERENCES)
    expect(() => store.save(DEFAULT_PREFERENCES)).not.toThrow()
  })

  it('works without any storage at all', () => {
    const store = createPreferencesStore(undefined)
    expect(store.load()).toEqual(DEFAULT_PREFERENCES)
    expect(() => store.save(DEFAULT_PREFERENCES)).not.toThrow()
  })

  it('ignores malformed JSON', () => {
    const storage = memoryStorage({ [PREFERENCES_KEY]: '{not json' })
    expect(createPreferencesStore(storage).load()).toEqual(DEFAULT_PREFERENCES)
  })

  it('ignores an unknown version', () => {
    expect(createPreferencesStore(stored({ version: 99, names: ['a', 'b'] })).load()).toEqual(DEFAULT_PREFERENCES)
  })

  it('ignores stored values that are not objects', () => {
    for (const value of [null, 42, 'text', ['a']]) {
      expect(createPreferencesStore(stored(value)).load()).toEqual(DEFAULT_PREFERENCES)
    }
  })

  it('replaces each invalid field with its default and keeps the valid ones', () => {
    const store = createPreferencesStore(
      stored({ version: 1, names: ['สมชาย', 'วิชัย'], raceDurationMs: 7_000, soundOn: 'yes', themeId: 'dragon' }),
    )
    expect(store.load()).toEqual({ ...DEFAULT_PREFERENCES, names: ['สมชาย', 'วิชัย'] })
  })

  it('cleans stored names: non-strings and blanks dropped, trimmed, at most 50', () => {
    const names = [' a ', '', 3, null, 'b', ...Array.from({ length: 60 }, (_, i) => `n${i}`)]
    const loaded = createPreferencesStore(stored({ version: 1, names })).load()
    expect(loaded.names).toHaveLength(50)
    expect(loaded.names.slice(0, 3)).toEqual(['a', 'b', 'n0'])
  })

  it('drops names that are not an array', () => {
    expect(createPreferencesStore(stored({ version: 1, names: 'a\nb' })).load().names).toEqual([])
  })
})
