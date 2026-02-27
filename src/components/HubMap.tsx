'use client'

import { useEffect, useRef } from 'react'
import { Hub } from '@/types/hub'

interface MapProps {
  hubs: Hub[]
  selectedHub: Hub | null
  onSelectHub: (hub: Hub) => void
}

export default function HubMap({ hubs, selectedHub, onSelectHub }: MapProps) {
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Record<string, any>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (mapRef.current) return // Already initialized

    let isMounted = true

    import('leaflet').then(L => {
      if (!isMounted || mapRef.current) return

      // Fix default marker icon paths for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        center: [7.9465, -1.0232], // Center of Ghana
        zoom: 7,
        zoomControl: false,
      })

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map)

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map)

      // Custom marker icon
      const defaultIcon = (verified: boolean) => L.divIcon({
        html: `
          <div style="
            width: 28px; height: 28px;
            background: ${verified ? '#F4B942' : '#444'};
            border: 2px solid ${verified ? '#F4B942' : '#666'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          "></div>
        `,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      })

      // Add markers
      hubs.forEach(hub => {
        const marker = L.marker([hub.coordinates.lat, hub.coordinates.lng], {
          icon: defaultIcon(hub.verified),
        })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: 'DM Sans', sans-serif; min-width: 180px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <strong style="font-size: 14px; color: #fff;">${hub.name}</strong>
                ${hub.verified ? '<span style="color: #F4B942; font-size: 12px;">✓</span>' : ''}
              </div>
              <p style="font-size: 12px; color: #888; margin: 0 0 6px;">${hub.neighborhood}, ${hub.city}</p>
              <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                ${hub.tags.slice(0, 2).map(t => `<span style="font-size: 11px; padding: 2px 6px; background: #333; border-radius: 4px; color: #aaa;">${t}</span>`).join('')}
              </div>
            </div>
          `)

        marker.on('click', () => onSelectHub(hub))
        markersRef.current[hub.id] = { marker, L, icon: defaultIcon }
      })

      mapRef.current = { map, L, defaultIcon }
    })

    return () => {
      isMounted = false
      if (mapRef.current?.map) {
        mapRef.current.map.remove()
        mapRef.current = null
        markersRef.current = {}
      }
    }
  }, []) // eslint-disable-line

  // Fly to selected hub
  useEffect(() => {
    if (!mapRef.current || !selectedHub) return
    const { map } = mapRef.current
    map.flyTo([selectedHub.coordinates.lat, selectedHub.coordinates.lng], 13, {
      duration: 1.2,
      easeLinearity: 0.25,
    })
    const markerData = markersRef.current[selectedHub.id]
    if (markerData?.marker) {
      markerData.marker.openPopup()
    }
  }, [selectedHub])

  // Update markers when hubs change (filtering)
  useEffect(() => {
    if (!mapRef.current) return
    const { map, L, defaultIcon } = mapRef.current

    // Remove all existing markers
    Object.values(markersRef.current).forEach((m: any) => m.marker.remove())
    markersRef.current = {}

    // Re-add filtered markers
    hubs.forEach(hub => {
      const icon = L.divIcon({
        html: `
          <div style="
            width: 28px; height: 28px;
            background: ${hub.verified ? '#F4B942' : '#444'};
            border: 2px solid ${hub.verified ? '#F4B942' : '#666'};
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          "></div>
        `,
        className: '',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      })

      const marker = L.marker([hub.coordinates.lat, hub.coordinates.lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: 'DM Sans', sans-serif; min-width: 180px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
              <strong style="font-size: 14px; color: #fff;">${hub.name}</strong>
              ${hub.verified ? '<span style="color: #F4B942; font-size: 12px;">✓</span>' : ''}
            </div>
            <p style="font-size: 12px; color: #888; margin: 0 0 6px;">${hub.neighborhood}, ${hub.city}</p>
            <div style="display: flex; gap: 4px; flex-wrap: wrap;">
              ${hub.tags.slice(0, 2).map(t => `<span style="font-size: 11px; padding: 2px 6px; background: #333; border-radius: 4px; color: #aaa;">${t}</span>`).join('')}
            </div>
          </div>
        `)

      marker.on('click', () => onSelectHub(hub))
      markersRef.current[hub.id] = { marker }
    })

    // Fit bounds if multiple hubs
    if (hubs.length > 1) {
      const bounds = L.latLngBounds(hubs.map(h => [h.coordinates.lat, h.coordinates.lng]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
    }
  }, [hubs]) // eslint-disable-line

  return (
    <div className="relative rounded-xl overflow-hidden border border-surface-border" style={{ height: '480px' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-surface-card/90 backdrop-blur-sm border border-surface-border rounded-lg px-3 py-2 text-xs font-body text-zinc-400 space-y-1 z-[1000]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-ghana-gold" />
          <span>Verified Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-zinc-600" />
          <span>Unverified</span>
        </div>
      </div>
    </div>
  )
}
