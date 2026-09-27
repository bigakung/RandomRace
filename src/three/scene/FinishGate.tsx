import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { FINISH_X } from '../layout/sceneLayout'
import { InstancedPlacements } from './InstancedPlacements'

const GATE_HEIGHT = 4.2
const PENNANT_SPACING = 1.1
const PENNANT_COLORS = ['#c0392b', '#e0b02a']

/**
 * A wooden gate with a gold-trimmed beam and a string of red-and-gold pennants spanning the
 * river at the finish line. Pennants face the camera (+Z) so they read from the default view.
 */
export function FinishGate({ courseHalfWidth }: { courseHalfWidth: number }) {
  const span = courseHalfWidth * 2
  const pennant = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-0.35, 0)
    shape.lineTo(0.35, 0)
    shape.lineTo(0, -0.7)
    shape.closePath()
    return { geometry: new THREE.ShapeGeometry(shape), material: new THREE.MeshStandardMaterial({ side: THREE.DoubleSide }) }
  }, [])
  useEffect(
    () => () => {
      pennant.geometry.dispose()
      pennant.material.dispose()
    },
    [pennant],
  )
  const pennants = useMemo(() => {
    const count = Math.max(2, Math.floor(span / PENNANT_SPACING))
    return Array.from({ length: count }, (_, i) => ({
      x: FINISH_X,
      z: -span / 2 + (i + 0.5) * (span / count),
      rotationY: 0,
      scale: 1,
    }))
  }, [span])

  return (
    <group>
      <group position-x={FINISH_X}>
        {[-1, 1].map((side) => (
          <group key={side} position-z={side * courseHalfWidth}>
            <mesh position-y={GATE_HEIGHT / 2 - 0.5} castShadow>
              <cylinderGeometry args={[0.18, 0.22, GATE_HEIGHT + 1, 8]} />
              <meshStandardMaterial color="#6b3b1f" roughness={0.9} />
            </mesh>
            <mesh position-y={GATE_HEIGHT + 0.35}>
              <coneGeometry args={[0.3, 0.9, 4]} />
              <meshStandardMaterial color="#e0b02a" metalness={0.6} roughness={0.35} />
            </mesh>
          </group>
        ))}
        <mesh position-y={GATE_HEIGHT - 0.2}>
          <boxGeometry args={[0.3, 0.35, span]} />
          <meshStandardMaterial color="#8e2a1c" roughness={0.6} />
        </mesh>
        <mesh position-y={GATE_HEIGHT + 0.02}>
          <boxGeometry args={[0.36, 0.08, span + 0.2]} />
          <meshStandardMaterial color="#e0b02a" metalness={0.6} roughness={0.35} />
        </mesh>
        {/* The line on the water that the Winner's bow touches. */}
        <mesh rotation-x={-Math.PI / 2} position-y={0.12}>
          <planeGeometry args={[0.25, span]} />
          <meshBasicMaterial color="#fff4d6" transparent opacity={0.85} />
        </mesh>
      </group>
      <InstancedPlacements
        geometry={pennant.geometry}
        material={pennant.material}
        placements={pennants}
        offset={[0, GATE_HEIGHT - 0.4, 0]}
        colors={PENNANT_COLORS}
      />
    </group>
  )
}
