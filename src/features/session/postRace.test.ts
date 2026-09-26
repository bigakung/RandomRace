import { describe, expect, it } from 'vitest'
import { createSeededRng, type Rng } from '../../utils/random'
import { COUNTDOWN_MS, DEFAULT_RACE_DURATION_MS, FINISH_HOLD_MS, createPickerSession } from './pickerSession'

const RESULT_AT = COUNTDOWN_MS + DEFAULT_RACE_DURATION_MS + FINISH_HOLD_MS

function sessionAtResult(rng?: Rng) {
  const session = createPickerSession(rng ? { rng } : {})
  session.addNames('สมชาย\nวิชัย\nมานะ\nนเรศ')
  session.start(0)
  session.tick(RESULT_AT)
  expect(session.getState().phase).toBe('result')
  return session
}

function names(session: ReturnType<typeof createPickerSession>) {
  return session.getState().roster.map((p) => p.name)
}

describe('after the Race', () => {
  it('Play Again draws a new Winner from the random source instead of reusing the last one', () => {
    let value = 0
    const session = sessionAtResult({ nextUint32: () => value })
    expect(session.getState().winner?.number).toBe(1)
    value = 2
    session.playAgain(RESULT_AT + 100)
    expect(session.getState().winner?.number).toBe(3)
  })

  it('Play Again returns to the countdown with the same Roster', () => {
    const session = sessionAtResult()
    session.playAgain(RESULT_AT + 100)
    const state = session.getState()
    expect(state.phase).toBe('countdown')
    expect(state.countdown).toBe(3)
    expect(names(session)).toEqual(['สมชาย', 'วิชัย', 'มานะ', 'นเรศ'])
    expect(state.winner).not.toBeNull()
  })

  it('Play Again performs a new, independent draw every time', () => {
    const seen = new Set<number>()
    const session = sessionAtResult(createSeededRng(11))
    for (let round = 1; round <= 40; round += 1) {
      const startedAt = round * (RESULT_AT + 1000)
      session.playAgain(startedAt)
      session.tick(startedAt + RESULT_AT)
      expect(session.getState().phase).toBe('result')
      seen.add(session.getState().winner?.number ?? 0)
    }
    // With 4 Participants and 40 fair draws, every one of them wins at least once.
    expect([...seen].sort()).toEqual([1, 2, 3, 4])
  })

  it('Play Again runs a full Race again: the new Winner crosses first', () => {
    const session = sessionAtResult(createSeededRng(3))
    session.playAgain(100_000)
    const winnerLane = (session.getState().winner?.number ?? 0) - 1
    const finish = 100_000 + COUNTDOWN_MS + DEFAULT_RACE_DURATION_MS
    session.tick(finish - 1)
    expect(session.laneProgress(finish - 1).every((p) => p < 1)).toBe(true)
    session.tick(finish)
    expect(session.laneProgress(finish)[winnerLane]).toBe(1)
  })

  it('Edit Names returns to the Roster with every name intact', () => {
    const session = sessionAtResult()
    session.editNames()
    const state = session.getState()
    expect(state.phase).toBe('input')
    expect(state.winner).toBeNull()
    expect(names(session)).toEqual(['สมชาย', 'วิชัย', 'มานะ', 'นเรศ'])
    session.addNames('สมหญิง')
    expect(names(session)).toHaveLength(5)
  })

  it('New Race clears the Roster and returns to input', () => {
    const session = sessionAtResult()
    session.newRace()
    expect(session.getState()).toMatchObject({ phase: 'input', roster: [], winner: null })
  })

  it('keeps the Race Duration across Play Again and Edit Names', () => {
    const session = createPickerSession()
    session.addNames('a\nb')
    session.setRaceDuration(5_000)
    session.start(0)
    session.tick(COUNTDOWN_MS + 5_000 + FINISH_HOLD_MS)
    session.editNames()
    expect(session.getState().raceDurationMs).toBe(5_000)
  })

  it('ignores post-Race actions before the result is shown', () => {
    const session = createPickerSession()
    session.addNames('a\nb')
    session.playAgain(0)
    session.newRace()
    expect(session.getState()).toMatchObject({ phase: 'input' })
    expect(names(session)).toEqual(['a', 'b'])
    session.start(0)
    session.editNames()
    session.newRace()
    expect(session.getState().phase).toBe('countdown')
    expect(names(session)).toEqual(['a', 'b'])
  })
})
