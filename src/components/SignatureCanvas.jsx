import { useRef, useEffect } from 'react'

export default function SignatureCanvas({ onSign }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#0D9488'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect()
      if (e.touches) {
        return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top }
      }
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const start = (e) => { drawing.current = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y) }
    const move = (e) => {
      if (!drawing.current) return
      e.preventDefault()
      const p = getPos(e)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
    const end = () => {
      drawing.current = false
      if (onSign) onSign(canvas.toDataURL())
    }

    canvas.addEventListener('mousedown', start)
    canvas.addEventListener('mousemove', move)
    canvas.addEventListener('mouseup', end)
    canvas.addEventListener('touchstart', start, { passive: false })
    canvas.addEventListener('touchmove', move, { passive: false })
    canvas.addEventListener('touchend', end)

    return () => {
      canvas.removeEventListener('mousedown', start)
      canvas.removeEventListener('mousemove', move)
      canvas.removeEventListener('mouseup', end)
      canvas.removeEventListener('touchstart', start)
      canvas.removeEventListener('touchmove', move)
      canvas.removeEventListener('touchend', end)
    }
  }, [onSign])

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (onSign) onSign(null)
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="border border-gray-600 rounded bg-gray-800 w-full cursor-crosshair"
      />
      <button type="button" onClick={clear} className="mt-1 text-xs text-gray-400 hover:text-teal-400">
        Clear Signature
      </button>
    </div>
  )
}
