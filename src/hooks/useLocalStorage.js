import { useState } from 'react'

export function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? initial }
    catch { return initial }
  })
  const set = v => { setVal(v); localStorage.setItem(key, JSON.stringify(v)) }
  return [val, set]
}
