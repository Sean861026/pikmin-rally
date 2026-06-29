'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, RefreshCw } from 'lucide-react'
import type { MushroomEvent } from '@/types'
import CreateEventModal from '@/components/CreateEventModal'
import EventDetailModal from '@/components/EventDetailModal'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'
import { haversine } from '@/lib/distance'

type LeafletMap = {
  remove: () => void
  containerPointToLatLng: (point: [number, number]) => { lat: number; lng: number }
}

const Map = dynamic(() => import('@/components/Map'), { ssr: false })

const DEFAULT_CENTER: [number, number] = [25.0478, 121.5318]

export default function Home() {
  const { lang, setLang } = useLang()
  const T = t[lang]
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER)
  const [events, setEvents] = useState<MushroomEvent[]>([])
  const [pickingLocation, setPickingLocation] = useState(false)
  const [showList, setShowList] = useState(false)
  const [createPos, setCreatePos] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<MushroomEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [radius, setRadius] = useState(10)
  const userLocationRef = useRef<[number, number] | null>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
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
      const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude]
      setCenter(loc)
      userLocationRef.current = loc
    })
  }, [fetchEvents])

  const filteredEvents = userLocationRef.current
    ? events.filter((ev) => haversine(userLocationRef.current![0], userLocationRef.current![1], ev.lat, ev.lng) <= radius)
    : events

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
            <h1 className="font-bold text-base leading-tight">{T.appName}</h1>
            <p className="text-xs text-green-200">{T.appDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as 'zh' | 'en' | 'ja')}
            className="bg-green-500 text-white text-xs font-medium rounded-full px-2 py-1 border-none outline-none cursor-pointer"
          >
            <option value="zh">中文</option>
            <option value="en">EN</option>
            <option value="ja">日本語</option>
          </select>
          <button onClick={fetchEvents} className="p-2 rounded-full hover:bg-green-500 transition">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={() => setPickingLocation((v) => !v)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition ${
              pickingLocation ? 'bg-white text-green-700' : 'bg-green-500 hover:bg-green-400 text-white'
            }`}
          >
            <MapPin size={14} />
            {pickingLocation ? T.pickLocation : T.createEvent}
          </button>
        </div>
      </header>

      {pickingLocation && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-sm text-yellow-700 text-center" style={{ zIndex: 1000 }}>
          {T.pickHint}
        </div>
      )}

      <div className="flex-1 relative">
        <Map
          events={filteredEvents}
          center={center}
          onEventClick={setSelectedEvent}
          onReady={(map) => { mapInstanceRef.current = map }}
        />

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

        {!pickingLocation && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 500 }}>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="bg-white shadow-lg rounded-full px-3 py-2 text-xs text-gray-600 border-none outline-none cursor-pointer"
            >
              {[1, 5, 10, 50].map((km) => (
                <option key={km} value={km}>{km} km</option>
              ))}
            </select>
            <button
              onClick={() => setShowList(true)}
              className="bg-white shadow-lg rounded-full px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              {filteredEvents.length > 0
                ? <><span className="font-bold text-green-600">{T.nearbyEvents(filteredEvents.length, radius)}</span><span className="ml-1 text-gray-400">↑</span></>
                : <span className="text-gray-400">{T.noEvents(radius)}</span>
              }
            </button>
          </div>
        )}
      </div>

      {showList && (
        <div className="fixed inset-0 flex flex-col justify-end" style={{ zIndex: 9999 }}>
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowList(false)} />
          <div className="relative bg-white rounded-t-2xl max-h-[70vh] flex flex-col" style={{ color: '#111' }}>
            <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b">
              <h2 className="font-bold text-base">{T.nearbyEvents(filteredEvents.length, radius)}</h2>
              <button onClick={() => setShowList(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
            </div>
            <ul className="overflow-y-auto divide-y">
              {filteredEvents.map((event) => {
                const levelColors: Record<number, string> = {
                  1: 'bg-green-100 text-green-700',
                  2: 'bg-yellow-100 text-yellow-700',
                  3: 'bg-orange-100 text-orange-700',
                  4: 'bg-red-100 text-red-700',
                  5: 'bg-purple-100 text-purple-700',
                }
                const time = new Date(event.scheduled_at).toLocaleString(undefined, {
                  month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
                })
                return (
                  <li key={event.id}>
                    <button
                      className="w-full text-left px-5 py-3 hover:bg-gray-50 transition flex items-center justify-between gap-3"
                      onClick={() => { setSelectedEvent(event); setShowList(false) }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[event.mushroom_level] ?? 'bg-gray-100 text-gray-700'}`}>
                          Lv {event.mushroom_level}
                        </span>
                        <span className="text-sm font-medium truncate">{event.creator_nickname}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-gray-500">{time}</p>
                        <p className="text-xs text-green-600">{event.join_count ?? 0}/{event.max_players} 人</p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {createPos && (
        <CreateEventModal
          lat={createPos.lat}
          lng={createPos.lng}
          onClose={() => setCreatePos(null)}
          onCreated={() => { setCreatePos(null); fetchEvents() }}
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
