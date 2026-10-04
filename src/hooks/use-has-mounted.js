'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getClientSnapshot = () => true
const getServerSnapshot = () => false

// Returns false on the server and during the first client render, then true
// after the component mounts. Use it to gate any UI that depends on
// client-only state (auth store, notification store, localStorage, etc.)
// so the SSR'd HTML matches the first client render and React won't throw a
// hydration mismatch.
export function useHasMounted() {
  return useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
}
