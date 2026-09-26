import { describe, expect, it } from 'vitest'
import { createSeededRng } from '../../utils/random'
import {
  COUNTDOWN_MS,
  DEFAULT_RACE_DURATION_MS,
  FINISH_HOLD_MS,
  GO_MS,
  createPickerSession,
} from './pickerSession'

const FRAME_MS = 1000 / 60
const RACE_START = COUNTDOWN_MS
const RACE_END = COUNTDOWN_MS + DEFAULT_RACE_DURATION_MS

function startedSession(count: number, seed: number) {
  const session = createPickerSession({ rng: createSeededRng(seed) })
  session.addNames(Array.from({ length: count }, (_, i) => `p${i + 1}`).join('\n'))
  session.start()
  session.stageReady(0)
  return session
}

function winnerIndex(session: ReturnType<typeof createPickerSession>): number {
  const winner = session.getState().winner
  if (!winner) throw new Error('no winner')
  return winner.number - 1
}

/** Simulates the animation loop from `from` to `to`, returning the progress of every frame. */
function sampleFrames(session: ReturnType<typeof createPickerSession>, from: number, to: number) {
  const frames: { now: number; progress: readonly number[] }[] = []
  const count = Math.ceil((to - from) / FRAME_MS)
  for (let i = 0; i <= count; i += 1) {
    const now = Math.min(to, from + i * FRAME_MS)
    session.tick(now)
    frames.push({ now, progress: session.laneProgress(now) })
  }
  return frames
}

