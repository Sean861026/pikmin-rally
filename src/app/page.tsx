'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, RefreshCw } from 'lucide-react'
import type { MushroomEvent } from '@/types'
import CreateEventModal from '@/components/CreateEventModal'
import EventDetailModal from '@/components/EventDetailModal'

type LeafletMap = {
  remove: () => void
  containerPointToLatLng: (point: [number, number]) => { lat: number; lng: number }
}

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

const DEFAULT_CENTER: [number, number] = [25.0478, 121.5318]

export default function Home() {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [events, setEvents] = useState<MushroomEvent[]>([])
  const [pickingLocation, setPickingLocation] = useState(false)
  const [createPos, setCreatePos] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<MushroomEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const mapInstanceRef = useRef<LeafletMap | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      // 把已過期的活動標為 done
      await supabase
        .from('mushroom_events')
        .update({ status: 'done' })
        .lt('scheduled_at', new Date().toISOString())
        .neq('status', 'done')
      const { data } = await supabase
        .from('mushroom_events')
        .select(`*, join_count:event_joins(count)`)
        .neq('status', 'done')
        .order('scheduled_at', { ascending: true })
      if (data) {
        setEvents(
          data.map((e) => ({
            ...e,
            join_count: Array.isArray(e.join_count) ? (e.join_count[0] as { count: number })?.count ?? 0 : 0,
          }))
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
    navigator.geolocation?.getCurrentPosition((pos) => {
      setCenter([pos.coords.latitude, pos.coords.longitude])
    })
  }, [fetchEvents])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const map = mapInstanceRef.current
    if (!map) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const latlng = map.containerPointToLatLng([x, y])
    setCreatePos({ lat: latlng.lat, lng: latlng.lng })
    setPickingLocation(false)
  }

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <header className="bg-green-600 text-white px-4 py-3 flex items-center justify-between shadow-md" style={{ zIndex: 1000 }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍄</span>
          <div>
            <h1 className="font-bold text-base leading-tight">皮克敏揪人</h1>
            <p className="text-xs text-green-200">找附近的玩家一起打蘑菇</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchEvents}
            className="p-2 rounded-full hover:bg-green-500 transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setPickingLocation((v) => !v)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${
              pickingLocation
                ? 'bg-white text-green-700'
                : 'bg-green-500 hover:bg-green-400 text-white'
            }`}
          >
            <MapPin size={14} />
            {pickingLocation ? '點地圖選位置' : '發起揪人'}
          </button>
        </div>
      </header>

      {pickingLocation && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-700 text-center" style={{ zIndex: 1000 }}>
          點選地圖上蘑菇的位置
        </div>
      )}

      <div className="flex-1 relative">
        <Map
          events={events}
          center={center}
          onEventClick={setSelectedEvent}
          onReady={(map) => { mapInstanceRef.current = map }}
        />

        {/* 選位置用的透明 overlay，蓋在地圖上 */}
        {pickingLocation && (
          <div
            className="absolute inset-0 cursor-crosshair"
            style={{ zIndex: 1000 }}
            onClick={handleOverlayClick}
          />
        )}

        <a
          href="https://github.com/Sean861026/pikmin-rally"
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-4 bg-white shadow-lg rounded-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-800 transition flex items-center gap-1.5"
          style={{ zIndex: 500 }}
        >
          <svg height="14" viewBox="0 0 16 16" width="14" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
          </svg>
          GitHub
        </a>

        {events.length > 0 && !pickingLocation && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-lg rounded-full px-4 py-2 text-sm text-gray-600" style={{ zIndex: 500 }}>
            附近有 <span className="font-bold text-green-600">{events.length}</span> 個揪人活動
          </div>
        )}
      </div>

      {createPos && (
        <CreateEventModal
          lat={createPos.lat}
          lng={createPos.lng}
          onClose={() => setCreatePos(null)}
          onCreated={() => {
            setCreatePos(null)
            fetchEvents()
          }}
        />
      )}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onUpdated={fetchEvents}
        />
      )}
    </main>
  )
}
