'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'

interface HeatMapLayerProps {
  points: Array<{ lat: number; lng: number; intensity: number }>
}

export function HeatMapLayer({ points }: HeatMapLayerProps) {
  const map = useMap()

  useEffect(() => {
    if (!points.length) return

    const heatData = points.map(p => [p.lat, p.lng, p.intensity] as [number, number, number])
    
    // @ts-ignore - leaflet.heat types not available
    const heatLayer = L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      gradient: {
        0.0: 'blue',
        0.5: 'yellow',
        1.0: 'red'
      }
    }).addTo(map)

    return () => {
      map.removeLayer(heatLayer)
    }
  }, [map, points])

  return null
}
