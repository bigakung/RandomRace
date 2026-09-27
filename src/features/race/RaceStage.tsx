import { Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '../../components/ErrorBoundary'
import { copy } from '../../copy/th'
import { THEME_COPY, type ThemeId } from '../../themes/registry'
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

/**
 * If nothing calls `stageReady` within this long, the stage gives up on 3D for this Race and
 * falls back to 2D itself (ADR-0003) — a compile that never resolves, or genuinely slow
 * hardware, must not leave a Race stuck before it has even begun.
 */
const PREPARE_TIMEOUT_MS = 8000
/** Delay before showing the loading message, so a fast `preparing` (Play Again, cached
 * shaders) never flashes it. */
const PREPARE_MESSAGE_DELAY_MS = 300

/** The loading message shown while nothing can be displayed yet, with a text status for
 * screen readers and an animated affordance so a longer wait doesn't read as stuck. */
function StageLoading({ message }: { message: string }) {
  return (
    <div className="race__loading" role="status">
      {message}
      <span className="race__loading-dots" aria-hidden="true" />
    </div>
  )
}

export function RaceStage({ state, session, themeId, reducedMotion }: RaceStageProps) {
  const [renderer, setRenderer] = useState<Renderer>(() => (isWebGLAvailable() ? '3d' : '2d'))
  const [fellBack, setFellBack] = useState(renderer === '2d')
  const preparing = state.phase === 'preparing'
  // Visible with the countdown/racing/finished chrome running; the stage stays mounted (hidden)
  // between Races and while `preparing` so the 3D renderer and its compiled shaders are reused.
  const active = state.phase === 'countdown' || state.phase === 'racing' || state.phase === 'finished'
  const shown = preparing || active
  const canSkip = preparing || state.phase === 'countdown' || state.phase === 'racing'
  const themeCopy = THEME_COPY[themeId]
  const description = themeCopy.raceLabel(state.roster.length)
  const skipButton = useRef<HTMLButtonElement>(null)

  // Changing the key rebuilds the scene with a fresh renderer and GL context.
  const [sceneKey, setSceneKey] = useState(0)

  // Both renderers read the same session clock, so switching mid-Race keeps the same Winner and timing.
  function fallBackTo2D() {
    setRenderer('2d')
    setFellBack(true)
  }

  // The 2D renderer has nothing to prepare; it can show something immediately.
  useEffect(() => {
    if (preparing && renderer === '2d') session.stageReady(performance.now())
  }, [preparing, renderer, session])

  // A safety net: whatever kept 3D from becoming ready, the Race must still start.
  useEffect(() => {
    if (!preparing) return
    const id = setTimeout(() => {
      if (renderer === '3d') fallBackTo2D()
      session.stageReady(performance.now())
    }, PREPARE_TIMEOUT_MS)
    return () => clearTimeout(id)
  }, [preparing, renderer, session])

  // Delayed so a `preparing` that resolves quickly (Play Again, shaders already cached) never
  // flashes a loading message.
  const [showPreparingMessage, setShowPreparingMessage] = useState(false)
  if (!preparing && showPreparingMessage) setShowPreparingMessage(false)
  useEffect(() => {
    if (!preparing) return
    const id = setTimeout(() => setShowPreparingMessage(true), PREPARE_MESSAGE_DELAY_MS)
    return () => clearTimeout(id)
  }, [preparing])

  // The Start button is gone as soon as a Race is drawn; give keyboard users the one control
  // that remains, as soon as there is something to skip to.
  useEffect(() => {
    if (shown) skipButton.current?.focus()
  }, [shown])

  // The scene's GL context lives for the rest of the page, and browsers reclaim idle contexts
  // (GPU reset, backgrounded phone). Only a loss during a Race needs 2D; otherwise (hidden
  // between Races, or still `preparing`) the scene is rebuilt with a fresh context and prepares
  // again. The listener is registered once, so it reads `active` through a ref.
  const activeRef = useRef(active)
  useEffect(() => {
    activeRef.current = active
  }, [active])
  function handleContextLost() {
    if (activeRef.current) {
      fallBackTo2D()
      return
    }
    setSceneKey((key) => key + 1)
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
    <section className="race" aria-labelledby="race-title" hidden={!shown}>
      {/* Kept for aria-labelledby (the section's accessible name) but never shown — the Race
          screen has no chrome besides the sound toggle and Skip button. */}
      <h2 id="race-title" className="visually-hidden">
        {themeCopy.sceneTitle}
      </h2>
      <div className="race__stage">
        {renderer === '3d' ? (
          <ErrorBoundary
            fallback={active && <RaceCanvas2D session={session} description={description} still={reducedMotion} />}
            onError={fallBackTo2D}
          >
            <Suspense fallback={<StageLoading message={themeCopy.loadingMessage} />}>
              <RaceScene3D
                key={sceneKey}
                session={session}
                roster={state.roster}
                themeId={themeId}
                reducedMotion={reducedMotion}
                active={active}
                preparing={preparing}
                onStageReady={() => session.stageReady(performance.now())}
                onPrepareFailed={fallBackTo2D}
                description={description}
                onContextLost={handleContextLost}
              />
            </Suspense>
            {preparing && showPreparingMessage && <StageLoading message={themeCopy.loadingMessage} />}
          </ErrorBoundary>
        ) : (
          // The 2D canvas has nothing expensive to keep, so it only exists during a Race.
          active && <RaceCanvas2D session={session} description={description} still={reducedMotion} />
        )}
        {/* The still 3D scene only renders on change, so something else must keep the clock moving. */}
        {active && renderer === '3d' && reducedMotion && <SessionTicker session={session} />}
        {active && labelMode(state.roster.length) === 'number' && (
          <LeaderBoard session={session} roster={state.roster} label={themeCopy.leadersLabel} />
        )}
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
