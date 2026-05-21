export default function PainSlider({ value, onChange, size = 'normal' }) {
  const colors = ['', '#22c55e','#4ade80','#86efac','#bbf7d0','#fde68a','#fbbf24','#f97316','#ef4444','#dc2626','#991b1b']
  const labels = ['', 'Min','','','','Moderate','','','','','Max']
  const big = size === 'large'
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <span className={`font-bold ${big ? 'text-4xl' : 'text-2xl'}`} style={{ color: colors[value] || '#9ca3af' }}>
          {value}/10
        </span>
        <span className="text-gray-400 text-sm">
          {value === 0 ? 'No pain' : value <= 3 ? 'Mild' : value <= 6 ? 'Moderate' : value <= 8 ? 'Severe' : 'Extreme'}
        </span>
      </div>
      <input
        type="range" min="0" max="10" value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        className={`w-full accent-teal-600 ${big ? 'h-6' : ''}`}
        style={{ cursor: 'pointer' }}
      />
      <div className="flex justify-between text-xs text-gray-500">
        {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{ color: n === value ? colors[n] : undefined }}>{n}</span>
        ))}
      </div>
    </div>
  )
}
