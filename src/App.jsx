import { HashRouter, Routes, Route } from 'react-router-dom'
import { SpecialtyProvider } from './contexts/SpecialtyContext'
import Layout from './components/Layout'
import Scheduler from './pages/Scheduler'
import MileageTracker from './pages/MileageTracker'
import IntakeForms from './pages/IntakeForms'
import SOAPNotes from './pages/SOAPNotes'
import ContactManager from './pages/ContactManager'
import Reactivation from './pages/Reactivation'
import StatsPnL from './pages/StatsPnL'
import CheckInQueue from './pages/CheckInQueue'
import Insurance from './pages/Insurance'
import Kiosk from './special/Kiosk'
import Book from './special/Book'
import Sign from './special/Sign'

export default function App() {
  return (
    <SpecialtyProvider>
      <HashRouter>
        <Routes>
          {/* Special full-screen routes (no layout) */}
          <Route path="/kiosk" element={<Kiosk />} />
          <Route path="/book" element={<Book />} />
          <Route path="/sign" element={<Sign />} />
          <Route path="/intake-form" element={<IntakeForms standalone />} />

          {/* Main app with sidebar layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Scheduler />} />
            <Route path="mileage" element={<MileageTracker />} />
            <Route path="intake" element={<IntakeForms />} />
            <Route path="soap" element={<SOAPNotes />} />
            <Route path="contacts" element={<ContactManager />} />
            <Route path="reactivation" element={<Reactivation />} />
            <Route path="stats" element={<StatsPnL />} />
            <Route path="checkin" element={<CheckInQueue />} />
            <Route path="insurance" element={<Insurance />} />
          </Route>
        </Routes>
      </HashRouter>
    </SpecialtyProvider>
  )
}
