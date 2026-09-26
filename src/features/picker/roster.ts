export const MIN_PARTICIPANTS = 2
export const MAX_PARTICIPANTS = 50

/** A Roster entry; `number` is its 1-based position and is what tells duplicate names apart. */
export type Participant = {
  readonly number: number
  readonly name: string
  /** Another Participant has the same name (ignoring letter case). */
  readonly duplicate: boolean
}

export type Roster = readonly Participant[]

/** Splits typed or pasted text into clean names: one per line, trimmed, blanks dropped. */
export function parseNames(text: string): string[] {
  return text
    .split(/\r\n|\r|\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
}

function duplicateKey(name: string): string {
  return name.toLocaleLowerCase()
}

export function toRoster(names: readonly string[]): Roster {
  const counts = new Map<string, number>()
  for (const name of names) {
    const key = duplicateKey(name)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return names.map((name, index) => ({
    number: index + 1,
    name,
    duplicate: (counts.get(duplicateKey(name)) ?? 0) > 1,
  }))
}
