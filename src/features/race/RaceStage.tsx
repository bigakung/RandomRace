import { Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { copy } from '../../copy/th'
import type { ThemeId } from '../../themes/registry'
import { isWebGLAvailable } from '../../three/webgl'
import type { PickerSession, SessionState } from '../session/pickerSession'
import { labelMode } from '../../three/layout/sceneLayout'
import { RaceCanvas2D } from './canvas2d/RaceCanvas2D'
import { LeaderBoard } from './LeaderBoard'
import { RaceScene3D } from './raceScene3DLoader'
import { SessionTicker } from './SessionTicker'

type RaceStageProps = {
  state: SessionState
  session: PickerSession
  themeId: ThemeId
  reducedMotion: boolean
  /**
   * False between Races. The stage stays mounted (hidden) after the first Race so the 3D
   * renderer — and its compiled shaders — are reused instead of rebuilt every Race. It is
   * also mounted inactive before the first Race to pre-warm the 3D scene.
   */
  active: boolean
}

type Renderer = '3d' | '2d'

export function RaceStage({ state, session, themeId, reducedMotion, active }: RaceStageProps) {
  const [renderer, setRenderer] = useState<Renderer>(() => (isWebGLAvailable() ? '3d' : '2d'))
  const [fellBack, setFellBack] = useState(renderer === '2d')
  const canSkip = state.phase === 'countdown' || state.phase === 'racing'
  const description = copy.raceLabel(state.roster.length)
  const skipButton = useRef<HTMLButtonElement>(null)

  // Mounted before the first Race, the 3D scene first renders one frame laid out at full size
  // but invisible (a display:none canvas has no size, so nothing would be created). After
  // that, or once any Race has run, it is simply hidden between Races.
  const [warm, setWarm] = useState(active)
  if (active && !warm) setWarm(true)
  const markWarm = useCallback(() => setWarm(true), [])
  const prewarming = !active && !warm && renderer === '3d'

  // The scene only follows the Roster during a Race, so typing names never rebuilds it.
  const [sceneRoster, setSceneRoster] = useState(state.roster)
  if (active && sceneRoster !== state.roster) setSceneRoster(state.roster)

  // The Start button is gone once the Race begins; give keyboard users the one control that remains.
  useEffect(() => {
    if (active) skipButton.current?.focus()
  }, [active])

  // Both renderers read the same session clock, so switching mid-Race keeps the same Winner and timing.
  function fallBackTo2D() {
    setRenderer('2d')
    setFellBack(true)
  }

  useEffect(() => {
    if (!canSkip) return
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') session.skip(performance.now())
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canSkip, session])

  return (
    <section
      className={prewarming ? 'race race--prewarm' : 'race'}
      aria-labelledby="race-title"
      hidden={!active && !prewarming}
      aria-hidden={prewarming || undefined}
      inert={prewarming}
    >
      <h2 id="race-title" className="race__title">
        {copy.sceneTitle}
      </h2>
      <div className="race__stage">
        {/* The still 3D scene only renders on change, so something else must keep the clock moving. */}
        {active && renderer === '3d' && reducedMotion && <SessionTicker session={session} />}
        {renderer === '3d' ? (
          <ErrorBoundary
            fallback={active && <RaceCanvas2D session={session} description={description} still={reducedMotion} />}
            onError={fallBackTo2D}
          >
            <Suspense
              fallback={
                <div className="race__loading">
                  {active && <SessionTicker session={session} />}
                  {copy.loading3d}
                </div>
              }
            >
              <RaceScene3D
                session={session}
                roster={sceneRoster}
                themeId={themeId}
                reducedMotion={reducedMotion}
                active={active}
                prewarm={prewarming}
                onPrewarmed={markWarm}
                description={description}
                onContextLost={fallBackTo2D}
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          // The 2D canvas has nothing expensive to keep, so it only exists during a Race.
          active && <RaceCanvas2D session={session} description={description} still={reducedMotion} />
        )}
        {active && labelMode(state.roster.length) === 'number' && <LeaderBoard session={session} roster={state.roster} />}
        <div className="race__countdown" aria-live="assertive">
          {state.countdown !== null && (
            <span key={String(state.countdown)} className="race__countdown-value">
              {state.countdown === 'GO' ? copy.go : state.countdown}
            </span>
          )}
        </div>
      </div>
      {reducedMotion && <p className="race__note">{copy.reducedMotionNote}</p>}
      {fellBack && <p className="race__note">{copy.fallback2d}</p>}
      <button
        type="button"
        ref={skipButton}
        className="button button--secondary race__skip"
        onClick={() => session.skip(performance.now())}
        disabled={!canSkip}
      >
        {copy.skip}
      </button>
    </section>
  )
}
