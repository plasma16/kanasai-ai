export interface PettyTheft {
  id: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  item_stolen: string
  description?: string
  occurred_at?: string
  occurred_time?: string // Optional time field
  created_at: string
  ip_address?: string // Track user IP for moderation
}

export interface TheftSubmission {
  latitude: number
  longitude: number
  item_stolen: string
  description?: string
  occurred_at?: string
  occurred_time?: string  // Optional time field
}
