import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { PickerSession } from '../features/session/pickerSession'

/** With on-demand rendering (reduced motion), draw a new frame whenever the session changes. */
export function SessionInvalidator({ session }: { session: PickerSession }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => session.subscribe(() => invalidate()), [session, invalidate])
  return null
}
