/**
 * Framework-free geometry of the 3D Race: where Lanes sit on the river, how Race progress
 * maps onto the track, and where the camera goes so every Lane is in view. World units:
 * X runs along the river (start → finish), Z across it (towards the camera is +Z), Y is up.
 */

export type Vec3 = readonly [number, number, number]

export type CameraFraming = {
  position: Vec3
  target: Vec3
}

export const LANE_SPACING = 1.6
export const START_X = -24
export const FINISH_X = 24
/** Room between the outermost Lanes and the river bank. */
const BANK_MARGIN = 1.2
/** Highest point that must stay in view above a Lane (flag tip and name label). */
const LABEL_HEIGHT = 2.2
/** Keep framed points slightly inside the screen edge. */
const SCREEN_MARGIN = 0.9
const CAMERA_PITCH_DEG = 14
const CAMERA_YAW_DEG = -8

export function laneLayout(laneCount: number): { laneZ: number[]; riverHalfWidth: number } {
  const laneZ = Array.from({ length: laneCount }, (_, lane) => (lane - (laneCount - 1) / 2) * LANE_SPACING)
  const outermost = ((laneCount - 1) / 2) * LANE_SPACING
  return { laneZ, riverHalfWidth: outermost + LANE_SPACING / 2 + BANK_MARGIN }
}

/** X position of a Vehicle's bow for a Lane progress in [0, 1]. */
export function trackX(progress: number): number {
  if (progress >= 1) return FINISH_X
  return START_X + progress * (FINISH_X - START_X)
}

function subtract(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function normalize(v: Vec3): Vec3 {
  const length = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / length, v[1] / length, v[2] / length]
}

/** Projects a world point through a look-at perspective camera into normalised device coordinates. */
export function projectToNdc(point: Vec3, { position, target }: CameraFraming, aspect: number, fovDeg: number): Vec3 {
  const forward = normalize(subtract(target, position))
  const right = normalize(cross(forward, [0, 1, 0]))
  const up = cross(right, forward)
  const relative = subtract(point, position)
  const depth = dot(relative, forward)
  const tanHalfV = Math.tan((fovDeg * Math.PI) / 360)
  return [dot(relative, right) / (depth * tanHalfV * aspect), dot(relative, up) / (depth * tanHalfV), depth]
}

function cameraDirection(pitchDeg: number): Vec3 {
  const pitch = (pitchDeg * Math.PI) / 180
  const yaw = (CAMERA_YAW_DEG * Math.PI) / 180
  return [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)]
}

/**
 * Closest camera along the view direction that shows every Lane between `fromX` and `toX`,
 * plus any `extraPoints`. With extra points it looks at the centre of everything it must show,
 * so they shift the composition rather than only pulling the camera back.
 */
function fitFraming(
  laneCount: number,
  aspect: number,
  fovDeg: number,
  fromX: number,
  toX: number,
  pitchDeg: number,
  extraPoints: readonly Vec3[] = [],
): CameraFraming {
  const { laneZ } = laneLayout(laneCount)
  const nearZ = laneZ[laneCount - 1] ?? 0
  const farZ = laneZ[0] ?? 0
  const direction = cameraDirection(pitchDeg)
  const points: Vec3[] = [...extraPoints]
  for (const x of [fromX, toX]) {
    for (const z of [nearZ, farZ]) {
      points.push([x, 0, z], [x, LABEL_HEIGHT, z])
    }
  }
  const middle = (axis: 1 | 2) => {
    const values = points.map((point) => point[axis])
    return (Math.min(...values) + Math.max(...values)) / 2
  }
  const composed = extraPoints.length > 0
  const target: Vec3 = [(fromX + toX) / 2, composed ? middle(1) : 0, composed ? middle(2) : 0]

  const framingAt = (distance: number): CameraFraming => ({
    position: [
      target[0] + direction[0] * distance,
      target[1] + direction[1] * distance,
      target[2] + direction[2] * distance,
    ],
    target,
  })
  const fits = (distance: number) =>
    points.every((point) => {
      const [x, y, depth] = projectToNdc(point, framingAt(distance), aspect, fovDeg)
      return depth > 0 && Math.abs(x) <= SCREEN_MARGIN && Math.abs(y) <= SCREEN_MARGIN
    })

  // Moving back only shrinks the projected track, so binary-search the closest distance that fits.
  let low = 1
  let high = 4000
  for (let i = 0; i < 40; i += 1) {
    const middle = (low + high) / 2
    if (fits(middle)) high = middle
    else low = middle
  }
  return framingAt(high)
}

