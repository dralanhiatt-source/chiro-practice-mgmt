import { useState, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { sendWhatsApp } from '../utils/whatsapp'

export default function ContactManager() {
  const [patients, setPatients] = useLocalStorage('patients', [])
  const [soapNotes] = useLocalStorage('soapNotes', [])
  const [search, setSearch] = useState('')
  const [officeFilter, setOfficeFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [treatmentPlan, setTreatmentPlan] = useState({ recommendedVisits: '', frequency: '2x/wk', startDate: '', primaryDiagnosis: '', goals: '' })
  const [showTxPlan, setShowTxPlan] = useState(false)
  const fileRef = useRef()

  const parseVCF = (text) => {
    const contacts = []
    const cards = text.split('BEGIN:VCARD')
    cards.forEach(card => {
      if (!card.trim()) return
      const getField = (field) => {
        const match = card.match(new RegExp(`${field}[^:]*:(.+)`, 'i'))
        return match ? match[1].trim() : ''
      }
      const fn = getField('FN')
      const tel = getField('TEL')
      if (fn || tel) {
        contacts.push({ firstName: fn.split(' ')[0] || '', lastName: fn.split(' ').slice(1).join(' ') || '', phone: tel, email: getField('EMAIL'), office: 'Rogers', id: Date.now() + Math.random(), vcfImport: true })
      }
    })
    return contacts
  }

  const handleVCF = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const contacts = parseVCF(ev.target.result)
      setPatients([...patients, ...contacts])
      alert(`Imported ${contacts.length} contacts`)
    }
    reader.readAsText(file)
  }

  const filtered = patients.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || p.phone?.includes(search)
    const matchOffice = officeFilter === 'All' || p.office === officeFilter
    return matchSearch && matchOffice
  })

  const getVisitCount = (id) => soapNotes.filter(n => n.patientId === id).length
  const getLastVisit = (id) => {
    const notes = soapNotes.filter(n => n.patientId === id)
    if (!notes.length) return 'N/A'
    return notes.sort((a, b) => b.date?.localeCompare(a.date))[0]?.date || 'N/A'
  }

  const exportCSV = () => {
    const rows = [['Name','Phone','Email','Office','First Visit','Total Visits','Last Visit']]
    filtered.forEach(p => rows.push([
      `${p.firstName} ${p.lastName}`, p.phone, p.email, p.office,
      p.firstVisit || 'N/A', getVisitCount(p.id), getLastVisit(p.id)
    ]))
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'patients.csv'
    a.click()
  }

  const patientNotes = selected ? soapNotes.filter(n => n.patientId === selected.id).sort((a, b) => b.date?.localeCompare(a.date)) : []

  const openModal = (p) => {
    setSelected(p)
    const plan = p.treatmentPlan || { recommendedVisits: '', frequency: '2x/wk', startDate: '', primaryDiagnosis: '', goals: '' }
    setTreatmentPlan(plan)
    setShowTxPlan(false)
  }

  const saveTreatmentPlan = () => {
    const updated = patients.map(p => p.id === selected.id ? { ...p, treatmentPlan } : p)
    setPatients(updated)
    setSelected({ ...selected, treatmentPlan })
    alert('Treatment plan saved!')
  }

  const startTelehealth = () => {
    if (!selected) return
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '')
    const url = `https://meet.jit.si/hiattchiro-${selected.id}-${dateStr}`
    navigator.clipboard.writeText(url).catch(() => {})
    const msg = `Hi ${selected.firstName}, here is your telehealth link: ${url} Join at your appointment time. — Dr. Hiatt`
    sendWhatsApp(msg)
    alert(`Telehealth link copied to clipboard!\n${url}`)
  }

  const completedVisits = selected ? getVisitCount(selected.id) : 0
  const recVisits = parseInt(treatmentPlan.recommendedVisits) || 0
  const txPercent = recVisits > 0 ? Math.min(100, Math.round((completedVisits / recVisits) * 100)) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">👥 Contact Manager</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => fileRef.current?.click()} className="bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-lg text-gray-200">📎 Import VCF</button>
          <button onClick={exportCSV} className="bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-lg text-gray-200">📥 Export CSV</button>
          <input ref={fileRef} type="file" accept=".vcf" onChange={handleVCF} className="hidden" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or phone..."
          className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm w-64 focus:outline-none focus:border-teal-600" />
        {['All','Rogers','Eureka Springs'].map(o => (
          <button key={o} onClick={() => setOfficeFilter(o)}
            className={`px-3 py-2 rounded-lg text-sm transition ${officeFilter === o ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {o}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500">{filtered.length} of {patients.length} patients</div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-800">
              <tr className="text-gray-400 text-left">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Office</th>
                <th className="px-4 py-3">Visits</th>
                <th className="px-4 py-3">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-600 py-10">No patients found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} onClick={() => openModal(p)}
                  className="border-t border-gray-800 hover:bg-gray-800 cursor-pointer transition">
                  <td className="px-4 py-3 font-medium">{p.firstName} {p.lastName}</td>
                  <td className="px-4 py-3 text-gray-400">{p.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs ${p.office === 'Rogers' ? 'bg-teal-900 text-teal-300' : 'bg-purple-900 text-purple-300'}`}>
                      {p.office}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{getVisitCount(p.id)}</td>
                  <td className="px-4 py-3 text-gray-400">{getLastVisit(p.id)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selected.firstName} {selected.lastName}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              <div><span className="text-gray-500">Phone:</span> <span>{selected.phone}</span></div>
              <div><span className="text-gray-500">Email:</span> <span>{selected.email || 'N/A'}</span></div>
              <div><span className="text-gray-500">Office:</span> <span>{selected.office}</span></div>
              <div><span className="text-gray-500">DOB:</span> <span>{selected.dob || 'N/A'}</span></div>
              <div><span className="text-gray-500">Visits:</span> <span className="text-teal-400 font-bold">{completedVisits}</span></div>
              <div><span className="text-gray-500">Last Visit:</span> <span>{getLastVisit(selected.id)}</span></div>
            </div>

            {selected.complaints?.length > 0 && (
              <div className="mb-3">
                <span className="text-xs text-gray-500">Chief Complaints: </span>
                <span className="text-sm">{selected.complaints.join(', ')}</span>
              </div>
            )}

            {/* Treatment Plan */}
            <div className="mb-4">
              <button onClick={() => setShowTxPlan(!showTxPlan)}
                className="text-sm font-semibold text-teal-400 hover:text-teal-300 mb-2 flex items-center gap-1">
                📋 Treatment Plan {showTxPlan ? '▲' : '▼'}
              </button>
              {showTxPlan && (
                <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Recommended Visits</label>
                      <input type="number" value={treatmentPlan.recommendedVisits} onChange={e => setTreatmentPlan({ ...treatmentPlan, recommendedVisits: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-600" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Frequency</label>
                      <select value={treatmentPlan.frequency} onChange={e => setTreatmentPlan({ ...treatmentPlan, frequency: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-600">
                        <option>1x/wk</option>
                        <option>2x/wk</option>
                        <option>3x/wk</option>
                        <option>PRN</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Start Date</label>
                    <input type="date" value={treatmentPlan.startDate} onChange={e => setTreatmentPlan({ ...treatmentPlan, startDate: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-600" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Primary Diagnosis</label>
                    <input value={treatmentPlan.primaryDiagnosis} onChange={e => setTreatmentPlan({ ...treatmentPlan, primaryDiagnosis: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-600" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Goals</label>
                    <textarea value={treatmentPlan.goals} onChange={e => setTreatmentPlan({ ...treatmentPlan, goals: e.target.value })}
                      rows={2} className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-teal-600 resize-none" />
                  </div>
                  {recVisits > 0 && (
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Progress: {completedVisits}/{recVisits} visits</span>
                        <span>{txPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded h-2">
                        <div style={{ width: txPercent + '%' }} className="bg-teal-500 h-2 rounded transition-all" />
                      </div>
                    </div>
                  )}
                  <button onClick={saveTreatmentPlan} className="bg-teal-600 hover:bg-teal-700 text-white text-xs px-4 py-2 rounded-lg font-medium">
                    💾 Save Plan
                  </button>
                </div>
              )}
            </div>

            <h4 className="font-semibold text-gray-400 mb-2 text-sm">Visit History</h4>
            {patientNotes.length === 0 ? (
              <p className="text-gray-600 text-sm">No SOAP notes recorded</p>
            ) : (
              <div className="space-y-2">
                {patientNotes.map((n, i) => (
                  <div key={i} className="bg-gray-800 rounded p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">{n.date} — Visit #{n.visitNumber}</span>
                      <span className="text-gray-500">Pain: {n.subjective?.painLevel}/10</span>
                    </div>
                    <div className="text-gray-400">{n.subjective?.complaints?.join(', ')}</div>
                    {n.assessment?.subluxations?.length > 0 && (
                      <div className="text-gray-500">Sub: {n.assessment.subluxations.join(', ')}</div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2 flex-wrap">
              <button onClick={startTelehealth} className="no-print bg-blue-700 hover:bg-blue-600 text-sm px-4 py-2 rounded-lg text-white">📹 Start Telehealth</button>
              <button onClick={() => window.print()} className="no-print bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-lg text-gray-200">🖨️ Export PDF</button>
              <button onClick={() => setSelected(null)} className="bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-lg text-gray-200">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
