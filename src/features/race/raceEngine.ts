import { randomFloat, type Rng } from '../../utils/random'

/**
 * A pre-computed, time-based plan for one Race. `progressAt` gives each Lane's distance
 * along the river (0 = start, 1 = finish line). Only the Winner ever reaches 1, and it
 * does so exactly at `durationMs`; after that every Lane stays where it is.
 */
export type RacePlan = {
  readonly laneCount: number
  readonly winnerIndex: number
  readonly durationMs: number
  /** Pass `out` to reuse an array across animation frames instead of allocating one. */
  progressAt(elapsedMs: number, out?: number[]): number[]
}

type RacePlanOptions = {
  laneCount: number
  winnerIndex: number
  durationMs: number
  rng: Rng
}

const MIN_SAMPLES = 240
const SAMPLES_PER_SECOND = 8
const MIN_SPEED = 0.2
const SECONDS_PER_SURGE = 4.5
/** Surges and speed waves are sized in seconds so long Races stay as lively as short ones. */
const SURGE_SECONDS: readonly [number, number] = [1.5, 4]
const WAVE_PERIOD_SECONDS: readonly [number, number] = [12, 30]
const MAX_ATTEMPTS = 12

type Bump = { center: number; width: number; amplitude: number }

type LaneProfile = {
  base: number
  wave: { amplitude: number; frequency: number; phase: number }
  bumps: Bump[]
}

function speedAt(profile: LaneProfile, u: number): number {
  const { base, wave, bumps } = profile
  let speed = base + wave.amplitude * Math.sin(2 * Math.PI * wave.frequency * u + wave.phase)
  for (const bump of bumps) {
    const x = (u - bump.center) / bump.width
    if (x > -3 && x < 3) speed += bump.amplitude * Math.exp(-x * x)
  }
  return Math.max(MIN_SPEED, speed)
}

function randomProfile(rng: Rng, durationSeconds: number, isWinner: boolean): LaneProfile {
  const surgeCount = Math.max(2, Math.round(durationSeconds / SECONDS_PER_SURGE))
  const surgeWidth = () => randomFloat(rng, ...SURGE_SECONDS) / durationSeconds
  // Each surge is followed by an equal slump ("surge then tire"), so it moves a boat ahead for a
  // while without a permanent gain. Permanent gains would add up like a random walk, whose leader
  // rarely changes, and long Races would go stale.
  const bumps: Bump[] = []
  for (let i = 0; i < surgeCount; i += 1) {
    const center = randomFloat(rng, 0.05, 0.85)
    const width = surgeWidth()
    const amplitude = randomFloat(rng, 0.3, 0.6)
    bumps.push({ center, width, amplitude }, { center: center + 2 * width, width, amplitude: -amplitude })
  }
  if (isWinner) {
    // A late burst lets the Winner come from behind instead of leading from the start.
    bumps.push({
      center: randomFloat(rng, 0.8, 0.92),
      width: Math.max(0.06, randomFloat(rng, 3, 6) / durationSeconds),
      amplitude: randomFloat(rng, 1.2, 1.8),
    })
  }
  const cycles = Math.max(1, durationSeconds / randomFloat(rng, ...WAVE_PERIOD_SECONDS))
  return {
    base: isWinner ? randomFloat(rng, 0.8, 0.9) : randomFloat(rng, 0.9, 1.1),
    wave: {
      amplitude: randomFloat(rng, 0.15, 0.35),
      frequency: cycles,
      phase: randomFloat(rng, 0, 2 * Math.PI),
    },
    bumps,
  }
}

/** Integrates a speed profile into cumulative distance, scaled so the Lane ends at `target`. */
function toProgressCurve(profile: LaneProfile, target: number, samples: number): Float64Array {
  const curve = new Float64Array(samples + 1)
  let distance = 0
  let previousSpeed = speedAt(profile, 0)
  for (let i = 1; i <= samples; i += 1) {
    const speed = speedAt(profile, i / samples)
    distance += (previousSpeed + speed) / 2
    curve[i] = distance
    previousSpeed = speed
  }
  for (let i = 1; i <= samples; i += 1) curve[i] = ((curve[i] ?? 0) / distance) * target
  curve[samples] = target
  return curve
}

function buildCurves({ laneCount, winnerIndex, durationMs, rng }: RacePlanOptions, samples: number): Float64Array[] {
  const durationSeconds = durationMs / 1000
  return Array.from({ length: laneCount }, (_, lane) => {
    const isWinner = lane === winnerIndex
    // A tight spread keeps the pack together so lead changes keep happening, and the finish is close.
    const target = isWinner ? 1 : randomFloat(rng, 0.9, 0.985)
    return toProgressCurve(randomProfile(rng, durationSeconds, isWinner), target, samples)
  })
}

function winnerLeadsMidRace(curves: Float64Array[], winnerIndex: number, samples: number): boolean {
  const mid = Math.floor(samples / 2)
  const winnerAtMid = curves[winnerIndex]?.[mid] ?? 0
  return curves.every((curve, lane) => lane === winnerIndex || (curve[mid] ?? 0) < winnerAtMid)
}

export function createRacePlan(options: RacePlanOptions): RacePlan {
  const { laneCount, winnerIndex, durationMs } = options
  const samples = Math.max(MIN_SAMPLES, Math.ceil((durationMs / 1000) * SAMPLES_PER_SECOND))
  let curves = buildCurves(options, samples)
  // A Winner that leads wire-to-wire makes a dull Race; re-plan a few times to get an overtake.
  for (
    let attempt = 1;
    laneCount > 1 && attempt < MAX_ATTEMPTS && winnerLeadsMidRace(curves, winnerIndex, samples);
    attempt += 1
  ) {
    curves = buildCurves(options, samples)
  }

  return {
    laneCount,
    winnerIndex,
    durationMs,
    progressAt(elapsedMs, out = new Array<number>(laneCount)) {
      out.length = laneCount
      const u = Math.min(1, Math.max(0, elapsedMs / durationMs))
      const position = u * samples
      const index = Math.min(samples - 1, Math.floor(position))
      const fraction = position - index
      // Called every animation frame: a plain loop, so nothing is allocated.
      for (let lane = 0; lane < curves.length; lane += 1) {
        const curve = curves[lane]
        if (!curve) continue
        // Use the exact end value at u = 1 so the Winner is precisely at 1, not 1 minus rounding error.
        if (u === 1) {
          out[lane] = curve[samples] ?? 0
          continue
        }
        const from = curve[index] ?? 0
        const to = curve[index + 1] ?? from
        out[lane] = from + (to - from) * fraction
      }
      return out
    },
  }
}
