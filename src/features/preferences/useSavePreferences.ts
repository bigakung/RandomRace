import { useEffect, useRef } from 'react'
import type { ThemeId } from '../../themes/registry'
import type { PickerSession } from '../session/pickerSession'
import type { PreferencesStore } from './preferences'

const SAVE_DELAY_MS = 400

/** Saves the Roster, Race Duration, sound and Theme, debounced while typing and flushed on leave. */
export function useSavePreferences(store: PreferencesStore, session: PickerSession, soundOn: boolean, themeId: ThemeId) {
  const latest = useRef({ soundOn, themeId })

  useEffect(() => {
    let timer: number | undefined
    let lastSaved = ''

    function save() {
      window.clearTimeout(timer)
      timer = undefined
      const { roster, raceDurationMs } = session.getState()
      const preferences = { names: roster.map((p) => p.name), raceDurationMs, ...latest.current }
      const serialized = JSON.stringify(preferences)
      if (serialized === lastSaved) return
      lastSaved = serialized
      store.save(preferences)
    }

    function scheduleSave() {
      window.clearTimeout(timer)
      timer = window.setTimeout(save, SAVE_DELAY_MS)
    }

    const unsubscribe = session.subscribe(scheduleSave)
    window.addEventListener('pagehide', save)
    return () => {
      unsubscribe()
      window.removeEventListener('pagehide', save)
      if (timer !== undefined) save()
    }
  }, [store, session])

  // Sound and Theme changes are rare and deliberate, so they are written straight away.
  useEffect(() => {
    latest.current = { soundOn, themeId }
    const { roster, raceDurationMs } = session.getState()
    store.save({ names: roster.map((p) => p.name), raceDurationMs, soundOn, themeId })
  }, [store, session, soundOn, themeId])
}
