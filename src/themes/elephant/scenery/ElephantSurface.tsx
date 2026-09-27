import type { SurfaceProps } from '../../../three/sceneTheme'

const TRACK_LENGTH = 260
const VERGE_WIDTH = 40

/** A flat packed-dirt track between two grass verges — the elephant Theme's Surface
 * (ADR-0004). Flat ground has nothing to animate; `segments`/`animated` are accepted for a
 * uniform Surface contract but unused here (`elephantSceneTheme.surfaceHeightAt` is a constant 0). */
export function ElephantSurface({ lighting, courseHalfWidth }: SurfaceProps) {
  const width = courseHalfWidth * 2

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[TRACK_LENGTH, width]} />
        <meshStandardMaterial color={lighting.surfacePrimary} roughness={1} flatShading />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.03}>
        <planeGeometry args={[TRACK_LENGTH, width + 2]} />
        <meshStandardMaterial color={lighting.surfaceShadow} roughness={1} />
      </mesh>
      {/* Countryside beyond the verges, so distant or tall framings never see past the world's edge. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.05}>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial color={lighting.surroundings} roughness={1} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} rotation-x={-Math.PI / 2} position={[0, -0.02, side * (courseHalfWidth + VERGE_WIDTH / 2)]}>
          <planeGeometry args={[TRACK_LENGTH, VERGE_WIDTH]} />
          <meshStandardMaterial color={lighting.surroundings} roughness={1} />
        </mesh>
      ))}
    </group>
  )
}
