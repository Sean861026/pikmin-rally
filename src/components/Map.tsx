'use client'

import { useEffect, useRef } from 'react'
import type { MushroomEvent } from '@/types'

type LeafletMap = {
  remove: () => void
  containerPointToLatLng: (point: [number, number]) => { lat: number; lng: number }
  setView: (center: [number, number], zoom?: number) => void
}

type Props = {
  events: MushroomEvent[]
  center: [number, number]
  onEventClick: (event: MushroomEvent) => void
  onReady: (map: LeafletMap) => void
}

export default function Map({ events, center, onEventClick, onReady }: Props) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<LeafletMap | null>(null)
  const markersRef = useRef<unknown[]>([])
  const onEventClickRef = useRef(onEventClick)

  useEffect(() => { onEventClickRef.current = onEventClick }, [onEventClick])

  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, 15)
    }
  }, [center])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')
      if (mapInstanceRef.current) return

      const map = L.map(mapRef.current!).setView(center, 15)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      mapInstanceRef.current = map as unknown as LeafletMap
      onReady(map as unknown as LeafletMap)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current) return
    const updateMap = async () => {
      const L = (await import('leaflet')).default
      const map = mapInstanceRef.current as unknown as ReturnType<typeof L.map>

      markersRef.current.forEach((m) => (m as ReturnType<typeof L.marker>).remove())
      markersRef.current = []

      events.forEach((event) => {
        const color = event.status === 'open' ? '#22c55e' : event.status === 'full' ? '#f97316' : '#6b7280'
        const icon = L.divIcon({
          html: `<div style="background:${color};width:36px;height:36px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-weight:bold;color:white;font-size:14px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">Lv${event.mushroom_level}</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        })
        const marker = L.marker([event.lat, event.lng], { icon })
          .addTo(map)
          .on('click', () => onEventClickRef.current(event))
        markersRef.current.push(marker)
      })
    }
    updateMap()
  }, [events])

  return <div ref={mapRef} className="w-full h-full" />
}
