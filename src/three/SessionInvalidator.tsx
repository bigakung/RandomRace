import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import type { PickerSession } from '../features/session/pickerSession'

type SessionInvalidatorProps = {
  session: PickerSession
  active: boolean
  /** Reduced motion: frames are drawn on demand, so request one on every session change. */
  onDemand: boolean
  /** Called on the first frame drawn after the stage becomes active again. */
  onFreshFrame: () => void
}

/**
 * Keeps a reused (hidden-between-Races) scene honest: it reports the first frame of each new
 * activation — so the canvas can stay invisible until then and the previous Race's final frame
 * is never shown — and, when rendering on demand, asks for frames as the session changes.
 */
export function SessionInvalidator({ session, active, onDemand, onFreshFrame }: SessionInvalidatorProps) {
  const invalidate = useThree((state) => state.invalidate)
  const awaitingFreshFrame = useRef(true)

  useEffect(() => {
    if (!onDemand) return
    return session.subscribe(() => invalidate())
  }, [session, invalidate, onDemand])

  useEffect(() => {
    awaitingFreshFrame.current = true
    if (active) invalidate()
  }, [active, invalidate])

  useFrame(() => {
    if (!active || !awaitingFreshFrame.current) return
    awaitingFreshFrame.current = false
    onFreshFrame()
  })

  return null
}
