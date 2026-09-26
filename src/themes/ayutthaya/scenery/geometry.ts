import * as THREE from 'three'

/** Solid of revolution from (radius, height) pairs; few segments give the faceted low-poly look. */
export function lathe(profile: readonly (readonly [number, number])[], segments: number): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    profile.map(([radius, height]) => new THREE.Vector2(radius, height)),
    segments,
  )
}

/** A gable roof: a triangular prism `length` long (along X), `width` deep and `height` tall. */
export function gableRoof(length: number, width: number, height: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(-width / 2, 0)
  shape.lineTo(width / 2, 0)
  shape.lineTo(0, height)
  shape.closePath()
  const roof = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false })
  roof.translate(0, 0, -length / 2)
  roof.rotateY(Math.PI / 2)
  return roof
}

/** Khmer-style corn-cob tower (prang) on a stepped base, ~15 units tall. */
export const PRANG_PROFILE: readonly (readonly [number, number])[] = [
  [3.4, 0],
  [3.4, 1.2],
  [2.8, 1.2],
  [2.8, 2.6],
  [2.3, 2.9],
  [2.5, 4.4],
  [2.4, 6],
  [2.1, 7.8],
  [1.7, 9.4],
  [1.2, 10.9],
  [0.7, 12.2],
  [0.35, 13.2],
  [0.12, 14.4],
  [0, 15.2],
]

/** Bell-shaped chedi (as at Wat Phra Si Sanphet) with its ringed spire, ~11 units tall. */
export const CHEDI_PROFILE: readonly (readonly [number, number])[] = [
  [3, 0],
  [3, 0.6],
  [2.6, 0.6],
  [2.6, 1.2],
  [2.25, 1.2],
  [2.25, 1.7],
  [2.1, 1.9],
  [2.45, 2.7],
  [2.35, 3.7],
  [1.9, 4.6],
  [1.15, 5.2],
  [0.9, 5.3],
  [0.9, 5.9],
  [0.7, 6.1],
  [0.6, 7],
  [0.45, 8],
  [0.3, 9],
  [0.15, 10],
  [0, 10.9],
]

export const PRANG_HEIGHT = 15.2
export const CHEDI_HEIGHT = 10.9
