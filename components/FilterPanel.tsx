'use client'

import { useState } from 'react'

interface FilterPanelProps {
  dateRange: { from: string; to: string }
  onDateRangeChange: (range: { from: string; to: string }) => void
  onReset: () => void
}

export default function FilterPanel({
  dateRange,
  onDateRangeChange,
  onReset
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const presetRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'All time', days: 0 }
  ]

  const handlePresetClick = (days: number) => {
    if (days === 0) {
      onDateRangeChange({ from: '', to: '' })
    } else {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - days)
      onDateRangeChange({
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0]
      })
    }
    setShowDatePicker(false)
    setIsOpen(false) // Close dropdown after selection
  }

  const getActiveFilterLabel = () => {
    if (!dateRange.from && !dateRange.to) return 'All time'
    if (dateRange.from && dateRange.to) {
      const fromDate = new Date(dateRange.from)
      const toDate = new Date(dateRange.to)
      const diffDays = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24))
      if (diffDays === 7) return 'Last 7 days'
      if (diffDays === 30) return 'Last 30 days'
      if (diffDays === 90) return 'Last 90 days'
      return `${dateRange.from} to ${dateRange.to}`
    }
    return 'Custom range'
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 text-white hover:bg-white/15 transition-all duration-300 flex items-center justify-between"
      >
        <span className="text-sm font-medium">🔽 Filters: {getActiveFilterLabel()}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-2xl p-4 z-10">
          <h3 className="text-sm font-semibold text-white mb-3">Date Range</h3>
          <div className="space-y-2">
            {presetRanges.map((preset) => (
              <button
                key={preset.days}
                onClick={() => handlePresetClick(preset.days)}
                className="block w-full text-left px-3 py-2 text-sm text-blue-200 hover:bg-white/10 rounded-lg transition-colors"
              >
                {preset.label}
              </button>
            ))}
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="block w-full text-left px-3 py-2 text-sm text-blue-200 hover:bg-white/10 rounded-lg transition-colors"
            >
              Custom Range
            </button>
          </div>

          {showDatePicker && (
            <div className="mt-3 space-y-2 pt-3 border-t border-white/20">
              <div>
                <label className="text-xs text-blue-300">From</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                  className="w-full px-2 py-1 bg-blue-800/50 border border-blue-700 text-white rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-blue-300">To</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
                  className="w-full px-2 py-1 bg-blue-800/50 border border-blue-700 text-white rounded text-sm"
                />
              </div>
            </div>
          )}

          <button
            onClick={() => { onReset(); setIsOpen(false) }}
            className="w-full mt-3 px-3 py-2 bg-blue-800/50 text-blue-200 rounded-lg text-sm hover:bg-blue-700/50 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
