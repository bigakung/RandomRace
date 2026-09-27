/**
 * Optional GLB/GLTF models for the Elephant Theme. Put files under `public/models/…` and set a
 * slot to its path (relative to the site root); `null` uses the built-in procedural model. A
 * path that fails to load also falls back to procedural.
 *
 * Palms, huts, fence posts and hills are drawn as instanced procedural geometry for
 * performance, so they have no model slot.
 */
export type ElephantModelSlot = 'vehicle'

export const elephantAssets: Record<ElephantModelSlot, string | null> = {
  vehicle: null,
}
