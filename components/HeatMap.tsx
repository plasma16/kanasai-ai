'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, useMap, CircleMarker, Marker } from 'react-leaflet'
import { HeatMapLayer } from './HeatMapLayer'
import 'leaflet/dist/leaflet.css'
import { supabase } from '@/lib/supabase'
import { PettyTheft } from '@/types/theft'
import L from 'leaflet'

// Singapore bounds
const SINGAPORE_CENTER: [number, number] = [1.3521, 103.8198]
const SINGAPORE_ZOOM = 12

interface HeatMapProps {
  onMapClick?: (lat: number, lng: number) => void
  selectedLocation?: { lat: number; lng: number }
}

// Custom pin icon for selected location
const createPinIcon = () => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      background-color: #3b82f6;
      width: 20px;
      height: 20px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);      position: relative;
    ">
      <div style="
        background-color: white;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      "></div>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -20]
  })
}

function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMap()
  
  useEffect(() => {
    if (!onMapClick) return
    
    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    }
    
    map.on('click', handleClick)
    return () => {
      map.off('click', handleClick)
    }
  }, [map, onMapClick])
  
  return null
}

export default function HeatMap({ onMapClick, selectedLocation }: HeatMapProps) {
  const [thefts, setThefts] = useState<PettyTheft[]>([])
  const [loading, setLoading] = useState(true)

  const fetchThefts = useCallback(async () => {
    const { data, error } = await supabase
      .from('petty_thefts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching thefts:', error)
    } else {
      setThefts(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchThefts()
  }, [fetchThefts])

  const heatPoints = thefts.map(theft => ({
    lat: theft.location.coordinates[1],
    lng: theft.location.coordinates[0],
    intensity: 1
  }))

  if (loading) {
    return (
      <div className="h-64 md:h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Loading theft data...</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={SINGAPORE_CENTER}
      zoom={SINGAPORE_ZOOM}
      className="h-64 md:h-96 w-full rounded-lg"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      <HeatMapLayer points={heatPoints} />
      
      {/* Existing theft markers */}
      {thefts.map((theft) => (
        <CircleMarker
          key={theft.id}
          center={[theft.location.coordinates[1], theft.location.coordinates[0]]}
          radius={8}
          pathOptions={{
            fillColor: '#ef4444',
            fillOpacity: 0.7,
            color: '#dc2626',
            weight: 1
          }}
        />
      ))}
      
      {/* Selected location pin */}
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={createPinIcon()}
        />
      )}
    </MapContainer>
  )
}
