import type { ThemeConfig } from '../types'

export const ayutthayaThemeConfig: ThemeConfig = {
  id: 'ayutthaya',
  name: 'กรุงศรีอยุธยา',
  vehicleColors: [
    '#b5452b',
    '#1f6f8b',
    '#d4a017',
    '#6a3d9a',
    '#2e7d4f',
    '#c2185b',
    '#e07b24',
    '#3949ab',
    '#8d6e3f',
    '#00897b',
  ],
  defaultTimeOfDay: 'sunset',
  lighting: {
    sunset: {
      skyTop: '#3d5a8a',
      skyHorizon: '#f7b267',
      sunColor: '#ffc27a',
      sunIntensity: 2.6,
      sunDirection: [-40, 45, -50],
      hemisphereSky: '#ffe2b8',
      hemisphereGround: '#6b5a3a',
      hemisphereIntensity: 1.5,
      ambientIntensity: 0.35,
      fogColor: '#f0b27a',
      water: '#5a9e8c',
      riverbed: '#4a4a30',
      bank: '#9aa85a',
    },
  },
}