/** Names on Vehicles stay readable up to this many Lanes; above it they show numbers only. */
const MAX_LANES_WITH_NAMES = 16

export function labelMode(laneCount: number): 'name' | 'number' {
  return laneCount <= MAX_LANES_WITH_NAMES ? 'name' : 'number'
}

/** Half-length of the stretch of river the follow camera keeps framed around its centre. */
const FOLLOW_WINDOW_HALF = 10
/** Narrow screens follow a shorter stretch so the boats are not tiny. */
const PORTRAIT_WINDOW_HALF = 6
/** The Leader is kept within this share of the window half, leaving room ahead of it. */
const LEADER_MARGIN = 0.8
/** Near the end the camera stops panning early so the finish gate stays in the frame. */
const FINISH_HOLD = 0.25
/** Tall screens look down more steeply so the Lanes fill the height instead of a strip. */
const PORTRAIT_PITCH_DEG = 32
/** Where the far-bank landmarks stand, relative to the river bank, for framing. */
const SCENERY_DEPTH = 14
const SCENERY_HEIGHT = 9

export type FollowRig = {
  /** Camera position relative to the point it looks at. */
  offset: Vec3
  /** Height and depth of the point it looks at (its X follows the Race). */
  lookY: number
  lookZ: number
  windowHalf: number
}

/** A camera sized to frame every Lane over a short stretch of river, to be slid along it. */
export function followRig(laneCount: number, aspect: number, fovDeg: number): FollowRig {
  const pitch = aspect < 1 ? PORTRAIT_PITCH_DEG : CAMERA_PITCH_DEG
  const windowHalf = aspect < 1 ? PORTRAIT_WINDOW_HALF : FOLLOW_WINDOW_HALF
  // Frame the far-bank temples too: the river sits lower in the picture, with the city behind
  // it, instead of an empty foreground bank.
  const farBank = -(laneLayout(laneCount).riverHalfWidth + SCENERY_DEPTH)
  const extra: Vec3[] = [
    [-windowHalf, SCENERY_HEIGHT, farBank],
    [windowHalf, SCENERY_HEIGHT, farBank],
  ]
  const { position, target } = fitFraming(laneCount, aspect, fovDeg, -windowHalf, windowHalf, pitch, extra)
  return { offset: subtract(position, target), lookY: target[1], lookZ: target[2], windowHalf }
}

export function framingAround({ offset, lookY, lookZ }: FollowRig, centerX: number): CameraFraming {
  const target: Vec3 = [centerX, lookY, lookZ]
  return { position: [centerX + offset[0], lookY + offset[1], lookZ + offset[2]], target }
}

/**
 * Where along the river the camera should look: between the rearmost boat and the Leader,
 * but never so far back that the Leader leaves the screen, and settling before the finish
 * so the gate — and the Winner crossing it — are in view.
 */
export function followCenterX(progress: readonly number[], { windowHalf }: FollowRig): number {
  if (progress.length === 0) return START_X
  let lead = -Infinity
  let rear = Infinity
  for (let lane = 0; lane < progress.length; lane += 1) {
    const x = trackX(progress[lane] ?? 0)
    if (x > lead) lead = x
    if (x < rear) rear = x
  }
  const center = Math.max((lead + rear) / 2, lead - LEADER_MARGIN * windowHalf)
  return Math.min(center, FINISH_X - FINISH_HOLD * windowHalf)
}
