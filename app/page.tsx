'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import SubmissionForm from '@/components/SubmissionForm'
import Header from '@/components/Header'
import FilterPanel from '@/components/FilterPanel'

// Dynamically import HeatMap to avoid SSR issues with Leaflet (window is not defined)
const HeatMap = dynamic(() => import('@/components/HeatMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 md:h-96 flex items-center justify-center bg-blue-900 rounded-lg">
      <p className="text-blue-200">Loading map...</p>
    </div>
  )
})

export default function Home() {
  const [activeTab, setActiveTab] = useState<'report' | 'view'>('report')
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setActiveTab('report')
  }

  const handleSubmissionSuccess = () => {
    setSelectedLocation(undefined)
    setRefreshKey(prev => prev + 1)
    setActiveTab('view') // Switch to view tab after submission
  }

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setDateRange({ from: '', to: '' })
  }

  return (
    <div className="min-h-screen bg-blue-950">
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
            }`}
          >
            📝 Report Theft
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-colors ${
              activeTab === 'view'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-900 text-blue-200 hover:bg-blue-800'
            }`}
          >
            🗺️ View Heat Map
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Report Tab: Form + Map side by side */}
          {activeTab === 'report' && (
            <>
              {/* Left: Submission Form */}
              <div className="w-full lg:w-1/2">
                <div className="bg-blue-900 rounded-lg shadow-lg p-6 border border-blue-800">
                  <h2 className="text-2xl font-bold text-white mb-6">Report a Theft</h2>
                  <div className="mb-6 p-4 bg-blue-800 rounded-lg">
                    <p className="text-blue-200">
                      💡 <strong>Tip:</strong> Click on the map to select the theft location, then fill out the form.
                    </p>
                  </div>
                  <SubmissionForm 
                    onSuccess={handleSubmissionSuccess}
                    initialLocation={selectedLocation}
                  />
                </div>
              </div>

              {/* Right: Map for location selection */}
              <div className="w-full lg:w-1/2">
                <div className="bg-blue-900 rounded-lg shadow-lg overflow-hidden border border-blue-800">
                  <div className="p-4 bg-blue-800 border-b border-blue-700">
                    <h3 className="text-lg font-semibold text-white">📍 Select Location</h3>
                    <p className="text-sm text-blue-200 mt-1">Click on the map to pin the theft location</p>
                  </div>
                  <HeatMap 
                    key={refreshKey}
                    onMapClick={handleMapClick}
                    selectedLocation={selectedLocation}
                    hideExistingThefts={true} // Don't fetch data, just pick location
                  />
                </div>
              </div>
            </>
          )}

          {/* View Tab: Filters + Heat Map */}
          {activeTab === 'view' && (
            <>
              {/* Left: Filters */}
              <div className="w-full lg:w-1/3">
                <div className="bg-blue-900 rounded-lg shadow-lg p-4 border border-blue-800">
                  <h2 className="text-lg font-semibold text-white mb-3">Filters</h2>
                  <FilterPanel
                    selectedCategory={selectedCategory}
                    dateRange={dateRange}
                    onCategoryChange={setSelectedCategory}
                    onDateRangeChange={setDateRange}
                    onReset={handleResetFilters}
                  />
                </div>
              </div>

              {/* Right: Heat Map */}
              <div className="w-full lg:w-2/3">
                <div className="bg-blue-900 rounded-lg shadow-lg overflow-hidden border border-blue-800">
                  <HeatMap 
                    key={refreshKey}
                    onMapClick={handleMapClick}
                    selectedLocation={selectedLocation}
                    filters={{ category: selectedCategory, dateFrom: dateRange.from, dateTo: dateRange.to }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
