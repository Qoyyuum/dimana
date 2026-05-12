<template>
  <div ref="mapContainer" class="map-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import maplibregl, { type LngLatBoundsLike } from 'maplibre-gl'

// Store loaded GeoJSON data for bounding box lookups
let geoData: Record<string, any> = {}

const props = defineProps<{
  highlightId?: number | null
  highlightLayer?: 'mukims' | 'kampongs' | 'districts'
  clickable?: boolean
  clickLayer?: 'mukims' | 'kampongs' | 'districts'
  showLabels?: boolean
}>()

const emit = defineEmits<{
  (e: 'areaClick', id: string, name: string): void
  (e: 'mapReady'): void
}>()

const mapContainer = ref<HTMLDivElement>()
let map: maplibregl.Map | null = null

const BRUNEI_CENTER: [number, number] = [114.95, 4.55]
const BRUNEI_ZOOM = 9

onMounted(async () => {
  if (!mapContainer.value) return

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      },
      layers: [
        {
          id: 'osm-tiles',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    center: BRUNEI_CENTER,
    zoom: BRUNEI_ZOOM,
    minZoom: 7,
    maxZoom: 15,
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-right')

  map.on('load', async () => {
    await addGeoJsonLayers()
    emit('mapReady')
  })
})

async function addGeoJsonLayers() {
  if (!map) return

  // Load GeoJSON data
  const [districtsRes, mukimsRes, kampongsRes] = await Promise.all([
    fetch('/data/districts.geojson'),
    fetch('/data/mukims.geojson'),
    fetch('/data/kampongs.geojson'),
  ])

  const districts = await districtsRes.json()
  const mukims = await mukimsRes.json()
  const kampongs = await kampongsRes.json()

  // Store for bbox lookups
  geoData = { districts, mukims, kampongs }

  // Add sources
  map.addSource('districts', { type: 'geojson', data: districts })
  map.addSource('mukims', { type: 'geojson', data: mukims })
  map.addSource('kampongs', { type: 'geojson', data: kampongs })

  // District borders (always visible)
  map.addLayer({
    id: 'districts-border',
    type: 'line',
    source: 'districts',
    paint: {
      'line-color': '#1e40af',
      'line-width': 2.5,
      'line-opacity': 0.8,
    },
  })

  // Mukim fill (transparent by default)
  map.addLayer({
    id: 'mukims-fill',
    type: 'fill',
    source: 'mukims',
    paint: {
      'fill-color': '#3b82f6',
      'fill-opacity': 0,
    },
  })

  // Mukim borders
  map.addLayer({
    id: 'mukims-border',
    type: 'line',
    source: 'mukims',
    paint: {
      'line-color': '#6b7280',
      'line-width': 1,
      'line-opacity': 0.5,
    },
  })

  // Kampong fill (transparent by default)
  map.addLayer({
    id: 'kampongs-fill',
    type: 'fill',
    source: 'kampongs',
    paint: {
      'fill-color': '#3b82f6',
      'fill-opacity': 0,
    },
  })

  // Kampong borders
  map.addLayer({
    id: 'kampongs-border',
    type: 'line',
    source: 'kampongs',
    paint: {
      'line-color': '#9ca3af',
      'line-width': 0.5,
      'line-opacity': 0.3,
    },
  })

  // Highlight layer for mukims
  map.addLayer({
    id: 'mukims-highlight',
    type: 'fill',
    source: 'mukims',
    paint: {
      'fill-color': '#7c3aed',
      'fill-opacity': 0.6,
    },
    filter: ['==', 'id', -1],
  })

  // Highlight layer for kampongs
  map.addLayer({
    id: 'kampongs-highlight',
    type: 'fill',
    source: 'kampongs',
    paint: {
      'fill-color': '#7c3aed',
      'fill-opacity': 0.6,
    },
    filter: ['==', 'id', -1],
  })

  // Highlight layer for districts
  map.addLayer({
    id: 'districts-highlight',
    type: 'fill',
    source: 'districts',
    paint: {
      'fill-color': '#7c3aed',
      'fill-opacity': 0.6,
    },
    filter: ['==', 'id', -1],
  })

  // Result correct layer
  map.addLayer({
    id: 'result-correct',
    type: 'fill',
    source: 'mukims',
    paint: {
      'fill-color': '#22c55e',
      'fill-opacity': 0.6,
    },
    filter: ['==', 'id', -1],
  })

  // Result wrong layer
  map.addLayer({
    id: 'result-wrong',
    type: 'fill',
    source: 'mukims',
    paint: {
      'fill-color': '#ef4444',
      'fill-opacity': 0.6,
    },
    filter: ['==', 'id', -1],
  })

  // Click handlers
  if (props.clickable) {
    const layerId = (props.clickLayer || 'mukims') + '-fill'
    map.on('click', layerId, (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0]
        const id = feature.properties?.id
        const name = feature.properties?.displayName || feature.properties?.name || ''
        emit('areaClick', String(id), name)
      }
    })

    map.on('mouseenter', layerId, () => {
      if (map) map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', layerId, () => {
      if (map) map.getCanvas().style.cursor = ''
    })
  }
}

