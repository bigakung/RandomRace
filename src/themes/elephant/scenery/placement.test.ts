import { describe, expect, it } from 'vitest'
import { laneLayout } from '../../../three/layout/sceneLayout'
import { planElephantScenery } from './placement'

const narrow = laneLayout(2).courseHalfWidth
const widest = laneLayout(50).courseHalfWidth

describe('planElephantScenery', () => {
  it.each([
    ['2 Lanes', narrow],
    ['50 Lanes', widest],
  ])('keeps every object out of the track (%s)', (_, courseHalfWidth) => {
    const plan = planElephantScenery(courseHalfWidth, 'full')
    for (const placement of [...plan.palms, ...plan.huts]) {
      expect(Math.abs(placement.z) - placement.radius).toBeGreaterThanOrEqual(courseHalfWidth)
    }
    for (const post of plan.fencePosts) expect(Math.abs(post.z)).toBeGreaterThan(courseHalfWidth)
  })

  it('keeps the camera side clear in the middle of the view', () => {
    const plan = planElephantScenery(widest, 'full')
    for (const placement of [...plan.palms, ...plan.huts].filter((p) => p.z > 0)) {
      expect(Math.abs(placement.x)).toBeGreaterThanOrEqual(30)
    }
  })

  it('uses fewer scattered objects at low detail', () => {
    const full = [...planElephantScenery(widest, 'full').palms, ...planElephantScenery(widest, 'full').huts].length
    const low = [...planElephantScenery(widest, 'low').palms, ...planElephantScenery(widest, 'low').huts].length
    expect(low).toBeLessThan(full)
  })

  it('is the same every time, so the scene does not reshuffle between Races', () => {
    expect(planElephantScenery(narrow, 'full')).toEqual(planElephantScenery(narrow, 'full'))
  })

  it('never puts a hill inside the track', () => {
    const plan = planElephantScenery(narrow, 'full')
    expect(plan.hills.length).toBeGreaterThan(0)
    for (const hill of plan.hills) expect(Math.abs(hill.z)).toBeGreaterThan(narrow)
  })
})
