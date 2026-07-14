'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import SubmissionForm from '@/components/SubmissionForm'
import Header from '@/components/Header'
import FilterPanel from '@/components/FilterPanel'

// Dynamically import Leaflet components to avoid SSR issues
const HeatMap = dynamic(() => import('@/components/HeatMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-blue-900 rounded-lg">
      <p className="text-blue-200">Loading map...</p>
    </div>
  )
})

export default function Home() {
  const [showForm, setShowForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | undefined>()
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [showFilters, setShowFilters] = useState(false)

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng })
    setShowForm(true)
  }

  const handleSubmissionSuccess = () => {
    setShowForm(false)
    setSelectedLocation(undefined)
    setRefreshKey(prev => prev + 1)
  }

  const handleResetFilters = () => {
    setSelectedCategory('all')
    setDateRange({ from: '', to: '' })
  }

  return (
    <div className="min-h-screen bg-blue-950">
      <Header onAddClick={() => setShowForm(true)} />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full bg-blue-900 text-blue-200 py-2 px-4 rounded-lg border border-blue-800"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Filters + Form */}
          <div className={`w-full lg:w-1/3 ${(showFilters || !showForm) ? 'block' : 'hidden lg:block'}`}>
            {/* Filters Panel */}
            <div className="bg-blue-900 rounded-lg shadow-lg p-4 border border-blue-800 mb-4">
              <h2 className="text-lg font-semibold text-white mb-3">Filters</h2>
              <FilterPanel
                selectedCategory={selectedCategory}
                dateRange={dateRange}
                onCategoryChange={setSelectedCategory}
                onDateRangeChange={setDateRange}
                onReset={handleResetFilters}
              />
            </div>

            {/* Submission Form */}
            {showForm ? (
              <div className="bg-blue-900 rounded-lg shadow-lg p-4 border border-blue-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Report Theft</h2>
                  <button 
                    onClick={() => {
                      setShowForm(false)
                      setSelectedLocation(undefined)
                    }}
                    className="text-blue-300 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                <SubmissionForm 
                  onSuccess={handleSubmissionSuccess}
                  initialLocation={selectedLocation}
                />
              </div>
            ) : (
              <div className="bg-blue-900 rounded-lg shadow-lg p-4 border border-blue-800">
                <h2 className="text-xl font-semibold text-white mb-4">How to Use</h2>
                <ol className="space-y-3 text-blue-200">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                    <span>Click the map to pin a theft location</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                    <span>Fill in what was stolen</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                    <span>Submit to add to the heat map</span>
                  </li>
                </ol>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-500 transition-colors shadow-lg"
                >
                  + Report a Theft
                </button>
              </div>
            )}
          </div>

          {/* Map Section */}
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
        </div>
      </main>
    </div>
  )
}
