import { describe, expect, it } from 'vitest'
import { createSeededRng } from '../../utils/random'
import { COUNTDOWN_MS, FINISH_HOLD_MS, createPickerSession, type SessionPhase } from './pickerSession'

function reducedSession(seed: number) {
  const session = createPickerSession({ rng: createSeededRng(seed) })
  session.setReducedMotion(true)
  session.addNames('สมชาย\nวิชัย\nมานะ\nนเรศ')
  session.setRaceDuration(300_000)
  return session
}

describe('reduced motion', () => {
  it('goes from the countdown straight to the finish, never racing, ignoring Race Duration', () => {
    const session = reducedSession(1)
    const phases = new Set<SessionPhase>()
    session.subscribe(() => phases.add(session.getState().phase))
    session.start()
    session.stageReady(0)
    for (let now = 0; now <= COUNTDOWN_MS + FINISH_HOLD_MS; now += 16) session.tick(now)
    session.tick(COUNTDOWN_MS + FINISH_HOLD_MS)
    expect(phases.has('racing')).toBe(false)
    expect(session.getState().phase).toBe('result')
    expect(session.getState().winner).not.toBeNull()
  })

  it('still counts down 3, 2, 1 but skips GO', () => {
    const session = reducedSession(2)
    const countdowns: unknown[] = []
    session.subscribe(() => countdowns.push(session.getState().countdown))
    session.start()
    session.stageReady(0)
    for (let now = 0; now <= COUNTDOWN_MS; now += 16) session.tick(now)
    session.tick(COUNTDOWN_MS)
    // start() itself notifies once, entering `preparing` with the countdown still null.
    expect(countdowns).toEqual([null, 3, 2, 1, null])
  })

  it('shows the Winner at the finish line and every other boat short of it', () => {
    const session = reducedSession(3)
    session.start()
    session.stageReady(0)
    session.tick(COUNTDOWN_MS)
    expect(session.getState().phase).toBe('finished')
    const winnerLane = (session.getState().winner?.number ?? 0) - 1
    const progress = session.laneProgress(COUNTDOWN_MS)
    expect(progress[winnerLane]).toBe(1)
    progress.forEach((p, lane) => {
      if (lane !== winnerLane) expect(p).toBeLessThan(1)
    })
  })

  it('draws the Winner as fairly as ever', () => {
    const counts = [0, 0, 0, 0]
    const rng = createSeededRng(9)
    for (let i = 0; i < 4000; i += 1) {
      const session = createPickerSession({ rng })
      session.setReducedMotion(true)
      session.addNames('a\nb\nc\nd')
      session.start()
      const winner = session.getState().winner
      if (winner) counts[winner.number - 1] = (counts[winner.number - 1] ?? 0) + 1
    }
    for (const count of counts) expect(Math.abs(count - 1000) / 1000).toBeLessThan(0.1)
  })

  it('applies to Play Again too, and can be switched off again', () => {
    const session = reducedSession(4)
    session.start()
    session.stageReady(0)
    session.tick(COUNTDOWN_MS + FINISH_HOLD_MS)
    session.setReducedMotion(false)
    session.playAgain()
    session.stageReady(10_000)
    session.tick(10_000 + COUNTDOWN_MS + 1)
    expect(session.getState().phase).toBe('racing')
  })
})
