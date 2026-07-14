export interface PettyTheft {
  id: string
  location: {
    type: 'Point'
    coordinates: [number, number] // [longitude, latitude]
  }
  item_stolen: string
  category: string
  description?: string
  occurred_at?: string
  created_at: string
}

export interface TheftSubmission {
  latitude: number
  longitude: number
  item_stolen: string
  category: string
  description?: string
  occurred_at?: string
}

export type TheftCategory = 'phone' | 'wallet' | 'laptop' | 'bag' | 'bicycle' | 'watch' | 'others'

export const CATEGORY_LABELS: Record<TheftCategory, string> = {
  phone: 'Phone',
  wallet: 'Wallet',
  laptop: 'Laptop',
  bag: 'Bag',
  bicycle: 'Bicycle',
  watch: 'Watch',
  others: 'Others'
}

export const CATEGORY_COLORS: Record<TheftCategory, string> = {
  phone: '#3b82f6',    // blue
  wallet: '#ef4444',   // red
  laptop: '#f59e0b',   // amber
  bag: '#10b981',      // green
  bicycle: '#8b5cf6',  // purple
  watch: '#ec4899',    // pink
  others: '#6b7280'    // gray
}
