import { useState } from 'react'

export function usePinProtect(storageKey = 'soapPin') {
  const [unlocked, setUnlocked] = useState(() => {
    const exp = localStorage.getItem(storageKey + '_exp')
    return exp && Date.now() < parseInt(exp)
  })
  const [pinSet] = useState(() => !!localStorage.getItem(storageKey))
  const unlock = (pin) => {
    const stored = localStorage.getItem(storageKey)
    if (!stored) {
      localStorage.setItem(storageKey, pin)
      localStorage.setItem(storageKey + '_exp', Date.now() + 30 * 24 * 60 * 60 * 1000)
      setUnlocked(true)
      return true
    }
    if (stored === pin) {
      localStorage.setItem(storageKey + '_exp', Date.now() + 30 * 24 * 60 * 60 * 1000)
      setUnlocked(true)
      return true
    }
    return false
  }
  return { unlocked, pinSet, unlock }
}
