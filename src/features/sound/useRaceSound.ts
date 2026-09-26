import { useEffect, useState } from 'react'
import type { PickerSession } from '../session/pickerSession'
import { loopsFor, oneShotsFor } from './soundDirector'
import { createWebAudioSoundManager, type SoundManager } from './soundManager'

/**
 * Plays the Race's sounds from session phase changes. Sound starts off; `setSoundOn(true)`
 * must come from a click so the browser lets audio start.
 */
export function useRaceSound(session: PickerSession, initiallyOn: boolean) {
  const [manager] = useState<SoundManager>(() => {
    const created = createWebAudioSoundManager()
    // Only records the preference; no audio starts until a Race does.
    created.setEnabled(initiallyOn)
    return created
  })
  const [soundOn, setSoundOnState] = useState(initiallyOn)

  useEffect(() => {
    let previous = session.getState()
    manager.setLoops(loopsFor(previous.phase))
    return session.subscribe(() => {
      const next = session.getState()
      oneShotsFor(previous, next).forEach((cue) => manager.play(cue))
      if (next.phase !== previous.phase) manager.setLoops(loopsFor(next.phase))
      previous = next
    })
  }, [session, manager])

  function setSoundOn(on: boolean) {
    manager.setEnabled(on)
    setSoundOnState(on)
  }

  return { soundOn, setSoundOn, soundSupported: manager.supported }
}
