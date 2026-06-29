'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Users, Clock, MapPin } from 'lucide-react'
import type { MushroomEvent, EventJoin } from '@/types'

type Props = {
  event: MushroomEvent
  onClose: () => void
  onUpdated: () => void
}

const levelColors: Record<number, string> = {
  1: 'bg-green-100 text-green-700',
  2: 'bg-yellow-100 text-yellow-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-red-100 text-red-700',
  5: 'bg-purple-100 text-purple-700',
}

export default function EventDetailModal({ event, onClose, onUpdated }: Props) {
  const [joins, setJoins] = useState<EventJoin[]>([])
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchJoins = async () => {
      const { supabase } = await import('@/lib/supabase')
      const { data } = await supabase
        .from('event_joins')
        .select('*')
        .eq('event_id', event.id)
        .order('joined_at', { ascending: true })
      if (data) setJoins(data)
    }
    fetchJoins()
  }, [event.id])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname) return
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
      onUpdated()
      onClose()
    } catch {
      alert('加入失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const localTime = new Date(event.scheduled_at).toLocaleString()
  const spotsLeft = event.max_players - joins.length
  const isFull = spotsLeft <= 0

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6" style={{ color: '#111' }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${levelColors[event.mushroom_level] ?? 'bg-gray-100 text-gray-700'}`}>
              Lv {event.mushroom_level} 蘑菇
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${isFull ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              {isFull ? '已滿' : `還差 ${spotsLeft} 人`}
            </span>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <Clock size={14} />
            <span>{localTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-900">
            <Users size={14} />
            <span>發起人：{event.creator_nickname}｜{joins.length}/{event.max_players} 人</span>
          </div>
          {event.note && (
            <div className="flex items-center gap-2 text-sm text-gray-900">
              <MapPin size={14} />
              <span>{event.note}</span>
            </div>
          )}
        </div>

        {joins.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-400 mb-1">已加入的玩家</p>
            <div className="flex flex-wrap gap-1">
              {joins.map((j) => (
                <span key={j.id} className="bg-green-50 text-green-700 text-xs px-2 py-0.5 rounded-full">
                  {j.player_nickname}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isFull && (
          <form onSubmit={handleJoin} className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="輸入你的暱稱加入"
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
        )}
      </div>
    </div>,
    document.body
  )
}
