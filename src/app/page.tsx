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
