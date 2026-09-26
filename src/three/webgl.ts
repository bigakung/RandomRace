let available: boolean | undefined

/** Detected once per page: every probe creates a throwaway GPU context. */
export function isWebGLAvailable(): boolean {
  if (available === undefined) {
    try {
      const canvas = document.createElement('canvas')
      available = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      available = false
    }
  }
  return available
}
