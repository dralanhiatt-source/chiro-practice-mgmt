import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sendWhatsApp } from '../utils/whatsapp'

const ROGERS_REVIEW = 'https://maps.app.goo.gl/kC58HXbBbH3SPzqC8'
const EUREKA_REVIEW = 'https://maps.app.goo.gl/NxXbVHHdyxjGcmSH8'

function daysSince(dateStr) {
  if (!dateStr) return 9999
  const d = new Date(dateStr)
  const now = new Date()
  return Math.floor((now - d) / (1000 * 60 * 60 * 24))
}

function isToday(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

function isThisWeek(dateStr) {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (d - now) / (1000 * 60 * 60 * 24)
  return diff >= -1 && diff <= 6
}

function yesterday(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  return diff === 1
}

export default function Reactivation() {
  const [patients] = useLocalStorage('patients', [])
  const [soapNotes] = useLocalStorage('soapNotes', [])
  const [reactivationLog, setReactivationLog] = useLocalStorage('reactivationLog', {})
  const [activeTab, setActiveTab] = useState('30')
  const [composeModal, setComposeModal] = useState(null)
  const [message, setMessage] = useState('')

  const getLastVisit = (id) => {
    const notes = soapNotes.filter(n => n.patientId === id)
    if (!notes.length) return null
    return notes.sort((a, b) => b.date?.localeCompare(a.date))[0]?.date
  }

  const getFirstVisit = (id) => {
    const notes = soapNotes.filter(n => n.patientId === id)
    if (!notes.length) return null
    return notes.sort((a, b) => a.date?.localeCompare(b.date))[0]?.date
  }

  const inactivePatients = patients
    .map(p => ({ ...p, lastVisit: getLastVisit(p.id), days: daysSince(getLastVisit(p.id)) }))
    .filter(p => p.lastVisit !== null)
    .sort((a, b) => b.days - a.days)

  const tab30 = inactivePatients.filter(p => p.days >= 30 && p.days < 60)
  const tab60 = inactivePatients.filter(p => p.days >= 60 && p.days < 90)
  const tab90 = inactivePatients.filter(p => p.days >= 90)

  const birthdayPatients = patients.filter(p => {
    if (!p.dob) return false
    const dob = new Date(p.dob)
    const today = new Date()
    return dob.getMonth() === today.getMonth() && isThisWeek(new Date(today.getFullYear(), dob.getMonth(), dob.getDate()).toISOString().split('T')[0])
  })

  const followUpPatients = patients.filter(p => {
    const lv = getLastVisit(p.id)
    return lv && yesterday(lv)
  })

  const newPatientFollowUps = patients.filter(p => {
    const fv = getFirstVisit(p.id)
    return fv && yesterday(fv)
  })

  const openCompose = (patient, type) => {
    let msg = ''
    if (type === 'reactivation') {
      msg = `Hi ${patient.firstName}! This is Dr. Hiatt's office. We noticed it's been a while since your last visit and wanted to check in. Your health is our priority — we'd love to help you feel your best again! Reply to schedule an appointment. 😊`
    } else if (type === 'birthday') {
      msg = `🎉 Happy Birthday ${patient.firstName}! From all of us at Dr. Hiatt's office, wishing you a wonderful day and a healthy year ahead! As a birthday gift, mention this message for a discounted visit this month. 🎂`
    } else if (type === 'followup') {
      msg = `Hi ${patient.firstName}! Just checking in after your visit with Dr. Hiatt yesterday. How are you feeling? We hope you're experiencing some relief. Don't hesitate to reach out if you have any questions! 💙`
    } else if (type === 'review') {
      const link = patient.office === 'Rogers' ? ROGERS_REVIEW : EUREKA_REVIEW
      msg = `Hi ${patient.firstName}! Thank you so much for your first visit with Dr. Hiatt! We hope you're already feeling better. If you have a moment, we'd really appreciate a Google review — it means the world to us! ${link}`
    }
    setMessage(msg)
    setComposeModal({ patient, type })
  }

  const sendMsg = () => {
    const p = composeModal.patient
    sendWhatsApp(message)
    const key = `${p.id}_${composeModal.type}`
    setReactivationLog({ ...reactivationLog, [key]: { sent: true, sentAt: new Date().toISOString() } })
    setComposeModal(null)
  }

  const renderList = (list, type = 'reactivation') => (
    list.length === 0 ? <p className="text-gray-600 text-sm py-4">No patients in this category</p> :
    <div className="space-y-2">
      {list.map(p => {
        const key = `${p.id}_${type}`
        const sent = reactivationLog[key]?.sent
        return (
          <div key={p.id} className="flex items-center justify-between bg-gray-800 rounded-lg p-3 flex-wrap gap-2">
            <div>
              <span className="font-medium">{p.firstName} {p.lastName}</span>
              <span className="ml-3 text-gray-400 text-sm">{p.phone}</span>
              {p.lastVisit && <span className="ml-3 text-gray-500 text-xs">Last: {p.lastVisit} ({p.days}d ago)</span>}
            </div>
            <div className="flex items-center gap-2">
              {sent && <span className="text-xs text-green-400">✓ Sent</span>}
              <button onClick={() => openCompose(p, type)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-3 py-1.5 rounded-lg">
                📱 Send Text
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🔄 Reactivation</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[['30','30 Days','tab30 length'],['60','60 Days',''],['90+','90+ Days','']].map(([val, label]) => (
          <button key={val} onClick={() => setActiveTab(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === val ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {label} {val === '30' ? `(${tab30.length})` : val === '60' ? `(${tab60.length})` : `(${tab90.length})`}
          </button>
        ))}
      </div>

      {/* Inactive list */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="font-semibold text-gray-300 mb-3">
          {activeTab === '30' ? '30-60 Days Inactive' : activeTab === '60' ? '60-90 Days Inactive' : '90+ Days Inactive'}
        </h2>
        {activeTab === '30' && renderList(tab30)}
        {activeTab === '60' && renderList(tab60)}
        {activeTab === '90+' && renderList(tab90)}
      </div>

      {/* Birthdays */}
      {birthdayPatients.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-yellow-800/50 p-4">
          <h2 className="font-semibold text-yellow-400 mb-3">🎂 Birthdays This Week ({birthdayPatients.length})</h2>
          {renderList(birthdayPatients.map(p => ({ ...p, days: 0 })), 'birthday')}
        </div>
      )}

      {/* Post-visit follow up */}
      {followUpPatients.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-blue-400 mb-3">💙 Post-Visit Follow-Up (Visited Yesterday)</h2>
          {renderList(followUpPatients.map(p => ({ ...p, days: 1 })), 'followup')}
        </div>
      )}

      {/* Google review requests */}
      {newPatientFollowUps.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-green-400 mb-3">⭐ Google Review Requests (New Patients Yesterday)</h2>
          {renderList(newPatientFollowUps.map(p => ({ ...p, days: 1 })), 'review')}
        </div>
      )}

      {/* Compose modal */}
      {composeModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md">
            <h3 className="font-semibold mb-1">Send Message</h3>
            <p className="text-sm text-gray-400 mb-3">To: {composeModal.patient.firstName} {composeModal.patient.lastName} ({composeModal.patient.phone})</p>
            <textarea value={message} onChange={e => setMessage(e.target.value)}
              rows={6} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 resize-none" />
            <div className="flex gap-2 mt-4">
              <button onClick={sendMsg} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium">📱 Send via WhatsApp</button>
              <button onClick={() => setComposeModal(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-2 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
