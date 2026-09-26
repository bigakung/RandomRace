import { useEffect, useState } from 'react'
import * as THREE from 'three'
import type { Roster } from '../../features/picker/roster'

const LABEL_WIDTH = 512
const LABEL_HEIGHT = 112
const FONT = '600 56px Sarabun, system-ui, sans-serif'
/** Screen-space size of a label sprite (fraction of the viewport height), constant at any camera distance. */
export const LABEL_SCALE: readonly [number, number] = [0.17, 0.17 * (LABEL_HEIGHT / LABEL_WIDTH)]

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let end = text.length
  while (end > 0 && ctx.measureText(`${text.slice(0, end)}…`).width > maxWidth) end -= 1
  return `${text.slice(0, end)}…`
}

/**
 * Draws "#n name" with the browser's own text shaping — which places Thai vowels and tone
 * marks correctly — onto a canvas used as a sprite texture (ADR-0002).
 */
function drawLabel(text: string, accent: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = LABEL_WIDTH
  canvas.height = LABEL_HEIGHT
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.font = FONT
    const label = fitText(ctx, text, LABEL_WIDTH - 56)
    const width = Math.min(LABEL_WIDTH - 8, ctx.measureText(label).width + 48)
    const x = (LABEL_WIDTH - width) / 2
    ctx.fillStyle = 'rgba(40, 20, 12, 0.72)'
    ctx.beginPath()
    ctx.roundRect(x, 12, width, LABEL_HEIGHT - 24, 40)
    ctx.fill()
    ctx.strokeStyle = accent
    ctx.lineWidth = 6
    ctx.stroke()
    ctx.fillStyle = '#fff8e8'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, LABEL_WIDTH / 2, LABEL_HEIGHT / 2 + 4)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return texture
}

/** One label texture per Participant, drawn once the Thai font is ready and disposed on change. */
export function useNameLabels(
  roster: Roster,
  colorFor: (lane: number) => string,
  mode: 'name' | 'number',
): THREE.CanvasTexture[] {
  const [textures, setTextures] = useState<THREE.CanvasTexture[]>([])

  useEffect(() => {
    let cancelled = false
    let created: THREE.CanvasTexture[] = []
    const fontReady = document.fonts?.load(FONT).catch(() => undefined) ?? Promise.resolve()
    void fontReady.then(() => {
      if (cancelled) return
      // Crowded Races show only numbers; the Leader panel carries the names.
      created = roster.map((p, lane) => drawLabel(mode === 'name' ? `#${p.number} ${p.name}` : `${p.number}`, colorFor(lane)))
      setTextures(created)
    })
    return () => {
      cancelled = true
      created.forEach((texture) => texture.dispose())
    }
  }, [roster, colorFor, mode])

  return textures
}
