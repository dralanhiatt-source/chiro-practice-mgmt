import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import PinProtect from '../components/PinProtect'
import PainSlider from '../components/PainSlider'
import SignatureCanvas from '../components/SignatureCanvas'
import VoiceDictation from '../components/VoiceDictation'

const COMPLAINTS = ['Neck','Upper Back','Mid Back','Low Back','Headache','Shoulder','Hip','Knee','Foot/Ankle','Numbness/Tingling','Other']
const POSTURE = ['Antalgic lean R','Antalgic lean L','Forward head','Elevated shoulder R','Elevated shoulder L','Elevated hip R','Elevated hip L','Normal']
const MUSCLE_TENSION = ['Cervical paraspinals','Thoracic','Lumbar','Trap R','Trap L','QL R','QL L','Piriformis R','Piriformis L']
const ROM_CERVICAL = ['Flex','Ext','R Rotation','L Rotation','R Lat Flex','L Lat Flex']
const ROM_LUMBAR = ['Flex','Ext','R Rotation','L Rotation','R Lat Flex','L Lat Flex']
const SPINE = ['C1','C2','C3','C4','C5','C6','C7','T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12','L1','L2','L3','L4','L5','Sacrum','R ilium','L ilium','Coccyx']
const TECHNIQUES = ['Diversified','Gonstead','Pierce-Stillwagon','Pettibon','Drop table','Activator','SOT','Cox','Soft tissue','Other']
const NEXT_VISIT = ['1 day','2 days','3 days','1 week','2 weeks','1 month','As needed']
const TX_PLANS = ['Acute 3x/wk','Sub-acute 2x/wk','Maintenance 1x/wk','Wellness monthly','Custom']
const COMPARED = ['Much better','Better','Same','Worse','Much worse','First visit']

const CPT_CODES = [
  { code: '98940', desc: 'Chiro 1-2 regions' },
  { code: '98941', desc: 'Chiro 3-4 regions' },
  { code: '98942', desc: 'Chiro 5 regions' },
  { code: '97012', desc: 'Mech traction' },
  { code: '97110', desc: 'Therapeutic exercise' },
  { code: '97530', desc: 'Therapeutic activities' },
  { code: '97035', desc: 'Ultrasound' },
  { code: '97014', desc: 'E-stim' },
]

const ICD10_CODES = [
  { code: 'M54.5', desc: 'Low back pain' },
  { code: 'M54.2', desc: 'Cervicalgia' },
  { code: 'M47.816', desc: 'Spondylosis lumbar' },
  { code: 'M47.812', desc: 'Spondylosis cervical' },
  { code: 'M54.3', desc: 'Sciatica' },
  { code: 'M54.4', desc: 'Lumbago with sciatica' },
  { code: 'G44.309', desc: 'Headache unspecified' },
  { code: 'M79.3', desc: 'Panniculitis' },
  { code: 'M99.01', desc: 'Subluxation cervical' },
  { code: 'M99.03', desc: 'Subluxation lumbar' },
  { code: 'S13.4', desc: 'Whiplash' },
  { code: 'M50.1', desc: 'Cervical disc degeneration' },
  { code: 'M51.1', desc: 'Lumbar disc degeneration' },
  { code: 'M62.838', desc: 'Muscle spasm' },
  { code: 'R52', desc: 'Chronic pain' },
  { code: 'M54.6', desc: 'Thoracic pain' },
  { code: 'M25.511', desc: 'Shoulder pain' },
  { code: 'M25.561', desc: 'Knee pain' },
  { code: 'M79.622', desc: 'Left upper arm pain' },
  { code: 'M79.604', desc: 'Right leg pain' },
]

const BLANK_SOAP = {
  patientId: null, date: '', time: '', visitNumber: 1,
  subjective: { complaints: [], painLevel: 5, comparedToLast: '', notes: '' },
  objective: { posture: [], muscleTension: [], romCervical: [], romLumbar: [] },
  assessment: { subluxations: [], techniques: [] },
  plan: { nextVisit: '', txPlan: '', notes: '', signature: null, dateSigned: '' },
  cptCodes: [],
  icd10Codes: [],
}

function Toggle({ label, active, onClick, small }) {
  return (
    <button type="button" onClick={onClick}
      className={`px-2 py-1 rounded border text-xs transition ${active ? 'bg-teal-600 border-teal-500 text-white' : 'border-gray-600 text-gray-400 hover:border-teal-700'} ${small ? '' : 'py-1.5'}`}>
      {label}
    </button>
  )
}

