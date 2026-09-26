import { randomInt, type Rng } from '../../utils/random'
import type { Roster } from '../picker/roster'

/** Draws the Winner's index uniformly from a non-empty Roster (ADR-0001). */
export function selectWinner(roster: Roster, rng: Rng): number {
  if (roster.length === 0) throw new RangeError('Cannot select a Winner from an empty Roster')
  return randomInt(0, roster.length - 1, rng)
}
