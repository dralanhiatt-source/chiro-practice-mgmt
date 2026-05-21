import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const EXPENSE_CATS = ['Supplies','Equipment','CE/Education','Software','Marketing','Professional fees','Other']
const COLORS = ['#0D9488','#2dd4bf','#14b8a6','#0f766e','#134e4a','#5eead4','#99f6e4']

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-teal-400 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  )
}

export default function StatsPnL() {
  const [appointments] = useLocalStorage('appointments', {})
  const [expenses, setExpenses] = useLocalStorage('expenses', [])
  const [view, setView] = useState('Combined')
  const [expenseForm, setExpenseForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'Supplies', amount: '', notes: '' })
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const todayStr = new Date().toISOString().split('T')[0]
  const isRateIncreaseMonth = todayStr >= '2026-06-01' && todayStr <= '2026-06-30'

  // Calculate revenue from appointments
  const getPrice = (type, date) => {
    const after = date >= '2026-07-01'
    if (type === 'new') return after ? 75 : 60
    if (type === 'existing') return after ? 50 : 40
    if (type === 'prepay4') return after ? 160 : 140
    return 0
  }

  const allAppts = []
  Object.entries(appointments).forEach(([key, slots]) => {
    const [office, date] = key.split('_')
    Object.values(slots || {}).forEach(appt => {
      if (appt?.status === 'booked') {
        allAppts.push({ ...appt, office, date, revenue: getPrice(appt.type, date) })
      }
    })
  })

  const filteredAppts = view === 'Combined' ? allAppts : allAppts.filter(a => a.office === view)

  const today = new Date()
  const todayAppts = filteredAppts.filter(a => a.date === todayStr)
  const thisWeekStart = new Date(today); thisWeekStart.setDate(today.getDate() - today.getDay())
  const thisWeekAppts = filteredAppts.filter(a => new Date(a.date) >= thisWeekStart)
  const thisMonthAppts = filteredAppts.filter(a => a.date?.slice(0,7) === todayStr.slice(0,7))
  const ytdAppts = filteredAppts.filter(a => a.date?.slice(0,4) === todayStr.slice(0,4))

  const sum = (arr) => arr.reduce((s, a) => s + a.revenue, 0)

  // Monthly data for chart
  const monthlyData = MONTHS.map((m, i) => {
    const monthStr = `${todayStr.slice(0,4)}-${(i+1).toString().padStart(2,'0')}`
    const appts = filteredAppts.filter(a => a.date?.startsWith(monthStr))
    return { name: m, revenue: sum(appts), patients: appts.length }
  })

  // Appointment type breakdown
  const typeData = [
    { name: 'New Patient', value: filteredAppts.filter(a => a.type === 'new').length },
    { name: 'Existing', value: filteredAppts.filter(a => a.type === 'existing').length },
    { name: 'Prepay 4', value: filteredAppts.filter(a => a.type === 'prepay4').length },
  ].filter(d => d.value > 0)

  // Expenses
  const filteredExpenses = expenses.filter(e => e.date?.slice(0,4) === todayStr.slice(0,4))
  const totalExpenses = filteredExpenses.reduce((s, e) => s + Number(e.amount), 0)
  const ytdRevenue = sum(ytdAppts)
  const netProfit = ytdRevenue - totalExpenses

  const expenseByCategory = EXPENSE_CATS.map(cat => ({
    cat,
    total: filteredExpenses.filter(e => e.category === cat).reduce((s, e) => s + Number(e.amount), 0)
  })).filter(c => c.total > 0)

  // Daily rate projection
  const daysInYear = 365
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const projectedAnnual = dayOfYear > 0 ? (ytdRevenue / dayOfYear) * daysInYear : 0

  const addExpense = () => {
    if (!expenseForm.amount) return
    setExpenses([...expenses, { ...expenseForm, id: Date.now() }])
    setExpenseForm({ date: new Date().toISOString().split('T')[0], category: 'Supplies', amount: '', notes: '' })
    setShowExpenseForm(false)
  }

  const exportPDF = () => window.print()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">📊 Stats & P&L</h1>
        <button onClick={exportPDF} className="no-print bg-gray-700 hover:bg-gray-600 text-sm px-4 py-2 rounded-lg text-gray-200">🖨️ Export PDF</button>
      </div>

      {isRateIncreaseMonth && (
        <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-300 text-sm px-4 py-2 rounded-lg">
          ⚠️ Rate increase effective July 1, 2026
        </div>
      )}

      {/* View tabs */}
      <div className="flex gap-2">
        {['Rogers','Eureka','Combined'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${view === v ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {v}
          </button>
        ))}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Today" value={`$${sum(todayAppts)}`} sub={`${todayAppts.length} patients`} icon="📅" />
        <StatCard label="This Week" value={`$${sum(thisWeekAppts)}`} sub={`${thisWeekAppts.length} patients`} icon="📆" />
        <StatCard label="This Month" value={`$${sum(thisMonthAppts)}`} sub={`${thisMonthAppts.length} patients`} icon="🗓️" />
        <StatCard label="YTD Revenue" value={`$${ytdRevenue}`} sub={`${ytdAppts.length} patients`} icon="💰" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Avg Per Visit" value={ytdAppts.length > 0 ? `$${(ytdRevenue/ytdAppts.length).toFixed(0)}` : '$0'} icon="📈" />
        <StatCard label="New Patients YTD" value={ytdAppts.filter(a => a.type === 'new').length} icon="🆕" />
        <StatCard label="Projected Annual" value={`$${projectedAnnual.toFixed(0)}`} sub="Based on YTD rate" icon="🔮" />
      </div>

      {/* Revenue chart */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <h2 className="font-semibold text-gray-300 mb-4">Monthly Revenue ({todayStr.slice(0,4)})</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
            <Bar dataKey="revenue" fill="#0D9488" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie chart */}
      {typeData.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h2 className="font-semibold text-gray-300 mb-4">Appointment Type Breakdown</h2>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {typeData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-gray-300">{d.name}: {d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense tracker */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-300">💸 Expenses ({todayStr.slice(0,4)})</h2>
          <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="bg-gray-700 hover:bg-gray-600 text-sm px-3 py-1.5 rounded-lg text-gray-200">+ Add Expense</button>
        </div>

        {showExpenseForm && (
          <div className="bg-gray-800 rounded-lg p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input type="date" value={expenseForm.date} onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            <select value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600">
              {EXPENSE_CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Amount $" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            <input placeholder="Notes" value={expenseForm.notes} onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-600" />
            <div className="col-span-full flex gap-2">
              <button onClick={addExpense} className="bg-teal-600 hover:bg-teal-700 text-white text-sm px-4 py-2 rounded-lg">Save</button>
              <button onClick={() => setShowExpenseForm(false)} className="bg-gray-700 text-gray-300 text-sm px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        )}

        {expenseByCategory.length > 0 && (
          <div className="space-y-1 mb-4">
            {expenseByCategory.map(c => (
              <div key={c.cat} className="flex justify-between text-sm py-1 border-b border-gray-800">
                <span className="text-gray-400">{c.cat}</span>
                <span className="text-red-400">${c.total.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {/* P&L Summary */}
        <div className="bg-gray-800 rounded-lg p-4 mt-4">
          <h3 className="font-semibold text-gray-300 mb-3">P&L Summary (YTD)</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Total Revenue</span><span className="text-teal-400 font-medium">${ytdRevenue}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Total Expenses</span><span className="text-red-400 font-medium">${totalExpenses.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-gray-700 pt-2 font-bold">
              <span>Net Profit</span>
              <span className={netProfit >= 0 ? 'text-green-400' : 'text-red-400'}>${netProfit.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
