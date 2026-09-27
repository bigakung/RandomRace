import { describe, expect, it } from 'vitest'
import { DEFAULT_THEME_ID, resolveThemeId, THEME_COPY, THEME_IDS } from './registry'

describe('resolveThemeId', () => {
  it('accepts every known id', () => {
    for (const id of THEME_IDS) expect(resolveThemeId(id)).toBe(id)
  })

  it('falls back to the default for an unknown or removed id', () => {
    expect(resolveThemeId('not-a-theme')).toBe(DEFAULT_THEME_ID)
    expect(resolveThemeId(undefined)).toBe(DEFAULT_THEME_ID)
    expect(resolveThemeId(null)).toBe(DEFAULT_THEME_ID)
  })
})

describe('THEME_COPY', () => {
  it('has a complete, non-empty entry for every Theme id', () => {
    for (const id of THEME_IDS) {
      const entry = THEME_COPY[id]
      expect(entry.label.name.length).toBeGreaterThan(0)
      expect(entry.label.description.length).toBeGreaterThan(0)
      expect(entry.sceneTitle.length).toBeGreaterThan(0)
      expect(entry.tagline.length).toBeGreaterThan(0)
      expect(entry.loadingMessage.length).toBeGreaterThan(0)
      expect(entry.leadersLabel.length).toBeGreaterThan(0)
      expect(entry.raceLabel(4)).toContain('4')
    }
  })

  it('gives every Theme its own wording, not a shared default', () => {
    const taglines = new Set(THEME_IDS.map((id) => THEME_COPY[id].tagline))
    expect(taglines.size).toBe(THEME_IDS.length)
  })
})
