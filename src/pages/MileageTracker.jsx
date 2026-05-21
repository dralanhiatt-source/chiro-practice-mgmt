import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const IRS_RATE = 0.70
const ROUTES = [
  { label: 'Bella Vista → Rogers (RT)', miles: 24, purpose: 'Rogers office visit' },
  { label: 'Bella Vista → Eureka Springs (RT)', miles: 52, purpose: 'Eureka office visit' },
  { label: 'Rogers → Eureka Springs', miles: 35, purpose: 'Rogers to Eureka' },
  { label: 'Eureka → Home', miles: 26, purpose: 'Return from Eureka' },
]

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function MileageTracker() {
  const [entries, setEntries] = useLocalStorage('mileage', [])
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], route: ROUTES[0].label, miles: ROUTES[0].miles, purpose: ROUTES[0].purpose, custom: false })
  const [showForm, setShowForm] = useState(false)

  const addEntry = () => {
    if (!form.date || !form.miles) return
    setEntries([...entries, { ...form, id: Date.now() }])
    setForm({ date: new Date().toISOString().split('T')[0], route: ROUTES[0].label, miles: ROUTES[0].miles, purpose: ROUTES[0].purpose, custom: false })
    setShowForm(false)
  }

  const totalMiles = entries.reduce((s, e) => s + Number(e.miles), 0)
  const totalDeduction = totalMiles * IRS_RATE

  const byMonth = {}
  entries.forEach(e => {
    const m = e.date ? e.date.slice(0, 7) : 'unknown'
    if (!byMonth[m]) byMonth[m] = { miles: 0, deduction: 0, entries: [] }
    byMonth[m].miles += Number(e.miles)
    byMonth[m].deduction += Number(e.miles) * IRS_RATE
    byMonth[m].entries.push(e)
  })

  const exportCSV = () => {
    const rows = [['Date','Route','Miles','Purpose','Deduction']]
    entries.forEach(e => rows.push([e.date, e.route, e.miles, e.purpose, (e.miles * IRS_RATE).toFixed(2)]))
    rows.push(['', 'TOTAL', totalMiles.toFixed(1), '', totalDeduction.toFixed(2)])
    const csv = rows.map(r => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'mileage.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">🚗 Mileage Tracker</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm px-4 py-2 rounded-lg">📥 Export CSV</button>
          <button onClick={() => setShowForm(!showForm)} className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg">+ Add Entry</button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Miles', value: totalMiles.toFixed(1), icon: '📍' },
          { label: 'Total Deduction', value: `$${totalDeduction.toFixed(2)}`, icon: '💰' },
          { label: 'IRS Rate', value: `$${IRS_RATE}/mile`, icon: '📋' },
          { label: 'Entries', value: entries.length, icon: '📝' },
        ].map(c => (
          <div key={c.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-xl font-bold text-teal-400">{c.value}</div>
            <div className="text-sm text-gray-500">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="bg-gray-900 rounded-xl border border-gray-700 p-5">
          <h2 className="font-semibold mb-4">Add Mileage Entry</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Route</label>
              <select value={form.route} onChange={e => {
                const r = ROUTES.find(r => r.label === e.target.value)
                setForm({ ...form, route: e.target.value, miles: r ? r.miles : form.miles, purpose: r ? r.purpose : form.purpose, custom: !r })
              }} className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
                {ROUTES.map(r => <option key={r.label}>{r.label}</option>)}
                <option value="custom">Custom...</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Miles</label>
              <input type="number" value={form.miles} onChange={e => setForm({ ...form, miles: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Purpose</label>
              <input value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            </div>
          </div>
          <div className="mt-3 text-sm text-teal-400">Deduction: ${(form.miles * IRS_RATE).toFixed(2)}</div>
          <div className="flex gap-2 mt-4">
            <button onClick={addEntry} className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-5 py-2 text-sm font-medium">Save Entry</button>
            <button onClick={() => setShowForm(false)} className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-5 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Monthly breakdown */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="font-semibold mb-3 text-gray-300">Monthly Breakdown</h2>
        {Object.keys(byMonth).length === 0 ? (
          <p className="text-gray-600 text-sm">No entries yet</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(byMonth).sort((a,b) => b[0].localeCompare(a[0])).map(([month, data]) => {
              const [y, m] = month.split('-')
              return (
                <div key={month} className="bg-gray-800 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">{MONTHS[parseInt(m)-1]} {y}</span>
                    <span className="ml-3 text-gray-400 text-sm">{data.entries.length} trips</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-teal-400">{data.miles.toFixed(1)} mi</div>
                    <div className="text-sm text-gray-400">${data.deduction.toFixed(2)} deduction</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Full log */}
      {entries.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold mb-3 text-gray-300">All Entries ({entries.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-500 text-left border-b border-gray-800">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Route</th>
                  <th className="pb-2 pr-4">Miles</th>
                  <th className="pb-2 pr-4">Purpose</th>
                  <th className="pb-2 text-right">Deduction</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => (
                  <tr key={e.id || i} className="border-b border-gray-800 text-gray-300">
                    <td className="py-2 pr-4">{e.date}</td>
                    <td className="py-2 pr-4 text-xs">{e.route}</td>
                    <td className="py-2 pr-4">{e.miles}</td>
                    <td className="py-2 pr-4 text-xs text-gray-400">{e.purpose}</td>
                    <td className="py-2 text-right text-teal-400">${(e.miles * IRS_RATE).toFixed(2)}</td>
                    <td className="py-2 pl-2">
                      <button onClick={() => setEntries(entries.filter((_, j) => j !== i))} className="text-red-400 text-xs hover:text-red-300">✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
