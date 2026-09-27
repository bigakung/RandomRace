import type { ThemeConfig } from '../types'

export const elephantThemeConfig: ThemeConfig = {
  id: 'elephant',
  name: 'ขบวนช้างไทย',
  vehicleColors: [
    '#c0392b',
    '#2e86ab',
    '#e0a030',
    '#6a3d9a',
    '#3a8f4c',
    '#c2185b',
    '#e07b24',
    '#3949ab',
    '#8d6e3f',
    '#00897b',
  ],
  // Bright countryside daylight, distinct from Ayutthaya's sunset — also exercises the
  // `day`/`morning` lighting presets as more than unused configuration.
  defaultTimeOfDay: 'day',
  lighting: {
    morning: {
      skyTop: '#a9c6e0',
      skyHorizon: '#ffe2b0',
      sunColor: '#fff0c2',
      sunIntensity: 2.1,
      sunDirection: [-30, 30, -55],
      hemisphereSky: '#dceeff',
      hemisphereGround: '#8a9a5a',
      hemisphereIntensity: 1.3,
      ambientIntensity: 0.4,
      fogColor: '#dcead2',
      surfacePrimary: '#c9a670',
      surfaceShadow: '#8a6a44',
      surroundings: '#8fae5a',
    },
    day: {
      skyTop: '#3f8fd1',
      skyHorizon: '#cdeaf7',
      sunColor: '#fffdf0',
      sunIntensity: 3.0,
      sunDirection: [-15, 75, -25],
      hemisphereSky: '#cdeeff',
      hemisphereGround: '#8fae5a',
      hemisphereIntensity: 1.6,
      ambientIntensity: 0.32,
      fogColor: '#d6ecd0',
      surfacePrimary: '#caa876',
      surfaceShadow: '#8a6a44',
      surroundings: '#8fc25a',
    },
  },
}
