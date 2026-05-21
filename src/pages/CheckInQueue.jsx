import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sendWhatsApp } from '../utils/whatsapp'

export default function CheckInQueue() {
  const navigate = useNavigate()
  const [appointments] = useLocalStorage('appointments', {})
  const [checkinStatus, setCheckinStatus] = useLocalStorage('checkinStatus', {})

  const today = new Date().toISOString().split('T')[0]

  // Gather today's appointments across both offices
  const todayAppts = []
  Object.entries(appointments).forEach(([key, slots]) => {
    const parts = key.split('_')
    const office = parts[0]
    const date = parts.slice(1).join('_')
    if (date === today) {
      Object.entries(slots || {}).forEach(([time, appt]) => {
        if (appt?.status === 'booked') {
          const statusKey = `${key}_${time}`
          todayAppts.push({ ...appt, office, date, time, statusKey, queueStatus: checkinStatus[statusKey] || 'scheduled' })
        }
      })
    }
  })

  todayAppts.sort((a, b) => a.time.localeCompare(b.time))

  const scheduled = todayAppts.filter(a => a.queueStatus === 'scheduled')
  const checkedIn = todayAppts.filter(a => a.queueStatus === 'checkedin')
  const completed = todayAppts.filter(a => a.queueStatus === 'completed')

  const moveStatus = (appt, newStatus) => {
    const updated = { ...checkinStatus, [appt.statusKey]: newStatus }
    setCheckinStatus(updated)

    if (newStatus === 'checkedin') {
      const msg = `${appt.name} just checked in — Visit #${appt.visitNumber || '?'}, ${appt.complaint || appt.type}, pain N/A, office: ${appt.office}`
      sendWhatsApp(msg)
    }
  }

  const getTypeLabel = (type) => ({ new: 'New Patient', existing: 'Existing', prepay4: 'Prepay 4' }[type] || type)

  const Column = ({ title, color, items, actions }) => (
    <div className="flex-1 min-w-0">
      <div className={`text-xs font-bold uppercase tracking-wide px-3 py-2 rounded-t-lg ${color}`}>
        {title} ({items.length})
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-b-lg min-h-48 p-2 space-y-2">
        {items.length === 0 ? (
          <p className="text-gray-600 text-xs text-center pt-6">Empty</p>
        ) : items.map(appt => (
          <div key={appt.statusKey} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-sm">{appt.name}</div>
                <div className="text-xs text-gray-400">{appt.time} — {getTypeLabel(appt.type)}</div>
                <div className="text-xs text-gray-500">{appt.office}</div>
                {appt.complaint && <div className="text-xs text-gray-500 mt-1">"{appt.complaint}"</div>}
              </div>
            </div>
            <div className="flex gap-1 mt-2 flex-wrap">
              {actions(appt)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const REVENUE_MAP = { new: 60, existing: 40, prepay4: 140 }

  const sendEODSummary = () => {
    const completedAppts = todayAppts.filter(a => a.queueStatus === 'completed')
    const noShowAppts = todayAppts.filter(a => a.queueStatus === 'noshow')
    const revenue = completedAppts.reduce((sum, a) => sum + (REVENUE_MAP[a.type] || 0), 0)
    // Count tomorrow's appointments
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    let tomorrowCount = 0
    Object.entries(appointments).forEach(([key, slots]) => {
      const parts = key.split('_')
      const date = parts.slice(1).join('_')
      if (date === tomorrowStr) {
        tomorrowCount += Object.values(slots || {}).filter(a => a?.status === 'booked').length
      }
    })
    const msg = `📋 ChiroDesk Daily Summary — ${today}\n✅ Visits completed: ${completedAppts.length}\n💰 Revenue: $${revenue}\n❌ No-shows: ${noShowAppts.length}\n⏰ Tomorrow: ${tomorrowCount} appointments\n📝 Sent from ChiroDesk`
    sendWhatsApp(msg)
    alert('EOD Summary sent via WhatsApp!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">✅ Check-In Queue — {today}</h1>
        <button onClick={sendEODSummary} className="bg-purple-700 hover:bg-purple-600 text-white text-sm px-4 py-2 rounded-lg">
          📋 Send EOD Summary
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Scheduled', value: todayAppts.length, color: 'text-gray-400' },
          { label: 'Checked In', value: checkedIn.length, color: 'text-yellow-400' },
          { label: 'Completed', value: completed.length, color: 'text-green-400' },
          { label: 'Remaining', value: scheduled.length + checkedIn.length, color: 'text-teal-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {todayAppts.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-8 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500">No appointments scheduled for today</p>
          <p className="text-gray-600 text-sm mt-1">Book appointments in the Scheduler tab</p>
        </div>
      ) : (
        <div className="flex gap-4 flex-wrap md:flex-nowrap">
          <Column
            title="Scheduled"
            color="bg-gray-700 text-gray-200"
            items={scheduled}
            actions={(appt) => [
              <button key="ci" onClick={() => moveStatus(appt, 'checkedin')}
                className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 rounded">
                ✓ Check In
              </button>,
              <button key="soap" onClick={() => navigate('/soap')}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 py-1 rounded">
                📝 SOAP
              </button>,
            ]}
          />
          <Column
            title="Checked In"
            color="bg-yellow-900/50 text-yellow-300"
            items={checkedIn}
            actions={(appt) => [
              <button key="done" onClick={() => moveStatus(appt, 'completed')}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded">
                ✓ Done
              </button>,
              <button key="soap" onClick={() => navigate('/soap')}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 py-1 rounded">
                📝 SOAP
              </button>,
            ]}
          />
          <Column
            title="Completed"
            color="bg-green-900/50 text-green-300"
            items={completed}
            actions={(appt) => [
              <button key="undo" onClick={() => moveStatus(appt, 'checkedin')}
                className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-2 py-1 rounded">
                ↩ Undo
              </button>,
            ]}
          />
        </div>
      )}
    </div>
  )
}
