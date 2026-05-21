import { QRCodeSVG } from 'qrcode.react'

const BASE = 'https://dralanhiatt-source.github.io/chiro-practice-mgmt/#/book'

export default function Sign() {
  return (
    <div className="min-h-screen bg-white text-gray-800 p-8 flex flex-col items-center">
      {/* Print button */}
      <button onClick={() => window.print()}
        className="no-print mb-6 bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-2 font-medium">
        🖨️ Print This Sign
      </button>

      <div className="max-w-2xl w-full border-4 border-teal-600 rounded-2xl p-10 text-center">
        {/* Header */}
        <div className="text-5xl mb-3">🦴</div>
        <h1 className="text-4xl font-bold text-teal-700 mb-2">Welcome to Dr. Hiatt's Office</h1>
        <p className="text-lg text-gray-600 mb-2">Chiropractic Care — Rogers & Eureka Springs</p>
        <div className="w-24 h-1 bg-teal-500 mx-auto mb-8 rounded-full"></div>

        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Scan to Book Your Next Appointment</h2>

        {/* QR codes */}
        <div className="flex justify-center gap-12 flex-wrap">
          <div className="flex flex-col items-center gap-3">
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-teal-200">
              <QRCodeSVG value={`${BASE}?office=rogers`} size={180} bgColor="#f9fafb" fgColor="#0D9488" />
            </div>
            <div className="font-bold text-xl text-teal-700">Rogers Office</div>
            <div className="text-sm text-gray-500">Wed / Fri / Sat</div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="bg-gray-50 p-4 rounded-xl border-2 border-teal-200">
              <QRCodeSVG value={`${BASE}?office=eureka`} size={180} bgColor="#f9fafb" fgColor="#0D9488" />
            </div>
            <div className="font-bold text-xl text-teal-700">Eureka Springs Office</div>
            <div className="text-sm text-gray-500">Wed / Fri / Sat</div>
          </div>
        </div>

        <div className="mt-8 text-gray-500 text-sm">
          <p>Or visit: <span className="font-mono text-teal-700">dralanhiatt-source.github.io/chiro-practice-mgmt</span></p>
        </div>
      </div>

      <p className="no-print mt-6 text-gray-400 text-xs">This page is optimized for printing. Use your browser's print function (Ctrl+P).</p>
    </div>
  )
}
