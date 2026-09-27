/** Every Theme the app knows. Kept free of rendering code so it can live in the initial bundle. */
export const THEME_IDS = ['ayutthaya', 'elephant'] as const
export type ThemeId = (typeof THEME_IDS)[number]
export const DEFAULT_THEME_ID: ThemeId = 'ayutthaya'

/** A short, human-facing name for picking a Theme on the Roster screen. */
export type ThemeLabel = { name: string; description: string }

/**
 * The Thai UI text that names and describes a Theme, and that reads out during a Race
 * (the scene title, the Roster tagline, the Race's accessible label, the loading message, the
 * crowded-Race Leader panel's label). Kept here — not in each Theme's own `themeConfig.ts` —
 * because the Roster screen needs it before the 3D chunk (and that Theme's own module) has
 * ever loaded.
 */
export type ThemeCopy = {
  label: ThemeLabel
  sceneTitle: string
  tagline: string
  raceLabel: (count: number) => string
  loadingMessage: string
  leadersLabel: string
}

export const THEME_COPY: Record<ThemeId, ThemeCopy> = {
  ayutthaya: {
    label: { name: 'กรุงศรีอยุธยา', description: 'เรือไทยแล่นบนแม่น้ำยามเย็น' },
    sceneTitle: 'กรุงศรีอยุธยา',
    tagline: 'ใส่รายชื่อ แล้วลุ้นว่าเรือของใครจะเข้าเส้นชัยก่อน',
    raceLabel: (count) => `การแข่งเรือ ${count} ลำบนแม่น้ำ`,
    loadingMessage: 'กำลังเตรียมแม่น้ำ…',
    leadersLabel: 'เรือที่นำอยู่ 3 อันดับแรก',
  },
  elephant: {
    label: { name: 'ขบวนช้างไทย', description: 'ช้างวิ่งเล่นบนทุ่งหญ้าชนบท' },
    sceneTitle: 'ขบวนช้างไทย',
    tagline: 'ใส่รายชื่อ แล้วลุ้นว่าช้างของใครจะเข้าเส้นชัยก่อน',
    raceLabel: (count) => `การแข่งช้าง ${count} เชือกบนทุ่งหญ้า`,
    loadingMessage: 'กำลังเตรียมทุ่งหญ้า…',
    leadersLabel: 'ช้างที่นำอยู่ 3 อันดับแรก',
  },
}

/** Unknown or removed Theme ids fall back to the default, so an old saved choice never breaks the app. */
export function resolveThemeId(id: unknown): ThemeId {
  return THEME_IDS.find((known) => known === id) ?? DEFAULT_THEME_ID
}
