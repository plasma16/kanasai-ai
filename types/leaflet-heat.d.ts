declare module 'leaflet.heat' {
  import L from 'leaflet'
  
  interface HeatLayerOptions {
    radius?: number
    blur?: number
    maxZoom?: number
    max?: number
    minOpacity?: number
    gradient?: { [key: number]: string }
  }
  
  function heatLayer(
    latlngs: Array<[number, number, number?]>,
    options?: HeatLayerOptions
  ): L.Layer
  
  export default heatLayer
}