function PatientSearchModal({ patients, onSelect, onClose }) {
  const [q, setQ] = useState('')
  const filtered = patients.filter(p => {
    const name = `${p.firstName} ${p.lastName}`.toLowerCase()
    return name.includes(q.toLowerCase()) || p.phone?.includes(q)
  }).slice(0, 20)
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl border border-gray-700 p-5 w-full max-w-md">
        <h3 className="font-semibold mb-3">Select Patient</h3>
        <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or phone..."
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-600" />
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filtered.map(p => (
            <button key={p.id} onClick={() => onSelect(p)}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-sm">
              <span className="font-medium">{p.firstName} {p.lastName}</span>
              <span className="ml-2 text-gray-500">{p.phone}</span>
            </button>
          ))}
          {filtered.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No patients found</p>}
        </div>
        <button onClick={onClose} className="mt-3 text-xs text-gray-500 hover:text-gray-300 w-full text-center">Cancel</button>
      </div>
    </div>
  )
}

export default function SOAPNotes() {
  const [patients] = useLocalStorage('patients', [])
  const [soapNotes, setSoapNotes] = useLocalStorage('soapNotes', [])
  const [form, setForm] = useState({ ...BLANK_SOAP, date: new Date().toISOString().split('T')[0], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [showPatientSearch, setShowPatientSearch] = useState(false)
  const [saved, setSaved] = useState(false)
  const [expandedNote, setExpandedNote] = useState(null)
  const [icd10Search, setIcd10Search] = useState('')

  useEffect(() => {
    if (selectedPatient) {
      const patientNotes = soapNotes.filter(n => n.patientId === selectedPatient.id)
      setForm(f => ({ ...f, patientId: selectedPatient.id, visitNumber: patientNotes.length + 1 }))
    }
  }, [selectedPatient])

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

  const updateS = (key, val) => setForm(f => ({ ...f, subjective: { ...f.subjective, [key]: val } }))
  const updateO = (key, val) => setForm(f => ({ ...f, objective: { ...f.objective, [key]: val } }))
  const updateA = (key, val) => setForm(f => ({ ...f, assessment: { ...f.assessment, [key]: val } }))
  const updateP = (key, val) => setForm(f => ({ ...f, plan: { ...f.plan, [key]: val } }))

  const addCPT = (cpt) => {
    const entry = `${cpt.code} - ${cpt.desc}`
    if (!form.cptCodes.includes(entry)) {
      setForm(f => ({ ...f, cptCodes: [...f.cptCodes, entry] }))
    }
  }
  const removeCPT = (entry) => setForm(f => ({ ...f, cptCodes: f.cptCodes.filter(c => c !== entry) }))

  const addICD10 = (icd) => {
    const entry = `${icd.code} - ${icd.desc}`
    if (!form.icd10Codes.includes(entry)) {
      setForm(f => ({ ...f, icd10Codes: [...f.icd10Codes, entry] }))
    }
  }
  const removeICD10 = (entry) => setForm(f => ({ ...f, icd10Codes: f.icd10Codes.filter(c => c !== entry) }))

  const filteredICD10 = ICD10_CODES.filter(i =>
    i.code.toLowerCase().includes(icd10Search.toLowerCase()) ||
    i.desc.toLowerCase().includes(icd10Search.toLowerCase())
  )

  const saveNote = () => {
    if (!selectedPatient) return alert('Please select a patient')
    const note = { ...form, patientId: selectedPatient.id, patientName: `${selectedPatient.firstName} ${selectedPatient.lastName}`, savedAt: new Date().toISOString() }
    setSoapNotes([...soapNotes, note])
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const exportPDF = () => window.print()

  const patientHistory = selectedPatient ? soapNotes.filter(n => n.patientId === selectedPatient.id).sort((a, b) => b.savedAt?.localeCompare(a.savedAt)) : []

  return (
    <PinProtect storageKey="soapPin">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold">📝 SOAP Notes</h1>
          <div className="flex gap-2">
            <button onClick={exportPDF} className="no-print bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-4 py-2 rounded-lg">🖨️ Export PDF</button>
            <button onClick={saveNote} className={`no-print text-sm px-4 py-2 rounded-lg font-medium transition ${saved ? 'bg-green-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
              {saved ? '✓ Saved!' : '💾 Save Note'}
            </button>
          </div>
        </div>

        {/* Patient selector */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <button onClick={() => setShowPatientSearch(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg">
              {selectedPatient ? `👤 ${selectedPatient.firstName} ${selectedPatient.lastName}` : '+ Select Patient'}
            </button>
            {selectedPatient && (
              <div className="flex gap-4 text-sm text-gray-400">
                <span>{selectedPatient.phone}</span>
                <span>Visit #{form.visitNumber}</span>
                <span>{selectedPatient.office}</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <label className="text-xs text-gray-500">Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Time</label>
              <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-1" />
            </div>
            <div>
              <label className="text-xs text-gray-500">Visit #</label>
              <input type="number" value={form.visitNumber} onChange={e => setForm(f => ({ ...f, visitNumber: parseInt(e.target.value) }))}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-1" />
            </div>
          </div>
        </div>

        {/* SUBJECTIVE */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-teal-400 mb-4">S — Subjective</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Chief Complaint</label>
              <div className="flex flex-wrap gap-2">
                {COMPLAINTS.map(c => (
                  <Toggle key={c} label={c} active={form.subjective.complaints.includes(c)} onClick={() => updateS('complaints', toggleArr(form.subjective.complaints, c))} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Pain Level</label>
              <PainSlider value={form.subjective.painLevel} onChange={v => updateS('painLevel', v)} />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Compared to Last Visit</label>
              <div className="flex flex-wrap gap-2">
                {COMPARED.map(c => (
                  <Toggle key={c} label={c} active={form.subjective.comparedToLast === c} onClick={() => updateS('comparedToLast', c)} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Notes</label>
              <VoiceDictation onResult={t => updateS('notes', t)} />
              <textarea value={form.subjective.notes} onChange={e => updateS('notes', e.target.value)}
                rows={3} placeholder="Subjective notes..."
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 resize-none mt-2" />
            </div>
          </div>
        </div>

        {/* OBJECTIVE */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-teal-400 mb-4">O — Objective</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Posture</label>
              <div className="flex flex-wrap gap-2">
                {POSTURE.map(p => <Toggle key={p} label={p} active={form.objective.posture.includes(p)} onClick={() => updateO('posture', toggleArr(form.objective.posture, p))} />)}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Muscle Tension</label>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_TENSION.map(m => <Toggle key={m} label={m} active={form.objective.muscleTension.includes(m)} onClick={() => updateO('muscleTension', toggleArr(form.objective.muscleTension, m))} />)}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">ROM Restricted — Cervical</label>
                <div className="flex flex-wrap gap-2">
                  {ROM_CERVICAL.map(r => <Toggle key={r} label={r} active={form.objective.romCervical.includes(r)} onClick={() => updateO('romCervical', toggleArr(form.objective.romCervical, r))} small />)}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">ROM Restricted — Lumbar</label>
                <div className="flex flex-wrap gap-2">
                  {ROM_LUMBAR.map(r => <Toggle key={r} label={r} active={form.objective.romLumbar.includes(r)} onClick={() => updateO('romLumbar', toggleArr(form.objective.romLumbar, r))} small />)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ASSESSMENT */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-teal-400 mb-4">A — Assessment</h2>

          {/* CPT Code Quick-Pick */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">CPT Code Quick-Pick</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {CPT_CODES.map(cpt => (
                <button key={cpt.code} type="button" onClick={() => addCPT(cpt)}
                  className="border border-teal-500 text-teal-400 text-xs rounded px-2 py-1 font-mono hover:bg-teal-900">
                  {cpt.code}
                </button>
              ))}
            </div>
            {form.cptCodes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {form.cptCodes.map(c => (
                  <span key={c} className="bg-teal-900 border border-teal-600 text-teal-300 text-xs rounded px-2 py-0.5 flex items-center gap-1">
                    {c}
                    <button onClick={() => removeCPT(c)} className="text-teal-500 hover:text-red-400 ml-1">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ICD-10 Quick-Pick */}
          <div className="mb-4">
            <label className="text-sm text-gray-400 mb-2 block">ICD-10 Diagnosis Codes</label>
            <input value={icd10Search} onChange={e => setIcd10Search(e.target.value)}
              placeholder="Search ICD-10 codes..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mb-2" />
            {icd10Search && (
              <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto mb-2">
                {filteredICD10.map(icd => (
                  <button key={icd.code} type="button" onClick={() => addICD10(icd)}
                    className="border border-teal-500 text-teal-400 text-xs rounded px-2 py-1 font-mono hover:bg-teal-900">
                    {icd.code} — {icd.desc}
                  </button>
                ))}
              </div>
            )}
            {form.icd10Codes.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {form.icd10Codes.map(c => (
                  <span key={c} className="bg-blue-900 border border-blue-600 text-blue-300 text-xs rounded px-2 py-0.5 flex items-center gap-1">
                    {c}
                    <button onClick={() => removeICD10(c)} className="text-blue-500 hover:text-red-400 ml-1">✕</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Subluxations</label>
              <div className="flex flex-wrap gap-2">
                {SPINE.map(s => (
                  <Toggle key={s} label={s} active={form.assessment.subluxations.includes(s)} onClick={() => updateA('subluxations', toggleArr(form.assessment.subluxations, s))} small />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Techniques Used</label>
              <div className="flex flex-wrap gap-2">
                {TECHNIQUES.map(t => <Toggle key={t} label={t} active={form.assessment.techniques.includes(t)} onClick={() => updateA('techniques', toggleArr(form.assessment.techniques, t))} />)}
              </div>
            </div>
          </div>
        </div>

        {/* PLAN */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="text-lg font-semibold text-teal-400 mb-4">P — Plan</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Next Visit</label>
              <div className="flex flex-wrap gap-2">
                {NEXT_VISIT.map(v => <Toggle key={v} label={v} active={form.plan.nextVisit === v} onClick={() => updateP('nextVisit', v)} />)}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Treatment Plan</label>
              <div className="flex flex-wrap gap-2">
                {TX_PLANS.map(p => <Toggle key={p} label={p} active={form.plan.txPlan === p} onClick={() => updateP('txPlan', p)} />)}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Plan Notes</label>
              <VoiceDictation onResult={t => updateP('notes', t)} />
              <textarea value={form.plan.notes} onChange={e => updateP('notes', e.target.value)}
                rows={3} placeholder="Plan notes..."
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 resize-none mt-2" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Doctor Signature</label>
              <SignatureCanvas onSign={sig => updateP('signature', sig)} />
              <div className="text-xs text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Patient history */}
        {patientHistory.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h2 className="font-semibold text-gray-300 mb-3">📋 Visit History ({patientHistory.length} notes)</h2>
            <div className="space-y-2">
              {patientHistory.map((note, i) => (
                <div key={i} className="bg-gray-800 rounded-lg border border-gray-700">
                  <button onClick={() => setExpandedNote(expandedNote === i ? null : i)}
                    className="w-full flex items-center justify-between p-3 text-sm text-left">
                    <div className="flex gap-4">
                      <span className="font-medium">{note.date}</span>
                      <span className="text-gray-400">Visit #{note.visitNumber}</span>
                      <span className="text-gray-500">{note.subjective?.complaints?.join(', ')}</span>
                    </div>
                    <span className="text-gray-500">{expandedNote === i ? '▲' : '▼'}</span>
                  </button>
                  {expandedNote === i && (
                    <div className="px-3 pb-3 text-xs text-gray-400 space-y-1 border-t border-gray-700 pt-2">
                      <p><strong>Pain:</strong> {note.subjective?.painLevel}/10 | <strong>Compared:</strong> {note.subjective?.comparedToLast}</p>
                      <p><strong>Subluxations:</strong> {note.assessment?.subluxations?.join(', ')}</p>
                      <p><strong>Techniques:</strong> {note.assessment?.techniques?.join(', ')}</p>
                      <p><strong>Plan:</strong> Next visit {note.plan?.nextVisit} — {note.plan?.txPlan}</p>
                      {note.cptCodes?.length > 0 && <p><strong>CPT:</strong> {note.cptCodes.join(', ')}</p>}
                      {note.icd10Codes?.length > 0 && <p><strong>ICD-10:</strong> {note.icd10Codes.join(', ')}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showPatientSearch && (
          <PatientSearchModal patients={patients} onSelect={p => { setSelectedPatient(p); setShowPatientSearch(false) }} onClose={() => setShowPatientSearch(false)} />
        )}
      </div>
    </PinProtect>
  )
}
