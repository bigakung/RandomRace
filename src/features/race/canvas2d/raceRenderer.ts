import type { Roster } from '../../picker/roster'

export type RaceFrame = {
  width: number
  height: number
  roster: Roster
  progress: readonly number[]
  now: number
  /** Lane of the Winner once it has crossed the line, to celebrate; null while racing. */
  celebrateLane: number | null
  /** Reduced motion: boats sit still and the Winner glow does not pulse. */
  still: boolean
}

/** Lanes shorter than this show only the Participant number on the boat. */
const MIN_LANE_HEIGHT_FOR_NAMES = 24
const MARGIN_X = 16
const MARGIN_Y = 12

type Layout = {
  laneHeight: number
  top: number
  startX: number
  finishX: number
  boatLength: number
  showNames: boolean
}

function computeLayout(width: number, height: number, laneCount: number): Layout {
  const laneHeight = (height - MARGIN_Y * 2) / Math.max(1, laneCount)
  return {
    laneHeight,
    top: MARGIN_Y,
    startX: MARGIN_X,
    finishX: width - MARGIN_X - 8,
    boatLength: Math.min(150, Math.max(56, width * 0.14)),
    showNames: laneHeight >= MIN_LANE_HEIGHT_FOR_NAMES,
  }
}

function vehicleColor(lane: number): string {
  // Golden-angle hue steps keep neighbouring Lanes visually distinct.
  return `hsl(${Math.round((lane * 137.508) % 360)} 70% 46%)`
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text
  let end = text.length
  while (end > 0 && ctx.measureText(`${text.slice(0, end)}…`).width > maxWidth) end -= 1
  return end > 0 ? `${text.slice(0, end)}…` : ''
}

export function createRaceRenderer() {
  // Fitting labels needs measureText; cache per label until the layout or font changes.
  const labelCache = new Map<string, string>()

  function label(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    const key = `${ctx.font}|${Math.round(maxWidth)}|${text}`
    let fitted = labelCache.get(key)
    if (fitted === undefined) {
      fitted = fitText(ctx, text, maxWidth)
      labelCache.set(key, fitted)
    }
    return fitted
  }

  function drawRiver(ctx: CanvasRenderingContext2D, { width, height }: RaceFrame, layout: Layout, laneCount: number) {
    const water = ctx.createLinearGradient(0, 0, 0, height)
    water.addColorStop(0, '#3b8a8f')
    water.addColorStop(1, '#1f5f6b')
    ctx.fillStyle = water
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'rgb(255 255 255 / 0.05)'
    for (let lane = 0; lane < laneCount; lane += 2) {
      ctx.fillRect(0, layout.top + lane * layout.laneHeight, width, layout.laneHeight)
    }

    const square = Math.max(3, Math.min(8, layout.laneHeight / 3))
    for (let y = 0, row = 0; y < height; y += square, row += 1) {
      ctx.fillStyle = row % 2 === 0 ? '#fff' : '#3b1f14'
      ctx.fillRect(layout.finishX, y, square, square)
      ctx.fillStyle = row % 2 === 0 ? '#3b1f14' : '#fff'
      ctx.fillRect(layout.finishX + square, y, square, square)
    }
  }

  function drawBoat(ctx: CanvasRenderingContext2D, frame: RaceFrame, layout: Layout, lane: number) {
    const participant = frame.roster[lane]
    if (!participant) return
    const progress = frame.progress[lane] ?? 0
    const { laneHeight, boatLength, startX, finishX } = layout
    const noseX = startX + boatLength + progress * (finishX - startX - boatLength)
    const bob = frame.still ? 0 : Math.sin(frame.now / 300 + lane * 1.7) * Math.min(1.5, laneHeight * 0.05)
    const centerY = layout.top + (lane + 0.5) * laneHeight + bob
    const hullHeight = Math.max(4, Math.min(26, laneHeight * 0.62))
    const tailX = noseX - boatLength

    const celebrating = frame.celebrateLane === lane
    if (celebrating) {
      // A pulsing gold glow marks the Winner in the flat fallback.
      ctx.shadowColor = '#ffd257'
      ctx.shadowBlur = frame.still ? 16 : 14 + Math.sin(frame.now / 150) * 6
    }
    ctx.fillStyle = vehicleColor(lane)
    ctx.beginPath()
    ctx.moveTo(tailX, centerY - hullHeight / 2)
    ctx.lineTo(noseX - hullHeight * 0.6, centerY - hullHeight / 2)
    ctx.quadraticCurveTo(noseX, centerY - hullHeight / 2, noseX, centerY - hullHeight * 0.9)
    ctx.lineTo(noseX - hullHeight * 0.2, centerY + hullHeight / 2)
    ctx.lineTo(tailX + hullHeight * 0.3, centerY + hullHeight / 2)
    ctx.closePath()
    ctx.fill()
    ctx.shadowBlur = 0
    if (celebrating) {
      ctx.strokeStyle = '#ffd257'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    if (hullHeight < 8) return
    const fontSize = Math.min(15, hullHeight * 0.72)
    ctx.font = `600 ${fontSize}px Sarabun, system-ui, sans-serif`
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'middle'
    const text = layout.showNames ? `#${participant.number} ${participant.name}` : `${participant.number}`
    ctx.fillText(label(ctx, text, boatLength - hullHeight), tailX + 6, centerY + 1)
  }

  return {
    draw(ctx: CanvasRenderingContext2D, frame: RaceFrame) {
      const laneCount = frame.roster.length
      const layout = computeLayout(frame.width, frame.height, laneCount)
      drawRiver(ctx, frame, layout, laneCount)
      for (let lane = 0; lane < laneCount; lane += 1) drawBoat(ctx, frame, layout, lane)
    },
  }
}
