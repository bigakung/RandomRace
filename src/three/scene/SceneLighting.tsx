import { useMemo } from 'react'
import * as THREE from 'three'
import type { LightingPreset } from '../../themes/types'
import { FINISH_X, START_X } from '../layout/sceneLayout'

type SceneLightingProps = {
  lighting: LightingPreset
  shadows: boolean
  riverHalfWidth: number
}

export function SceneLighting({ lighting, shadows, riverHalfWidth }: SceneLightingProps) {
  const sunPosition = useMemo(() => {
    const [x, y, z] = lighting.sunDirection
    return new THREE.Vector3(x, y, z).normalize().multiplyScalar(80)
  }, [lighting.sunDirection])
  // Shadow camera just covers the track so the shadow map resolution is spent where boats are.
  const halfExtent = Math.max((FINISH_X - START_X) / 2 + 6, riverHalfWidth + 4)

  return (
    <>
      <hemisphereLight args={[lighting.hemisphereSky, lighting.hemisphereGround, lighting.hemisphereIntensity]} />
      <ambientLight intensity={lighting.ambientIntensity} />
      <directionalLight
        position={sunPosition}
        color={lighting.sunColor}
        intensity={lighting.sunIntensity}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-halfExtent}
        shadow-camera-right={halfExtent}
        shadow-camera-top={halfExtent}
        shadow-camera-bottom={-halfExtent}
        shadow-camera-near={1}
        shadow-camera-far={200}
        shadow-bias={-0.0005}
      />
    </>
  )
}
