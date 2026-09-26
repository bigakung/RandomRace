import { useState, type ClipboardEvent, type FormEvent } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { copy } from '../../copy/th'
import type { SessionNotice } from '../session/pickerSession'
import { ParticipantRow } from './ParticipantRow'
import type { Roster } from './roster'

type RosterEditorProps = {
  roster: Roster
  notice: SessionNotice | null
  onAddNames: (text: string) => void
  onRename: (number: number, name: string) => boolean
  onRemove: (number: number) => void
  onClear: () => void
  /** Focus the add-name field on mount (when returning from a result, not on first load). */
  autoFocus: boolean
}

export function RosterEditor({ roster, notice, onAddNames, onRename, onRemove, onClear, autoFocus }: RosterEditorProps) {
  const [draft, setDraft] = useState('')
  const [confirmingClear, setConfirmingClear] = useState(false)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onAddNames(draft)
    setDraft('')
  }

  // A single-line input would flatten pasted newlines, so multi-line pastes are handled here.
  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const text = event.clipboardData.getData('text')
    if (!/[\r\n]/.test(text)) return
    event.preventDefault()
    onAddNames(text)
  }


  return (
    <section className="roster" aria-labelledby="roster-heading">
      <div className="roster__header">
        <h2 id="roster-heading">{copy.rosterHeading}</h2>
        <span className="roster__count" aria-live="polite">
          {copy.participantCount(roster.length)}
        </span>
      </div>

      <form className="roster__add" onSubmit={handleSubmit}>
        <label htmlFor="add-name" className="visually-hidden">
          {copy.addNameLabel}
        </label>
        <input
          id="add-name"
          type="text"
          value={draft}
          placeholder={copy.addNamePlaceholder}
          autoComplete="off"
          onChange={(event) => setDraft(event.target.value)}
          onPaste={handlePaste}
          autoFocus={autoFocus}
        />
        <button type="submit" className="button button--secondary">
          {copy.addNameButton}
        </button>
      </form>

      {notice && (
        <p className="roster__notice" role="status">
          {copy.notice(notice)}
        </p>
      )}

      {roster.length === 0 ? (
        <p className="roster__empty">{copy.emptyRoster}</p>
      ) : (
        <>
          <ol className="roster__list">
            {roster.map((participant) => (
              <ParticipantRow
                key={participant.number}
                participant={participant}
                onRename={onRename}
                onRemove={onRemove}
              />
            ))}
          </ol>
          <button type="button" className="roster__clear" onClick={() => setConfirmingClear(true)}>
            {copy.clearAll}
          </button>
        </>
      )}
      <ConfirmDialog
        open={confirmingClear}
        message={copy.confirmClearAll(roster.length)}
        confirmLabel={copy.confirmClear}
        cancelLabel={copy.cancelEdit}
        onConfirm={() => {
          setConfirmingClear(false)
          onClear()
        }}
        onCancel={() => setConfirmingClear(false)}
      />
    </section>
  )
}
