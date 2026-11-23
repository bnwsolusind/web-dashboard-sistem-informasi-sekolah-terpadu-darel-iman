import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
 MapPin,
 Crosshair,
 Search,
 ExternalLink,
 Loader2,
 RefreshCw,
 Compass,
 CheckCircle2,
 AlertCircle,
 Move,
 CheckSquare,
 Square
} from 'lucide-react'
import {
 getMapboxToken,
 getMapTileConfig,
 searchAddressGeocoding,
 reverseGeocodeCoords,
} from '../../utils/mapboxHelper'

/**
 * InteractiveMapPicker
 * Komponen peta interaktif untuk sinkronisasi dua arah:
 * 1. Mendukung Mapbox (dengan token dinamis dari database) serta fallback ke OpenStreetMap.
 * 2. Ketik alamat di formulir -> Pin otomatis berpindah ke titik lokasi tersebut (multi-stage geocoding dengan debounce).
 * 3. Geser pin / klik peta -> Koordinat (lat/lng) dan seluruh field alamat (jalan, kelurahan, kecamatan, kota, provinsi, kode pos) otomatis terisi!
 * 4. Opsi toggle: Pengguna bebas memilih apakah pin menimpa teks alamat formulir atau mempertahankan teks alamat manual.
 */
export default function InteractiveMapPicker({
 latitude,
 longitude,
 radiusMeter = 100,
 addressText = '',
 cityName = '',
 provinceName = '',
 triggerSearchKey = null,
 onLocationChange,
 onAddressDetected,
 className = ''
}) {
 const mapContainerRef = useRef(null)
 const mapInstanceRef = useRef(null)
 const markerRef = useRef(null)
 const circleRef = useRef(null)

 const [isLoaded, setIsLoaded] = useState(false)
 const [mapboxToken, setMapboxToken] = useState('')
 const tileLayerRef = useRef(null)
 const [customSearch, setCustomSearch] = useState('')
 const [isSearching, setIsSearching] = useState(false)
 const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
 const [lastDetectedAddress, setLastDetectedAddress] = useState('')
 const [searchFeedback, setSearchFeedback] = useState(null)
 const [syncAddressWithPin, setSyncAddressWithPin] = useState(true)

 // Ambil token Mapbox dinamis dari database
 useEffect(() => {
 let isMounted = true
 getMapboxToken().then((token) => {
 if (isMounted && token) {
 setMapboxToken(token)
 }
 })
 return () => {
 isMounted = false
 }
 }, [])

 // Refs to prevent unnecessary effect triggers & cycles
 const syncAddressWithPinRef = useRef(syncAddressWithPin)
 syncAddressWithPinRef.current = syncAddressWithPin

 const onLocationChangeRef = useRef(onLocationChange)
 onLocationChangeRef.current = onLocationChange

 const onAddressDetectedRef = useRef(onAddressDetected)
 onAddressDetectedRef.current = onAddressDetected

 // Flag to know if address change is from dragging pin, preventing circular geocoding
 const isInternalPinMoveRef = useRef(false)
 const lastGeocodedTextRef = useRef('')

 // Default coordinate (Padang, Sumbar if not specified)
 const currentLat = latitude !== '' && latitude !== null && !isNaN(Number(latitude))
 ? Number(latitude)
 : -0.9471
 const currentLng = longitude !== '' && longitude !== null && !isNaN(Number(longitude))
 ? Number(longitude)
 : 100.4172

 // 1. Dynamic Injection Leaflet CDN
 useEffect(() => {
 if (window.L) {
 setIsLoaded(true)
 return
 }

 if (!document.getElementById('leaflet-css')) {
 const link = document.createElement('link')
 link.id = 'leaflet-css'
 link.rel = 'stylesheet'
 link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
 document.head.appendChild(link)
 }

 if (!document.getElementById('leaflet-js')) {
 const script = document.createElement('script')
 script.id = 'leaflet-js'
 script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
 script.onload = () => setIsLoaded(true)
 script.onerror = () => console.error('Gagal memuat Leaflet CDN')
 document.head.appendChild(script)
 } else {
 const script = document.getElementById('leaflet-js')
 const handleLoad = () => setIsLoaded(true)
 script.addEventListener('load', handleLoad)
 return () => script.removeEventListener('load', handleLoad)
 }
 }, [])

 // Reverse geocoding function via Mapbox (fallback Nominatim OSM)
 const performReverseGeocode = useCallback(async (lat, lng, shouldUpdateFields = true) => {
 if (!lat || !lng) return
 setIsReverseGeocoding(true)

 try {
 const data = await reverseGeocodeCoords(lat, lng, mapboxToken)

 if (data) {
 const fullRoad = data.road || ''
 const display = data.displayName || ''
 const provinsi = data.province || ''
 const kota = data.city || ''
 const kecamatan = data.district || ''
 const kelurahan = data.subdistrict || ''
 const postcode = data.postalCode || ''

 const addressSummary = data.summary || [fullRoad, kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')
 setLastDetectedAddress(addressSummary || display)

 if (shouldUpdateFields) {
 isInternalPinMoveRef.current = true
 lastGeocodedTextRef.current = fullRoad || addressSummary

 onAddressDetectedRef.current?.({
 displayName: display,
 road: fullRoad || addressSummary,
 province: provinsi,
 city: kota,
 district: kecamatan,
 subdistrict: kelurahan,
 postalCode: postcode,
 summary: addressSummary
 })
 setSearchFeedback({
 type: 'success',
 text: `Alamat & koordinat berhasil disinkronkan (${data.source === 'mapbox' ? 'Mapbox' : 'OSM'}): ${addressSummary || display}`
 })
 } else {
 setSearchFeedback({
 type: 'info',
 text: `Koordinat diperbarui ke (${lat}, ${lng}). Teks alamat lama dipertahankan.`
 })
 }
 }
 } catch (err) {
 console.error('Reverse geocoding error:', err)
 setSearchFeedback({
 type: 'error',
 text: 'Gagal mendeteksi teks alamat dari koordinat baru.'
 })
 } finally {
 setIsReverseGeocoding(false)
 }
 }, [mapboxToken])

 // Update tile layer dynamically if mapboxToken is resolved after map load
 useEffect(() => {
 if (mapInstanceRef.current && mapboxToken && window.L) {
 if (tileLayerRef.current) {
 mapInstanceRef.current.removeLayer(tileLayerRef.current)
 }
 const tileCfg = getMapTileConfig(mapboxToken)
 const newLayer = window.L.tileLayer(tileCfg.url, {
 attribution: tileCfg.attribution,
 maxZoom: tileCfg.maxZoom,
 tileSize: tileCfg.tileSize,
 zoomOffset: tileCfg.zoomOffset,
 }).addTo(mapInstanceRef.current)
 tileLayerRef.current = newLayer
 }
 }, [mapboxToken])

 // 2. Initialize Map Instance (Only run once when Leaflet is loaded)
 useEffect(() => {
 if (!isLoaded || !window.L || !mapContainerRef.current || mapInstanceRef.current) return

 const L = window.L

 delete L.Icon.Default.prototype._getIconUrl
 L.Icon.Default.mergeOptions({
 iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
 iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
 shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
 })

 const initialLat = currentLat
 const initialLng = currentLng

 const map = L.map(mapContainerRef.current, {
 center: [initialLat, initialLng],
 zoom: 15,
 zoomControl: true,
 scrollWheelZoom: true,
 })

 const tileCfg = getMapTileConfig(mapboxToken)
 const tileLayer = L.tileLayer(tileCfg.url, {
 attribution: tileCfg.attribution,
 maxZoom: tileCfg.maxZoom,
 tileSize: tileCfg.tileSize,
 zoomOffset: tileCfg.zoomOffset,
 }).addTo(map)
 tileLayerRef.current = tileLayer

 // Draggable marker
 const marker = L.marker([initialLat, initialLng], {
 draggable: true,
 title: 'Geser pin ini untuk menentukan titik koordinat'
 }).addTo(map)

 // Geofencing Circle
 const circle = L.circle([initialLat, initialLng], {
 radius: Number(radiusMeter) || 100,
 color: '#059669',
 fillColor: '#10b981',
 fillOpacity: 0.18,
 weight: 2,
 }).addTo(map)

 // Event when marker is dragged -> updates lat/lng AND triggers reverse geocode
 marker.on('dragend', () => {
 const pos = marker.getLatLng()
 const newLat = Number(pos.lat.toFixed(7))
 const newLng = Number(pos.lng.toFixed(7))
 circle.setLatLng(pos)
 onLocationChangeRef.current?.({ lat: newLat, lng: newLng })
 isInternalPinMoveRef.current = true
 performReverseGeocode(newLat, newLng, syncAddressWithPinRef.current)
 })

 // Event when map is clicked -> updates lat/lng AND triggers reverse geocode
 map.on('click', (e) => {
 const newLat = Number(e.latlng.lat.toFixed(7))
 const newLng = Number(e.latlng.lng.toFixed(7))
 marker.setLatLng(e.latlng)
 circle.setLatLng(e.latlng)
 onLocationChangeRef.current?.({ lat: newLat, lng: newLng })
 isInternalPinMoveRef.current = true
 performReverseGeocode(newLat, newLng, syncAddressWithPinRef.current)
 })

 mapInstanceRef.current = map
 markerRef.current = marker
 circleRef.current = circle

 // Force resize after modal transition
 setTimeout(() => {
 map.invalidateSize()
 }, 350)

 return () => {
 map.remove()
 mapInstanceRef.current = null
 markerRef.current = null
 circleRef.current = null
 }
 }, [isLoaded, performReverseGeocode])

 // 3. Sync external lat/lng changes to map
 useEffect(() => {
 if (mapInstanceRef.current && markerRef.current && circleRef.current) {
 if (latitude !== '' && longitude !== '' && latitude !== null && longitude !== null) {
 const lat = Number(latitude)
 const lng = Number(longitude)
 if (!isNaN(lat) && !isNaN(lng)) {
 const currentMarkerPos = markerRef.current.getLatLng()
 if (
 Math.abs(currentMarkerPos.lat - lat) > 0.000001 ||
 Math.abs(currentMarkerPos.lng - lng) > 0.000001
 ) {
 markerRef.current.setLatLng([lat, lng])
 circleRef.current.setLatLng([lat, lng])
 mapInstanceRef.current.panTo([lat, lng])
 }
 }
 }
 }
 }, [latitude, longitude])

 // 4. Sync radiusMeter changes
 useEffect(() => {
 if (circleRef.current && radiusMeter) {
 const rad = Number(radiusMeter)
 if (!isNaN(rad) && rad > 0) {
 circleRef.current.setRadius(rad)
 }
 }
 }, [radiusMeter])

 // Invalidate map size periodically
 useEffect(() => {
 if (mapInstanceRef.current) {
 const timer = setTimeout(() => {
 mapInstanceRef.current?.invalidateSize()
 }, 400)
 return () => clearTimeout(timer)
 }
 }, [])

 /**
 * Multi-Stage Geocoding Search:
 * Mencoba mencari lokasi dengan bertingkat agar alamat yang diketik pasti menemukan titik di peta:
 * Level 1: [Alamat Lengkap, Kota, Provinsi]
 * Level 2: [Alamat tanpa No/RT/RW, Kota, Provinsi]
 * Level 3: [Nama Jalan, Kota]
 * Level 4: [Kota, Provinsi]
 */
 const executeSearch = useCallback(async (searchQuery, rawAddressText = '', shouldUpdateFields = false, isAuto = false) => {
 if (!searchQuery || !searchQuery.trim()) return
 setIsSearching(true)
 setSearchFeedback(null)

 try {
 const cleanAddress = (rawAddressText || searchQuery).trim()
 const cleanCity = (cityName || '').trim()
 const cleanProvince = (provinceName || '').trim()

 // Buat kandidat query bertingkat
 const candidates = []

 // 1. Full query
 candidates.push([cleanAddress, cleanCity, cleanProvince].filter(Boolean).join(', '))

 // 2. Query tanpa No / RT / RW
 const strippedRoad = cleanAddress
 .replace(/(no\.|nomor|rt\s*\d+|rw\s*\d+|blok\s*[a-z0-9]+)/gi, '')
 .replace(/\s+/g, ' ')
 .trim()
 if (strippedRoad && strippedRoad !== cleanAddress) {
 candidates.push([strippedRoad, cleanCity, cleanProvince].filter(Boolean).join(', '))
 }

 // 3. Hanya jalan + kota
 if (strippedRoad && cleanCity) {
 candidates.push(`${strippedRoad}, ${cleanCity}`)
 }

 // 4. Query input langsung
 candidates.push(searchQuery.trim())

 // 5. Fallback ke Kota + Provinsi jika ada
 if (cleanCity) {
 candidates.push([cleanCity, cleanProvince].filter(Boolean).join(', '))
 }

 // Hilangkan duplikat kandidat
 const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)))

 let matchedItem = null
 for (const candidate of uniqueCandidates) {
 const item = await searchAddressGeocoding(candidate, mapboxToken)
 if (item) {
 matchedItem = item
 break
 }
 }

 if (matchedItem) {
 const parsedLat = Number(Number(matchedItem.lat).toFixed(7))
 const parsedLng = Number(Number(matchedItem.lng).toFixed(7))

 // Pindahkan pin dan lingkaran di peta
 if (mapInstanceRef.current && markerRef.current && circleRef.current) {
 markerRef.current.setLatLng([parsedLat, parsedLng])
 circleRef.current.setLatLng([parsedLat, parsedLng])
 mapInstanceRef.current.setView([parsedLat, parsedLng], 16)
 }

 // Update koordinat ke form parent
 onLocationChangeRef.current?.({ lat: parsedLat, lng: parsedLng })

 const fullRoad = matchedItem.road || ''
 const display = matchedItem.displayName || ''
 const provinsi = matchedItem.province || ''
 const kota = matchedItem.city || ''
 const kecamatan = matchedItem.district || ''
 const kelurahan = matchedItem.subdistrict || ''
 const postcode = matchedItem.postalCode || ''

 const summary = matchedItem.summary || [fullRoad, kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')
 setLastDetectedAddress(summary || display)

 if (shouldUpdateFields) {
 isInternalPinMoveRef.current = true
 onAddressDetectedRef.current?.({
 displayName: display,
 road: fullRoad,
 province: provinsi,
 city: kota,
 district: kecamatan,
 subdistrict: kelurahan,
 postalCode: postcode,
 summary
 })
 }

 setSearchFeedback({
 type: 'success',
 text: `Titik peta ditemukan (${matchedItem.source === 'mapbox' ? 'Mapbox' : 'OSM'}): ${display}`
 })
 } else {
 setSearchFeedback({
 type: 'error',
 text: `Lokasi "${searchQuery}" tidak ditemukan pada peta. Coba lengkapi nama kota atau kabupaten.`
 })
 }
 } catch (err) {
 console.error('Geocoding search error:', err)
 setSearchFeedback({
 type: 'error',
 text: 'Gagal mencari lokasi pada peta. Periksa koneksi internet.'
 })
 } finally {
 setIsSearching(false)
 }
 }, [cityName, provinceName])

 // 5. Watcher: Auto-Geocode saat pengguna mengetik alamat di formulir (Debounced 900ms)
 useEffect(() => {
 // Jika perubahan alamat berasal dari geser pin (reverse geocode), jangan trigger pencarian balik!
 if (isInternalPinMoveRef.current) {
 isInternalPinMoveRef.current = false
 lastGeocodedTextRef.current = (addressText || '').trim()
 return
 }

 const trimmed = (addressText || '').trim()
 // Minimal 4 karakter untuk mulai auto-search
 if (trimmed.length < 4) return
 if (trimmed === lastGeocodedTextRef.current) return

 const timer = setTimeout(() => {
 lastGeocodedTextRef.current = trimmed
 executeSearch(trimmed, trimmed, syncAddressWithPinRef.current, true)
 }, 900)

 return () => clearTimeout(timer)
 }, [addressText, executeSearch])

 // 6. External trigger (misal tombol cepat di samping label alamat)
 useEffect(() => {
 if (triggerSearchKey) {
 const parts = [addressText, cityName, provinceName].filter(Boolean)
 if (parts.length > 0) {
 executeSearch(parts.join(', '), addressText, syncAddressWithPinRef.current, false)
 }
 }
 }, [triggerSearchKey, addressText, cityName, provinceName, executeSearch])

 // Browser Geolocation
 const handleUseMyLocation = useCallback(() => {
 if (!navigator.geolocation) {
 setSearchFeedback({
 type: 'warning',
 text: 'Fitur Geolocation tidak didukung atau tidak diizinkan oleh peramban Anda.',
 })
 return
 }

 setIsSearching(true)
 navigator.geolocation.getCurrentPosition(
 (pos) => {
 setIsSearching(false)
 const newLat = Number(pos.coords.latitude.toFixed(7))
 const newLng = Number(pos.coords.longitude.toFixed(7))

 if (mapInstanceRef.current && markerRef.current && circleRef.current) {
 markerRef.current.setLatLng([newLat, newLng])
 circleRef.current.setLatLng([newLat, newLng])
 mapInstanceRef.current.setView([newLat, newLng], 16)
 }

 onLocationChangeRef.current?.({ lat: newLat, lng: newLng })
 isInternalPinMoveRef.current = true
 performReverseGeocode(newLat, newLng, syncAddressWithPinRef.current)
 },
 (err) => {
 setIsSearching(false)
 setSearchFeedback({
 type: 'error',
 text: 'Gagal mengambil lokasi GPS: ' + (err.message || 'Pastikan izin lokasi telah diaktifkan.'),
 })
 },
 { enableHighAccuracy: true, timeout: 10000 }
 )
 }, [performReverseGeocode])

 // Quick Action: Search from Form Address Button
 const handleSearchFromFormAddress = () => {
 const parts = [addressText, cityName, provinceName].filter(Boolean)
 if (parts.length === 0) {
 setSearchFeedback({
 type: 'warning',
 text: 'Tulis nama jalan atau kota di kolom formulir terlebih dahulu.'
 })
 return
 }
 const query = parts.join(', ')
 executeSearch(query, addressText, syncAddressWithPinRef.current, false)
 }

 return (
 <div className={`space-y-3 ${className}`}>
 {/* Header & Action Bar */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 pb-2.5">
 <div>
 <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
 <MapPin className="size-4 text-[#059669] dark:text-[#10B981]" />
 Peta Lokasi & Penentuan Titik Koordinat
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Ketik alamat di formulir atau <strong>geser pin</strong> di peta untuk mengisi otomatis alamat & koordinat.
 </p>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 {/* Tombol Cari Titik dari Alamat Form */}
 <button
 type="button"
 onClick={handleSearchFromFormAddress}
 disabled={isSearching}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition disabled:opacity-50 text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 title="Arahkan pin peta ke alamat yang telah Anda ketik di atas"
 >
 {isSearching ? (
 <Loader2 className="size-3.5 animate-spin" />
 ) : (
 <Compass className="size-3.5" />
 )}
 Arahkan Pin ke Alamat Formulir
 </button>

 {/* Tombol GPS */}
 <button
 type="button"
 onClick={handleUseMyLocation}
 disabled={isSearching}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white hover:bg-emerald-50 dark:bg-slate-800 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 px-3 py-1.5 text-xs font-bold shadow-xs cursor-pointer transition"
 title="Gunakan titik lokasi GPS Anda saat ini"
 >
 <Crosshair className="size-3.5" /> Deteksi GPS Saya
 </button>

 {/* Link Buka Google Maps */}
 {latitude && longitude && (
 <a
 href={`https://www.google.com/maps?q=${latitude},${longitude}`}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white hover:bg-emerald-50/40 dark:bg-slate-800 dark:border-emerald-700/80 text-slate-700 dark:text-slate-200 px-2.5 py-1.5 text-xs font-bold shadow-xs transition"
 title="Periksa titik ini di Google Maps"
 >
 <ExternalLink className="size-3.5" /> Google Maps
 </a>
 )}
 </div>
 </div>

 {/* Manual Search Bar */}
 <div className="flex gap-2">
 <div className="relative flex-1">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 size-3.5" />
 <input
 type="text"
 value={customSearch}
 onChange={(e) => setCustomSearch(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === 'Enter') {
 e.preventDefault()
 executeSearch(customSearch, customSearch, syncAddressWithPinRef.current, false)
 }
 }}
 placeholder="Cari jalan / tempat spesifik pada peta (Tekan Enter)..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 shadow-xs transition"
 />
 </div>
 <button
 type="button"
 onClick={() => executeSearch(customSearch, customSearch, syncAddressWithPinRef.current, false)}
 disabled={isSearching || !customSearch.trim()}
 className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 px-4 py-2 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
 >
 {isSearching ? <Loader2 className="size-3.5 animate-spin" /> : 'Cari'}
 </button>
 </div>

 {/* Mode Sinkronisasi Teks Alamat vs Pin */}
 <div
 onClick={() => setSyncAddressWithPin(p => !p)}
 className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 px-3 py-2 rounded-xl"
 >
 {syncAddressWithPin ? (
 <CheckSquare className="size-4 text-emerald-600 shrink-0" />
 ) : (
 <Square className="size-4 text-slate-400 shrink-0" />
 )}
 <span>
 Otomatis perbarui teks alamat & wilayah (Kelurahan, Kecamatan, Kota) saat pin digeser atau diklik di peta
 </span>
 </div>

 {/* Search Feedback Callout */}
 {searchFeedback && (
 <div
 className={`flex items-start gap-2 rounded-xl p-2.5 text-xs font-medium border ${
 searchFeedback.type === 'success'
 ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
 : searchFeedback.type === 'info'
 ? 'bg-teal-50 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950/40 dark:text-teal-300 dark:border-emerald-800/60'
 : 'bg-amber-50 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60'
 }`}
 >
 {searchFeedback.type === 'success' ? (
 <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
 ) : searchFeedback.type === 'info' ? (
 <Move className="size-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
 ) : (
 <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
 )}
 <span className="flex-1">{searchFeedback.text}</span>
 <button
 type="button"
 onClick={() => setSearchFeedback(null)}
 className="text-[10px] opacity-60 hover:opacity-100 font-bold ml-2 cursor-pointer"
 >
 ✕
 </button>
 </div>
 )}

 {/* Interactive Map Canvas Container */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 shadow-inner dark:border-emerald-800/60 dark:bg-emerald-950/40">
 {!isLoaded && (
 <div className="flex h-64 items-center justify-center">
 <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
 <Loader2 className="size-5 animate-spin text-emerald-600" />
 Memuat Peta Interaktif...
 </div>
 </div>
 )}
 <div
 ref={mapContainerRef}
 className="h-64 sm:h-72 w-full"
 style={{ display: isLoaded ? 'block' : 'none', zIndex: 0 }}
 />

 {/* Floating Instruction Overlay */}
 <div className="pointer-events-none absolute bottom-2.5 left-2.5 right-2.5 z-[400] flex justify-between items-center">
 <div className="rounded-xl bg-slate-900/85 backdrop-blur-md px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg flex items-center gap-1.5 border border-emerald-200/10">
 <Move className="size-3 text-emerald-400" />
 <span>Geser pin atau klik peta untuk memindahkan titik koordinat</span>
 </div>
 {radiusMeter && (
 <div className="rounded-xl bg-emerald-950/85 backdrop-blur-md px-2.5 py-1.5 text-[10px] font-bold text-emerald-300 shadow-lg border border-emerald-200/80 dark:border-emerald-800/60">
 Radius: {radiusMeter}m
 </div>
 )}
 </div>
 </div>

 </div>
 )
}
