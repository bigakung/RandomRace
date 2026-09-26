/**
 * Optional GLB/GLTF models for the Ayutthaya Theme. Put files under `public/models/…` and set a
 * slot to its path (relative to the site root, e.g. `models/temples/prang.glb`); `null` uses the
 * built-in procedural model. A path that fails to load also falls back to procedural.
 *
 * Houses, trees, flags and wall details are drawn as instanced procedural geometry for
 * performance, so they have no model slot.
 */
export type AyutthayaModelSlot = 'vehicle' | 'temple' | 'chedi' | 'prang'

export const ayutthayaAssets: Record<AyutthayaModelSlot, string | null> = {
  vehicle: null,
  temple: null,
  chedi: null,
  prang: null,
}
