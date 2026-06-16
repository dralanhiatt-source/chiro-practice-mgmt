import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import SignatureCanvas from '../components/SignatureCanvas'
import PainSlider from '../components/PainSlider'
import { playSpaChime } from '../components/AudioEffects'
import { sendWhatsApp } from '../utils/whatsapp'
import { savePatientIntake } from '../utils/supabase'
import '../i18n/index.js'

const COMPLAINTS = ['neck','upperback','midback','lowback','headache','shoulder','hip','knee','foot','numbness','none','other']
const DURATIONS = ['Less than 1 week','1-4 weeks','1-3 months','3-6 months','6+ months']
const CONDITIONS = ['Heart condition','High blood pressure','Diabetes','Osteoporosis','Arthritis','Cancer','Stroke','Pacemaker','Pregnancy','Epilepsy','Anxiety/Depression','Thyroid condition','Kidney disease','Asthma','Blood thinners','None of the above','Other']
const CAUSES = ['Auto accident','Work injury','Sports injury','Slip and fall','No specific cause','Other']
const OFFICES = ['Rogers','Eureka']
const REFERRAL_SOURCES = ['Google','Friend','Facebook','Instagram','Existing patient','Other']
const WORSE = ['Sitting','Standing','Walking','Bending','Lifting','Morning','Night','Stress','None','Other']
const BETTER = ['Rest','Heat','Ice','Movement','Medication','Stretching','None','Other']
const MEDICATIONS = ['Blood pressure medication','Blood thinners','Diabetes medication','Thyroid medication','Antidepressants','Anti-anxiety medication','Pain medication','Anti-inflammatory (ibuprofen/naproxen)','Muscle relaxers','Steroids','Cholesterol medication','None','Other']
const ALLERGIES = ['Penicillin','Sulfa drugs','Aspirin','Ibuprofen','Latex','Iodine','Codeine','Local anesthetics','None','Other']
const CARE_GOALS = ['Pain relief','Improved mobility','Return to work','Return to sport/activity','Posture improvement','Preventive care','Stress relief','Better sleep','None','Other']

const BLANK = {
  firstName: '', lastName: '', dobMonth: '', dobDay: '', dobYear: '', phone: '', email: '', address: '',
  emergencyName: '', emergencyPhone: '', complaints: [], complaintOther: '', painLevel: 5,
  worsens: [], worsenOther: '', betters: [], betterOther: '',
  careGoals: [], careGoalOther: '',
  duration: '', prevCare: '', medications: [], medicationOther: '', conditions: [], conditionOther: '', allergies: [], allergyOther: '', cause: '',
  hipaaSignature: null, consentText: false, office: 'Rogers', lang: 'en',
  referralSource: '', referralName: '',
}

