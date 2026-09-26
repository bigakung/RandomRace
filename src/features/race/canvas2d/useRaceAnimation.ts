import { useEffect, type RefObject } from 'react'
import type { PickerSession } from '../../session/pickerSession'
import { createRaceRenderer } from './raceRenderer'

const MAX_PIXEL_RATIO = 2

/**
 * Runs the single animation loop for a Race: advances the session clock and redraws the
 * canvas every frame, without touching React state.
 */
export function useRaceAnimation(canvasRef: RefObject<HTMLCanvasElement | null>, session: PickerSession, still: boolean) {
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const renderer = createRaceRenderer()
    let width = 0
    let height = 0

    function resize() {
      if (!canvas || !ctx) return
      const rect = canvas.getBoundingClientRect()
      const ratio = Math.min(MAX_PIXEL_RATIO, window.devicePixelRatio || 1)
      width = rect.width
      height = rect.height
      canvas.width = Math.max(1, Math.round(width * ratio))
      canvas.height = Math.max(1, Math.round(height * ratio))
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    resize()

    let frameId = 0
    function loop(now: number) {
      session.tick(now)
      const state = session.getState()
      if (ctx && width > 0 && height > 0) {
        renderer.draw(ctx, {
          width,
          height,
          roster: state.roster,
          progress: session.laneProgress(now),
          now,
          still,
          celebrateLane: state.phase === 'finished' && state.winner ? state.winner.number - 1 : null,
        })
      }
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
    }
  }, [canvasRef, session, still])
}
