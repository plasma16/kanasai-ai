'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TheftSubmission } from '@/types/theft'

// Common stolen items for quick selection
const COMMON_STOLEN_ITEMS = [
  'CashCard',
  'iPhone',
  'Samsung Phone',
  'Wallet',
  'Laptop',
  'iPad/Tablet',
  'Backpack/Bag',
  'Bicycle',
  'Watch',
  'Earphones/AirPods',
  'Sunglasses',
  'Keys',
  'Umbrella',
  'Groceries',
  'Package/Delivery',
  'Other'
]

interface SubmissionFormProps {
  onSuccess: () => void
  initialLocation?: { lat: number; lng: number }
}

export default function SubmissionForm({ onSuccess, initialLocation }: SubmissionFormProps) {
  const [formData, setFormData] = useState<TheftSubmission>({
    latitude: initialLocation?.lat || 0,
    longitude: initialLocation?.lng || 0,
    item_stolen: '',
    description: '',
    occurred_at: new Date().toISOString().split('T')[0],
    occurred_time: ''
  })
  
  // Update form data when initialLocation changes (when user clicks map)
  useEffect(() => {
    if (initialLocation) {
      setFormData(prev => ({
        ...prev,
        latitude: initialLocation.lat,
        longitude: initialLocation.lng
      }))
    }
  }, [initialLocation])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    if (!formData.item_stolen.trim()) {
      setError('Please specify what was stolen')
      setSubmitting(false)
      return
    }

    if (formData.latitude === 0 || formData.longitude === 0) {
      setError('Please click on the map to set the location')
      setSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('petty_thefts')
        .insert({
          location: `POINT(${formData.longitude} ${formData.latitude})`,
          item_stolen: formData.item_stolen,
          description: formData.description || null,
          occurred_at: formData.occurred_at || null
        })

      if (error) throw error
      
      onSuccess()
    } catch (err) {
      setError('Failed to submit report. Please try again.')
      console.error('Submission error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const hasLocation = formData.latitude !== 0 && formData.longitude !== 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Location Status */}
      <div className={`p-3 rounded-md ${hasLocation ? 'bg-blue-800' : 'bg-yellow-900'}`}>
        <p className={`text-sm ${hasLocation ? 'text-blue-200' : 'text-yellow-200'}`}>
          {hasLocation ? (
            <>📍 Location set: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</>
          ) : (
            <>⚠️ Please click on the map to select theft location</>
          )}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-1">
          What was stolen? *
        </label>
        <input
          type="text"
          required
          list="common-items"
          value={formData.item_stolen}
          onChange={(e) => setFormData({ ...formData, item_stolen: e.target.value })}
          placeholder="e.g., iPhone 15, Wallet, Laptop"
          className="w-full px-3 py-2 bg-blue-800 border border-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-400"
        />
        <datalist id="common-items">
          {COMMON_STOLEN_ITEMS.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
        <p className="text-xs text-blue-400 mt-1">💡 Select from common items or type your own</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-1">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the incident..."
          rows={3}
          className="w-full px-3 py-2 bg-blue-800 border border-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-blue-400"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-1">
          Date occurred *
        </label>
        <input
          type="date"
          required
          value={formData.occurred_at}
          onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
          className="w-full px-3 py-2 bg-blue-800 border border-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-blue-200 mb-1">
          Time occurred (optional)
        </label>
        <input
          type="time"
          value={formData.occurred_time}
          onChange={(e) => setFormData({ ...formData, occurred_time: e.target.value })}
          className="w-full px-3 py-2 bg-blue-800 border border-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-blue-400 mt-1">💡 Approximate time helps with heat map accuracy</p>
      </div>

      {error && (
        <div className="bg-red-900 p-3 rounded-md">
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !hasLocation}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Submitting...' : !hasLocation ? 'Select Location First' : 'Submit Report'}
      </button>
    </form>
  )
}