describe('Race flow', () => {
  it('counts down 3, 2, 1 then shows GO while racing starts', () => {
    const session = startedSession(4, 1)
    expect(session.getState()).toMatchObject({ phase: 'countdown', countdown: 3 })
    session.tick(1000)
    expect(session.getState().countdown).toBe(2)
    session.tick(2000)
    expect(session.getState().countdown).toBe(1)
    session.tick(RACE_START)
    expect(session.getState()).toMatchObject({ phase: 'racing', countdown: 'GO' })
    session.tick(RACE_START + GO_MS)
    expect(session.getState()).toMatchObject({ phase: 'racing', countdown: null })
  })

  it('draws the Winner before the countdown and never changes it', () => {
    const session = startedSession(10, 3)
    const drawn = session.getState().winner
    expect(drawn).not.toBeNull()
    sampleFrames(session, 0, RACE_END + FINISH_HOLD_MS)
    expect(session.getState().winner).toBe(drawn)
  })

  it('finishes when the Winner crosses the line, then shows the result after a hold', () => {
    const session = startedSession(5, 2)
    session.tick(RACE_END - 1)
    expect(session.getState().phase).toBe('racing')
    session.tick(RACE_END)
    expect(session.getState().phase).toBe('finished')
    session.tick(RACE_END + FINISH_HOLD_MS)
    expect(session.getState().phase).toBe('result')
  })

  it('keeps every boat at the start line during the countdown', () => {
    const session = startedSession(6, 4)
    for (const now of [0, 1500, RACE_START - 1]) {
      session.tick(now)
      expect(session.laneProgress(now).every((p) => p === 0)).toBe(true)
    }
  })

  it('only notifies subscribers when the phase or countdown changes', () => {
    const session = startedSession(4, 5)
    let notifications = 0
    session.subscribe(() => {
      notifications += 1
    })
    sampleFrames(session, 0, RACE_END + FINISH_HOLD_MS)
    // 2, 1, GO, GO cleared, finished, result
    expect(notifications).toBe(6)
  })

  it.each([2, 50])('lets the Winner cross first, with continuous motion, for %i lanes', (count) => {
    for (let seed = 0; seed < 40; seed += 1) {
      const session = startedSession(count, seed)
      const winner = winnerIndex(session)
      const frames = sampleFrames(session, RACE_START, RACE_END)
      let previous = frames[0]?.progress ?? []
      const maxStep = 12 * (FRAME_MS / DEFAULT_RACE_DURATION_MS)
      const violations: string[] = []

      for (const { now, progress } of frames) {
        if (progress.length !== count) violations.push(`lane count ${progress.length} at ${now}`)
        progress.forEach((p, lane) => {
          const step = p - (previous[lane] ?? 0)
          if (step < 0) violations.push(`lane ${lane} moved backwards at ${now}`)
          if (step > maxStep) violations.push(`lane ${lane} jumped ${step.toFixed(4)} at ${now}`)
          if (p > 1) violations.push(`lane ${lane} passed the line at ${now}`)
          if (p >= 1 && (lane !== winner || now < RACE_END)) {
            violations.push(`lane ${lane} reached the line at ${now} (winner ${winner})`)
          }
        })
        previous = progress
      }
      expect(violations.slice(0, 5), `seed ${seed}`).toEqual([])
      expect(session.laneProgress(RACE_END)[winner]).toBe(1)
    }
  })

  it('has lead changes: the Winner does not lead the whole way', () => {
    for (let seed = 0; seed < 40; seed += 1) {
      const session = startedSession(8, seed)
      const winner = winnerIndex(session)
      const frames = sampleFrames(session, RACE_START, RACE_END)
      const leaders = frames.map(({ progress }) => progress.indexOf(Math.max(...progress)))
      const midRaceLeader = leaders[Math.floor(leaders.length / 2)]
      expect(midRaceLeader).not.toBe(winner)
      expect(leaders.at(-1)).toBe(winner)
    }
  })

  it('freezes the boats where they are once finished', () => {
    const session = startedSession(5, 6)
    session.tick(RACE_END)
    const atFinish = session.laneProgress(RACE_END)
    expect(session.laneProgress(RACE_END + 5000)).toEqual(atFinish)
  })

  describe('skip', () => {
    it('jumps from preparing to finished with the already-drawn Winner (skip, not cancel)', () => {
      const session = createPickerSession({ rng: createSeededRng(10) })
      session.addNames('p1\np2\np3\np4\np5')
      session.start()
      const drawn = session.getState().winner
      expect(session.getState().phase).toBe('preparing')
      session.skip(0)
      expect(session.getState()).toMatchObject({ phase: 'finished', countdown: null })
      expect(session.getState().winner).toBe(drawn)
      const winnerLane = (drawn?.number ?? 0) - 1
      // The countdown clock never started (stageReady was never called), so tick() must still
      // move finished → result on ticks alone, and the Winner's Lane is at the finish line.
      expect(session.laneProgress(0)[winnerLane]).toBe(1)
      session.tick(FINISH_HOLD_MS)
      expect(session.getState().phase).toBe('result')
    })

    it('jumps from the countdown to finished with the same Winner', () => {
      const session = startedSession(5, 7)
      const drawn = session.getState().winner
      session.tick(500)
      session.skip(500)
      expect(session.getState()).toMatchObject({ phase: 'finished', countdown: null })
      expect(session.getState().winner).toBe(drawn)
      expect(session.laneProgress(500)[winnerIndex(session)]).toBe(1)
      session.tick(500 + FINISH_HOLD_MS)
      expect(session.getState().phase).toBe('result')
    })

    it('jumps from mid-race to finished with the same Winner', () => {
      const session = startedSession(5, 8)
      const drawn = session.getState().winner
      session.tick(RACE_START + 2000)
      session.skip(RACE_START + 2000)
      expect(session.getState().phase).toBe('finished')
      expect(session.getState().winner).toBe(drawn)
    })

    it('does nothing outside a Race', () => {
      const session = createPickerSession()
      session.addNames('a\nb')
      session.skip(0)
      expect(session.getState().phase).toBe('input')
    })
  })

  it('locks the Roster during a Race', () => {
    const session = startedSession(3, 9)
    session.addNames('late')
    session.removeParticipant(1)
    session.clearRoster()
    expect(session.renameParticipant(2, 'x')).toBe(false)
    session.start()
    expect(session.getState().roster.map((p) => p.name)).toEqual(['p1', 'p2', 'p3'])
    expect(session.getState().phase).toBe('countdown')
  })

  it('ignores ticks outside a Race', () => {
    const session = createPickerSession()
    session.tick(99_999)
    expect(session.getState().phase).toBe('input')
    expect(session.laneProgress(0)).toEqual([])
  })
})
