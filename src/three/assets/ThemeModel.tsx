import { useGLTF } from '@react-three/drei'
import { Suspense, useMemo, type ReactNode } from 'react'
import { ErrorBoundary } from '../../components/ErrorBoundary'

type ThemeModelProps = {
  /** Path relative to the site root, or null to use the procedural fallback. */
  url: string | null
  fallback: ReactNode
}

function GltfScene({ url }: { url: string }) {
  // Draco decoding is off: drei would otherwise fetch its decoder from an external CDN.
  const gltf = useGLTF(`${import.meta.env.BASE_URL}${url}`, false)
  // Clone so the same model can be placed several times.
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])
  return <primitive object={scene} />
}

/**
 * A Theme model slot: the GLB when one is configured and loads, otherwise the procedural
 * fallback — while loading and on any load error — so a missing asset never breaks a Race.
 */
export function ThemeModel({ url, fallback }: ThemeModelProps) {
  if (!url) return <>{fallback}</>
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <GltfScene url={url} />
      </Suspense>
    </ErrorBoundary>
  )
}
