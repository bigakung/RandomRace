import type { Countdown, SessionPhase } from '../session/pickerSession'

export type SoundCue = 'countdown' | 'start' | 'winner'
export type SoundLoop = 'ambient' | 'water' | 'race'

type Moment = { phase: SessionPhase; countdown: Countdown }

/** One-shot sounds triggered by moving from one session moment to the next. */
export function oneShotsFor(previous: Moment, next: Moment): SoundCue[] {
  if (next.phase === 'finished' && previous.phase !== 'finished') return ['winner']
  if (next.countdown === previous.countdown) return []
  if (next.countdown === 'GO') return ['start']
  if (typeof next.countdown === 'number') return ['countdown']
  return []
}

/** Loops that should be playing in a phase; everything else is stopped. */
export function loopsFor(phase: SessionPhase): SoundLoop[] {
  switch (phase) {
    case 'countdown':
    case 'finished':
      return ['ambient', 'water']
    case 'racing':
      return ['ambient', 'water', 'race']
    default:
      return []
  }
}
