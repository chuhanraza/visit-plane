'use client'
import { useState, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps'
import { normalizeGeoName } from '@/utils/countryMapping'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

type Status = 'free' | 'arrival' | 'required' | 'same' | 'unknown'
const COLORS: Record<Status, string> = {
  free: '#10B981', arrival: '#F59E0B', required: '#EF4444', same: '#6B7280', unknown: '#D1D5DB',
}
const STATUS_LABEL: Record<Status, string> = {
  free: '🟢 Visa Free', arrival: '🟡 On Arrival', required: '🔴 Visa Required',
  same: '🏠 Your Country', unknown: '⚪ No Data',
}

interface Props {
  visaFree: Set<string>
  onArrival: Set<string>
  required: Set<string>
  passport: string
  onCountryClick: (dbName: string) => void
}

type GeoPos = { coordinates: [number, number]; zoom: number }

export default function WorldMap({ visaFree, onArrival, required, passport, onCountryClick }: Props) {
  const [pos, setPos] = useState<GeoPos>({ coordinates: [0, 20], zoom: 1 })
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; status: Status } | null>(null)

  const getStatus = useCallback((dbName: string): Status => {
    if (dbName.toLowerCase() === passport.toLowerCase()) return 'same'
    if (visaFree.has(dbName)) return 'free'
    if (onArrival.has(dbName)) return 'arrival'
    if (required.has(dbName)) return 'required'
    return 'unknown'
  }, [visaFree, onArrival, required, passport])

  return (
    <div className="relative w-full bg-[#0A1628] rounded-2xl overflow-hidden border border-white/5" style={{ height: 500 }}>
      {/* Zoom Controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
        {([
          ['+', () => setPos(p => ({ ...p, zoom: Math.min(p.zoom * 1.5, 8) }))],
          ['↺', () => setPos({ coordinates: [0, 20], zoom: 1 })],
          ['−', () => setPos(p => ({ ...p, zoom: Math.max(p.zoom / 1.5, 1) }))],
        ] as [string, () => void][]).map(([label, fn]) => (
          <button key={label} onClick={fn}
            className="w-8 h-8 rounded-lg bg-white/10 text-white text-sm font-bold hover:bg-teal-500/30 transition flex items-center justify-center border border-white/10">
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2">
        {([['#10B981', 'Visa Free'], ['#F59E0B', 'On Arrival'], ['#EF4444', 'Visa Required'], ['#D1D5DB', 'No Data']] as [string, string][]).map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm border border-white/10">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      <ComposableMap
        projectionConfig={{ scale: 147, center: [0, 20] }}
        width={800} height={500}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup zoom={pos.zoom} center={pos.coordinates} onMoveEnd={setPos}>
          <Geographies geography={GEO_URL}>
            {({ geographies }) => geographies.map(geo => {
              const dbName = normalizeGeoName(geo.properties.name as string)
              const status = getStatus(dbName)
              const color = COLORS[status]
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={color}
                  stroke="#1F2937"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: `${color}CC`, outline: 'none', cursor: status !== 'same' ? 'pointer' : 'default' },
                    pressed: { outline: 'none' },
                  }}
                  onMouseEnter={(evt: React.MouseEvent) => setTooltip({ x: evt.clientX, y: evt.clientY, name: geo.properties.name as string, status })}
                  onMouseMove={(evt: React.MouseEvent) => setTooltip(t => t ? { ...t, x: evt.clientX, y: evt.clientY } : null)}
                  onMouseLeave={() => setTooltip(null)}
                  onClick={() => { if (status !== 'same' && status !== 'unknown') onCountryClick(dbName) }}
                />
              )
            })}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip && (
        <div className="fixed z-[9999] pointer-events-none rounded-xl bg-gray-900/95 border border-white/15 px-3 py-2 text-xs text-white shadow-2xl backdrop-blur-sm"
          style={{ left: tooltip.x + 14, top: tooltip.y - 48 }}>
          <div className="font-bold">{tooltip.name}</div>
          <div className="mt-0.5 text-white/60">{STATUS_LABEL[tooltip.status]}</div>
          {(tooltip.status === 'free' || tooltip.status === 'arrival') && (
            <div className="mt-1 text-teal-400 text-[10px]">Click to view details →</div>
          )}
        </div>
      )}
    </div>
  )
}
