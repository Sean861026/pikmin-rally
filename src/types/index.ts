export type MushroomEvent = {
  id: string
  lat: number
  lng: number
  mushroom_level: number
  scheduled_at: string
  max_players: number
  note: string | null
  creator_nickname: string
  status: 'open' | 'full' | 'done'
  created_at: string
  join_count?: number
}

export type EventJoin = {
  id: string
  event_id: string
  player_nickname: string
  joined_at: string
}
