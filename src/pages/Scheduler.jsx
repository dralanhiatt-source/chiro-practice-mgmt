import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sendWhatsApp } from '../utils/whatsapp'

const ROGERS_SLOTS = 9   // 8:00 AM – 10:00 AM @ 15-min intervals
const EUREKA_SLOTS = 21  // 10:45 AM – 4:00 PM @ 15-min intervals
const SLOT_COUNT = 20    // display cap for booked-count badge
const ALLOWED_DAYS = [3, 5, 6] // Wed, Fri, Sat

function getRolling6Weeks() {
  const dates = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let d = new Date(today)
  while (dates.length < 42) {
    if (ALLOWED_DAYS.includes(d.getDay())) dates.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return dates
}

function generateSlots(office, date) {
  const slots = []
  const isRogers = office === 'Rogers'
  if (isRogers) {
    // 8:00 AM – 10:00 AM, latest slot first (backwards)
    for (let i = 0; i < ROGERS_SLOTS; i++) {
      const totalMin = 10 * 60 - i * 15
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      slots.push({ time: `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`, label: `${h > 12 ? h-12 : h || 12}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}` })
    }
  } else {
    // 10:45 AM – 4:00 PM, forwards
    for (let i = 0; i < EUREKA_SLOTS; i++) {
      const totalMin = 10 * 60 + 45 + i * 15
      const h = Math.floor(totalMin / 60)
      const m = totalMin % 60
      slots.push({ time: `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`, label: `${h > 12 ? h-12 : h || 12}:${m.toString().padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}` })
    }
  }
  return slots
}

const PRICE = (type, date) => {
  const after = date >= '2026-07-01'
  if (type === 'new') return after ? 75 : 60
  if (type === 'existing') return after ? 50 : 40
  if (type === 'prepay4') return after ? 160 : 140
  return 0
}

const TYPE_LABELS = { new: 'New Patient', existing: 'Existing Patient', prepay4: 'Prepay 4-Visit Plan' }

const BLANK_BOOKING = { name: '', phone: '', email: '', type: 'existing', recurring: 'one-time', complaint: '' }

export default function Scheduler() {
  const { office } = useOutletContext()
  const [selectedOffice, setSelectedOffice] = useState(office || 'Rogers')
  const [appointments, setAppointments] = useLocalStorage('appointments', {})
  const [blockedDates, setBlockedDates] = useLocalStorage('blockedDates', [])
  const [waitlist, setWaitlist] = useLocalStorage('waitlist', [])
  const [pendingBookings, setPendingBookings] = useLocalStorage('pendingBookings', [])
  const [selectedDate, setSelectedDate] = useState(null)
  const [modal, setModal] = useState(null) // { date, slot } or null
  const [form, setForm] = useState(BLANK_BOOKING)
  const [noShows, setNoShows] = useLocalStorage('noShows', {})
  const [showWaitlistModal, setShowWaitlistModal] = useState(false)
  const [waitlistForm, setWaitlistForm] = useState({ name: '', phone: '', officePreference: selectedOffice })
  const [receiptModal, setReceiptModal] = useState(null)

  const today = new Date()
  today.setHours(0,0,0,0)
  const todayStr = today.toISOString().split('T')[0]
  const isRateIncreaseMonth = todayStr >= '2026-06-01' && todayStr <= '2026-06-30'

  const dates = getRolling6Weeks()

  const getKey = (office, date) => `${office}_${date}`

  const getAppts = (office, date) => appointments[getKey(office, date)] || {}

  const bookSlot = () => {
    if (!form.name || !form.phone) return alert('Name and phone required')
    const key = getKey(modal.office, modal.date)
    const newAppts = { ...appointments, [key]: { ...(appointments[key] || {}), [modal.slot]: { ...form, status: 'booked', bookedAt: new Date().toISOString() } } }
    setAppointments(newAppts)

    const price = PRICE(form.type, modal.date)
    const msg = `New appointment booked!\nPatient: ${form.name}\nPhone: ${form.phone}\nOffice: ${modal.office}\nDate: ${modal.date}\nTime: ${modal.slot}\nType: ${TYPE_LABELS[form.type]} - $${price}\nRecurring: ${form.recurring}\nComplaint: ${form.complaint}`
    sendWhatsApp(msg)
    setModal(null)
    setForm(BLANK_BOOKING)
  }

  const blockDate = (date) => {
    if (!blockedDates.includes(date)) setBlockedDates([...blockedDates, date])
    else setBlockedDates(blockedDates.filter(d => d !== date))
  }

  const markNoShow = (office, date, slot, patName) => {
    const k = `${office}_${patName}`
    const prev = noShows[k] || 0
    setNoShows({ ...noShows, [k]: prev + 1 })
    // update appointment status
    const key = getKey(office, date)
    const newAppts = { ...appointments, [key]: { ...(appointments[key] || {}), [slot]: { ...(appointments[key]?.[slot] || {}), status: 'noshow' } } }
    setAppointments(newAppts)
  }

  const approveBooking = (idx) => {
    const bk = pendingBookings[idx]
    // Try to find a slot
    const msg = `Booking APPROVED for ${bk.name} — ${bk.preferredDay}, ${bk.office}. We'll text you a confirmation shortly.`
    sendWhatsApp(msg)
    const updated = pendingBookings.map((b, i) => i === idx ? { ...b, status: 'approved' } : b)
    setPendingBookings(updated)
  }

  const denyBooking = (idx) => {
    const updated = pendingBookings.map((b, i) => i === idx ? { ...b, status: 'denied' } : b)
    setPendingBookings(updated)
  }

  const generateReceipt = (appt, office, date, slot) => {
    const price = PRICE(appt.type, date)
    const receipt = {
      patientName: appt.name,
      visitDate: date,
      visitTime: slot,
      office,
      type: TYPE_LABELS[appt.type],
      amountPaid: price,
      provider: 'Dr. Alan Hiatt DC',
      address: office === 'Rogers' ? '2608 N 2nd St Ste 120, Rogers, AR 72756' : '185 E Van Buren, Eureka Springs, AR 72632',
      note: 'Services may be HSA/FSA eligible.',
      generatedAt: new Date().toISOString(),
    }
    setReceiptModal(receipt)
  }

  const slots = selectedDate ? generateSlots(selectedOffice, selectedDate) : []
  const maxSlots = selectedOffice === 'Rogers' ? ROGERS_SLOTS : EUREKA_SLOTS
  const dayAppts = selectedDate ? getAppts(selectedOffice, selectedDate) : {}
  const totalBooked = Object.values(dayAppts).filter(a => a?.status === 'booked').length

  const pending = pendingBookings.filter(b => !b.status || b.status === 'pending')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-100">📅 Scheduler</h1>
        {isRateIncreaseMonth && (
          <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-300 text-sm px-4 py-2 rounded-lg">
            ⚠️ Rate increase effective July 1, 2026 — New: $75 | Existing: $50 | Prepay 4: $160
          </div>
        )}
      </div>

      {/* Office tabs */}
      <div className="flex gap-2">
        {['Rogers', 'Eureka'].map(o => (
          <button key={o} onClick={() => { setSelectedOffice(o); setSelectedDate(null) }}
            className={`px-5 py-2 rounded-lg font-medium transition ${selectedOffice === o ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {o}
          </button>
        ))}
      </div>

      {/* 6-week calendar */}
      <div>
        <h2 className="text-sm font-medium text-gray-400 mb-3">Select a Date (6-week rolling — Wed/Fri/Sat only)</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {dates.map(d => {
            const ds = d.toISOString().split('T')[0]
            const dayAppts2 = getAppts(selectedOffice, ds)
            const count = Object.values(dayAppts2).filter(a => a?.status === 'booked').length
            const isBlocked = blockedDates.includes(`${selectedOffice}_${ds}`) || blockedDates.includes(ds)
            const isSelected = selectedDate === ds
            const isPast = d < today
            const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
            const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            return (
              <button key={ds} onClick={() => setSelectedDate(ds)}
                className={`p-2 rounded-lg border text-center text-xs transition ${
                  isSelected ? 'border-teal-500 bg-teal-600/20 text-teal-300' :
                  isBlocked ? 'border-red-700 bg-red-900/20 text-red-400' :
                  isPast ? 'border-gray-800 bg-gray-900/50 text-gray-600' :
                  count >= maxSlots ? 'border-yellow-700 bg-yellow-900/20 text-yellow-400' :
                  'border-gray-700 bg-gray-900 hover:border-teal-600 text-gray-300'
                }`}>
                <div className="font-medium">{dayNames[d.getDay()]}</div>
                <div className="text-lg font-bold">{d.getDate()}</div>
                <div>{monthNames[d.getMonth()]}</div>
                {!isBlocked && !isPast && <div className="mt-1 text-xs">{count}/{maxSlots}</div>}
                {isBlocked && <div className="mt-1 text-red-400">Blocked</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected date slots */}
      {selectedDate && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="font-semibold text-gray-200">
              {selectedOffice} — {selectedDate} ({totalBooked}/{maxSlots} booked)
            </h2>
            <div className="flex gap-2">
              <button onClick={() => blockDate(`${selectedOffice}_${selectedDate}`)}
                className={`text-xs px-3 py-1 rounded ${blockedDates.includes(`${selectedOffice}_${selectedDate}`) ? 'bg-red-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-red-800'}`}>
                {blockedDates.includes(`${selectedOffice}_${selectedDate}`) ? '🔓 Unblock Day' : '🔒 Block Day'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {slots.map(s => {
              const appt = dayAppts[s.time]
              const status = appt?.status || 'available'
              return (
                <div key={s.time}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition ${
                    status === 'booked' ? 'border-teal-600 bg-teal-900/30 text-teal-300' :
                    status === 'pending' ? 'border-yellow-600 bg-yellow-900/20 text-yellow-300' :
                    status === 'noshow' ? 'border-red-600 bg-red-900/20 text-red-300' :
                    'border-gray-700 bg-gray-800 hover:border-teal-600 text-gray-300'
                  }`}
                  onClick={() => {
                    if (status === 'available') setModal({ office: selectedOffice, date: selectedDate, slot: s.time, slotLabel: s.label })
                  }}
                >
                  <div className="font-medium">{s.label}</div>
                  {appt ? (
                    <div>
                      <div className="mt-1 font-semibold truncate">{appt.name}</div>
                      <div className="text-gray-400">{TYPE_LABELS[appt.type]}</div>
                      {appt.status !== 'noshow' && (
                        <button onClick={(e) => { e.stopPropagation(); markNoShow(selectedOffice, selectedDate, s.time, appt.name) }}
                          className="mt-1 text-red-400 hover:text-red-300">Mark No-Show</button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); generateReceipt(appt, selectedOffice, selectedDate, s.label) }}
                        className="mt-1 ml-2 text-teal-400 hover:text-teal-300 text-xs">🧾 Receipt</button>
                      {noShows[`${selectedOffice}_${appt.name}`] >= 2 && (
                        <span className="ml-1 text-red-500">⛔ 2+ No-shows</span>
                      )}
                    </div>
                  ) : <div className="mt-1 text-gray-500">Available</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Pending bookings */}
      {pending.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-yellow-400 mb-3">⏳ Pending Bookings ({pending.length})</h2>
          <div className="space-y-2">
            {pendingBookings.map((bk, i) => bk.status && bk.status !== 'pending' ? null : (
              <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg p-3 flex-wrap gap-2">
                <div>
                  <span className="font-medium">{bk.name}</span>
                  <span className="ml-3 text-gray-400 text-sm">{bk.phone}</span>
                  <span className="ml-3 text-gray-400 text-sm">{bk.office} — {bk.preferredDay}</span>
                  {bk.complaint && <span className="ml-3 text-gray-500 text-xs">"{bk.complaint}"</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveBooking(i)} className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1 rounded">✓ Approve</button>
                  <button onClick={() => denyBooking(i)} className="bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded">✗ Deny</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Waitlist */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-300">📋 Waitlist ({waitlist.length})</h2>
          <button onClick={() => setShowWaitlistModal(true)} className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs px-3 py-1 rounded">+ Add to Waitlist</button>
        </div>
        {waitlist.length === 0 ? (
          <p className="text-gray-600 text-sm">No one on waitlist</p>
        ) : (
          <div className="space-y-2">
            {waitlist.map((w, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800 rounded p-2 text-sm">
                <div><span className="font-medium">{w.name}</span> <span className="text-gray-400">{w.phone}</span> — {w.officePreference}</div>
                <button onClick={() => setWaitlist(waitlist.filter((_, j) => j !== i))} className="text-red-400 text-xs hover:text-red-300">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Book Appointment — {modal.slotLabel} ({modal.office})</h3>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Patient Name*" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Phone*" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
                <option value="new">New Patient — ${PRICE('new', modal.date)}</option>
                <option value="existing">Existing Patient — ${PRICE('existing', modal.date)}</option>
                <option value="prepay4">Prepay 4-Visit Plan — ${PRICE('prepay4', modal.date)}</option>
              </select>
              <select value={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
                <option value="one-time">One-Time</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <input value={form.complaint} onChange={e => setForm({ ...form, complaint: e.target.value })} placeholder="Chief Complaint" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={bookSlot} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-2 font-medium transition">Book Appointment</button>
              <button onClick={() => { setModal(null); setForm(BLANK_BOOKING) }} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Waitlist Modal */}
      {showWaitlistModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Add to Waitlist</h3>
            <div className="space-y-3">
              <input value={waitlistForm.name} onChange={e => setWaitlistForm({ ...waitlistForm, name: e.target.value })} placeholder="Patient Name" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
              <input value={waitlistForm.phone} onChange={e => setWaitlistForm({ ...waitlistForm, phone: e.target.value })} placeholder="Phone" className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
              <select value={waitlistForm.officePreference} onChange={e => setWaitlistForm({ ...waitlistForm, officePreference: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
                <option>Rogers</option>
                <option>Eureka</option>
              </select>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setWaitlist([...waitlist, waitlistForm]); setShowWaitlistModal(false); setWaitlistForm({ name: '', phone: '', officePreference: selectedOffice }) }} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium">Add</button>
              <button onClick={() => setShowWaitlistModal(false)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm text-gray-900">
            <h3 className="text-lg font-bold mb-4 text-center">🧾 Visit Receipt</h3>
            <div className="space-y-2 text-sm border-t border-gray-200 pt-3">
              <div className="flex justify-between"><span className="text-gray-500">Patient:</span><span className="font-medium">{receiptModal.patientName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Visit Date:</span><span>{receiptModal.visitDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Time:</span><span>{receiptModal.visitTime}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Office:</span><span>{receiptModal.office}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Service:</span><span>{receiptModal.type}</span></div>
              <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2"><span>Amount Paid:</span><span className="text-teal-700">${receiptModal.amountPaid}</span></div>
            </div>
            <div className="mt-4 text-xs text-gray-500 space-y-1">
              <p>Provider: {receiptModal.provider}</p>
              <p>{receiptModal.address}</p>
              <p className="text-blue-700 font-medium">{receiptModal.note}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => window.print()} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium">🖨️ Print</button>
              <button onClick={() => setReceiptModal(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg py-2 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
