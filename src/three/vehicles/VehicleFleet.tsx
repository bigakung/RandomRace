import { useFrame } from '@react-three/fiber'
import { useCallback, useRef } from 'react'
import type * as THREE from 'three'
import type { Roster } from '../../features/picker/roster'
import type { PickerSession } from '../../features/session/pickerSession'
import { labelMode, laneLayout, trackX } from '../layout/sceneLayout'
import type { SceneTheme } from '../sceneTheme'
import { LABEL_SCALE, useNameLabels } from './nameLabels'

type VehicleFleetProps = {
  session: PickerSession
  roster: Roster
  theme: SceneTheme
  castShadow: boolean
  animatedSurface: boolean
  /** Reduced motion: no sway or roll. */
  still: boolean
}

const RIDE_HEIGHT = 0.06
const LABEL_Y = 2.0

/**
 * Every Participant's Vehicle and name label. A single frame callback advances the session
 * clock and places each Vehicle from its Lane progress — refs only, no React updates.
 */
export function VehicleFleet({ session, roster, theme, castShadow, animatedSurface, still }: VehicleFleetProps) {
  const { Vehicle, vehicleLength, config, surfaceHeightAt } = theme
  const colorFor = useCallback(
    (lane: number) => config.vehicleColors[lane % config.vehicleColors.length] ?? '#b5452b',
    [config.vehicleColors],
  )
  const labels = useNameLabels(roster, colorFor, labelMode(roster.length))
  const groups = useRef<(THREE.Group | null)[]>([])
  const progress = useRef<number[]>([])
  const { laneZ } = laneLayout(roster.length)

  useFrame(() => {
    const now = performance.now()
    session.tick(now)
    session.laneProgress(now, progress.current)
    const seconds = animatedSurface ? now / 1000 : 0

    // A plain loop: no closures or iterators are created per frame.
    for (let lane = 0; lane < groups.current.length; lane += 1) {
      const group = groups.current[lane]
      if (!group) continue
      const x = trackX(progress.current[lane] ?? 0)
      const z = laneZ[lane] ?? 0
      const phase = lane * 1.7
      const midX = x - vehicleLength / 2
      // Ride the same ground the Theme's Surface draws, and pitch with its slope.
      const bob = surfaceHeightAt(midX, z, seconds)
      const slope = surfaceHeightAt(midX + 0.6, z, seconds) - surfaceHeightAt(midX - 0.6, z, seconds)
      const t = still ? 0 : now / 1000
      const sway = still ? 0 : 1
      group.position.set(x, RIDE_HEIGHT + bob, z + Math.sin(t * 0.7 + phase) * 0.05 * sway)
      group.rotation.set(Math.sin(t * 1.3 + phase) * 0.035 * sway, Math.sin(t * 0.5 + phase) * 0.02 * sway, slope * 0.5)
    }
  })

  return (
    <group>
      {roster.map((participant, lane) => (
        <group
          key={participant.number}
          ref={(group) => {
            groups.current[lane] = group
          }}
          position={[trackX(0), RIDE_HEIGHT, laneZ[lane] ?? 0]}
        >
          <Vehicle color={colorFor(lane)} castShadow={castShadow} />
          {labels[lane] && (
            <sprite position={[-vehicleLength / 2, LABEL_Y, 0]} scale={[LABEL_SCALE[0], LABEL_SCALE[1], 1]}>
              <spriteMaterial map={labels[lane]} transparent depthWrite={false} sizeAttenuation={false} />
            </sprite>
          )}
        </group>
      ))}
    </group>
  )
}
