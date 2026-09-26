import { useEffect } from 'react'
import type { PickerSession } from '../session/pickerSession'

/** Keeps the Race clock moving while no renderer is running its own frame loop (e.g. 3D still loading). */
export function SessionTicker({ session }: { session: PickerSession }) {
  useEffect(() => {
    let frameId = 0
    const loop = (now: number) => {
      session.tick(now)
      frameId = requestAnimationFrame(loop)
    }
    frameId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frameId)
  }, [session])
  return null
}
