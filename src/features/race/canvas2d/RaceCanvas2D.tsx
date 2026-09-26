import { useRef } from 'react'
import type { PickerSession } from '../../session/pickerSession'
import { useRaceAnimation } from './useRaceAnimation'

type RaceCanvas2DProps = {
  session: PickerSession
  description: string
  /** Reduced motion: no bobbing or pulsing. */
  still: boolean
}

/** The flat 2D Race, used when 3D (WebGL) is unavailable or lost (ADR-0002). */
export function RaceCanvas2D({ session, description, still }: RaceCanvas2DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useRaceAnimation(canvasRef, session, still)
  return <canvas ref={canvasRef} className="race__canvas" role="img" aria-label={description} />
}
