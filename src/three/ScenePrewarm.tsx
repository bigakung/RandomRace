import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { Object3D } from 'three'

type ScenePrewarmProps = {
  /** Called once the shaders are compiled and one frame has uploaded geometry and textures. */
  onDone: () => void
}

/**
 * Does the first Race's expensive GPU work ahead of time, while the Roster screen is open:
 * compiles every shader (without blocking the page where the browser supports parallel
 * compilation) and draws a single frame. It never starts a frame loop, so it costs one
 * burst of work and nothing afterwards.
 */
export function ScenePrewarm({ onDone }: ScenePrewarmProps) {
  const gl = useThree((state) => state.gl)
  const scene = useThree((state) => state.scene)
  const camera = useThree((state) => state.camera)

  useEffect(() => {
    let cancelled = false

    // compile() only visits visible objects; briefly reveal the hidden ones (the Winner ring
    // and confetti) so their shaders are ready too. compileAsync issues every compile before
    // it returns, so visibility can be restored straight away.
    const hidden: Object3D[] = []
    scene.traverse((object) => {
      if (!object.visible) hidden.push(object)
    })
    for (const object of hidden) object.visible = true
    const compiled = gl.compileAsync(scene, camera)
    for (const object of hidden) object.visible = false

    compiled
      .then(() => {
        if (cancelled) return
        gl.render(scene, camera)
        onDone()
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [gl, scene, camera, onDone])

  return null
}
