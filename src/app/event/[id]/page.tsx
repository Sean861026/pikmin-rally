'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Clock, Users, MapPin, ArrowLeft, Share2, Navigation } from 'lucide-react'
import type { MushroomEvent, EventJoin } from '@/types'

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
  const [event, setEvent] = useState<MushroomEvent | null>(null)
  const [joins, setJoins] = useState<EventJoin[]>([])
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data: ev } = await supabase
        .from('mushroom_events')
        .select('*')
        .eq('id', id)
        .single()
      if (!ev) { setNotFound(true); return }
      setEvent(ev)

      const { data: jns } = await supabase
        .from('event_joins')
        .select('*')
        .eq('event_id', id)
        .order('joined_at', { ascending: true })
      if (jns) setJoins(jns)
    }
    fetch()
  }, [id])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname || !event) return
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('event_joins').insert({
        event_id: event.id,
        player_nickname: nickname,
      })
      if (error) throw error
      if (joins.length + 1 >= event.max_players) {
        await supabase.from('mushroom_events').update({ status: 'full' }).eq('id', event.id)
      }
      setJoins((prev) => [...prev, { id: '', event_id: event.id, player_nickname: nickname, joined_at: new Date().toISOString() }])
      setNickname('')
    } catch {
      alert('加入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  if (notFound) return (
    <main className="flex flex-col items-center justify-center h-screen text-gray-500">
      <p className="text-lg">找不到這個活動</p>
      <button onClick={() => router.push('/')} className="mt-4 text-green-600 underline">回到地圖</button>
    </main>
  )

  if (!event) return (
    <main className="flex items-center justify-center h-screen text-gray-400">載入中...</main>
  )

  const localTime = new Date(event.scheduled_at).toLocaleString()
  const spotsLeft = event.max_players - joins.length
  const isFull = spotsLeft <= 0

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-green-600 text-white px-4 py-3 flex items-center gap-3">
        <button onClick={() => router.push('/')} className="p-1 rounded-full hover:bg-green-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-base">皮克敏揪人</h1>
          <p className="text-xs text-green-200">活動詳情</p>
        </div>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${levelColors[event.mushroom_level] ?? 'bg-gray-100 text-gray-700'}`}>
                Lv {event.mushroom_level} 蘑菇
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isFull ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                {isFull ? '已滿' : `還差 ${spotsLeft} 人`}
              </span>
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert('連結已複製！') }}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <Share2 size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="space-y-2 text-gray-900">
            <div className="flex items-center gap-2 text-sm">
              <Clock size={14} className="text-gray-400" />
              <span>{localTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users size={14} className="text-gray-400" />
              <span>發起人：{event.creator_nickname}｜{joins.length}/{event.max_players} 人</span>
            </div>
            {event.note && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-gray-400" />
                <span>{event.note}</span>
              </div>
            )}
          </div>
        </div>

        {joins.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-xs text-gray-400 mb-2">已加入的玩家</p>
            <div className="flex flex-wrap gap-1">
              {joins.map((j, i) => (
                <span key={i} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  {j.player_nickname}
                </span>
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
          <Navigation size={16} />
          用 Google Maps 導航到蘑菇位置
        </a>

        {!isFull && event.status !== 'done' && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-900 mb-3">加入這場揪人</p>
            <form onSubmit={handleJoin} className="flex gap-2">
              <input
                className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="輸入你的暱稱"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-xl disabled:opacity-50 text-sm"
              >
                {loading ? '...' : '加入'}
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => router.push('/')}
          className="w-full text-center text-sm text-green-600 py-2"
        >
          查看地圖上的其他活動 →
        </button>
      </div>
    </main>
  )
}
