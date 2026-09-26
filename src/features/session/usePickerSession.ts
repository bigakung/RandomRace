import { useState, useSyncExternalStore } from 'react'
import type { Preferences } from '../preferences/preferences'
import { createPickerSession, type PickerSession, type SessionState } from './pickerSession'

/** Creates the session once, seeded with the Roster and Race Duration remembered from last time. */
export function usePickerSession(initial: Preferences): [SessionState, PickerSession] {
  const [session] = useState(() => {
    const created = createPickerSession()
    created.addNames(initial.names.join('\n'))
    created.setRaceDuration(initial.raceDurationMs)
    return created
  })
  const state = useSyncExternalStore(session.subscribe, session.getState)
  return [state, session]
}
