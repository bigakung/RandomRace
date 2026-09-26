import { useEffect, useRef } from 'react'

type ConfirmDialogProps = {
  open: boolean
  message: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  onCancel: () => void
}

/**
 * A modal confirmation built on the native <dialog>, which traps focus, closes on Esc and
 * returns focus to the opener for free. Cancel is focused first so Enter never destroys data.
 */
export function ConfirmDialog({ open, message, confirmLabel, cancelLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = dialog.current
    if (!element) return
    if (open && !element.open) {
      element.showModal()
      cancelButton.current?.focus()
    } else if (!open && element.open) {
      element.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialog}
      className="confirm"
      aria-labelledby="confirm-message"
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
    >
      <p id="confirm-message" className="confirm__message">
        {message}
      </p>
      <div className="confirm__actions">
        <button ref={cancelButton} type="button" className="button button--secondary confirm__button" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="button button--danger confirm__button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
