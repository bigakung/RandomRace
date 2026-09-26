import { describe, expect, it } from 'vitest'
import { createSeededRng, type Rng } from '../../utils/random'
import { createPickerSession } from './pickerSession'

function namesOf(count: number): string {
  return Array.from({ length: count }, (_, i) => `คนที่ ${i + 1}`).join('\n')
}

function fixedRng(value: number): Rng {
  return { nextUint32: () => value }
}

describe('PickerSession', () => {
  it('starts in input phase with an empty Roster', () => {
    const state = createPickerSession().getState()
    expect(state.phase).toBe('input')
    expect(state.roster).toEqual([])
    expect(state.winner).toBeNull()
  })

  it('adds a single typed name and numbers Participants by position', () => {
    const session = createPickerSession()
    session.addNames('สมชาย')
    session.addNames('  วิชัย  ')
    expect(session.getState().roster).toMatchObject([
      { number: 1, name: 'สมชาย' },
      { number: 2, name: 'วิชัย' },
    ])
  })

  it('splits pasted multi-line text, trimming and dropping blank lines', () => {
    const session = createPickerSession()
    session.addNames('สมชาย\n  วิชัย \r\n\r\nมานะ\n   \nนเรศ\n')
    expect(session.getState().roster.map((p) => p.name)).toEqual([
      'สมชาย',
      'วิชัย',
      'มานะ',
      'นเรศ',
    ])
  })

  it('refuses to start with no Participants', () => {
    const session = createPickerSession()
    session.start()
    const state = session.getState()
    expect(state.phase).toBe('input')
    expect(state.winner).toBeNull()
    expect(state.error).toEqual({ code: 'not-enough-participants' })
  })

  it('refuses to start with one Participant', () => {
    const session = createPickerSession()
    session.addNames('สมชาย')
    session.start()
    expect(session.getState().phase).toBe('input')
    expect(session.getState().error).toEqual({ code: 'not-enough-participants' })
  })

  it('clears the error once a valid Roster is started', () => {
    const session = createPickerSession()
    session.start()
    session.addNames('สมชาย\nวิชัย')
    session.start()
    expect(session.getState().error).toBeNull()
  })

  it('draws the Winner immediately, entering preparing before the countdown clock starts', () => {
    const session = createPickerSession()
    session.addNames('สมชาย\nวิชัย')
    session.start()
    const state = session.getState()
    expect(state.phase).toBe('preparing')
    expect(state.countdown).toBeNull()
    expect(state.winner).not.toBeNull()
  })

  it('ignores tick and laneProgress while preparing: nobody has moved yet', () => {
    const session = createPickerSession()
    session.addNames('สมชาย\nวิชัย')
    session.start()
    session.tick(50_000)
    expect(session.getState().phase).toBe('preparing')
    expect(session.laneProgress(50_000).every((p) => p === 0)).toBe(true)
  })

  it('starts the countdown clock only once stageReady is called', () => {
    const session = createPickerSession()
    session.addNames('สมชาย\nวิชัย')
    session.start()
    session.stageReady(1000)
    expect(session.getState()).toMatchObject({ phase: 'countdown', countdown: 3 })
    session.tick(1000)
    expect(session.getState().countdown).toBe(3)
    session.tick(2000)
    expect(session.getState().countdown).toBe(2)
  })

  it('ignores stageReady outside preparing', () => {
    const session = createPickerSession()
    session.addNames('สมชาย\nวิชัย')
    session.stageReady(0)
    expect(session.getState().phase).toBe('input')
  })

  it.each([2, 5, 50])('draws exactly one Winner from a Roster of %i', (count) => {
    for (let seed = 0; seed < 50; seed += 1) {
      const session = createPickerSession({ rng: createSeededRng(seed) })
      session.addNames(namesOf(count))
      session.start()
      session.stageReady(0)
      const { phase, winner, roster } = session.getState()
      expect(phase).toBe('countdown')
      const matches = roster.filter((p) => p === winner)
      expect(matches).toHaveLength(1)
    }
  })

  it('picks the Winner from the injected random source', () => {
    const session = createPickerSession({ rng: fixedRng(2) })
    session.addNames('สมชาย\nวิชัย\nมานะ\nนเรศ')
    session.start()
    expect(session.getState().winner).toMatchObject({ number: 3, name: 'มานะ' })
  })

  it('gives every Participant a fair chance', () => {
    const rng = createSeededRng(7)
    const counts = [0, 0, 0, 0]
    const draws = 8000
    for (let i = 0; i < draws; i += 1) {
      const session = createPickerSession({ rng })
      session.addNames('a\nb\nc\nd')
      session.start()
      const winner = session.getState().winner
      if (winner) counts[winner.number - 1] = (counts[winner.number - 1] ?? 0) + 1
    }
    for (const count of counts) expect(Math.abs(count - draws / 4) / (draws / 4)).toBeLessThan(0.08)
  })

  it('notifies subscribers on change and stops after unsubscribe', () => {
    const session = createPickerSession()
    let calls = 0
    const unsubscribe = session.subscribe(() => {
      calls += 1
    })
    session.addNames('สมชาย')
    unsubscribe()
    session.addNames('วิชัย')
    expect(calls).toBe(1)
  })
})
