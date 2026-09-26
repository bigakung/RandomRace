import { FINISH_X } from '../../../three/layout/sceneLayout'
import { createSeededRng, randomFloat } from '../../../utils/random'

/**
 * Where the Ayutthaya scenery goes, relative to the river's half-width. Pure and seeded, so
 * the city looks the same every Race and can be checked for never intruding on a Lane.
 * The far bank is −Z (behind the Race); the camera side is +Z.
 */

export type SceneryDetail = 'low' | 'full'

export type Placement = {
  x: number
  z: number
  rotationY: number
  scale: number
  /** Footprint radius, used to keep objects clear of the river. */
  radius: number
}

export type TempleKind = 'prang' | 'chedi' | 'hall'

export type SceneryPlan = {
  houses: Placement[]
  palms: Placement[]
  trees: Placement[]
  flags: Placement[]
  temples: (Placement & { kind: TempleKind })[]
  towers: Placement[]
  silhouettes: (Placement & { kind: TempleKind })[]
  wall: { z: number; halfThickness: number; length: number }
  bridge: { x: number; halfWidth: number; span: number }
}

const SEED = 1350 // Ayutthaya was founded in 1350.
const BANK_CLEARANCE = 0.4
const WALL_OFFSET = 7
const WALL_HALF_THICKNESS = 0.7
const WALL_LENGTH = 180
const CAMERA_SIDE_CLEAR_X = 30

export function planScenery(riverHalfWidth: number, detail: SceneryDetail): SceneryPlan {
  const rng = createSeededRng(SEED)
  const between = (min: number, max: number) => randomFloat(rng, min, max)
  const keep = (share: number) => detail === 'full' || between(0, 1) < share
  const farBank = (distance: number, radius: number) => -(riverHalfWidth + BANK_CLEARANCE + radius + distance)
  const wallZ = -(riverHalfWidth + WALL_OFFSET)

  const houses: Placement[] = []
  for (let x = -60; x <= 60; x += between(7, 12)) {
    if (!keep(0.5)) continue
    houses.push({ x, z: farBank(between(0.3, 1.2), 1.5), rotationY: between(-0.12, 0.12), scale: between(0.9, 1.15), radius: 1.5 })
  }

  const flags: Placement[] = []
  for (let x = -44; x <= 44; x += 11) {
    flags.push({ x: x + between(-1, 1), z: farBank(0, 0.3), rotationY: 0, scale: 1, radius: 0.3 })
  }

  const palms: Placement[] = []
  const trees: Placement[] = []
  // Along the far bank between the houses and the wall.
  for (let x = -80; x <= 80; x += between(3, 6)) {
    if (!keep(0.4)) continue
    const radius = 1.4
    const z = farBank(between(2.4, WALL_OFFSET - 3), radius)
    const target = between(0, 1) < 0.6 ? palms : trees
    target.push({ x, z, rotationY: between(0, Math.PI * 2), scale: between(0.8, 1.3), radius })
  }
  // A grove behind the wall, among the temples.
  for (let i = 0; i < 70; i += 1) {
    if (!keep(0.35)) continue
    const radius = 1.6
    trees.push({
      x: between(-90, 90),
      z: wallZ - between(3, 50),
      rotationY: between(0, Math.PI * 2),
      scale: between(0.9, 1.6),
      radius,
    })
  }
  // A few palms on the camera-side bank, only towards the edges so the Race stays in view.
  if (detail === 'full') {
    for (const side of [-1, 1]) {
      for (let i = 0; i < 5; i += 1) {
        palms.push({
          x: side * between(CAMERA_SIDE_CLEAR_X + 2, 70),
          z: riverHalfWidth + BANK_CLEARANCE + 1.2 + between(0.5, 8),
          rotationY: between(0, Math.PI * 2),
          scale: between(0.8, 1.2),
          radius: 1.2,
        })
      }
    }
  }

  // Landmarks behind the wall, loosely echoing Wat Phra Si Sanphet's three chedis and a
  // Khmer-style prang like Wat Chaiwatthanaram's, with ordination halls between them.
  const templeZ = wallZ - WALL_HALF_THICKNESS
  const allTemples: SceneryPlan['temples'] = [
    { kind: 'chedi', x: -14, z: templeZ - 16, rotationY: 0, scale: 1.1, radius: 3.4 },
    { kind: 'chedi', x: -6, z: templeZ - 16, rotationY: 0, scale: 1.1, radius: 3.4 },
    { kind: 'chedi', x: 2, z: templeZ - 16, rotationY: 0, scale: 1.1, radius: 3.4 },
    { kind: 'hall', x: -6, z: templeZ - 7, rotationY: 0, scale: 1, radius: 5.6 },
    { kind: 'prang', x: 20, z: templeZ - 22, rotationY: Math.PI / 8, scale: 1.3, radius: 4.4 },
    { kind: 'hall', x: 34, z: templeZ - 9, rotationY: 0.1, scale: 0.9, radius: 5.2 },
    { kind: 'chedi', x: -32, z: templeZ - 12, rotationY: 0, scale: 0.8, radius: 2.6 },
    { kind: 'prang', x: -48, z: templeZ - 26, rotationY: Math.PI / 8, scale: 0.9, radius: 3.2 },
  ]
  const temples = allTemples.filter((_, index) => index < 6 || detail === 'full')

  const towers: Placement[] = [-50, -20, 10, 45].map((x) => ({
    x,
    z: wallZ,
    rotationY: 0,
    scale: 1,
    radius: WALL_HALF_THICKNESS + 1.2,
  }))

  const silhouettes: SceneryPlan['silhouettes'] = []
  for (let i = 0; i < (detail === 'full' ? 9 : 5); i += 1) {
    silhouettes.push({
      kind: i % 3 === 0 ? 'prang' : 'chedi',
      x: -120 + i * (240 / 8) + between(-8, 8),
      z: wallZ - between(85, 110),
      rotationY: 0,
      scale: between(1.3, 2.1),
      radius: 10,
    })
  }

  return {
    houses,
    palms,
    trees,
    flags,
    temples,
    towers,
    silhouettes,
    wall: { z: wallZ, halfThickness: WALL_HALF_THICKNESS, length: WALL_LENGTH },
    bridge: { x: FINISH_X + 16, halfWidth: 1.6, span: riverHalfWidth * 2 + 4 },
  }
}
