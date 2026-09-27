import { useEffect, useState } from 'react'
import { copy } from '../../copy/th'
import type { Roster } from '../picker/roster'
import type { PickerSession } from '../session/pickerSession'

const TOP = 3
const REFRESH_MS = 250

/** Lane indexes of the current Leaders, furthest along first. */
function leaders(progress: readonly number[]): number[] {
  return progress
    .map((value, lane) => ({ value, lane }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP)
    .map(({ lane }) => lane)
}

/**
 * The top-3 Leaders with names, for crowded Races where boats only show numbers. Refreshes a
 * few times per second and re-renders only when the order actually changes. It is display
 * only (never a ranking) and is not a live region, so screen readers are not flooded.
 */
export function LeaderBoard({ session, roster, label }: { session: PickerSession; roster: Roster; label: string }) {
  const [top, setTop] = useState<number[]>([])

  useEffect(() => {
    const progress: number[] = []
    const refresh = () => {
      const next = leaders(session.laneProgress(performance.now(), progress))
      setTop((current) => (current.length === next.length && current.every((lane, i) => lane === next[i]) ? current : next))
    }
    refresh()
    const timer = window.setInterval(refresh, REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [session])

  return (
    <aside className="leaders" aria-label={label}>
      <h3 className="leaders__title">{copy.leadersTitle}</h3>
      <ol className="leaders__list">
        {top.map((lane) => {
          const participant = roster[lane]
          if (!participant) return null
          return (
            <li key={participant.number} className="leaders__item">
              <span className="leaders__number">#{participant.number}</span>
              <span className="leaders__name">{participant.name}</span>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}
