import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sendWhatsApp } from '../utils/whatsapp'

const OFFICES = ['Rogers, AR', 'Eureka Springs, AR']
const DAYS = ['Wednesday', 'Friday', 'Saturday']
const HEARD = ['Google', 'Friend/Referral', 'Facebook', 'Instagram', 'Other']

export default function Book() {
  const [searchParams] = useSearchParams()
  const initialOffice = searchParams.get('office') || ''
  const [pendingBookings, setPendingBookings] = useLocalStorage('pendingBookings', [])
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    office: initialOffice ? (initialOffice === 'rogers' ? 'Rogers, AR' : 'Eureka Springs, AR') : '',
    preferredDay: 'Wednesday', complaint: '', heardFrom: '', consentText: false
  })
  const [submitted, setSubmitted] = useState(false)

  const bookUrl = `${window.location.origin}${window.location.pathname}`

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone) return alert('First name, last name, and phone are required.')
    if (!form.consentText) return alert('Please agree to receive text messages to continue.')
    const booking = { ...form, status: 'pending', submittedAt: new Date().toISOString() }
    setPendingBookings([...pendingBookings, booking])
    const msg = `New booking request!\nName: ${form.firstName} ${form.lastName}\nPhone: ${form.phone}\nEmail: ${form.email}\nOffice: ${form.office}\nPreferred day: ${form.preferredDay}\nComplaint: ${form.complaint}\nHeard from: ${form.heardFrom}`
    sendWhatsApp(msg)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-gray-900">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-200">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-teal-700 mb-3">Request Received!</h1>
          <p className="text-gray-600 mb-4">
            Thank you, {form.firstName}! Dr. Hiatt will confirm your appointment within 24 hours.
            You'll receive a text message with your intake form link.
          </p>
          <p className="text-sm text-gray-500">Check your phone for a confirmation text from our office.</p>
          <button onClick={() => setSubmitted(false)} className="mt-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-2 font-medium">
            Book Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-3xl font-bold text-gray-800">Book an Appointment</h1>
          <p className="text-gray-500 mt-1">with Dr. Hiatt — Chiropractic Care</p>
        </div>

        {/* HSA/FSA Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 mb-6">
          💳 Chiropractic care is HSA and FSA eligible. Pay with your health savings card.
        </div>

        {/* QR code */}
        <div className="flex justify-center mb-6">
          <QRCodeSVG value={bookUrl} size={120} bgColor="#ffffff" fgColor="#0D9488" />
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">First Name *</label>
              <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1">Last Name *</label>
              <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Phone *</label>
            <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Office Preference</label>
            <select value={form.office} onChange={e => setForm({ ...form, office: e.target.value })}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500">
              <option value="">Select office</option>
              {OFFICES.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Preferred Day</label>
            <div className="flex gap-2">
              {DAYS.map(d => (
                <button key={d} type="button" onClick={() => setForm({ ...form, preferredDay: d })}
                  className={`flex-1 py-2 rounded-lg text-sm border font-medium transition ${form.preferredDay === d ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-gray-300 text-gray-600 hover:border-teal-400'}`}>
                  {d.slice(0,3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Chief Complaint</label>
            <textarea value={form.complaint} onChange={e => setForm({ ...form, complaint: e.target.value })}
              placeholder="What are you coming in for?" rows={3}
              className="w-full bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500 resize-none" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">How did you hear about us?</label>
            <select value={form.heardFrom} onChange={e => setForm({ ...form, heardFrom: e.target.value })}
              className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-500">
              <option value="">Select one</option>
              {HEARD.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          <label className="flex items-start gap-2 cursor-pointer mt-2">
            <input type="checkbox" required checked={form.consentText} onChange={e => setForm({ ...form, consentText: e.target.checked })} className="accent-teal-600 mt-1" />
            <span className="text-sm text-gray-600">I agree to receive automated text messages (appointment confirmations, reminders, and updates) from Affordable Chiropractic. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out. <a href="https://chirodesk.pro/sms-terms" target="_blank" rel="noreferrer" className="underline text-teal-600">SMS Terms</a></span>
          </label>

          <button type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-3 font-semibold text-lg transition mt-2">
            Request Appointment →
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          We'll confirm within 24 hours by text message.
        </p>
      </div>
    </div>
  )
}
