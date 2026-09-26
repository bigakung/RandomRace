import { describe, expect, it } from 'vitest'
import { FINISH_X, laneLayout } from '../../../three/layout/sceneLayout'
import { planScenery, type Placement } from './placement'

const narrow = laneLayout(2).riverHalfWidth
const widest = laneLayout(50).riverHalfWidth

function everyPlacement(plan: ReturnType<typeof planScenery>): Placement[] {
  return [
    ...plan.houses,
    ...plan.palms,
    ...plan.trees,
    ...plan.flags,
    ...plan.temples,
    ...plan.towers,
    ...plan.silhouettes,
  ]
}

describe('planScenery', () => {
  it.each([
    ['2 Lanes', narrow],
    ['50 Lanes', widest],
  ])('keeps every object out of the river (%s)', (_, riverHalfWidth) => {
    const plan = planScenery(riverHalfWidth, 'full')
    for (const placement of everyPlacement(plan)) {
      expect(Math.abs(placement.z) - placement.radius).toBeGreaterThanOrEqual(riverHalfWidth)
    }
    expect(Math.abs(plan.wall.z) - plan.wall.halfThickness).toBeGreaterThanOrEqual(riverHalfWidth)
  })

  it('puts the bridge beyond the finish line so no boat ever reaches it', () => {
    const plan = planScenery(widest, 'full')
    expect(plan.bridge.x - plan.bridge.halfWidth).toBeGreaterThan(FINISH_X + 2)
    expect(plan.bridge.span).toBeGreaterThan(widest * 2)
  })

  it('keeps the camera side clear in the middle of the view', () => {
    const plan = planScenery(widest, 'full')
    for (const placement of everyPlacement(plan).filter((p) => p.z > 0)) {
      expect(Math.abs(placement.x)).toBeGreaterThanOrEqual(30)
    }
  })

  it('places the landmarks on the far bank, behind the city wall', () => {
    const plan = planScenery(narrow, 'full')
    expect(plan.temples.length).toBeGreaterThanOrEqual(4)
    for (const temple of plan.temples) expect(temple.z + temple.radius).toBeLessThan(plan.wall.z)
  })

  it('uses fewer objects at low detail', () => {
    const full = everyPlacement(planScenery(widest, 'full')).length
    const low = everyPlacement(planScenery(widest, 'low')).length
    expect(low).toBeLessThan(full * 0.7)
  })

  it('is the same every time, so the scene does not reshuffle between Races', () => {
    expect(planScenery(narrow, 'full')).toEqual(planScenery(narrow, 'full'))
  })
})
