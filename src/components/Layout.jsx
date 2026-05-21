import { NavLink, Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'

const NAV = [
  { to: '/', icon: '📅', label: 'Scheduler' },
  { to: '/mileage', icon: '🚗', label: 'Mileage' },
  { to: '/intake', icon: '📋', label: 'Intake' },
  { to: '/soap', icon: '📝', label: 'SOAP Notes' },
  { to: '/contacts', icon: '👥', label: 'Contacts' },
  { to: '/reactivation', icon: '🔄', label: 'Reactivation' },
  { to: '/stats', icon: '📊', label: 'Stats & P&L' },
  { to: '/checkin', icon: '✅', label: 'Check-In' },
]

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  return <span className="text-sm text-gray-400">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
}

export default function Layout() {
  const [darkMode, setDarkMode] = useState(true)
  const [office, setOffice] = useState(() => localStorage.getItem('activeOffice') || 'Rogers')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const setOfficeAndSave = (o) => { setOffice(o); localStorage.setItem('activeOffice', o) }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <aside className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 fixed md:static z-40 h-full w-56 bg-gray-900 border-r border-gray-800
        flex flex-col transition-transform duration-200
      `}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏥</span>
            <div>
              <div className="font-bold text-teal-400 text-sm leading-tight">ChiroDesk</div>
              <div className="text-xs text-gray-500">by Hiatt</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-600/20 text-teal-400 border-r-2 border-teal-400'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="mt-4 px-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-2">Special</p>
            <NavLink to="/kiosk" className="flex items-center gap-3 px-0 py-2 text-sm text-gray-500 hover:text-teal-400 transition">
              📱 Kiosk Mode
            </NavLink>
            <NavLink to="/book" className="flex items-center gap-3 px-0 py-2 text-sm text-gray-500 hover:text-teal-400 transition">
              🌐 Book Page
            </NavLink>
            <NavLink to="/sign" className="flex items-center gap-3 px-0 py-2 text-sm text-gray-500 hover:text-teal-400 transition">
              🖨️ Waiting Room Sign
            </NavLink>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-800 text-xs text-gray-600 text-center">
          ChiroDesk by Hiatt v1.0
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between gap-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <div className="flex items-center gap-1">
              {['Rogers', 'Eureka'].map(o => (
                <button
                  key={o}
                  onClick={() => setOfficeAndSave(o)}
                  className={`px-3 py-1 rounded text-xs font-medium transition ${
                    office === o ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock />
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="text-lg hover:scale-110 transition-transform"
              title="Toggle dark mode"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet context={{ office, setOffice: setOfficeAndSave }} />
        </main>
      </div>
    </div>
  )
}
