import { PerformanceMonitor } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Roster } from '../features/picker/roster'
import type { PickerSession } from '../features/session/pickerSession'
import type { ThemeId } from '../themes/registry'
import { CAMERA_FOV, RaceCamera } from './camera/RaceCamera'
import { WinnerEffect } from './effects/WinnerEffect'
import { laneLayout } from './layout/sceneLayout'
import { chooseQuality, lowerQuality, qualitySettings, readDeviceSignals } from './quality/quality'
import { FinishGate } from './scene/FinishGate'
import { River } from './scene/River'
import { SceneLighting } from './scene/SceneLighting'
import { SkyDome } from './scene/SkyDome'
import { sceneThemes } from './sceneThemes'
import { SessionInvalidator } from './SessionInvalidator'
import { VehicleFleet } from './vehicles/VehicleFleet'

type RaceScene3DProps = {
  session: PickerSession
  roster: Roster
  themeId: ThemeId
  /** Still scene: on-demand rendering, no waves, bobbing, flags, particles or camera moves. */
  reducedMotion: boolean
  /** False between Races: the scene stays mounted but stops rendering entirely. */
  active: boolean
  description: string
  onContextLost: () => void
}

/** The 3D Race. It only reads Race progress from the session and never affects the outcome (ADR-0002). */
export default function RaceScene3D({ session, roster, themeId, reducedMotion, active, description, onContextLost }: RaceScene3DProps) {
  const theme = sceneThemes[themeId]
  const lighting = theme.config.lighting[theme.config.defaultTimeOfDay] ?? theme.config.lighting.sunset
  const [quality, setQuality] = useState(() => chooseQuality(readDeviceSignals()))
  const settings = qualitySettings[quality]
  const { riverHalfWidth, laneZ } = useMemo(() => laneLayout(roster.length), [roster.length])

  const animated = settings.animatedWater && !reducedMotion

  // The canvas is reused across Races and still holds the last Race's final frame; keep it
  // invisible from each activation until the new Race's first frame is drawn.
  const wrapper = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!active && wrapper.current) wrapper.current.dataset.fresh = 'false'
  }, [active])
  const markFresh = useCallback(() => {
    if (wrapper.current) wrapper.current.dataset.fresh = 'true'
  }, [])

  if (!lighting) return null

  return (
    <div ref={wrapper} className="race__scene" role="img" aria-label={description} data-fresh="false">
      <Canvas
        shadows={settings.shadows ? 'percentage' : false}
        dpr={[1, settings.maxPixelRatio]}
        frameloop={!active ? 'never' : reducedMotion ? 'demand' : 'always'}
        camera={{ fov: CAMERA_FOV, position: [0, 20, 40] }}
        gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (event) => {
            event.preventDefault()
            onContextLost()
          })
        }}
      >
        {/* Step down once on a sustained low frame rate; never step back up mid-session. */}
        <PerformanceMonitor onDecline={() => setQuality(lowerQuality)} />
        <color attach="background" args={[lighting.skyHorizon]} />
        <fog attach="fog" args={[lighting.fogColor, 90, 420]} />
        <SessionInvalidator session={session} active={active} onDemand={reducedMotion} onFreshFrame={markFresh} />
        <RaceCamera session={session} laneCount={roster.length} still={reducedMotion} />
        <SkyDome lighting={lighting} />
        <SceneLighting lighting={lighting} shadows={settings.shadows} riverHalfWidth={riverHalfWidth} />
        <River
          lighting={lighting}
          riverHalfWidth={riverHalfWidth}
          segments={settings.waterSegments}
          animated={animated}
        />
        <theme.Environment
          riverHalfWidth={riverHalfWidth}
          detail={settings.sceneryDetail}
          castShadow={settings.shadows}
          animated={animated}
        />
        <FinishGate riverHalfWidth={riverHalfWidth} />
        <VehicleFleet
          session={session}
          roster={roster}
          theme={theme}
          castShadow={settings.shadows}
          animatedWater={animated}
          still={reducedMotion}
        />
        <WinnerEffect
          session={session}
          laneZ={laneZ}
          vehicleLength={theme.vehicleLength}
          particleCount={reducedMotion ? 0 : settings.celebrationParticles}
          still={reducedMotion}
        />
      </Canvas>
    </div>
  )
}
