/** Every Theme the app knows. Kept free of rendering code so it can live in the initial bundle. */
export const THEME_IDS = ['ayutthaya'] as const
export type ThemeId = (typeof THEME_IDS)[number]
export const DEFAULT_THEME_ID: ThemeId = 'ayutthaya'

/** Unknown or removed Theme ids fall back to the default, so an old saved choice never breaks the app. */
export function resolveThemeId(id: unknown): ThemeId {
  return THEME_IDS.find((known) => known === id) ?? DEFAULT_THEME_ID
}
