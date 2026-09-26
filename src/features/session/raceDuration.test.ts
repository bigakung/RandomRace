import { describe, expect, it } from 'vitest'
import { createSeededRng } from '../../utils/random'
import {
  COUNTDOWN_MS,
  DEFAULT_RACE_DURATION_MS,
  RACE_DURATION_PRESETS_MS,
  createPickerSession,
  type PickerSession,
} from './pickerSession'

const FRAME_MS = 1000 / 60

function sessionWith(count: number, seed: number, durationMs?: number) {
  const session = createPickerSession({ rng: createSeededRng(seed) })
  session.addNames(Array.from({ length: count }, (_, i) => `p${i + 1}`).join('\n'))
  if (durationMs !== undefined) session.setRaceDuration(durationMs)
  session.start(0)
  return session
}

function winnerLane(session: PickerSession): number {
  return (session.getState().winner?.number ?? 0) - 1
}

/** Number of times the Leader changes, ignoring the tied start. */
function leadChanges(session: PickerSession, durationMs: number, stepMs: number): number {
  const out: number[] = []
  let leader = -1
  let changes = 0
  for (let elapsed = durationMs * 0.05; elapsed < durationMs; elapsed += stepMs) {
    const now = COUNTDOWN_MS + elapsed
    session.tick(now)
    session.laneProgress(now, out)
    const current = out.indexOf(Math.max(...out))
    if (leader !== -1 && current !== leader) changes += 1
    leader = current
  }
  return changes
}

describe('Race Duration', () => {
  it('defaults to 10 seconds', () => {
    expect(createPickerSession().getState().raceDurationMs).toBe(10_000)
    expect(DEFAULT_RACE_DURATION_MS).toBe(10_000)
  })

  it('offers presets from 5 seconds to 5 minutes', () => {
    expect(RACE_DURATION_PRESETS_MS).toEqual([5_000, 10_000, 30_000, 60_000, 120_000, 300_000])
  })

  it('ignores values that are not presets', () => {
    const session = createPickerSession()
    session.setRaceDuration(7_000)
    session.setRaceDuration(600_000)
    expect(session.getState().raceDurationMs).toBe(10_000)
  })

  it('cannot be changed during a Race', () => {
    const session = sessionWith(3, 1)
    session.setRaceDuration(60_000)
    expect(session.getState().raceDurationMs).toBe(10_000)
  })

  it.each(RACE_DURATION_PRESETS_MS)('lets the Winner cross the line exactly at %i ms', (durationMs) => {
    const session = sessionWith(6, 2, durationMs)
    const finish = COUNTDOWN_MS + durationMs
    session.tick(finish - 1)
    expect(session.getState().phase).toBe('racing')
    expect(session.laneProgress(finish - 1).every((p) => p < 1)).toBe(true)
    session.tick(finish)
    expect(session.getState().phase).toBe('finished')
    expect(session.laneProgress(finish)[winnerLane(session)]).toBe(1)
  })

  it.each([
    { durationMs: 60_000, minimum: 3 },
    { durationMs: 120_000, minimum: 5 },
    { durationMs: 300_000, minimum: 10 },
  ])('keeps long Races lively: at least $minimum lead changes at $durationMs ms', ({ durationMs, minimum }) => {
    for (let seed = 0; seed < 10; seed += 1) {
      const session = sessionWith(8, seed, durationMs)
      expect(leadChanges(session, durationMs, 250), `seed ${seed}`).toBeGreaterThanOrEqual(minimum)
    }
  })

  it('keeps the Winner-first and no-teleport guarantees in a 5-minute Race', () => {
    const durationMs = 300_000
    const session = sessionWith(8, 3, durationMs)
    const winner = winnerLane(session)
    const maxStep = 12 * (FRAME_MS / durationMs)
    const previous = new Array<number>(8).fill(0)
    const out: number[] = []
    const violations: string[] = []
    for (let elapsed = 0; elapsed < durationMs; elapsed += FRAME_MS) {
      const now = COUNTDOWN_MS + elapsed
      session.tick(now)
      session.laneProgress(now, out)
      out.forEach((p, lane) => {
        const step = p - (previous[lane] ?? 0)
        if (step < 0 || step > maxStep) violations.push(`lane ${lane} step ${step} at ${elapsed}`)
        if (p >= 1) violations.push(`lane ${lane} (winner ${winner}) reached the line early at ${elapsed}`)
        previous[lane] = p
      })
    }
    expect(violations.slice(0, 5)).toEqual([])
  })
})
