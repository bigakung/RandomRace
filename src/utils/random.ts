/** A source of uniformly distributed unsigned 32-bit integers. */
export type Rng = {
  nextUint32(): number
}

type RandomValuesSource = {
  getRandomValues(array: Uint32Array<ArrayBuffer>): unknown
}

const UINT32_RANGE = 0x1_0000_0000

export function createDefaultRng(
  source: RandomValuesSource | undefined = globalThis.crypto,
): Rng {
  if (source && typeof source.getRandomValues === 'function') {
    const buffer = new Uint32Array(1)
    return {
      nextUint32() {
        source.getRandomValues(buffer)
        return buffer[0] ?? 0
      },
    }
  }
  return {
    nextUint32: () => Math.floor(Math.random() * UINT32_RANGE),
  }
}

/** Deterministic mulberry32 generator for reproducible tests and animation variation. */
export function createSeededRng(seed: number): Rng {
  let state = seed >>> 0
  return {
    nextUint32() {
      state = (state + 0x6d2b79f5) >>> 0
      let t = state
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return (t ^ (t >>> 14)) >>> 0
    },
  }
}

/** Uniform integer in [min, max], inclusive, without modulo bias. */
export function randomInt(min: number, max: number, rng: Rng = createDefaultRng()): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`Invalid range [${min}, ${max}]`)
  }
  const range = max - min + 1
  if (range > UINT32_RANGE) throw new RangeError('Range exceeds 2^32')

  // Only accept draws below the largest multiple of `range`, so every result is equally likely.
  const limit = Math.floor(UINT32_RANGE / range) * range
  let draw = rng.nextUint32()
  while (draw >= limit) draw = rng.nextUint32()
  return min + (draw % range)
}

/** Uniform float in [min, max). */
export function randomFloat(rng: Rng, min = 0, max = 1): number {
  return min + (rng.nextUint32() / UINT32_RANGE) * (max - min)
}
