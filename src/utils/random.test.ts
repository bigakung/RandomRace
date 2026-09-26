import { describe, expect, it } from 'vitest'
import { createDefaultRng, createSeededRng, randomInt, type Rng } from './random'

const UINT32_MAX = 0xffffffff

function sequenceRng(values: number[]): Rng {
  let index = 0
  return {
    nextUint32() {
      const value = values[index % values.length]
      index += 1
      return value ?? 0
    },
  }
}

describe('randomInt', () => {
  it('always returns a value within the inclusive bounds', () => {
    const rng = createSeededRng(42)
    for (const [min, max] of [[0, 1], [0, 49], [-5, 5], [10, 11]] as const) {
      for (let i = 0; i < 2000; i += 1) {
        const value = randomInt(min, max, rng)
        expect(Number.isInteger(value)).toBe(true)
        expect(value).toBeGreaterThanOrEqual(min)
        expect(value).toBeLessThanOrEqual(max)
      }
    }
  })

  it('returns the only value of a single-value range', () => {
    expect(randomInt(7, 7, createSeededRng(1))).toBe(7)
  })

  it('rejects draws from the biased tail instead of wrapping them', () => {
    // For a range of 3, 2^32 is not divisible by 3, so the top value would bias toward 0.
    const rng = sequenceRng([UINT32_MAX, 5])
    expect(randomInt(0, 2, rng)).toBe(5 % 3)
  })

  it('throws on an invalid range', () => {
    expect(() => randomInt(3, 2)).toThrow(RangeError)
    expect(() => randomInt(0.5, 2)).toThrow(RangeError)
  })

  it('is close to uniform over many draws', () => {
    const rng = createDefaultRng()
    const buckets = 5
    const draws = 50_000
    const counts = new Array<number>(buckets).fill(0)
    for (let i = 0; i < draws; i += 1) {
      const bucket = randomInt(0, buckets - 1, rng)
      counts[bucket] = (counts[bucket] ?? 0) + 1
    }
    const expected = draws / buckets
    for (const count of counts) {
      expect(Math.abs(count - expected) / expected).toBeLessThan(0.05)
    }
  })
})

describe('createDefaultRng', () => {
  it('uses crypto.getRandomValues when available', () => {
    let calls = 0
    const fakeCrypto = {
      getRandomValues(array: Uint32Array) {
        calls += 1
        array[0] = 123
        return array
      },
    }
    const rng = createDefaultRng(fakeCrypto)
    expect(rng.nextUint32()).toBe(123)
    expect(calls).toBe(1)
  })

  it('falls back to Math.random when crypto is unavailable', () => {
    const rng = createDefaultRng(undefined)
    for (let i = 0; i < 100; i += 1) {
      const value = rng.nextUint32()
      expect(Number.isInteger(value)).toBe(true)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(UINT32_MAX)
    }
  })
})

describe('createSeededRng', () => {
  it('is reproducible for the same seed', () => {
    const a = createSeededRng(99)
    const b = createSeededRng(99)
    for (let i = 0; i < 10; i += 1) expect(a.nextUint32()).toBe(b.nextUint32())
  })
})
