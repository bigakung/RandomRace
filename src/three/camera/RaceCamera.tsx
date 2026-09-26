import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PickerSession } from '../../features/session/pickerSession'
import { followCenterX, followRig, laneLayout } from '../layout/sceneLayout'

export const CAMERA_FOV = 45

/** Pulled back a little during the countdown, so GO can glide the camera in. */
const COUNTDOWN_PULL_BACK = 1.12
/** A slight push-in as the Leader nears the finish. */
const FINISH_PUSH_IN = 0.94
const NEAR_FINISH_PROGRESS = 0.85
/** Once the Winner has crossed, the camera closes in on its Lane. */
const WINNER_PUSH_IN = 0.8
/** Smoothing rates (per second): the camera eases more gently near the finish. */
const FOLLOW_RATE = 2.2
const FINISH_RATE = 1.1

/**
 * A cinematic follow camera: slides along the river keeping the Leader in view, reframes for
 * the canvas shape, and never rotates on its own. Reads Race progress; never changes it.
 */
export function RaceCamera({ session, laneCount, still }: { session: PickerSession; laneCount: number; still: boolean }) {
  const camera = useThree((state) => state.camera)
  const scene = useThree((state) => state.scene)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  const aspect = height > 0 ? width / height : 16 / 9
  const rig = useMemo(() => followRig(laneCount, aspect, CAMERA_FOV), [laneCount, aspect])
  const progress = useRef<number[]>([])
  const center = useRef<number | null>(null)
  const zoom = useRef(COUNTDOWN_PULL_BACK)
  const lookZ = useRef<number | null>(null)
  const lastPhase = useRef<string | null>(null)
  const { laneZ } = useMemo(() => laneLayout(laneCount), [laneCount])

  useEffect(() => {
    if (!(camera instanceof THREE.PerspectiveCamera)) return
    camera.fov = CAMERA_FOV
    camera.near = 0.5
    camera.far = 2000
    camera.updateProjectionMatrix()
    // Fog starts beyond the farthest Lane so boats stay clear while the background softens.
    if (scene.fog instanceof THREE.Fog) {
      const distance = Math.hypot(...rig.offset)
      scene.fog.near = distance * 1.3
      scene.fog.far = distance * 5 + 200
    }
  }, [camera, scene, rig])

  useFrame((_, delta) => {
    const now = performance.now()
    session.laneProgress(now, progress.current)
    const { phase, winner } = session.getState()
    // The scene is reused across Races: start each new countdown from a fresh framing rather
    // than gliding in from where the previous Race ended.
    if (phase === 'countdown' && lastPhase.current !== 'countdown') {
      center.current = null
      lookZ.current = null
      zoom.current = COUNTDOWN_PULL_BACK
    }
    lastPhase.current = phase
    let leader = 0
    for (let lane = 0; lane < progress.current.length; lane += 1) leader = Math.max(leader, progress.current[lane] ?? 0)
    const nearFinish = phase === 'finished' || leader >= NEAR_FINISH_PROGRESS

    const targetCenter = followCenterX(progress.current, rig)
    const celebrating = phase === 'finished' && winner !== null
    const targetZoom = still ? 1 : phase === 'countdown' ? COUNTDOWN_PULL_BACK : celebrating ? WINNER_PUSH_IN : nearFinish ? FINISH_PUSH_IN : 1
    // Slide across the river to the Winner's Lane so a far-side Winner stays in the closer shot.
    const targetLookZ = celebrating && !still ? rig.lookZ + ((laneZ[winner.number - 1] ?? 0) - rig.lookZ) * 0.8 : rig.lookZ
    // Frame-rate independent easing; the first frame snaps into place.
    // Reduced motion snaps straight to each framing instead of gliding.
    const ease = center.current === null || still ? 1 : 1 - Math.exp(-(nearFinish ? FINISH_RATE : FOLLOW_RATE) * delta)
    center.current = (center.current ?? targetCenter) + (targetCenter - (center.current ?? targetCenter)) * ease
    zoom.current += (targetZoom - zoom.current) * ease
    lookZ.current = (lookZ.current ?? targetLookZ) + (targetLookZ - (lookZ.current ?? targetLookZ)) * ease

    const [x, y, z] = rig.offset
    camera.position.set(center.current + x * zoom.current, rig.lookY + y * zoom.current, lookZ.current + z * zoom.current)
    camera.lookAt(center.current, rig.lookY, lookZ.current)
  })

  return null
}
