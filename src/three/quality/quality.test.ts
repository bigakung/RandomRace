import { describe, expect, it } from 'vitest'
import { chooseQuality, lowerQuality } from './quality'

describe('chooseQuality', () => {
  it('defaults to medium when nothing is known about the device', () => {
    expect(chooseQuality({})).toBe('medium')
  })

  it('picks medium for a typical desktop', () => {
    expect(chooseQuality({ coarsePointer: false, shortestScreenSide: 1080, cores: 8, memoryGb: 16 })).toBe('medium')
  })

  it('picks low for a phone-sized touch screen', () => {
    expect(chooseQuality({ coarsePointer: true, shortestScreenSide: 390, cores: 8, memoryGb: 8 })).toBe('low')
  })

  it('keeps medium for a large touch screen with good hardware', () => {
    expect(chooseQuality({ coarsePointer: true, shortestScreenSide: 1024, cores: 8, memoryGb: 8 })).toBe('medium')
  })

  it.each([
    { cores: 4, memoryGb: 16 },
    { cores: 8, memoryGb: 4 },
    { cores: 2 },
    { memoryGb: 2 },
  ])('picks low for weak hardware %o', (signals) => {
    expect(chooseQuality(signals)).toBe('low')
  })
})

describe('lowerQuality', () => {
  it('steps down one level and stops at low', () => {
    expect(lowerQuality('high')).toBe('medium')
    expect(lowerQuality('medium')).toBe('low')
    expect(lowerQuality('low')).toBe('low')
  })
})
