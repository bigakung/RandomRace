/**
 * The river's wave field. The same formula runs on the GPU (to displace the water surface)
 * and on the CPU (so Vehicles ride the waves they appear to sit on); keep the two in sync.
 */
export function waveHeight(x: number, z: number, seconds: number): number {
  return (
    0.08 * Math.sin(x * 0.6 + seconds * 1.3) +
    0.05 * Math.sin(z * 0.9 - seconds * 1.1) +
    0.03 * Math.sin((x + z) * 1.7 + seconds * 2.1)
  )
}

export const WAVE_HEIGHT_GLSL = /* glsl */ `
float waveHeight(vec2 p, float t) {
  return 0.08 * sin(p.x * 0.6 + t * 1.3)
       + 0.05 * sin(p.y * 0.9 - t * 1.1)
       + 0.03 * sin((p.x + p.y) * 1.7 + t * 2.1);
}
`
