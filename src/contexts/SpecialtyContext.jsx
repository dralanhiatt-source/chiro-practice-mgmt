import { createContext, useContext, useState } from 'react'
import { SPECIALTIES } from '../config/specialties'

const SpecialtyContext = createContext()

export function SpecialtyProvider({ children }) {
  const [specialty, setSpecialty] = useState(
    () => localStorage.getItem('chirodesk_specialty') || 'chiro'
  )
  const config = SPECIALTIES[specialty] || SPECIALTIES.chiro
  const changeSpecialty = (s) => {
    setSpecialty(s)
    localStorage.setItem('chirodesk_specialty', s)
  }
  return (
    <SpecialtyContext.Provider value={{ specialty, config, changeSpecialty }}>
      {children}
    </SpecialtyContext.Provider>
  )
}

export const useSpecialty = () => useContext(SpecialtyContext)
