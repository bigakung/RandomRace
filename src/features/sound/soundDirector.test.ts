import { describe, expect, it } from 'vitest'
import type { Countdown, SessionPhase } from '../session/pickerSession'
import { loopsFor, oneShotsFor } from './soundDirector'

type Moment = { phase: SessionPhase; countdown: Countdown }

const at = (phase: SessionPhase, countdown: Countdown = null): Moment => ({ phase, countdown })

describe('oneShotsFor', () => {
  it('ticks on each countdown number', () => {
    expect(oneShotsFor(at('input'), at('countdown', 3))).toEqual(['countdown'])
    expect(oneShotsFor(at('countdown', 3), at('countdown', 2))).toEqual(['countdown'])
    expect(oneShotsFor(at('countdown', 2), at('countdown', 1))).toEqual(['countdown'])
  })

  it('plays the start gong at GO', () => {
    expect(oneShotsFor(at('countdown', 1), at('racing', 'GO'))).toEqual(['start'])
  })

  it('plays nothing when GO clears', () => {
    expect(oneShotsFor(at('racing', 'GO'), at('racing', null))).toEqual([])
  })

  it('celebrates when the Race finishes, including after a skip', () => {
    expect(oneShotsFor(at('racing'), at('finished'))).toEqual(['winner'])
    expect(oneShotsFor(at('countdown', 2), at('finished'))).toEqual(['winner'])
  })

  it('plays nothing for unrelated changes', () => {
    expect(oneShotsFor(at('input'), at('input'))).toEqual([])
    expect(oneShotsFor(at('finished'), at('result'))).toEqual([])
    expect(oneShotsFor(at('result'), at('input'))).toEqual([])
  })
})

describe('loopsFor', () => {
  it('is silent outside a Race', () => {
    expect(loopsFor('input')).toEqual([])
    expect(loopsFor('result')).toEqual([])
  })

  it('has river ambience during the countdown and the finish', () => {
    expect(loopsFor('countdown')).toEqual(['ambient', 'water'])
    expect(loopsFor('finished')).toEqual(['ambient', 'water'])
  })

  it('adds the race rhythm only while racing', () => {
    expect(loopsFor('racing')).toEqual(['ambient', 'water', 'race'])
  })
})
