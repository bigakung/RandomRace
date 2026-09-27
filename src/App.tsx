import { useEffect, useState } from 'react'
import { copy } from './copy/th'
import { PickerScreen } from './features/picker/PickerScreen'
import { browserStorage, createPreferencesStore } from './features/preferences/preferences'
import { useSavePreferences } from './features/preferences/useSavePreferences'
import { preloadRaceScene3D } from './features/race/raceScene3DLoader'
import { RaceStage } from './features/race/RaceStage'
import { ResultScreen } from './features/result/ResultScreen'
import { usePickerSession } from './features/session/usePickerSession'
import { SoundToggle } from './features/sound/SoundToggle'
import { useRaceSound } from './features/sound/useRaceSound'
import { THEME_COPY } from './themes/registry'
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion'

export function App() {
  const [store] = useState(() => createPreferencesStore(browserStorage()))
  const [initial] = useState(() => store.load())
  const [state, session] = usePickerSession(initial)
  const { soundOn, setSoundOn, soundSupported } = useRaceSound(session, initial.soundOn)
  // Cosmetic only, like soundOn — the Theme never changes how a Winner is chosen or the Race
  // moves, so it lives here rather than in PickerSession. Only shown as a choice on the Roster
  // screen, so it cannot change mid-Race.
  const [themeId, setThemeId] = useState(initial.themeId)
  useSavePreferences(store, session, soundOn, themeId)
  const reducedMotion = usePrefersReducedMotion()
  useEffect(() => session.setReducedMotion(reducedMotion), [session, reducedMotion])
  // Only move focus into the Roster when coming back from a result, never on first load (it
  // would pop the on-screen keyboard on phones).
  const [focusRoster, setFocusRoster] = useState(false)

  // Fetch the 3D Race while names are being typed so it is usually ready by the time a Race
  // starts; if not, the stage itself waits for the renderer (ADR-0003).
  useEffect(preloadRaceScene3D, [])
  const racing =
    state.phase === 'preparing' ||
    state.phase === 'countdown' ||
    state.phase === 'racing' ||
    state.phase === 'finished'
  // Once the first Race starts, the Race stage stays mounted (hidden between Races) so the 3D
  // renderer and its compiled shaders are reused rather than rebuilt for every Race.
  const [raceStageMounted, setRaceStageMounted] = useState(false)
  if (racing && !raceStageMounted) setRaceStageMounted(true)

  return (
    <main className={racing ? 'app app--race' : 'app'}>
      <SoundToggle on={soundOn} supported={soundSupported} onChange={setSoundOn} />
      {/* Dropped entirely (not just visually) during a Race so the stage can grow into the
          space — the sound toggle and Skip button are enough chrome while racing. */}
      {!racing && (
        <header className="app__header">
          <h1 className="app__title">
            <span className="app__title-main">{copy.appTitle}</span>
            <span className="app__title-sub">{copy.appSubtitle}</span>
          </h1>
          <p className="app__tagline">{THEME_COPY[themeId].tagline}</p>
        </header>
      )}

      {state.phase === 'input' && (
        <PickerScreen state={state} session={session} focusRoster={focusRoster} themeId={themeId} onThemeChange={setThemeId} />
      )}
      {raceStageMounted && <RaceStage state={state} session={session} themeId={themeId} reducedMotion={reducedMotion} />}
      {state.phase === 'result' && state.winner && (
        <ResultScreen
          winner={state.winner}
          roster={state.roster}
          onPlayAgain={() => session.playAgain()}
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
