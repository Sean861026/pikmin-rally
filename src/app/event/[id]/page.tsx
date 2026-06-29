'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, Users, MapPin, ArrowLeft, Share2, Navigation } from 'lucide-react'
import type { MushroomEvent, EventJoin } from '@/types'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'

const levelColors: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
  5: 'bg-purple-100 text-purple-700',
}

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { lang } = useLang()
  const T = t[lang]

  const [event, setEvent] = useState<MushroomEvent | null>(null)
  const [joins, setJoins] = useState<EventJoin[]>([])
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data: ev } = await supabase.from('mushroom_events').select('*').eq('id', id).single()
      if (!ev) { setNotFound(true); return }
      setEvent(ev)
      const { data: jns } = await supabase.from('event_joins').select('*').eq('event_id', id).order('joined_at', { ascending: true })
      if (jns) setJoins(jns)
    }
    fetchData()
  }, [id])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname || !event) return
    if (joins.some((j) => j.player_nickname === nickname)) {
      alert(T.alreadyJoined)
      return
    }
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('event_joins').insert({ event_id: event.id, player_nickname: nickname })
      if (error) throw error
      if (joins.length + 1 >= event.max_players) {
        await supabase.from('mushroom_events').update({ status: 'full' }).eq('id', event.id)
      }
      setJoins((prev) => [...prev, { id: '', event_id: event.id, player_nickname: nickname, joined_at: new Date().toISOString() }])
      setNickname('')
    } catch {
      alert(T.joinFailed)
    } finally {
      setLoading(false)
    }
  }

  if (notFound) return (
    <main className="flex flex-col items-center justify-center h-screen text-gray-500">
      <p className="text-lg">{T.notFound}</p>
      <button onClick={() => router.push('/')} className="mt-4 text-green-600 underline">{T.backToMap}</button>
    </main>
  )

  if (!event) return (
    <main className="flex items-center justify-center h-screen text-gray-400">{T.loading}</main>
  )

  const localTime = new Date(event.scheduled_at).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  })
  const spotsLeft = event.max_players - joins.length
  const isFull = spotsLeft <= 0

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="p-1 rounded-full hover:bg-green-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-base">{T.appName}</h1>
          <p className="text-xs text-green-200">{T.eventDetail}</p>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ color: '#111' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${levelColors[event.mushroom_level] ?? 'bg-gray-100 text-gray-700'}`}>
                Lv {event.mushroom_level}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isFull ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {isFull ? T.full : T.spotsLeft(spotsLeft)}
              </span>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert(T.copyLink) }} className="p-1.5 rounded-full hover:bg-gray-100">
              <Share2 size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <Clock size={14} className="text-gray-400" /><span>{localTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <Users size={14} className="text-gray-400" />
              <span>{T.organizer}：{event.creator_nickname}｜{T.players(joins.length, event.max_players)}</span>
            </div>
            {event.note && (
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <MapPin size={14} className="text-gray-400" /><span>{event.note}</span>
              </div>
            )}
          </div>
        </div>

        {joins.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ color: '#111' }}>
            <p className="text-xs text-gray-400 mb-2">{T.joinedPlayers}</p>
            <div className="flex flex-wrap gap-1">
              {joins.map((j, i) => (
                <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">{j.player_nickname}</span>
              ))}
            </div>
          </div>
        )}

        <a
          href={`https://maps.google.com/?q=${event.lat},${event.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white rounded-2xl p-4 shadow-sm text-green-600 font-medium text-sm hover:bg-green-50 transition"
        >
          <Navigation size={16} />{T.navigate}
        </a>

        {!isFull && event.status !== 'done' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm" style={{ color: '#111' }}>
            <p className="text-sm font-medium text-gray-900 mb-3">{T.joinEvent}</p>
            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder={T.joinPlaceholder}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-50 text-sm">
                {loading ? T.joining : T.join}
              </button>
            </form>
          </div>
        )}

        <button onClick={() => router.push('/')} className="w-full text-center text-sm text-green-600 py-2">
          {T.seeOtherEvents}
        </button>
      </div>
    </main>
  )
}
