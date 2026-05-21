import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import SignatureCanvas from '../components/SignatureCanvas'
import PainSlider from '../components/PainSlider'
import { playSpaChime } from '../components/AudioEffects'
import { sendWhatsApp } from '../utils/whatsapp'
import '../i18n/index.js'

const COMPLAINTS = ['neck','upperback','midback','lowback','headache','shoulder','hip','knee','foot','numbness','other']
const DURATIONS = ['Less than 1 week','1-4 weeks','1-3 months','3-6 months','6+ months']
const CONDITIONS = ['Heart condition','Osteoporosis','Recent surgery','Cancer history','Blood thinners','Diabetes','Pregnancy','Pacemaker','None']
const CAUSES = ['Auto accident','Work injury','Sports injury','Slip and fall','No specific cause','Other']
const OFFICES = ['Rogers','Eureka Springs']
const REFERRAL_SOURCES = ['Google','Friend','Facebook','Instagram','Existing patient','Other']

const BLANK = {
  firstName: '', lastName: '', dob: '', phone: '', email: '', address: '',
  emergencyName: '', emergencyPhone: '', complaints: [], painLevel: 5,
  duration: '', prevCare: '', medications: '', conditions: [], cause: '',
  hipaaSignature: null, consentText: false, office: 'Rogers', lang: 'en',
  referralSource: '', referralName: '',
}

export default function IntakeForms() {
  const { t, i18n } = useTranslation()
  const [form, setForm] = useState(BLANK)
  const [patients, setPatients] = useLocalStorage('patients', [])
  const [prepayList, setPrepayList] = useLocalStorage('prepayList', [])
  const [submitted, setSubmitted] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [lang, setLang] = useState('en')

  const bookUrl = `${window.location.origin}${window.location.pathname}#/book`

  const toggleLang = (l) => {
    setLang(l)
    i18n.changeLanguage(l)
    localStorage.setItem('lang', l)
  }

  const toggleArr = (arr, val) => arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.phone) return alert('First name, last name, and phone are required.')

    const patient = {
      ...form,
      id: Date.now(),
      submittedAt: new Date().toISOString(),
      visitCount: 0,
      firstVisit: null,
      lastVisit: null,
      totalPaid: 0,
    }
    setPatients([...patients, patient])

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
    <div className="space-y-6 max-w-3xl mx-auto">
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

      {showQR && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex flex-col sm:flex-row items-center gap-6">
          <QRCodeSVG value={bookUrl} size={140} bgColor="#111827" fgColor="#0D9488" />
          <div>
            <p className="text-sm text-gray-400 mb-2">Share this link for patient self-booking:</p>
            <a href={bookUrl} target="_blank" rel="noreferrer" className="text-teal-400 text-sm break-all">{bookUrl}</a>
            <button onClick={() => { navigator.clipboard.writeText(bookUrl) }} className="mt-2 block text-xs text-gray-500 hover:text-gray-300">📋 Copy URL</button>
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
              <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
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
                <input type="checkbox" checked={form.complaints.includes(c)} onChange={() => setForm({ ...form, complaints: toggleArr(form.complaints, c) })} className="accent-teal-600" />
                <span className="text-sm">{t(`complaint.${c}`)}</span>
              </label>
            ))}
          </div>
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

        {/* Prev care + medications */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
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
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">{t('intake.medications')}</label>
            <textarea value={form.medications} onChange={e => setForm({ ...form, medications: e.target.value })}
              rows={3} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600 resize-none" />
          </div>
        </div>

        {/* Medical conditions */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-3">{t('intake.conditions')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CONDITIONS.map(c => (
              <label key={c} className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition text-sm ${
                form.conditions.includes(c) ? 'border-teal-500 bg-teal-900/20 text-teal-300' : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}>
                <input type="checkbox" checked={form.conditions.includes(c)} onChange={() => setForm({ ...form, conditions: toggleArr(form.conditions, c) })} className="accent-teal-600" />
                {c}
              </label>
            ))}
          </div>
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
            <input type="checkbox" checked={form.consentText} onChange={e => setForm({ ...form, consentText: e.target.checked })} className="accent-teal-600" />
            <span className="text-sm text-gray-300">{t('intake.consentText')}</span>
          </label>
        </div>

        <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-3 font-semibold text-lg transition">
          {t('intake.submit')}
        </button>
      </form>

      {/* Prepay tracker */}
      {prepayList.length > 0 && (
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