export default function IntakeForms({ standalone = false }) {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState(BLANK)
  const [patients, setPatients] = useLocalStorage('patients', [])
  const [prepayList, setPrepayList] = useLocalStorage('prepayList', [])
  const [submitted, setSubmitted] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [lang, setLang] = useState('en')

  const intakeUrl = `${window.location.origin}${window.location.pathname}#/intake-form`

  const toggleLang = (l) => {
    setLang(l)
    i18n.changeLanguage(l)
    localStorage.setItem('lang', l)
  }

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

  // Toggle a checklist value. If noneVal is provided, selecting it clears all
  // others, and selecting anything else removes noneVal.
  const toggleGroup = (arr, val, noneVal) => {
    if (noneVal && val === noneVal) return arr.includes(noneVal) ? [] : [noneVal]
    const cleaned = noneVal ? arr.filter(v => v !== noneVal) : arr
    return cleaned.includes(val) ? cleaned.filter(v => v !== val) : [...cleaned, val]
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone || !form.consentText) return alert('First name, last name, phone, and text consent are required.')

    const pad = (n) => String(n).padStart(2, '0')
    const dob = form.dobYear && form.dobMonth && form.dobDay ? `${form.dobYear}-${pad(form.dobMonth)}-${pad(form.dobDay)}` : ''

    const patient = {
      ...form,
      dob,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      visitCount: 0,
      firstVisit: null,
      lastVisit: null,
      totalPaid: 0,
    }
    setPatients([...patients, patient])

    // Also sync to Supabase patient_intake (anon key). localStorage write above is kept.
    const join = (arr, other) => (arr || []).map(v => (v === 'Other' || v === 'other') ? (other || 'Other') : v).filter(Boolean).join(', ')
    savePatientIntake({
      first_name: form.firstName,
      last_name: form.lastName,
      dob: dob || null,
      phone: form.phone,
      email: form.email || null,
      office: form.office,
      emergency_name: form.emergencyName || null,
      emergency_phone: form.emergencyPhone || null,
      chief_complaint: join(form.complaints, form.complaintOther),
      pain_areas: (form.complaints || []).join(', '),
      pain_scale: form.painLevel,
      onset: form.duration || null,
      worse_with: join(form.worsens, form.worsenOther),
      better_with: join(form.betters, form.betterOther),
      prior_chiro: form.prevCare || null,
      conditions: join(form.conditions, form.conditionOther),
      medications: join(form.medications, form.medicationOther),
      allergies: join(form.allergies, form.allergyOther),
      goals: join(form.careGoals, form.careGoalOther),
      pregnant: (form.conditions || []).includes('Pregnancy') ? 'Yes' : null,
    }).catch(err => console.error('[intake] Supabase sync failed:', err))

    const msg = `New patient intake submitted!\nName: ${form.firstName} ${form.lastName}\nPhone: ${form.phone}\nEmail: ${form.email}\nOffice: ${form.office}\nChief complaint: ${form.complaints.join(', ')}\nPain level: ${form.painLevel}/10\nCause: ${form.cause}`
    sendWhatsApp(msg)
    playSpaChime()
    setSubmitted(true)
    setForm(BLANK)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6">
        <div className="text-6xl">✅</div>
        <h2 className="text-2xl font-bold text-teal-400">Form Submitted!</h2>
        <p className="text-gray-400 text-center max-w-md">Thank you! Dr. Hiatt's office has received your intake form. You'll receive a text message confirmation shortly.</p>
        <button onClick={() => setSubmitted(false)} className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-2">Submit Another</button>
      </div>
    )
  }

  return (
    <div className={standalone ? 'max-w-2xl mx-auto px-4 py-6 space-y-6' : 'space-y-6 max-w-3xl mx-auto'}>
      {standalone ? (
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-teal-400">Dr. Alan Hiatt, DC</h1>
          <p className="text-sm text-gray-400">New Patient Intake</p>
          <div className="flex items-center justify-center gap-2 pt-1">
            {['en','es'].map(l => (
              <button key={l} type="button" onClick={() => toggleLang(l)}
                className={`px-3 py-1 rounded text-xs font-medium uppercase ${lang === l ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {l}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-bold">📋 {t('intake.title')}</h1>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            {['en','es'].map(l => (
              <button key={l} onClick={() => toggleLang(l)}
                className={`px-3 py-1 rounded text-xs font-medium uppercase ${lang === l ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}>
                {l}
              </button>
            ))}
            {/* QR Code */}
            <button onClick={() => setShowQR(!showQR)} className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs px-3 py-1 rounded">📱 QR / Link</button>
          </div>
        </div>
      )}

      {showQR && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex flex-col sm:flex-row items-center gap-6">
          <QRCodeSVG value={intakeUrl} size={140} bgColor="#111827" fgColor="#0D9488" />
          <div>
            <p className="text-sm text-gray-400 mb-2">Share this link for patient intake:</p>
            <a href={intakeUrl} target="_blank" rel="noreferrer" className="text-teal-400 text-sm break-all">{intakeUrl}</a>
            <button onClick={() => { navigator.clipboard.writeText(intakeUrl) }} className="mt-2 block text-xs text-gray-500 hover:text-gray-300">📋 Copy URL</button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HSA/FSA Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          💳 Chiropractic care is HSA and FSA eligible. Pay with your health savings card.
        </div>

        {/* Office selector */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <label className="text-sm font-medium text-gray-300 block mb-2">{t('common.office')}</label>
          <div className="flex gap-2">
            {OFFICES.map(o => (
              <button key={o} type="button" onClick={() => setForm({ ...form, office: o })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${form.office === o ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-4">Personal Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.firstName')} *</label>
              <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.lastName')} *</label>
              <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.dob')}</label>
              <div className="grid grid-cols-3 gap-2">
                <select value={form.dobMonth} onChange={e => setForm({ ...form, dobMonth: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={form.dobDay} onChange={e => setForm({ ...form, dobDay: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={form.dobYear} onChange={e => setForm({ ...form, dobYear: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
                  <option value="">Year</option>
                  {Array.from({ length: 2006 - 1924 + 1 }, (_, i) => 2006 - i).map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.phone')} *</label>
              <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.email')}</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.address')}</label>
              <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.emergency')}</label>
              <input value={form.emergencyName} onChange={e => setForm({ ...form, emergencyName: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">{t('intake.emergencyPhone')}</label>
              <input value={form.emergencyPhone} onChange={e => setForm({ ...form, emergencyPhone: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
          </div>
        </div>

        {/* Chief Complaint */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-4">{t('intake.chiefComplaint')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMPLAINTS.map(c => (
              <label key={c} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                form.complaints.includes(c) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="checkbox" checked={form.complaints.includes(c)} onChange={() => setForm({ ...form, complaints: toggleGroup(form.complaints, c, 'none') })} className="accent-teal-600" />
                <span className="text-sm">{t(`complaint.${c}`)}</span>
              </label>
            ))}
          </div>
          {form.complaints.includes('other') && (
            <input value={form.complaintOther} onChange={e => setForm({ ...form, complaintOther: e.target.value })}
              placeholder="Please describe your complaint..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-3" />
          )}
        </div>

        {/* Goals for Care */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">Goals for Care</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CARE_GOALS.map(g => (
              <label key={g} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                form.careGoals.includes(g) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="checkbox" checked={form.careGoals.includes(g)} onChange={() => setForm({ ...form, careGoals: toggleGroup(form.careGoals, g, 'None') })} className="accent-teal-600" />
                {g}
              </label>
            ))}
          </div>
          {form.careGoals.includes('Other') && (
            <input value={form.careGoalOther} onChange={e => setForm({ ...form, careGoalOther: e.target.value })}
              placeholder="Please describe..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-3" />
          )}
        </div>

        {/* Pain scale + duration */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-gray-300 mb-3">{t('intake.painScale')}</h2>
            <PainSlider value={form.painLevel} onChange={v => setForm({ ...form, painLevel: v })} />
          </div>
          <div>
            <h2 className="font-semibold text-gray-300 mb-3">{t('intake.duration')}</h2>
            <div className="space-y-2">
              {DURATIONS.map(d => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="duration" checked={form.duration === d} onChange={() => setForm({ ...form, duration: d })} className="accent-teal-600" />
                  <span className="text-sm text-gray-300">{d}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* What makes it worse / better */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="font-semibold text-gray-300 mb-3">What makes it worse?</h2>
            <div className="grid grid-cols-2 gap-2">
              {WORSE.map(w => (
                <label key={w} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                  form.worsens.includes(w) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                  <input type="checkbox" checked={form.worsens.includes(w)} onChange={() => setForm({ ...form, worsens: toggleGroup(form.worsens, w, 'None') })} className="accent-teal-600" />
                  {w}
                </label>
              ))}
            </div>
            {form.worsens.includes('Other') && (
              <input value={form.worsenOther} onChange={e => setForm({ ...form, worsenOther: e.target.value })}
                placeholder="Please describe..." className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-2" />
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-300 mb-3">What makes it better?</h2>
            <div className="grid grid-cols-2 gap-2">
              {BETTER.map(b => (
                <label key={b} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                  form.betters.includes(b) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                }`}>
                  <input type="checkbox" checked={form.betters.includes(b)} onChange={() => setForm({ ...form, betters: toggleGroup(form.betters, b, 'None') })} className="accent-teal-600" />
                  {b}
                </label>
              ))}
            </div>
            {form.betters.includes('Other') && (
              <input value={form.betterOther} onChange={e => setForm({ ...form, betterOther: e.target.value })}
                placeholder="Please describe..." className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-2" />
            )}
          </div>
        </div>

        {/* Previous chiropractic care */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">{t('intake.prevCare')}</h2>
          <div className="flex gap-3">
            {['Yes','No'].map(v => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="prevCare" checked={form.prevCare === v} onChange={() => setForm({ ...form, prevCare: v })} className="accent-teal-600" />
                <span className="text-sm text-gray-300">{v}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">{t('intake.medications')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {MEDICATIONS.map(m => (
              <label key={m} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                form.medications.includes(m) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="checkbox" checked={form.medications.includes(m)} onChange={() => setForm({ ...form, medications: toggleGroup(form.medications, m, 'None') })} className="accent-teal-600" />
                {m}
              </label>
            ))}
          </div>
          {form.medications.includes('Other') && (
            <input value={form.medicationOther} onChange={e => setForm({ ...form, medicationOther: e.target.value })}
              placeholder="Please specify..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-3" />
          )}
        </div>

        {/* Allergies */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">Allergies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALLERGIES.map(a => (
              <label key={a} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                form.allergies.includes(a) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="checkbox" checked={form.allergies.includes(a)} onChange={() => setForm({ ...form, allergies: toggleGroup(form.allergies, a, 'None') })} className="accent-teal-600" />
                {a}
              </label>
            ))}
          </div>
          {form.allergies.includes('Other') && (
            <input value={form.allergyOther} onChange={e => setForm({ ...form, allergyOther: e.target.value })}
              placeholder="Please specify..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-3" />
          )}
        </div>

        {/* Medical conditions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">{t('intake.conditions')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONDITIONS.map(c => (
              <label key={c} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                form.conditions.includes(c) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="checkbox" checked={form.conditions.includes(c)} onChange={() => setForm({ ...form, conditions: toggleGroup(form.conditions, c, 'None of the above') })} className="accent-teal-600" />
                {c}
              </label>
            ))}
          </div>
          {form.conditions.includes('Other') && (
            <input value={form.conditionOther} onChange={e => setForm({ ...form, conditionOther: e.target.value })}
              placeholder="Please specify..."
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mt-3" />
          )}
        </div>

        {/* Cause */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">{t('intake.cause')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CAUSES.map(c => (
              <label key={c} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="cause" checked={form.cause === c} onChange={() => setForm({ ...form, cause: c })} className="accent-teal-600" />
                <span className="text-sm text-gray-300">{c}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Referral Source */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">How did you hear about us?</h2>
          <select value={form.referralSource} onChange={e => setForm({ ...form, referralSource: e.target.value, referralName: '' })}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 mb-3">
            <option value="">Select one...</option>
            {REFERRAL_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(form.referralSource === 'Friend' || form.referralSource === 'Existing patient') && (
            <input value={form.referralName} onChange={e => setForm({ ...form, referralName: e.target.value })}
              placeholder={form.referralSource === 'Friend' ? "Friend's name" : "Patient's name"}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
          )}
        </div>

        {/* HIPAA */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">{t('hipaa.title')}</h2>
          <p className="text-sm text-gray-400 mb-4 leading-relaxed">{t('hipaa.text')}</p>
          <label className="text-xs text-gray-400 mb-2 block">{t('hipaa.signature')}</label>
          <SignatureCanvas onSign={sig => setForm({ ...form, hipaaSignature: sig })} />
          <label className="flex items-center gap-2 mt-4 cursor-pointer">
            <input type="checkbox" required checked={form.consentText} onChange={e => setForm({ ...form, consentText: e.target.checked })} className="accent-teal-600" />
            <span className="text-sm text-gray-300">{t('intake.consentText')}</span>
          </label>
        </div>

        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-3 font-semibold text-lg transition">
          {t('intake.submit')}
        </button>
      </form>

      {/* Prepay tracker (staff only) */}
      {!standalone && prepayList.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mt-6">
          <h2 className="font-semibold text-gray-300 mb-3">💳 Prepay 4-Visit Packages</h2>
          <div className="space-y-2">
            {prepayList.map((p, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-800 rounded-lg p-3">
                <span className="font-medium text-sm">{p.name}</span>
                <div className="flex gap-1">
                  {[0,1,2,3].map(n => (
                    <div key={n} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${n < p.used ? 'border-teal-500 bg-teal-600 text-white' : 'border-gray-600 text-gray-600'}`}>
                      {n+1}
                    </div>
                  ))}
                </div>
                <span className="text-sm text-gray-400">{p.used}/4</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
