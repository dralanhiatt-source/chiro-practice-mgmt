import { useState } from 'react'
import { usePinProtect } from '../hooks/usePinProtect'

export default function PinProtect({ children, storageKey }) {
  const { unlocked, pinSet, unlock } = usePinProtect(storageKey)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  if (unlocked) return children

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pin.length < 4) { setError('PIN must be at least 4 digits'); return }
    const ok = unlock(pin)
    if (!ok) { setError('Incorrect PIN'); setPin('') }
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-8 w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold mb-2">PIN Protected</h2>
        <p className="text-gray-400 text-sm mb-6">
          {pinSet ? 'Enter your PIN to access SOAP Notes' : 'Set a new PIN for SOAP Notes (min 4 digits)'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="Enter PIN"
            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:border-teal-600"
            maxLength={8}
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-3 font-medium transition"
          >
            {pinSet ? 'Unlock' : 'Set PIN'}
          </button>
        </form>
      </div>
    </div>
  )
}
