'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TheftSubmission } from '@/types/theft'

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
    occurred_at: ''
  })
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formData.latitude !== 0 && (
        <div className="bg-green-50 p-3 rounded-md">
          <p className="text-sm text-green-800">
            📍 Location set: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
          </p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          What was stolen? *
        </label>
        <input
          type="text"
          required
          value={formData.item_stolen}
          onChange={(e) => setFormData({ ...formData, item_stolen: e.target.value })}
          placeholder="e.g., iPhone 15, Wallet, Laptop"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the incident..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Date occurred (optional)
        </label>
        <input
          type="date"
          value={formData.occurred_at}
          onChange={(e) => setFormData({ ...formData, occurred_at: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="bg-red-50 p-3 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? 'Submitting...' : 'Submit Report'}
      </button>
    </form>
  )
}
