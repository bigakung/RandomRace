import { Suspense, useEffect, useRef, useState } from 'react'
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
}

type Renderer = '3d' | '2d'

export function RaceStage({ state, session, themeId, reducedMotion }: RaceStageProps) {
  const [renderer, setRenderer] = useState<Renderer>(() => (isWebGLAvailable() ? '3d' : '2d'))
  const [fellBack, setFellBack] = useState(renderer === '2d')
  const canSkip = state.phase === 'countdown' || state.phase === 'racing'
  const description = copy.raceLabel(state.roster.length)
  const skipButton = useRef<HTMLButtonElement>(null)

  // The Start button is gone once the Race begins; give keyboard users the one control that remains.
  useEffect(() => skipButton.current?.focus(), [])

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
    <section className="race" aria-labelledby="race-title">
      <h2 id="race-title" className="race__title">
        {copy.sceneTitle}
      </h2>
      <div className="race__stage">
        {/* The still 3D scene only renders on change, so something else must keep the clock moving. */}
        {renderer === '3d' && reducedMotion && <SessionTicker session={session} />}
        {renderer === '3d' ? (
          <ErrorBoundary fallback={<RaceCanvas2D session={session} description={description} still={reducedMotion} />} onError={fallBackTo2D}>
            <Suspense
              fallback={
                <div className="race__loading">
                  <SessionTicker session={session} />
                  {copy.loading3d}
                </div>
              }
            >
              <RaceScene3D
                session={session}
                roster={state.roster}
                themeId={themeId}
                reducedMotion={reducedMotion}
                description={description}
                onContextLost={fallBackTo2D}
              />
            </Suspense>
          </ErrorBoundary>
        ) : (
          <RaceCanvas2D session={session} description={description} still={reducedMotion} />
        )}
        {labelMode(state.roster.length) === 'number' && <LeaderBoard session={session} roster={state.roster} />}
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
