import { createDefaultRng, type Rng } from '../../utils/random'
import {
  MAX_PARTICIPANTS,
  MIN_PARTICIPANTS,
  parseNames,
  toRoster,
  type Participant,
  type Roster,
} from '../picker/roster'
import { createRacePlan, type RacePlan } from '../race/raceEngine'
import { selectWinner } from '../race/winnerSelector'

export const COUNTDOWN_MS = 3000
export const GO_MS = 800
export const FINISH_HOLD_MS = 1500
export const RACE_DURATION_PRESETS_MS = [5_000, 10_000, 30_000, 60_000, 120_000, 300_000] as const
export type RaceDurationMs = (typeof RACE_DURATION_PRESETS_MS)[number]
export const DEFAULT_RACE_DURATION_MS: RaceDurationMs = 10_000

export type SessionPhase = 'input' | 'preparing' | 'countdown' | 'racing' | 'finished' | 'result'

export type Countdown = 3 | 2 | 1 | 'GO' | null

/** Something the user must fix; the action that caused it did not happen. */
export type SessionError =
  | { code: 'not-enough-participants' }
  | { code: 'empty-name' }

/** Information about an action that succeeded with a caveat. */
export type SessionNotice = { code: 'names-dropped'; dropped: number }

export type SessionState = {
  readonly phase: SessionPhase
  readonly countdown: Countdown
  readonly roster: Roster
  readonly winner: Participant | null
  readonly error: SessionError | null
  readonly notice: SessionNotice | null
  /** How long the Race runs from GO until the Winner crosses the line. */
  readonly raceDurationMs: RaceDurationMs
}

/**
 * The whole picking flow as a framework-free state machine. Time is passed in explicitly
 * (`now`, in ms) so the animation loop drives it and tests can control it.
 */
export type PickerSession = {
  getState(): SessionState
  subscribe(listener: () => void): () => void
  /** Adds one typed name or a pasted multi-line list, keeping at most 50 Participants. */
  addNames(text: string): void
  /** Returns false (and keeps the old name) when the new name is empty or the number unknown. */
  renameParticipant(number: number, name: string): boolean
  removeParticipant(number: number): void
  clearRoster(): void
  /** Accepts only the preset Race Durations, and only before a Race starts. */
  setRaceDuration(durationMs: number): void
  /**
   * Draws the Winner and enters `preparing`; refused with fewer than 2 Participants. The
   * countdown clock does not start until the active renderer calls `stageReady` (ADR-0003).
   */
  start(): void
  /**
   * The active renderer can show something now: starts the countdown clock at `now`. Only has
   * an effect during `preparing`; a renderer decides only *when*, never the outcome (ADR-0003).
   */
  stageReady(now: number): void
  /** Advances countdown → racing → finished → result. Notifies only when the phase or countdown changes. */
  tick(now: number): void
  /**
   * Jumps straight to finished with the already-drawn Winner, from `preparing`, `countdown` or
   * `racing`. There is deliberately no cancel (ADR-0001).
   */
  skip(now: number): void
  /**
   * The user prefers reduced motion: Races started from now on skip the Race animation and go
   * from the countdown straight to the finish. The draw is unchanged.
   */
  setReducedMotion(on: boolean): void
  /** From the result: same Roster, a new independent draw, into `preparing` again. */
  playAgain(): void
  /** From the result: back to the Roster, every name kept. */
  editNames(): void
  /** From the result: clears the Roster for a new group (the UI confirms first). */
  newRace(): void
  /** Each Lane's distance along the river at `now` (0 = start, 1 = finish line). */
  /** Pass `out` to reuse an array across animation frames. */
  laneProgress(now: number, out?: number[]): readonly number[]
}

type PickerSessionOptions = {
  rng?: Rng
}

type RaceTiming = {
  plan: RacePlan
  /** Set by `stageReady`; null while `preparing`, before the countdown clock has started. */
  startedAt: number | null
  finishedAt: number | null
  /** Reduced motion: go from the countdown straight to the finish, with no Race animation. */
  skipRace: boolean
}

