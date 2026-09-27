import { createSeededRng, randomFloat } from '../../../utils/random'

/**
 * Where the countryside scenery goes, relative to the track's half-width. Pure and seeded, so
 * it looks the same every Race and can be checked for never intruding on a Lane.
 * The far side is −Z (behind the Race); the camera side is +Z.
 */

export type SceneryDetail = 'low' | 'full'

export type Placement = {
  x: number
  z: number
  rotationY: number
  scale: number
  /** Footprint radius, used to keep objects clear of the track. */
  radius: number
}

export type ElephantSceneryPlan = {
  palms: Placement[]
  huts: Placement[]
  fencePosts: Placement[]
  hills: Placement[]
}

const SEED = 543 // Chang (ช้าง — elephant) has 4 letters; a small, arbitrary fixed seed.
const CLEARANCE = 0.4
const FENCE_OFFSET = 1.4
const CAMERA_SIDE_CLEAR_X = 30

export function planElephantScenery(courseHalfWidth: number, detail: SceneryDetail): ElephantSceneryPlan {
  const rng = createSeededRng(SEED)
  const between = (min: number, max: number) => randomFloat(rng, min, max)
  const keep = (share: number) => detail === 'full' || between(0, 1) < share
  const farSide = (distance: number, radius: number) => -(courseHalfWidth + CLEARANCE + radius + distance)

  const fencePosts: Placement[] = []
  for (const side of [-1, 1]) {
    for (let x = -100; x <= 100; x += 4) {
      fencePosts.push({ x, z: side * (courseHalfWidth + FENCE_OFFSET), rotationY: 0, scale: 1, radius: 0.15 })
    }
  }

  const palms: Placement[] = []
  for (let x = -90; x <= 90; x += between(4, 8)) {
    if (!keep(0.45)) continue
    const radius = 1.2
    palms.push({ x, z: farSide(between(2, 10), radius), rotationY: between(0, Math.PI * 2), scale: between(0.8, 1.3), radius })
  }
  if (detail === 'full') {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i += 1) {
        palms.push({
          x: side * between(CAMERA_SIDE_CLEAR_X + 2, 70),
          z: side * (courseHalfWidth + FENCE_OFFSET + between(3, 10)),
          rotationY: between(0, Math.PI * 2),
          scale: between(0.8, 1.2),
          radius: 1.2,
        })
      }
    }
  }

  const huts: Placement[] = []
  for (let x = -70; x <= 70; x += between(20, 30)) {
    if (!keep(0.6)) continue
    const radius = 2.2
    huts.push({ x, z: farSide(between(6, 16), radius), rotationY: between(-0.2, 0.2), scale: between(0.9, 1.15), radius })
  }

  const hills: Placement[] = []
  const hillCount = detail === 'full' ? 9 : 5
  for (let i = 0; i < hillCount; i += 1) {
    hills.push({
      x: -140 + i * (280 / (hillCount - 1)) + between(-10, 10),
      z: farSide(80 + between(0, 40), 0),
      rotationY: 0,
      scale: between(9, 16),
      radius: 20,
    })
  }

  return { palms, huts, fencePosts, hills }
}
