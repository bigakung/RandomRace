import { copy } from '../../copy/th'
import type { PickerSession, SessionState } from '../session/pickerSession'
import { RaceDurationPicker } from './RaceDurationPicker'
import { MIN_PARTICIPANTS } from './roster'
import { RosterEditor } from './RosterEditor'

type PickerScreenProps = {
  state: SessionState
  session: PickerSession
  focusRoster: boolean
}

export function PickerScreen({ state, session, focusRoster }: PickerScreenProps) {
  const notEnough = state.roster.length < MIN_PARTICIPANTS

  return (
    <>
      <RosterEditor
        roster={state.roster}
        notice={state.notice}
        onAddNames={session.addNames}
        onRename={session.renameParticipant}
        onRemove={session.removeParticipant}
        onClear={session.clearRoster}
        autoFocus={focusRoster}
      />
      {/* The start hint already explains a too-small Roster. */}
      {state.error && state.error.code !== 'not-enough-participants' && (
        <p className="app__error" role="alert">
          {copy.error(state.error)}
        </p>
      )}
      <RaceDurationPicker value={state.raceDurationMs} onChange={session.setRaceDuration} />
      <div className="app__start">
        <button
          type="button"
          className="button button--primary"
          onClick={() => session.start(performance.now())}
          aria-disabled={notEnough}
          aria-describedby={notEnough ? 'start-hint' : undefined}
        >
          <span className="button__th">{copy.start.th}</span>
          <span className="button__en">{copy.start.en}</span>
        </button>
        {notEnough && (
          <p
            id="start-hint"
            className={state.error ? 'app__hint app__hint--alert' : 'app__hint'}
            role={state.error ? 'alert' : undefined}
          >
            {copy.startHint}
          </p>
        )}
      </div>
    </>
  )
}