export function createPickerSession({ rng = createDefaultRng() }: PickerSessionOptions = {}): PickerSession {
  let state: SessionState = {
    phase: 'input',
    countdown: null,
    roster: [],
    winner: null,
    error: null,
    notice: null,
    raceDurationMs: DEFAULT_RACE_DURATION_MS,
  }
  let race: RaceTiming | null = null
  let reducedMotion = false
  const listeners = new Set<() => void>()

  function update(next: Partial<SessionState>) {
    state = { ...state, ...next }
    listeners.forEach((listener) => listener())
  }

  function editable(): boolean {
    return state.phase === 'input'
  }

  function currentNames(): string[] {
    return state.roster.map((p) => p.name)
  }

  function setNames(names: string[], notice: SessionNotice | null = null) {
    update({ roster: toRoster(names), error: null, notice })
  }

  /**
   * Draws a fresh, independent Winner and plan, then enters `preparing`. The countdown clock
   * does not start yet — `stageReady` starts it once a renderer can show something (ADR-0003).
   */
  function beginRace() {
    const { roster } = state
    // The Winner is drawn before anything moves; the plan only visualises it (ADR-0001).
    const winnerIndex = selectWinner(roster, rng)
    const plan = createRacePlan({ laneCount: roster.length, winnerIndex, durationMs: state.raceDurationMs, rng })
    race = { plan, startedAt: null, finishedAt: null, skipRace: reducedMotion }
    update({ phase: 'preparing', countdown: null, winner: roster[winnerIndex] ?? null, error: null, notice: null })
  }

  function finish(at: number) {
    if (race) race.finishedAt = at
  }

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    addNames(text) {
      if (!editable()) return
      const added = parseNames(text)
      if (added.length === 0) return
      const combined = [...currentNames(), ...added]
      const dropped = Math.max(0, combined.length - MAX_PARTICIPANTS)
      setNames(
        combined.slice(0, MAX_PARTICIPANTS),
        dropped > 0 ? { code: 'names-dropped', dropped } : null,
      )
    },

    renameParticipant(number, name) {
      if (!editable()) return false
      const index = number - 1
      const names = currentNames()
      if (index < 0 || index >= names.length) return false
      const trimmed = name.trim()
      if (trimmed.length === 0) {
        update({ error: { code: 'empty-name' } })
        return false
      }
      names[index] = trimmed
      setNames(names)
      return true
    },

    removeParticipant(number) {
      if (!editable()) return
      const names = currentNames()
      if (number < 1 || number > names.length) return
      names.splice(number - 1, 1)
      setNames(names)
    },

    setRaceDuration(durationMs) {
      if (!editable()) return
      const preset = RACE_DURATION_PRESETS_MS.find((value) => value === durationMs)
      if (preset !== undefined) update({ raceDurationMs: preset })
    },

    clearRoster() {
      if (!editable()) return
      setNames([])
    },

    start() {
      if (!editable()) return
      const { roster } = state
      if (roster.length < MIN_PARTICIPANTS) {
        update({ error: { code: 'not-enough-participants' } })
        return
      }
      beginRace()
    },

    stageReady(now) {
      if (!race || state.phase !== 'preparing') return
      race.startedAt = now
      update({ phase: 'countdown', countdown: 3 })
    },

    setReducedMotion(on) {
      reducedMotion = on
    },

    playAgain() {
      if (state.phase !== 'result') return
      beginRace()
    },

    editNames() {
      if (state.phase !== 'result') return
      race = null
      update({ phase: 'input', countdown: null, winner: null })
    },

    newRace() {
      if (state.phase !== 'result') return
      race = null
      update({ phase: 'input', countdown: null, winner: null, roster: [], error: null, notice: null })
    },

    tick(now) {
      if (!race) return
      let { phase, countdown } = state

      // While `preparing`, or after a skip that happened during `preparing`, the countdown
      // clock has not started (`startedAt` is null): there is nothing to advance yet, but a
      // skip may already have moved to `finished`, and that still needs to reach `result`.
      if (race.startedAt !== null && (phase === 'countdown' || phase === 'racing')) {
        const startedAt = race.startedAt
        const elapsed = now - startedAt
        const raceElapsed = elapsed - COUNTDOWN_MS
        if (elapsed < COUNTDOWN_MS) {
          phase = 'countdown'
          countdown = (3 - Math.floor(elapsed / 1000)) as 3 | 2 | 1
        } else if (!race.skipRace && raceElapsed < race.plan.durationMs) {
          phase = 'racing'
          countdown = raceElapsed < GO_MS ? 'GO' : null
        } else {
          phase = 'finished'
          countdown = null
          finish(startedAt + COUNTDOWN_MS + (race.skipRace ? 0 : race.plan.durationMs))
        }
      }

      if (phase === 'finished' && race.finishedAt !== null && now - race.finishedAt >= FINISH_HOLD_MS) {
        phase = 'result'
      }

      if (phase !== state.phase || countdown !== state.countdown) update({ phase, countdown })
    },

    skip(now) {
      if (!race) return
      if (state.phase !== 'preparing' && state.phase !== 'countdown' && state.phase !== 'racing') return
      finish(now)
      update({ phase: 'finished', countdown: null })
    },

    laneProgress(now, out) {
      if (!race) return out ? ((out.length = 0), out) : []
      const { plan, startedAt } = race
      switch (state.phase) {
        case 'preparing':
        case 'countdown':
          // The countdown clock has not started (or not yet reached GO): every boat sits at
          // the start line. This also covers a skip during `preparing` (`startedAt` still null).
          return plan.progressAt(0, out)
        case 'racing':
          // `startedAt` is always set by the time `racing` is reached (ADR-0003).
          return plan.progressAt(now - (startedAt ?? now) - COUNTDOWN_MS, out)
        default:
          // finished / result: including a skip from `preparing`, the Winner is at the line.
          return plan.progressAt(plan.durationMs, out)
      }
    },
  }
}
