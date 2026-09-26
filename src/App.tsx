import { useEffect, useState } from 'react'
import { copy } from './copy/th'
import { PickerScreen } from './features/picker/PickerScreen'
import { MIN_PARTICIPANTS } from './features/picker/roster'
import { browserStorage, createPreferencesStore } from './features/preferences/preferences'
import { useSavePreferences } from './features/preferences/useSavePreferences'
import { preloadRaceScene3D } from './features/race/raceScene3DLoader'
import { RaceStage } from './features/race/RaceStage'
import { ResultScreen } from './features/result/ResultScreen'
import { usePickerSession } from './features/session/usePickerSession'
import { SoundToggle } from './features/sound/SoundToggle'
import { useRaceSound } from './features/sound/useRaceSound'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'
import { isWebGLAvailable } from './three/webgl'

export function App() {
  const [store] = useState(() => createPreferencesStore(browserStorage()))
  const [initial] = useState(() => store.load())
  const [state, session] = usePickerSession(initial)
  const { soundOn, setSoundOn, soundSupported } = useRaceSound(session, initial.soundOn)
  const themeId = initial.themeId
  useSavePreferences(store, session, soundOn, themeId)
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => session.setReducedMotion(reducedMotion), [session, reducedMotion])
  // Only move focus into the Roster when coming back from a result, never on first load (it
  // would pop the on-screen keyboard on phones).
  const [focusRoster, setFocusRoster] = useState(false)

  // Fetch the 3D Race while names are being typed so it is ready when the Race starts.
  useEffect(preloadRaceScene3D, [])
  const racing = state.phase === 'countdown' || state.phase === 'racing' || state.phase === 'finished'
  // Once the first Race starts, the Race stage stays mounted (hidden between Races) so the 3D
  // renderer and its compiled shaders are reused rather than rebuilt for every Race.
  const [raceStageMounted, setRaceStageMounted] = useState(false)
  if (racing && !raceStageMounted) setRaceStageMounted(true)

  // Mount it early — hidden — once a Race could start, so the first Race's shaders compile
  // while names are still being typed. Waiting for a startable Roster (and an idle moment)
  // means nobody pays for a GPU context just by opening the page.
  const canStart = state.phase === 'input' && state.roster.length >= MIN_PARTICIPANTS
  useEffect(() => {
    if (!canStart || raceStageMounted) return
    const prewarm = () => {
      if (isWebGLAvailable()) setRaceStageMounted(true)
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(prewarm, { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(prewarm, 500)
    return () => clearTimeout(id)
  }, [canStart, raceStageMounted])

  return (
    <main className={racing ? 'app app--race' : 'app'}>
      <SoundToggle on={soundOn} supported={soundSupported} onChange={setSoundOn} />
      <header className="app__header">
        <h1 className="app__title">
          <span className="app__title-main">{copy.appTitle}</span>
          <span className="app__title-sub">{copy.appSubtitle}</span>
        </h1>
        {!racing && <p className="app__tagline">{copy.tagline}</p>}
      </header>

      {state.phase === 'input' && <PickerScreen state={state} session={session} focusRoster={focusRoster} />}
      {raceStageMounted && (
        <RaceStage state={state} session={session} themeId={themeId} reducedMotion={reducedMotion} active={racing} />
      )}
      {state.phase === 'result' && state.winner && (
        <ResultScreen
          winner={state.winner}
          roster={state.roster}
          onPlayAgain={() => session.playAgain(performance.now())}
          onEditNames={() => {
            setFocusRoster(true)
            session.editNames()
          }}
          onNewRace={() => {
            setFocusRoster(true)
            session.newRace()
          }}
        />
      )}
    </main>
  )
}
