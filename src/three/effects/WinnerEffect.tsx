import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { PickerSession } from '../../features/session/pickerSession'
import { FINISH_X } from '../layout/sceneLayout'

type WinnerEffectProps = {
  session: PickerSession
  laneZ: readonly number[]
  vehicleLength: number
  particleCount: number
  /** Reduced motion: a steady ring and light, no pulsing. */
  still: boolean
}

const GOLD = new THREE.Color('#ffd257')
const CONFETTI = ['#e0b02a', '#c0392b', '#f2ece0', '#2f6b3a', '#f7b267'].map((color) => new THREE.Color(color))
const GRAVITY = 4
const LIGHT_INTENSITY = 18

/**
 * The celebration around the Winner once it crosses the line: a pulsing gold ring on the water,
 * a warm light, rising gold sparkles and falling confetti. Buffers are allocated once; the frame
 * callback only rewrites them.
 */
export function WinnerEffect({ session, laneZ, vehicleLength, particleCount, still }: WinnerEffectProps) {
  const group = useRef<THREE.Group>(null)
  const ring = useRef<THREE.Mesh>(null)
  const points = useRef<THREE.Points>(null)
  const light = useRef<THREE.PointLight>(null)
  const startedAt = useRef<number | null>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i += 1) {
      // First half gold sparkles, second half confetti.
      const color = i < particleCount / 2 ? GOLD : (CONFETTI[i % CONFETTI.length] ?? GOLD)
      color.toArray(colors, i * 3)
    }
    const geometry = new THREE.BufferGeometry()
    const positionAttribute = new THREE.BufferAttribute(positions, 3)
    geometry.setAttribute('position', positionAttribute)
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const material = new THREE.PointsMaterial({ size: 0.28, vertexColors: true, transparent: true, depthWrite: false })
    return { positions, velocities, positionAttribute, geometry, material }
  }, [particleCount])
  useEffect(
    () => () => {
      particles.geometry.dispose()
      particles.material.dispose()
    },
    [particles],
  )

  const ringParts = useMemo(
    () => ({
      geometry: new THREE.RingGeometry(1.1, 1.6, 40).rotateX(-Math.PI / 2),
      material: new THREE.MeshBasicMaterial({
        color: GOLD,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    }),
    [],
  )
  useEffect(
    () => () => {
      ringParts.geometry.dispose()
      ringParts.material.dispose()
    },
    [ringParts],
  )

  function launch(index: number) {
    const { positions, velocities } = particles
    const base = index * 3
    const sparkle = index < particleCount / 2
    positions[base] = (Math.random() - 0.5) * vehicleLength
    positions[base + 1] = 0.4
    positions[base + 2] = (Math.random() - 0.5) * 0.8
    velocities[base] = (Math.random() - 0.5) * (sparkle ? 0.8 : 3)
    velocities[base + 1] = sparkle ? 1.2 + Math.random() * 1.6 : 4 + Math.random() * 3
    velocities[base + 2] = (Math.random() - 0.5) * (sparkle ? 0.8 : 3)
  }

  useFrame((_, delta) => {
    const root = group.current
    if (!root) return
    const { phase, winner } = session.getState()
    const active = (phase === 'finished' || phase === 'result') && winner !== null
    // The light stays in the scene at zero intensity: adding a light later would make every
    // material recompile its shader right at the finish.
    if (ring.current) ring.current.visible = active
    if (points.current) points.current.visible = active
    if (!active || !winner) {
      startedAt.current = null
      if (light.current) light.current.intensity = 0
      return
    }

    const now = performance.now() / 1000
    if (startedAt.current === null) {
      startedAt.current = now
      for (let i = 0; i < particleCount; i += 1) launch(i)
    }
    const age = now - startedAt.current
    root.position.set(FINISH_X - vehicleLength / 2, 0, laneZ[winner.number - 1] ?? 0)

    const pulse = still ? 1 : 1 + Math.sin(age * 5) * 0.12
    ring.current?.scale.set(pulse, 1, pulse)
    if (light.current) light.current.intensity = still ? LIGHT_INTENSITY : LIGHT_INTENSITY * Math.min(1, age * 2)

    const step = Math.min(delta, 0.05)
    const { positions, velocities } = particles
    for (let i = 0; i < particleCount; i += 1) {
      const base = i * 3
      const sparkle = i < particleCount / 2
      velocities[base + 1] = (velocities[base + 1] ?? 0) - (sparkle ? GRAVITY * 0.15 : GRAVITY) * step
      positions[base] = (positions[base] ?? 0) + (velocities[base] ?? 0) * step
      positions[base + 1] = (positions[base + 1] ?? 0) + (velocities[base + 1] ?? 0) * step
      positions[base + 2] = (positions[base + 2] ?? 0) + (velocities[base + 2] ?? 0) * step
      if ((positions[base + 1] ?? 0) < 0 || (sparkle && (positions[base + 1] ?? 0) > 5)) launch(i)
    }
    particles.positionAttribute.needsUpdate = true
  })

  return (
    <group ref={group}>
      <mesh ref={ring} geometry={ringParts.geometry} material={ringParts.material} position-y={0.15} visible={false} />
      <pointLight ref={light} color={GOLD} intensity={0} distance={10} position={[0, 2.5, 0]} />
      <points ref={points} geometry={particles.geometry} material={particles.material} frustumCulled={false} visible={false} />
    </group>
  )
}
