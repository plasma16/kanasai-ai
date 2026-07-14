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
    setDateRange({ from: '', to: '' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 relative">
      {/* Animated background blobs for glassmorphism depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'report'
                ? 'bg-white/20 backdrop-blur-md text-white shadow-lg shadow-blue-500/25 border border-white/30'
                : 'bg-white/5 backdrop-blur-sm text-blue-200 hover:bg-white/10 border border-white/10'
            }`}
          >
            📝 Report Theft
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === 'view'
                ? 'bg-white/20 backdrop-blur-md text-white shadow-lg shadow-blue-500/25 border border-white/30'
                : 'bg-white/5 backdrop-blur-sm text-blue-200 hover:bg-white/10 border border-white/10'
            }`}
          >
            🗺️ View Heat Map
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Report Tab: Map on top, Form below */}
          {activeTab === 'report' && (
            <>
              {/* Top: Map for location selection */}
              <div className="w-full">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="p-4 bg-white/5 backdrop-blur-sm border-b border-white/20">
                    <h3 className="text-lg font-semibold text-white">📍 Select Location</h3>
                    <p className="text-sm text-blue-200 mt-1">Click on the map to pin the theft location</p>
                  </div>
                  <HeatMap 
                    key={refreshKey}
                    onMapClick={handleMapClick}
                    selectedLocation={selectedLocation}
                    hideExistingThefts={true}
                  />
                </div>
              </div>

              {/* Bottom: Submission Form */}
              <div className="w-full">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <h2 className="text-2xl font-bold text-white mb-6">Report a Theft</h2>
                  <div className="mb-6 p-4 bg-blue-500/20 backdrop-blur-sm rounded-xl border border-blue-400/30">
                    <p className="text-blue-100">
                      💡 <strong>Tip:</strong> Click on the map above to select the theft location, then fill out the form below.
                    </p>
                  </div>
                  <SubmissionForm 
                    onSuccess={handleSubmissionSuccess}
                    initialLocation={selectedLocation}
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
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <h2 className="text-lg font-semibold text-white mb-3">Filters</h2>
                  <FilterPanel
                    dateRange={dateRange}
                    onDateRangeChange={setDateRange}
                    onReset={handleResetFilters}
                  />
                </div>
              </div>

              {/* Right: Heat Map */}
              <div className="w-full lg:w-2/3">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <HeatMap 
                    key={refreshKey}
                    onMapClick={handleMapClick}
                    selectedLocation={selectedLocation}
                    filters={{ dateFrom: dateRange.from, dateTo: dateRange.to }}
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
