'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useLang } from '@/lib/LangContext'
import { t } from '@/lib/i18n'

type Props = {
  lat: number
  lng: number
  onClose: () => void
  onCreated: () => void
}

export default function CreateEventModal({ lat, lng, onClose, onCreated }: Props) {
  const { lang } = useLang()
  const T = t[lang]
  const [nickname, setNickname] = useState('')
  const [level, setLevel] = useState(1)
  const [maxPlayers, setMaxPlayers] = useState(5)
  const [scheduledAt, setScheduledAt] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname || !scheduledAt) return
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase.from('mushroom_events').insert({
        lat,
        lng,
        mushroom_level: level,
        max_players: maxPlayers,
        scheduled_at: new Date(scheduledAt).toISOString(),
        creator_nickname: nickname,
        note: note || null,
        status: 'open',
      })
      if (error) throw error
      onCreated()
    } catch (err) {
      console.error(err)
      alert(T.createFailed)
    } finally {
      setLoading(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md p-6" style={{ color: '#111' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-green-700">{T.modalTitle}</h2>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <p className="text-xs text-gray-400 mb-4">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-900">{T.nickname}</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder={T.nicknamePlaceholder}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-900">{T.mushroomLevel}</label>
              <select
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5].map((l) => (
                  <option key={l} value={l}>Lv {l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-900">{T.maxPlayers}</label>
              <input
                type="number"
                min={2}
                max={20}
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">{T.scheduleTime}</label>
            <input
              type="datetime-local"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-900">{T.note}</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder={T.notePlaceholder}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl disabled:opacity-50"
          >
            {loading ? T.publishing : T.publish}
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}
