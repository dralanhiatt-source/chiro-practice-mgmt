import { useState, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

export const PAYER_LIST = [
  { id: '00001', name: 'Medicare' },
  { id: '00002', name: 'Medicaid Arkansas' },
  { id: '00050', name: 'BCBS Arkansas (USAble)' },
  { id: '00060', name: 'BCBS Federal' },
  { id: '00190', name: 'Aetna' },
  { id: '00510', name: 'Cigna' },
  { id: '00710', name: 'UnitedHealthcare' },
  { id: '00730', name: 'Humana' },
  { id: '01260', name: 'Tricare' },
  { id: '01380', name: 'Veterans Affairs' },
  { id: '10098', name: 'Oscar Health' },
  { id: '10099', name: 'Molina Healthcare' },
  { id: '10100', name: 'Centene / WellCare' },
  { id: '10101', name: 'Ambetter / Sunflower' },
  { id: '10102', name: 'QualChoice Arkansas' },
  { id: '10103', name: 'Arkansas DHS Medicaid' },
  { id: '10200', name: 'Delta Dental' },
  { id: '10201', name: 'MetLife' },
  { id: '10202', name: 'Guardian' },
  { id: '10203', name: 'Anthem BCBS' },
  { id: '10204', name: 'Allstate Benefits' },
  { id: '10205', name: 'Progressive (auto)' },
  { id: '10206', name: 'State Farm (auto)' },
  { id: '10207', name: 'Geico (auto)' },
  { id: '10208', name: 'USAA' },
  { id: '10209', name: 'Workers Comp Arkansas' },
]

const BLANK_INS = {
  payerId: '',
  payerName: '',
  memberId: '',
  groupNumber: '',
  subscriberName: '',
  subscriberDob: '',
  relationship: 'Self',
  insPhone: '',
  copay: '',
  deductibleTotal: '',
  deductibleMet: '',
  cardFront: null,
  cardBack: null,
  verificationStatus: 'Unverified',
  // Medicare extras
  mbi: '',
  secondaryPayer: '',
  ptan: '',
  visitAllowed: '',
  visitUsed: '',
  // Medicaid extras
  medicaidId: '',
  medicaidProviderNum: '',
}

const BLANK_SETTINGS = {
  npi1: '',
  npi2: '',
  taxId: '',
  taxonomy: '111N00000X',
  ptan: '',
  medicaidProvider: '',
  pos: '11',
  practiceName: 'Hiatt Chiropractic',
  addressRogers: '1234 W Walnut St, Rogers AR 72756',
  addressEureka: '100 Main St, Eureka Springs AR 72632',
  phone: '',
}

const VERIFICATION_CYCLE = { Unverified: 'Pending', Pending: 'Verified', Verified: 'Unverified' }
const VERIFICATION_COLOR = { Unverified: 'bg-red-700 text-red-100', Pending: 'bg-yellow-600 text-yellow-100', Verified: 'bg-green-700 text-green-100' }

function PayerDropdown({ value, onChange }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const filtered = PAYER_LIST.filter(p => p.name.toLowerCase().includes(q.toLowerCase()))
  const selected = PAYER_LIST.find(p => p.id === value)

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)}
        className="w-full text-left bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
        {selected ? selected.name : 'Select payer...'}
        <span className="float-right text-gray-500">▼</span>
      </button>
      {open && (
        <div className="absolute z-30 top-full left-0 right-0 bg-gray-800 border border-gray-600 rounded-b mt-0.5 max-h-56 overflow-y-auto shadow-xl">
          <div className="p-2">
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search payer..."
              className="w-full bg-gray-700 border border-gray-500 rounded px-2 py-1 text-sm focus:outline-none focus:border-teal-600" />
          </div>
          {filtered.map(p => (
            <button key={p.id} type="button"
              onClick={() => { onChange(p.id, p.name); setOpen(false); setQ('') }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700">
              <span className="text-gray-400 text-xs mr-2">{p.id}</span>{p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function InsuranceForm({ data, onChange, label }) {
  const isMedicare = data.payerName?.toLowerCase().includes('medicare')
  const isMedicaid = data.payerName?.toLowerCase().includes('medicaid')
  const [showAbn, setShowAbn] = useState(false)

  const set = (key, val) => onChange({ ...data, [key]: val })

  const handlePhoto = (key, e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => set(key, reader.result)
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-5">
      {isMedicare && (
        <div className="bg-yellow-900/40 border border-yellow-600 rounded-lg p-3 text-yellow-300 text-sm">
          ⚠️ Medicare patient — AT modifier required on all manipulation codes (98940/98941/98942)
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Payer Name</label>
          <PayerDropdown value={data.payerId} onChange={(id, name) => onChange({ ...data, payerId: id, payerName: name })} />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Member ID</label>
          <input value={data.memberId} onChange={e => set('memberId', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Group Number</label>
          <input value={data.groupNumber} onChange={e => set('groupNumber', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Subscriber Name</label>
          <input value={data.subscriberName} onChange={e => set('subscriberName', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Subscriber DOB</label>
          <input type="date" value={data.subscriberDob} onChange={e => set('subscriberDob', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Relationship to Patient</label>
          <select value={data.relationship} onChange={e => set('relationship', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
            {['Self','Spouse','Child','Other'].map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Insurance Phone</label>
          <input value={data.insPhone} onChange={e => set('insPhone', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Copay Amount</label>
          <input type="number" value={data.copay} onChange={e => set('copay', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" placeholder="$" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Deductible Total</label>
          <input type="number" value={data.deductibleTotal} onChange={e => set('deductibleTotal', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" placeholder="$" />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Deductible Met</label>
          <input type="number" value={data.deductibleMet} onChange={e => set('deductibleMet', e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" placeholder="$" />
        </div>
      </div>

      {/* Verification Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Verification Status:</span>
        <button type="button"
          onClick={() => set('verificationStatus', VERIFICATION_CYCLE[data.verificationStatus])}
          className={`px-3 py-1 rounded-full text-xs font-bold transition ${VERIFICATION_COLOR[data.verificationStatus]}`}>
          {data.verificationStatus}
        </button>
        <span className="text-xs text-gray-500">Click to cycle</span>
      </div>

      {/* Card Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Insurance Card — Front</label>
          <input type="file" accept="image/*" onChange={e => handlePhoto('cardFront', e)}
            className="text-xs text-gray-400" />
          {data.cardFront && <img src={data.cardFront} alt="Card Front" className="mt-2 rounded border border-gray-700 max-h-32 object-contain" />}
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Insurance Card — Back</label>
          <input type="file" accept="image/*" onChange={e => handlePhoto('cardBack', e)}
            className="text-xs text-gray-400" />
          {data.cardBack && <img src={data.cardBack} alt="Card Back" className="mt-2 rounded border border-gray-700 max-h-32 object-contain" />}
        </div>
      </div>

      {/* Medicare extras */}
      {isMedicare && (
        <div className="bg-gray-800/60 rounded-lg border border-yellow-800 p-4 space-y-4">
          <h4 className="text-yellow-400 font-semibold text-sm">Medicare Specifics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Medicare Beneficiary ID (MBI)</label>
              <input value={data.mbi} onChange={e => set('mbi', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Secondary Payer Status</label>
              <input value={data.secondaryPayer} onChange={e => set('secondaryPayer', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">PTAN</label>
              <input value={data.ptan} onChange={e => set('ptan', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Visits Allowed</label>
              <input type="number" value={data.visitAllowed} onChange={e => set('visitAllowed', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Visits Used</label>
              <input type="number" value={data.visitUsed} onChange={e => set('visitUsed', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
          </div>
          {data.visitAllowed > 0 && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Visit Usage</span>
                <span>{data.visitUsed || 0} / {data.visitAllowed}</span>
              </div>
              <div className="bg-gray-700 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min(100, ((data.visitUsed || 0) / data.visitAllowed) * 100)}%` }} />
              </div>
            </div>
          )}
          <button type="button" onClick={() => setShowAbn(true)}
            className="bg-orange-700 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded">
            ⚠️ ABN Warning
          </button>
          {showAbn && (
            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
              <div className="bg-gray-900 rounded-xl border border-orange-600 p-5 max-w-md w-full">
                <h3 className="text-orange-400 font-bold mb-3">ABN Notice</h3>
                <p className="text-sm text-gray-300 mb-4">
                  This service may not be covered by Medicare. An Advance Beneficiary Notice (ABN) should be provided to the patient before rendering services.
                </p>
                <button onClick={() => setShowAbn(false)}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded">Close</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Medicaid extras */}
      {isMedicaid && (
        <div className="bg-gray-800/60 rounded-lg border border-blue-800 p-4 space-y-4">
          <h4 className="text-blue-400 font-semibold text-sm">Medicaid Specifics</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Medicaid ID</label>
              <input value={data.medicaidId} onChange={e => set('medicaidId', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Medicaid Provider Number</label>
              <input value={data.medicaidProviderNum} onChange={e => set('medicaidProviderNum', e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Insurance() {
  const [patients] = useLocalStorage('patients', [])
  const [allInsurance, setAllInsurance] = useLocalStorage('patientInsurance', {})
  const [practiceSettings, setPracticeSettings] = useLocalStorage('practiceSettings', BLANK_SETTINGS)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [activeTab, setActiveTab] = useState('primary')
  const [patientSearch, setPatientSearch] = useState('')
  const [showPatientPicker, setShowPatientPicker] = useState(false)
  const [saved, setSaved] = useState(false)

  const patientId = selectedPatient?.id
  const ins = allInsurance[patientId] || { primary: { ...BLANK_INS }, secondary: { ...BLANK_INS } }

  const setPrimary = (data) => {
    setAllInsurance({ ...allInsurance, [patientId]: { ...ins, primary: data } })
  }
  const setSecondary = (data) => {
    setAllInsurance({ ...allInsurance, [patientId]: { ...ins, secondary: data } })
  }

  const saveSettings = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const filteredPatients = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase())
  ).slice(0, 20)

  const TABS = [
    { id: 'primary', label: 'Primary Insurance' },
    { id: 'secondary', label: 'Secondary Insurance' },
    { id: 'settings', label: '⚙️ Practice Settings' },
    { id: 'payerlist', label: '📋 Payer List' },
  ]

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">🏥 Insurance</h1>
        <button onClick={() => setShowPatientPicker(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg">
          {selectedPatient ? `👤 ${selectedPatient.firstName} ${selectedPatient.lastName}` : '+ Select Patient'}
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 bg-gray-900 rounded-xl border border-gray-800 p-2">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 text-sm rounded-lg transition ${activeTab === t.id ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
        {(activeTab === 'primary' || activeTab === 'secondary') && !selectedPatient && (
          <p className="text-gray-500 text-center py-8">Select a patient to manage insurance</p>
        )}

        {activeTab === 'primary' && selectedPatient && (
          <>
            <h3 className="text-teal-400 font-semibold mb-4">Primary Insurance</h3>
            <InsuranceForm data={ins.primary} onChange={setPrimary} label="Primary" />
          </>
        )}

        {activeTab === 'secondary' && selectedPatient && (
          <>
            <h3 className="text-teal-400 font-semibold mb-4">Secondary Insurance</h3>
            <InsuranceForm data={ins.secondary} onChange={setSecondary} label="Secondary" />
          </>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-5">
            <h3 className="text-teal-400 font-semibold">Practice Billing Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['practiceName','Practice Name'],
                ['npi1','NPI Type 1 (Individual)'],
                ['npi2','NPI Type 2 (Group)'],
                ['taxId','Tax ID / EIN'],
                ['taxonomy','Taxonomy Code'],
                ['ptan','Medicare PTAN'],
                ['medicaidProvider','Medicaid Provider Number'],
                ['pos','Place of Service Code'],
                ['phone','Practice Phone'],
                ['addressRogers','Rogers Address'],
                ['addressEureka','Eureka Springs Address'],
              ].map(([key, label]) => (
                <div key={key} className={key.startsWith('address') ? 'md:col-span-2' : ''}>
                  <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                  <input value={practiceSettings[key] || ''} onChange={e => setPracticeSettings({ ...practiceSettings, [key]: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
                </div>
              ))}
            </div>
            <button onClick={saveSettings}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${saved ? 'bg-green-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'}`}>
              {saved ? '✓ Saved!' : '💾 Save Settings'}
            </button>
          </div>
        )}

        {activeTab === 'payerlist' && (
          <div>
            <h3 className="text-teal-400 font-semibold mb-4">Payer List ({PAYER_LIST.length} payers)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="py-2 pr-4">Payer ID</th>
                    <th className="py-2">Payer Name</th>
                  </tr>
                </thead>
                <tbody>
                  {PAYER_LIST.map(p => (
                    <tr key={p.id} className="border-b border-gray-800 hover:bg-gray-800/40">
                      <td className="py-2 pr-4 text-gray-500 font-mono text-xs">{p.id}</td>
                      <td className="py-2">{p.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Patient picker modal */}
      {showPatientPicker && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-5 w-full max-w-md">
            <h3 className="font-semibold mb-3">Select Patient</h3>
            <input autoFocus value={patientSearch} onChange={e => setPatientSearch(e.target.value)} placeholder="Search by name..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-teal-600" />
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredPatients.map(p => (
                <button key={p.id} onClick={() => { setSelectedPatient(p); setShowPatientPicker(false); setPatientSearch('') }}
                  className="w-full text-left px-3 py-2 rounded hover:bg-gray-800 text-sm">
                  <span className="font-medium">{p.firstName} {p.lastName}</span>
                  <span className="ml-2 text-gray-500">{p.phone}</span>
                </button>
              ))}
              {filteredPatients.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No patients found</p>}
            </div>
            <button onClick={() => setShowPatientPicker(false)} className="mt-3 text-xs text-gray-500 hover:text-gray-300 w-full text-center">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