function highlightArea(id: number | null, layer: string = 'mukims') {
  if (!map) return

  const highlightLayerId = layer + '-highlight'
  if (id !== null && id !== undefined) {
    map.setFilter(highlightLayerId, ['==', 'id', id])
  } else {
    map.setFilter(highlightLayerId, ['==', 'id', -1])
  }
}

function showResult(id: number, correct: boolean, layer: string = 'mukims') {
  if (!map) return

  const source = layer
  // Update the result layers to use correct source
  if (map.getLayer('result-correct')) {
    map.removeLayer('result-correct')
  }
  if (map.getLayer('result-wrong')) {
    map.removeLayer('result-wrong')
  }

  map.addLayer({
    id: 'result-correct',
    type: 'fill',
    source: source,
    paint: {
      'fill-color': '#22c55e',
      'fill-opacity': 0.6,
    },
    filter: correct ? ['==', 'id', id] : ['==', 'id', -1],
  })

  map.addLayer({
    id: 'result-wrong',
    type: 'fill',
    source: source,
    paint: {
      'fill-color': '#ef4444',
      'fill-opacity': 0.6,
    },
    filter: correct ? ['==', 'id', -1] : ['==', 'id', id],
  })
}

function clearHighlights() {
  if (!map) return
  map.setFilter('mukims-highlight', ['==', 'id', -1])
  map.setFilter('kampongs-highlight', ['==', 'id', -1])
  map.setFilter('districts-highlight', ['==', 'id', -1])
  if (map.getLayer('result-correct')) {
    map.setFilter('result-correct', ['==', 'id', -1])
  }
  if (map.getLayer('result-wrong')) {
    map.setFilter('result-wrong', ['==', 'id', -1])
  }
}

function computeBbox(coords: any): [number, number, number, number] {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity

  function walk(c: any) {
    if (typeof c[0] === 'number' && typeof c[1] === 'number' && (c.length === 2 || c.length === 3)) {
      if (c[0] < minLng) minLng = c[0]
      if (c[0] > maxLng) maxLng = c[0]
      if (c[1] < minLat) minLat = c[1]
      if (c[1] > maxLat) maxLat = c[1]
    } else {
      for (const item of c) walk(item)
    }
  }

  walk(coords)
  return [minLng, minLat, maxLng, maxLat]
}

function fitToFeatureById(id: number, layer: string = 'mukims') {
  if (!map || !geoData[layer]) return

  const feature = geoData[layer].features.find((f: any) => f.properties.id === id)
  if (!feature) return

  const [minLng, minLat, maxLng, maxLat] = computeBbox(feature.geometry.coordinates)
  const bounds: LngLatBoundsLike = [[minLng, minLat], [maxLng, maxLat]]

  map.fitBounds(bounds, {
    padding: { top: 80, bottom: 220, left: 40, right: 40 },
    maxZoom: 13,
    duration: 1200,
  })
}

function flyToArea(center: [number, number], zoom?: number) {
  if (!map) return
  map.flyTo({ center, zoom: zoom || 11, duration: 1000 })
}

function resetView() {
  if (!map) return
  map.flyTo({ center: BRUNEI_CENTER, zoom: BRUNEI_ZOOM, duration: 1000 })
}

function enableClickableLayer(layer: string) {
  if (!map) return

  const fillLayerId = layer + '-fill'
  // Make the fill layer clickable by giving it a slight opacity on hover
  map.setPaintProperty(fillLayerId, 'fill-opacity', [
    'case',
    ['boolean', ['feature-state', 'hover'], false],
    0.3,
    0.05,
  ])

  let hoveredId: number | null = null

  map.on('mousemove', fillLayerId, (e) => {
    if (!map) return
    if (e.features && e.features.length > 0) {
      if (hoveredId !== null) {
        map.setFeatureState({ source: layer, id: hoveredId }, { hover: false })
      }
      hoveredId = e.features[0].id as number
      map.setFeatureState({ source: layer, id: hoveredId }, { hover: true })
      map.getCanvas().style.cursor = 'pointer'
    }
  })

  map.on('mouseleave', fillLayerId, () => {
    if (!map) return
    if (hoveredId !== null) {
      map.setFeatureState({ source: layer, id: hoveredId }, { hover: false })
    }
    hoveredId = null
    map.getCanvas().style.cursor = ''
  })

  map.on('click', fillLayerId, (e) => {
    if (e.features && e.features.length > 0) {
      const feature = e.features[0]
      const id = feature.properties?.id
      const name = feature.properties?.displayName || feature.properties?.name || ''
      emit('areaClick', String(id), name)
    }
  })
}

watch(() => props.highlightId, (newId) => {
  highlightArea(newId ?? null, props.highlightLayer || 'mukims')
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})

defineExpose({
  highlightArea,
  showResult,
  clearHighlights,
  flyToArea,
  resetView,
  enableClickableLayer,
  fitToFeatureById,
})
</script>
