import * as THREE from 'three'

/** Shared, flat-shaded low-poly materials for the elephant countryside (one of each per page). */
function standard(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra })
}

let cache: ReturnType<typeof create> | null = null

function create() {
  return {
    palmTrunk: standard('#8a6a42'),
    foliage: standard('#ffffff'), // tinted per instance
    thatch: standard('#c9a24a'),
    hutWall: standard('#a9895f'),
    postWood: standard('#6b4a2c'),
    hill: new THREE.MeshBasicMaterial({ color: '#8fae7a' }),
  }
}

export function elephantMaterials() {
  cache ??= create()
  return cache
}
