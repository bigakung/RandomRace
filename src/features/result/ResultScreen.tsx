import { useEffect, useRef, useState } from 'react'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { copy } from '../../copy/th'
import type { Participant, Roster } from '../picker/roster'

type ResultScreenProps = {
  winner: Participant
  roster: Roster
  onPlayAgain: () => void
  onEditNames: () => void
  onNewRace: () => void
}

const CONFETTI_PIECES = 28
const CONFETTI_COLORS = ['#e0b02a', '#c0392b', '#f2ece0', '#2f6b3a', '#f7b267']

/** Fixed pseudo-random confetti layout, computed once, so re-renders never reshuffle it. */
const confetti = Array.from({ length: CONFETTI_PIECES }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 7) % 10) / 10,
  duration: 2.4 + ((i * 13) % 10) / 8,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  rotate: (i * 47) % 360,
}))

export function ResultScreen({ winner, roster, onPlayAgain, onEditNames, onNewRace }: ResultScreenProps) {
  const heading = useRef<HTMLHeadingElement>(null)
  const [confirmingNewRace, setConfirmingNewRace] = useState(false)

  // Move focus to the result so keyboard and screen-reader users land on the Winner.
  useEffect(() => heading.current?.focus(), [])

  return (
    <section className="result" aria-labelledby="winner-heading">
      <div className="result__confetti" aria-hidden="true">
        {confetti.map((piece, index) => (
          <span
            key={index}
            style={{
              left: `${piece.left}%`,
              background: piece.color,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              rotate: `${piece.rotate}deg`,
            }}
          />
        ))}
      </div>

      <div className="winner" aria-live="polite">
        <h2 id="winner-heading" ref={heading} tabIndex={-1} className="winner__heading">
          {copy.winnerHeading}
        </h2>
        <p className="winner__name">“{winner.name}”</p>
        <p className="winner__number">#{winner.number}</p>
      </div>

      <div className="result__actions">
        <button type="button" className="button button--primary" onClick={onPlayAgain}>
          <span className="button__th">{copy.playAgain.th}</span>
          <span className="button__en">{copy.playAgain.en}</span>
        </button>
        <div className="result__secondary">
          <button type="button" className="button button--outline" onClick={onEditNames}>
            <span className="button__th">{copy.editNames.th}</span>
            <span className="button__en">{copy.editNames.en}</span>
          </button>
          <button type="button" className="button button--outline" onClick={() => setConfirmingNewRace(true)}>
            <span className="button__th">{copy.newRace.th}</span>
            <span className="button__en">{copy.newRace.en}</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmingNewRace}
        message={copy.confirmClearAll(roster.length)}
        confirmLabel={copy.confirmClear}
        cancelLabel={copy.cancelEdit}
        onConfirm={() => {
          setConfirmingNewRace(false)
          onNewRace()
        }}
        onCancel={() => setConfirmingNewRace(false)}
      />
    </section>
  )
}
