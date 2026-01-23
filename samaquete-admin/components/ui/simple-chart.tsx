"use client"

// Composant de graphique simple (à remplacer par Recharts quand installé)
// TODO SAFE LIMIT: Ce composant est temporaire jusqu'à l'installation de Recharts

interface SimpleChartProps {
  type: "line" | "bar" | "pie"
  data: { label: string; value: number }[]
  title?: string
  height?: number
}

export function SimpleChart({ type, data, title, height = 200 }: SimpleChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)
  
  if (type === "line" || type === "bar") {
    const color = "#f59e0b" // Couleur principale amber
    
    if (type === "line") {
      // Vraie courbe avec SVG
      const padding = 10 // Padding pour éviter que les points touchent les bords
      const chartHeight = 100 - padding * 2
      const chartWidth = 100 - padding * 2
      
      const points = data.map((item, index) => {
        const x = padding + (index / (data.length - 1 || 1)) * chartWidth
        const y = padding + (maxValue > 0 ? chartHeight - (item.value / maxValue) * chartHeight : chartHeight)
        return { x, y, value: item.value, label: item.label }
      })
      
      // Créer le path SVG pour la ligne avec courbe lisse
      const pathData = points.map((point, index) => {
        if (index === 0) {
          return `M ${point.x} ${point.y}`
        }
        // Utiliser des courbes de Bézier pour une ligne plus fluide
        const prevPoint = points[index - 1]
        const cp1x = prevPoint.x + (point.x - prevPoint.x) / 3
        const cp1y = prevPoint.y
        const cp2x = prevPoint.x + (point.x - prevPoint.x) * 2 / 3
        const cp2y = point.y
        return `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${point.x} ${point.y}`
      }).join(' ')
      
      return (
        <div className="w-full relative" style={{ height: `${height}px` }}>
          {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
          <div className="relative w-full" style={{ height: `${height - 60}px`, paddingBottom: "50px" }}>
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              style={{ overflow: 'visible' }}
            >
              {/* Zone de fond pour la courbe (optionnel) */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={color} stopOpacity="0.05" />
                </linearGradient>
                {/* Pattern pour la grille */}
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              
              {/* Grille de fond */}
              <rect width="100" height="100" fill="url(#grid)" opacity="0.5" />
              
              {/* Zone remplie sous la courbe */}
              <path
                d={`${pathData} L ${points[points.length - 1].x} ${100 - padding} L ${points[0].x} ${100 - padding} Z`}
                fill="url(#lineGradient)"
              />
              
              {/* Ligne de la courbe */}
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-sm"
              />
              
              {/* Points sur la courbe */}
              {points.map((point, index) => (
                <g key={index} className="group">
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="4"
                    fill={color}
                    stroke="white"
                    strokeWidth="2.5"
                    className="hover:r-5 transition-all cursor-pointer"
                  />
                  {/* Tooltip au survol avec formatage */}
                  <title>{`${point.label}: ${point.value.toLocaleString("fr-FR")} FCFA`}</title>
                  {/* Ligne verticale pointillée pour aider à lire les valeurs */}
                  <line
                    x1={point.x}
                    y1={point.y}
                    x2={point.x}
                    y2={100 - padding}
                    stroke="#e5e7eb"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </g>
              ))}
            </svg>
            {/* Labels en bas avec formatage amélioré */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-start mt-2 px-1">
              {data.map((item, index) => (
                <div key={index} className="flex flex-col items-center gap-1 flex-1 min-w-0 px-0.5">
                  <span className="text-xs text-gray-600 font-medium truncate w-full text-center leading-tight" title={item.label}>
                    {item.label}
                  </span>
                  <span className="text-xs font-bold text-gray-900 whitespace-nowrap" title={`${item.value.toLocaleString("fr-FR")} FCFA`}>
                    {item.value > 0 ? item.value.toLocaleString("fr-FR") : "0"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }
    
    // Bar chart
    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        {title && <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>}
        <div className="flex items-end justify-between gap-3 h-full pb-8">
          {data.map((item, index) => {
            const heightPercent = maxValue > 0 ? (item.value / maxValue) * 100 : 0
            const colors = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"]
            const barColor = colors[index % colors.length]
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full group relative">
                <div className="relative w-full h-full flex items-end justify-center">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80 cursor-pointer"
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: barColor,
                      minHeight: item.value > 0 ? "8px" : "0",
                    }}
                    title={`${item.label}: ${item.value}`}
                  />
                </div>
                {/* Tooltip au survol avec nombre réel */}
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  <div className="font-semibold">{item.label}</div>
                  <div className="text-center">Nombre réel: {item.value}</div>
                  {/* Flèche pointant vers la barre */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
                <span className="text-xs text-gray-600 truncate w-full text-center font-medium">{item.label}</span>
                <span className="text-xs font-bold text-gray-900">{item.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  if (type === "pie") {
    const total = data.reduce((sum, d) => sum + d.value, 0)
    let currentAngle = 0
    
    return (
      <div className="w-full flex items-center justify-center" style={{ height: `${height}px` }}>
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100
              const angle = (percentage / 100) * 360
              const startAngle = currentAngle
              currentAngle += angle
              
              const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180)
              const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180)
              const x2 = 50 + 50 * Math.cos((currentAngle * Math.PI) / 180)
              const y2 = 50 + 50 * Math.sin((currentAngle * Math.PI) / 180)
              
              const largeArc = angle > 180 ? 1 : 0
              
              const colors = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"]
              const color = colors[index % colors.length]
              
              return (
                <g key={index} className="group">
                  <path
                    d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                    fill={color}
                    stroke="white"
                    strokeWidth="0.5"
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                  <title>{`${item.label}: ${item.value} (${percentage.toFixed(1)}%)`}</title>
                </g>
              )
            })}
          </svg>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item, index) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            const colors = ["#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#ef4444"]
            return (
              <div key={index} className="flex items-center gap-2 group">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-600">{item.label}:</span>
                <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
                <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  ({item.value})
                </span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  
  return null
}
