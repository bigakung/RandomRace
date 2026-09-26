import { describe, expect, it } from 'vitest'
import { createPickerSession } from './pickerSession'

function sessionWith(text: string) {
  const session = createPickerSession()
  session.addNames(text)
  return session
}

function names(session: ReturnType<typeof createPickerSession>) {
  return session.getState().roster.map((p) => p.name)
}

describe('PickerSession Roster management', () => {
  it('splits on every newline style', () => {
    expect(names(sessionWith('a\nb\r\nc\rd'))).toEqual(['a', 'b', 'c', 'd'])
  })

  it('ignores a paste of only whitespace and separators without an error', () => {
    const session = sessionWith(' \n\t\r\n   \r')
    expect(session.getState().roster).toEqual([])
    expect(session.getState().error).toBeNull()
    expect(session.getState().notice).toBeNull()
  })

  describe('50 Participant cap', () => {
    it('keeps the first 50 and reports how many names were dropped', () => {
      const text = Array.from({ length: 53 }, (_, i) => `n${i + 1}`).join('\n')
      const session = sessionWith(text)
      const { roster, notice } = session.getState()
      expect(roster).toHaveLength(50)
      expect(roster[49]?.name).toBe('n50')
      expect(notice).toEqual({ code: 'names-dropped', dropped: 3 })
    })

    it('counts existing Participants toward the cap', () => {
      const session = sessionWith(Array.from({ length: 49 }, (_, i) => `n${i}`).join('\n'))
      session.addNames('x\ny\nz')
      expect(session.getState().roster).toHaveLength(50)
      expect(names(session).at(-1)).toBe('x')
      expect(session.getState().notice).toEqual({ code: 'names-dropped', dropped: 2 })
    })

    it('reports a typed name dropped when the Roster is already full', () => {
      const session = sessionWith(Array.from({ length: 50 }, (_, i) => `n${i}`).join('\n'))
      session.addNames('late')
      expect(session.getState().roster).toHaveLength(50)
      expect(session.getState().notice).toEqual({ code: 'names-dropped', dropped: 1 })
    })

    it('clears the notice on the next successful change', () => {
      const session = sessionWith(Array.from({ length: 51 }, (_, i) => `n${i}`).join('\n'))
      session.removeParticipant(1)
      expect(session.getState().notice).toBeNull()
    })
  })

  describe('renaming', () => {
    it('renames a Participant in place, trimmed', () => {
      const session = sessionWith('สมชาย\nวิชย')
      expect(session.renameParticipant(2, '  วิชัย ')).toBe(true)
      expect(names(session)).toEqual(['สมชาย', 'วิชัย'])
    })

    it('rejects an empty name and keeps the previous one', () => {
      const session = sessionWith('สมชาย\nวิชัย')
      expect(session.renameParticipant(1, '   ')).toBe(false)
      expect(names(session)).toEqual(['สมชาย', 'วิชัย'])
      expect(session.getState().error).toEqual({ code: 'empty-name' })
    })

    it('ignores an unknown Participant number', () => {
      const session = sessionWith('สมชาย\nวิชัย')
      expect(session.renameParticipant(9, 'x')).toBe(false)
      expect(names(session)).toEqual(['สมชาย', 'วิชัย'])
    })
  })

  describe('removing and clearing', () => {
    it('removes a Participant and renumbers the rest', () => {
      const session = sessionWith('a\nb\nc\nd')
      session.removeParticipant(2)
      expect(session.getState().roster).toMatchObject([
        { number: 1, name: 'a' },
        { number: 2, name: 'c' },
        { number: 3, name: 'd' },
      ])
    })

    it('clears the whole Roster', () => {
      const session = sessionWith('a\nb\nc')
      session.clearRoster()
      expect(session.getState().roster).toEqual([])
    })
  })

  describe('duplicate names', () => {
    it('keeps duplicates as distinct numbered Participants and flags them', () => {
      const session = sessionWith('สมชาย\nวิชัย\nสมชาย')
      expect(session.getState().roster).toEqual([
        { number: 1, name: 'สมชาย', duplicate: true },
        { number: 2, name: 'วิชัย', duplicate: false },
        { number: 3, name: 'สมชาย', duplicate: true },
      ])
    })

    it('treats names differing only in letter case as duplicates', () => {
      const session = sessionWith('Somchai\nsomchai')
      expect(session.getState().roster.every((p) => p.duplicate)).toBe(true)
    })

    it('unflags a name once its duplicate is removed', () => {
      const session = sessionWith('สมชาย\nสมชาย')
      session.removeParticipant(2)
      expect(session.getState().roster[0]?.duplicate).toBe(false)
    })

    it('allows starting a Race with duplicate names', () => {
      const session = sessionWith('สมชาย\nสมชาย')
      session.start(0)
      expect(session.getState().phase).toBe('countdown')
    })
  })
})
