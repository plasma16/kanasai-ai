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
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-blue-200 mb-2">Date Range</h3>
        <div className="space-y-1">
          {presetRanges.map((preset) => (
            <button
              key={preset.days}
              onClick={() => handlePresetClick(preset.days)}
              className="block w-full text-left px-2 py-1 text-sm text-blue-200 hover:bg-blue-800 rounded transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="block w-full text-left px-2 py-1 text-sm text-blue-200 hover:bg-blue-800 rounded transition-colors"
          >
            Custom Range
          </button>
        </div>

        {showDatePicker && (
          <div className="mt-2 space-y-2">
            <div>
              <label className="text-xs text-blue-300">From</label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value })}
                className="w-full px-2 py-1 bg-blue-800 border border-blue-700 text-white rounded text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-blue-300">To</label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value })}
                className="w-full px-2 py-1 bg-blue-800 border border-blue-700 text-white rounded text-sm"
              />
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full px-3 py-1.5 bg-blue-800 text-blue-200 rounded text-sm hover:bg-blue-700 transition-colors"
      >
        Reset Filters
      </button>
    </div>
  )
}
