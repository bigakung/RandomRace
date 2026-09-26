import * as THREE from 'three'

/** Shared, flat-shaded low-poly materials for the Ayutthaya scenery (one of each per page). */
function standard(color: string, extra: THREE.MeshStandardMaterialParameters = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.85, flatShading: true, ...extra })
}

let cache: ReturnType<typeof create> | null = null

function create() {
  return {
    laterite: standard('#b56a45'),
    stucco: standard('#e9dfcc'),
    whitewash: standard('#f2ece0'),
    gold: standard('#e0b02a', { metalness: 0.6, roughness: 0.35 }),
    roofRed: standard('#b8401e'),
    roofGreen: standard('#2f6b3a'),
    plinth: standard('#8e3b24'),
    teak: standard('#8a5a33'),
    darkWood: standard('#5b3a22'),
    brick: standard('#9c5b3c'),
    palmTrunk: standard('#7a5a3a'),
    foliage: standard('#ffffff'), // tinted per instance
    flag: standard('#ffffff', { side: THREE.DoubleSide, roughness: 0.9 }), // tinted per instance
    silhouette: new THREE.MeshBasicMaterial({ color: '#d98d6a' }),
  }
}

export function sceneryMaterials() {
  cache ??= create()
  return cache
}
