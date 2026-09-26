import type { SoundCue, SoundLoop } from './soundDirector'

/** Plays the Race's sounds. Implementations can be swapped (e.g. for recorded audio files). */
export type SoundManager = {
  readonly supported: boolean
  /** Must first be called with `true` from a user gesture so the browser allows audio. */
  setEnabled(enabled: boolean): void
  play(cue: SoundCue): void
  /** The loops that should be playing now; others fade out. Remembered while muted. */
  setLoops(loops: readonly SoundLoop[]): void
}

type AudioContextConstructor = typeof AudioContext

function audioContextConstructor(): AudioContextConstructor | undefined {
  const scope = globalThis as typeof globalThis & { webkitAudioContext?: AudioContextConstructor }
  return scope.AudioContext ?? scope.webkitAudioContext
}

/** Thai-sounding pentatonic scale (C D E G A) across two octaves, in Hz. */
const PENTATONIC = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880]
const RANAT_STEP_SECONDS = 0.19
const SCHEDULE_AHEAD_SECONDS = 0.25
const SCHEDULER_INTERVAL_MS = 60

export function createWebAudioSoundManager(): SoundManager {
  const Context = audioContextConstructor()
  let context: AudioContext | null = null
  let master: GainNode | null = null
  let noise: AudioBuffer | null = null
  let enabled = false
  let wanted: readonly SoundLoop[] = []
  const running = new Map<SoundLoop, () => void>()

  function ensureContext(): AudioContext | null {
    if (!Context) return null
    if (!context) {
      try {
        context = new Context()
        master = context.createGain()
        master.gain.value = 0.5
        master.connect(context.destination)
      } catch {
        context = null
        return null
      }
    }
    void context.resume().catch(() => undefined)
    return context
  }

  function noiseBuffer(ctx: AudioContext): AudioBuffer {
    if (!noise) {
      noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
      const data = noise.getChannelData(0)
      for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
    }
    return noise
  }

  /** A single decaying tone. */
  function tone(ctx: AudioContext, frequency: number, start: number, duration: number, volume: number, type: OscillatorType) {
    if (!master) return
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = type
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain).connect(master)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.05)
  }

  /** Inharmonic partials with a long decay read as a bronze gong. */
  function gong(ctx: AudioContext, start: number, volume: number) {
    for (const [ratio, level, decay] of [
      [1, 1, 2.8],
      [2.76, 0.4, 1.6],
      [5.4, 0.18, 0.9],
    ] as const) {
      tone(ctx, 98 * ratio, start, decay, volume * level, 'sine')
    }
  }

  function playCue(ctx: AudioContext, cue: SoundCue) {
    const now = ctx.currentTime
    switch (cue) {
      case 'countdown':
        tone(ctx, 880, now, 0.12, 0.35, 'triangle')
        break
      case 'start':
        gong(ctx, now, 0.6)
        break
      case 'winner':
        ;[0, 2, 4, 5, 7, 9].forEach((step, i) => tone(ctx, PENTATONIC[step] ?? 440, now + i * 0.09, 0.5, 0.3, 'triangle'))
        gong(ctx, now + 0.55, 0.5)
        break
    }
  }

  /** A looping, gently swaying filtered-noise bed; returns a stopper that fades it out. */
  function noiseBed(ctx: AudioContext, filterType: BiquadFilterType, frequency: number, volume: number, swayHz: number) {
    const source = ctx.createBufferSource()
    source.buffer = noiseBuffer(ctx)
    source.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = frequency
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1)
    const sway = ctx.createOscillator()
    const swayDepth = ctx.createGain()
    sway.frequency.value = swayHz
    swayDepth.gain.value = volume * 0.5
    sway.connect(swayDepth).connect(gain.gain)
    source.connect(filter).connect(gain)
    if (master) gain.connect(master)
    source.start()
    sway.start()
    return () => {
      const end = ctx.currentTime + 0.6
      gain.gain.cancelScheduledValues(ctx.currentTime)
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0, end)
      source.stop(end + 0.05)
      sway.stop(end + 0.05)
    }
  }

  /** A ranat-like pentatonic melody over a soft drum, scheduled slightly ahead of time. */
  function ranatLoop(ctx: AudioContext) {
    let step = 0
    let note = 4
    let nextTime = ctx.currentTime + 0.05
    const timer = window.setInterval(() => {
      while (nextTime < ctx.currentTime + SCHEDULE_AHEAD_SECONDS) {
        const move = [-2, -1, 1, 2][Math.floor(Math.random() * 4)] ?? 1
        note = Math.min(PENTATONIC.length - 1, Math.max(0, note + move))
        tone(ctx, PENTATONIC[note] ?? 440, nextTime, 0.22, 0.12, 'triangle')
        if (step % 4 === 0) tone(ctx, 82, nextTime, 0.25, 0.25, 'sine')
        step += 1
        nextTime += RANAT_STEP_SECONDS
      }
    }, SCHEDULER_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }

  function startLoop(ctx: AudioContext, loop: SoundLoop): () => void {
    switch (loop) {
      case 'water':
        return noiseBed(ctx, 'lowpass', 500, 0.18, 0.15)
      case 'ambient':
        return noiseBed(ctx, 'bandpass', 4200, 0.04, 0.07)
      case 'race':
        return ranatLoop(ctx)
    }
  }

  function syncLoops() {
    // Only touch audio once something should play: a restored "sound on" preference must not
    // create an AudioContext before the user's first click (browsers block that).
    const ctx = enabled && (wanted.length > 0 || context) ? ensureContext() : null
    for (const [loop, stop] of running) {
      if (!ctx || !wanted.includes(loop)) {
        stop()
        running.delete(loop)
      }
    }
    if (!ctx) return
    for (const loop of wanted) {
      if (!running.has(loop)) running.set(loop, startLoop(ctx, loop))
    }
  }

  return {
    supported: Boolean(Context),

    setEnabled(next) {
      enabled = next
      syncLoops()
      if (!next) void context?.suspend().catch(() => undefined)
    },

    play(cue) {
      if (!enabled) return
      const ctx = ensureContext()
      if (ctx) playCue(ctx, cue)
    },

    setLoops(loops) {
      wanted = loops
      syncLoops()
    },
  }
}
