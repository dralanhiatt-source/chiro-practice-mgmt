import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import PainSlider from '../components/PainSlider'
import { playSpaChime, playDrumRoll } from '../components/AudioEffects'
import { sendWhatsApp } from '../utils/whatsapp'

const REASONS = ['Neck pain','Back pain','Headache','Shoulder','Hip/Knee','General wellness','Other']
const FOCUS_AREAS = ['Cervical (neck)','Upper back','Mid back','Lower back','Shoulder','Hip','Knee','Foot/Ankle']

export default function Kiosk() {
  const navigate = useNavigate()
  const [patients] = useLocalStorage('patients', [])
  const [soapNotes] = useLocalStorage('soapNotes', [])
  const [step, setStep] = useState(1) // 1=office, 2=lookup, 3=found, 4=notfound
  const [office, setOffice] = useState('')
  const [lookupPhone, setLookupPhone] = useState('')
  const [lookupName, setLookupName] = useState('')
  const [foundPatient, setFoundPatient] = useState(null)
  const [reasons, setReasons] = useState([])
  const [focusAreas, setFocusAreas] = useState([])
  const [pain, setPain] = useState(5)
  const [checkedIn, setCheckedIn] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  const reset = useCallback(() => {
    setStep(1); setOffice(''); setLookupPhone(''); setLookupName('')
    setFoundPatient(null); setReasons([]); setFocusAreas([]); setPain(5); setCheckedIn(false)
  }, [])

  // Auto-reset after 30s inactivity
  useEffect(() => {
    const t = setInterval(() => {
      if (Date.now() - lastActivity > 30000 && step > 1) reset()
    }, 5000)
    return () => clearInterval(t)
  }, [lastActivity, step, reset])

  const touch = () => setLastActivity(Date.now())

  const lookup = () => {
    touch()
    const phone = lookupPhone.replace(/\D/g, '')
    const found = patients.find(p =>
      (phone && p.phone?.replace(/\D/g, '').includes(phone)) ||
      (lookupName && `${p.firstName} ${p.lastName}`.toLowerCase().includes(lookupName.toLowerCase()))
    )
    if (found) {
      setFoundPatient(found)
      setStep(3)
      // Check birthday
      if (found.dob) {
        const dob = new Date(found.dob)
        const now = new Date()
        if (dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate()) {
          playDrumRoll()
        }
      }
    } else {
      setStep(4)
    }
  }

  const doCheckIn = () => {
    touch()
    const visitCount = soapNotes.filter(n => n.patientId === foundPatient.id).length
    const msg = `${foundPatient.firstName} ${foundPatient.lastName} just checked in (${office}) — Visit #${visitCount + 1}, reason: ${reasons.join(', ')}, focus: ${focusAreas.join(', ')}, pain ${pain}/10`
    sendWhatsApp(msg)
    playSpaChime()
    setCheckedIn(true)
    setTimeout(reset, 5000)
  }

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

  const BIG_BTN = 'flex-1 min-h-[100px] rounded-2xl font-bold text-2xl transition active:scale-95'

  if (checkedIn) {
    return (
      <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center gap-6" onClick={touch}>
        <div className="text-8xl">✅</div>
        <h1 className="text-4xl font-bold text-teal-400">Checked In!</h1>
        <p className="text-2xl text-gray-300">Welcome, {foundPatient?.firstName}!</p>
        <p className="text-gray-500">Please have a seat — the doctor will be with you shortly.</p>
        <p className="text-gray-600 text-sm mt-4">Returning to home screen...</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col p-6 overflow-y-auto" onClick={touch}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-4xl mb-2">🦴</div>
        <h1 className="text-3xl font-bold text-teal-400">Dr. Hiatt's Chiropractic</h1>
        {step > 1 && <p className="text-gray-500 text-sm mt-1">{office} Office</p>}
      </div>

      {/* Step 1: Office selection */}
      {step === 1 && (
        <div className="flex-1 flex flex-col gap-6 max-w-lg mx-auto w-full">
          <h2 className="text-2xl text-center text-gray-300 font-semibold">Select Your Office</h2>
          <div className="flex gap-4">
            {['Rogers','Eureka Springs'].map(o => (
              <button key={o} onClick={() => { setOffice(o); setStep(2); touch() }}
                className={`${BIG_BTN} bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/50`}>
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Lookup */}
      {step === 2 && (
        <div className="flex-1 flex flex-col gap-6 max-w-lg mx-auto w-full">
          <h2 className="text-2xl text-center text-gray-300 font-semibold">Find Your Account</h2>
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 mb-2 block text-lg">Phone Number</label>
              <input value={lookupPhone} onChange={e => { setLookupPhone(e.target.value); touch() }}
                type="tel" placeholder="Enter phone number"
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-5 py-4 text-2xl focus:outline-none focus:border-teal-600" />
            </div>
            <div className="text-center text-gray-600 text-lg">— or —</div>
            <div>
              <label className="text-gray-400 mb-2 block text-lg">Last Name</label>
              <input value={lookupName} onChange={e => { setLookupName(e.target.value); touch() }}
                placeholder="Enter last name"
                className="w-full bg-gray-800 border border-gray-600 rounded-xl px-5 py-4 text-2xl focus:outline-none focus:border-teal-600" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={lookup}
              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-5 text-2xl font-bold transition active:scale-95">
              Find Me →
            </button>
            <button onClick={reset} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl px-5 text-xl">← Back</button>
          </div>
        </div>
      )}

      {/* Step 3: Found patient */}
      {step === 3 && foundPatient && (
        <div className="flex-1 flex flex-col gap-5 max-w-lg mx-auto w-full">
          <div className="bg-gray-900 rounded-2xl border border-teal-700 p-6 text-center">
            <div className="text-5xl mb-3">👋</div>
            <h2 className="text-3xl font-bold text-teal-400">Welcome back, {foundPatient.firstName}!</h2>
            <p className="text-gray-400 mt-1">Visit #{soapNotes.filter(n => n.patientId === foundPatient.id).length + 1}</p>
          </div>

          <div>
            <label className="text-gray-400 mb-3 block text-lg font-medium">What brings you in today?</label>
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map(r => (
                <button key={r} onClick={() => { setReasons(toggleArr(reasons, r)); touch() }}
                  className={`py-4 rounded-xl border text-lg font-medium transition active:scale-95 ${reasons.includes(r) ? 'border-teal-500 bg-teal-900/50 text-teal-300' : 'border-gray-700 bg-gray-800 text-gray-300'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 mb-3 block text-lg font-medium">Focus area today:</label>
            <div className="grid grid-cols-2 gap-2">
              {FOCUS_AREAS.map(f => (
                <button key={f} onClick={() => { setFocusAreas(toggleArr(focusAreas, f)); touch() }}
                  className={`py-3 rounded-xl border text-base font-medium transition active:scale-95 ${focusAreas.includes(f) ? 'border-teal-500 bg-teal-900/50 text-teal-300' : 'border-gray-700 bg-gray-800 text-gray-300'}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-gray-400 mb-2 block text-lg font-medium">Current pain level:</label>
            <PainSlider value={pain} onChange={v => { setPain(v); touch() }} size="large" />
          </div>

          <button onClick={doCheckIn}
            className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl py-6 text-3xl font-bold transition active:scale-95 shadow-lg shadow-green-900/50">
            ✓ CHECK IN
          </button>
        </div>
      )}

      {/* Step 4: Not found */}
      {step === 4 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-lg mx-auto w-full">
          <div className="text-6xl">🔍</div>
          <h2 className="text-2xl font-semibold text-gray-300">Account Not Found</h2>
          <p className="text-gray-500 text-center">Don't worry! Scan the QR code below to fill out your new patient form, or tap to continue.</p>
          <div className="flex gap-3 w-full">
            <button onClick={() => navigate(`/book?office=${office}`)}
              className="flex-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl py-5 text-xl font-bold transition">
              📋 New Patient Form
            </button>
            <button onClick={reset} className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-xl px-5 text-lg">← Back</button>
          </div>
        </div>
      )}
    </div>
  )
}
