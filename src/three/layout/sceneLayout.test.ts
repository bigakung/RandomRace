import { describe, expect, it } from 'vitest'
import { createSeededRng, randomFloat } from '../../utils/random'
import {
  FINISH_X,
  LANE_SPACING,
  START_X,
  followCenterX,
  followRig,
  framingAround,
  labelMode,
  laneLayout,
  projectToNdc,
  trackX,
} from './sceneLayout'

const FOV_DEG = 45

describe('laneLayout', () => {
  it.each([2, 16, 50])('spaces %i Lanes evenly without overlap, centred on the river', (count) => {
    const { laneZ, riverHalfWidth } = laneLayout(count)
    expect(laneZ).toHaveLength(count)
    for (let i = 1; i < count; i += 1) {
      expect((laneZ[i] ?? 0) - (laneZ[i - 1] ?? 0)).toBeCloseTo(LANE_SPACING)
    }
    const first = laneZ[0] ?? 0
    const last = laneZ[count - 1] ?? 0
    expect(first + last).toBeCloseTo(0)
    expect(riverHalfWidth).toBeGreaterThanOrEqual(Math.max(Math.abs(first), Math.abs(last)) + LANE_SPACING / 2)
  })

  it('widens the river as Lanes are added', () => {
    expect(laneLayout(50).riverHalfWidth).toBeGreaterThan(laneLayout(2).riverHalfWidth)
  })
})

describe('trackX', () => {
  it('maps progress 0 to the start line and 1 exactly to the finish line', () => {
    expect(trackX(0)).toBe(START_X)
    expect(trackX(1)).toBe(FINISH_X)
  })

  it('is increasing along the Race', () => {
    let previous = -Infinity
    for (let p = 0; p <= 1; p += 0.05) {
      expect(trackX(p)).toBeGreaterThan(previous)
      previous = trackX(p)
    }
  })
})

describe('followRig', () => {
  it('looks down at the river from above, from the camera side of the Lanes', () => {
    const [, y, z] = followRig(8, 16 / 9, FOV_DEG).offset
    expect(y).toBeGreaterThan(0)
    expect(z).toBeGreaterThan(laneLayout(8).riverHalfWidth)
  })

  it('pulls back further for more Lanes', () => {
    const distance = (lanes: number) => Math.hypot(...followRig(lanes, 16 / 9, FOV_DEG).offset)
    expect(distance(50)).toBeGreaterThan(distance(2))
  })
})

describe('labelMode', () => {
  it('shows names up to 16 Lanes and numbers above', () => {
    expect(labelMode(2)).toBe('name')
    expect(labelMode(16)).toBe('name')
    expect(labelMode(17)).toBe('number')
    expect(labelMode(50)).toBe('number')
  })
})

describe('follow camera', () => {
  const aspects = [16 / 9, 9 / 19.5]

  /** Plausible mid-Race states: a pack spread over up to 25% of the track. */
  function raceStates(lanes: number, count: number): number[][] {
    const rng = createSeededRng(lanes)
    return Array.from({ length: count }, () => {
      const front = randomFloat(rng, 0, 1)
      return Array.from({ length: lanes }, () => Math.max(0, front - randomFloat(rng, 0, 0.25)))
    })
  }

  it.each([2, 16, 50].flatMap((lanes) => aspects.map((aspect) => ({ lanes, aspect }))))(
    'always keeps the Leader on screen, in every Lane ($lanes Lanes, aspect $aspect)',
    ({ lanes, aspect }) => {
      const rig = followRig(lanes, aspect, FOV_DEG)
      const { laneZ } = laneLayout(lanes)
      for (const progress of raceStates(lanes, 200)) {
        const framing = framingAround(rig, followCenterX(progress, rig))
        const leaderX = trackX(Math.max(...progress))
        for (const z of [laneZ[0] ?? 0, laneZ[lanes - 1] ?? 0]) {
          const [x, y, depth] = projectToNdc([leaderX, 0, z], framing, aspect, FOV_DEG)
          expect(depth).toBeGreaterThan(0)
          expect(Math.abs(x)).toBeLessThanOrEqual(1)
          expect(Math.abs(y)).toBeLessThanOrEqual(1)
        }
      }
    },
  )

  it.each(aspects)('shows the finish line when the Winner reaches it (aspect %d)', (aspect) => {
    const rig = followRig(8, aspect, FOV_DEG)
    const progress = [1, 0.95, 0.9, 0.97, 0.93, 0.91, 0.96, 0.92]
    const framing = framingAround(rig, followCenterX(progress, rig))
    const [x] = projectToNdc([FINISH_X, 0, 0], framing, aspect, FOV_DEG)
    expect(Math.abs(x)).toBeLessThanOrEqual(1)
  })

  it('looks down more steeply on portrait screens', () => {
    const steepness = (aspect: number) => {
      const [x, y, z] = followRig(8, aspect, FOV_DEG).offset
      return y / Math.hypot(x, z)
    }
    expect(steepness(9 / 19.5)).toBeGreaterThan(steepness(16 / 9))
  })
})
