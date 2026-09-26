import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { LightingPreset } from '../../themes/types'

const RADIUS = 600

/** A gradient sky with a soft sun disc, drawn behind everything and ignoring fog. */
export function SkyDome({ lighting }: { lighting: LightingPreset }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color(lighting.skyTop) },
          horizon: { value: new THREE.Color(lighting.skyHorizon) },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDirection;
          void main() {
            vDirection = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 top;
          uniform vec3 horizon;
          varying vec3 vDirection;
          void main() {
            float h = clamp(vDirection.y * 1.6, 0.0, 1.0);
            gl_FragColor = vec4(mix(horizon, top, pow(h, 0.8)), 1.0);
          }
        `,
      }),
    [lighting.skyTop, lighting.skyHorizon],
  )
  useEffect(() => () => material.dispose(), [material])

  const sunPosition = useMemo(() => {
    const [x, y, z] = lighting.sunDirection
    return new THREE.Vector3(x, y, z).normalize().multiplyScalar(RADIUS * 0.8)
  }, [lighting.sunDirection])

  return (
    <group>
      <mesh material={material} renderOrder={-1}>
        <sphereGeometry args={[RADIUS, 24, 12]} />
      </mesh>
      <mesh position={sunPosition} onUpdate={(mesh) => mesh.lookAt(0, 0, 0)}>
        <circleGeometry args={[28, 24]} />
        <meshBasicMaterial color={lighting.sunColor} fog={false} />
      </mesh>
    </group>
  )
}
