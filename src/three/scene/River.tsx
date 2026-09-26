import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { LightingPreset } from '../../themes/types'
import { WAVE_HEIGHT_GLSL } from '../effects/water'

const RIVER_LENGTH = 260
const BANK_WIDTH = 40
const BANK_HEIGHT = 0.45

type RiverProps = {
  lighting: LightingPreset
  riverHalfWidth: number
  segments: number
  animated: boolean
}

/** Translucent water with GPU vertex waves over a dark riverbed, between two earthen banks. */
export function River({ lighting, riverHalfWidth, segments, animated }: RiverProps) {
  const width = riverHalfWidth * 2
  const time = useMemo(() => ({ value: 0 }), [])

  const waterMaterial = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({
      color: lighting.water,
      roughness: 0.45,
      metalness: 0,
      transparent: true,
      opacity: 0.88,
      // Flat shading derives normals per pixel, so the displaced surface gets faceted low-poly highlights.
      flatShading: true,
    })
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = time
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\nuniform float uTime;\n${WAVE_HEIGHT_GLSL}`)
        .replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           // Named to avoid three's own \`worldPosition\`, declared later in the shadow chunks.
           vec4 waveWorld = modelMatrix * vec4(position, 1.0);
           transformed.z += waveHeight(waveWorld.xz, uTime);`,
        )
    }
    return material
  }, [lighting.water, time])
  useEffect(() => () => waterMaterial.dispose(), [waterMaterial])

  useFrame(() => {
    if (animated) time.value = performance.now() / 1000
  })

  const segmentsAcross = Math.max(8, Math.round((segments * width) / RIVER_LENGTH))

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} material={waterMaterial} receiveShadow>
        <planeGeometry args={[RIVER_LENGTH, width, segments, segmentsAcross]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.8}>
        <planeGeometry args={[RIVER_LENGTH, width + 2]} />
        <meshStandardMaterial color={lighting.riverbed} roughness={1} />
      </mesh>
      {/* Countryside beyond the banks, so distant or tall framings never see past the world's edge. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-1}>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial color={lighting.bank} roughness={1} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, BANK_HEIGHT / 2 - 0.9, side * (riverHalfWidth + BANK_WIDTH / 2)]}
          receiveShadow
        >
          <boxGeometry args={[RIVER_LENGTH, BANK_HEIGHT + 1.8, BANK_WIDTH]} />
          <meshStandardMaterial color={lighting.bank} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}
