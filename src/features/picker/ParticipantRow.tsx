import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { copy } from '../../copy/th'
import type { Participant } from './roster'

type ParticipantRowProps = {
  participant: Participant
  onRename: (number: number, name: string) => boolean
  onRemove: (number: number) => void
}

export function ParticipantRow({ participant, onRename, onRemove }: ParticipantRowProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const editButtonRef = useRef<HTMLButtonElement>(null)
  const wasEditing = useRef(false)
  const editing = draft !== null
  const inputId = `participant-${participant.number}`

  // Move focus into the field when editing starts and back to the edit button when it ends.
  useEffect(() => {
    if (editing) inputRef.current?.focus()
    else if (wasEditing.current) editButtonRef.current?.focus()
    wasEditing.current = editing
  }, [editing])

  function stopEditing() {
    setDraft(null)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (draft !== null && onRename(participant.number, draft)) stopEditing()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      stopEditing()
    }
  }

  return (
    <li className="participant">
      <span className="participant__number">#{participant.number}</span>

      {editing ? (
        <form className="participant__edit" onSubmit={handleSubmit}>
          <label htmlFor={inputId} className="visually-hidden">
            {copy.editNameLabel(participant.number)}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="text"
            value={draft}
            autoComplete="off"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button type="submit" className="icon-button" aria-label={copy.saveEdit}>
            ✓
          </button>
          <button type="button" className="icon-button" aria-label={copy.cancelEdit} onClick={stopEditing}>
            ✕
          </button>
        </form>
      ) : (
        <>
          <span className="participant__name">{participant.name}</span>
          {participant.duplicate && <span className="participant__badge">{copy.duplicateBadge}</span>}
          <button
            ref={editButtonRef}
            type="button"
            className="icon-button"
            aria-label={copy.editButton(participant.number, participant.name)}
            onClick={() => setDraft(participant.name)}
          >
            ✏️
          </button>
          <button
            type="button"
            className="icon-button icon-button--danger"
            aria-label={copy.deleteButton(participant.number, participant.name)}
            onClick={() => onRemove(participant.number)}
          >
            🗑
          </button>
        </>
      )}
    </li>
  )
}
