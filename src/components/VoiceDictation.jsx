import { useState, useRef } from 'react'

export default function VoiceDictation({ onResult, placeholder = 'Dictate notes...' }) {
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const recogRef = useRef(null)

  const toggle = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { alert('Speech recognition not supported in this browser.'); return }

    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }

    const recog = new SR()
    recogRef.current = recog
    recog.continuous = true
    recog.interimResults = true
    recog.lang = 'en-US'

    recog.onresult = (e) => {
      let text = ''
      for (let i = 0; i < e.results.length; i++) {
        text += e.results[i][0].transcript
      }
      setTranscript(text)
      if (onResult) onResult(text)
    }

    recog.onend = () => setListening(false)
    recog.start()
    setListening(true)
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggle}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
          listening ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
      >
        🎤 {listening ? 'Stop Dictation' : 'Start Dictation'}
      </button>
      {transcript && (
        <p className="text-sm text-gray-300 bg-gray-800 rounded p-2 border border-gray-700">{transcript}</p>
      )}
    </div>
  )
}
