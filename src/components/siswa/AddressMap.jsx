import React, { useState, useEffect, useRef, useCallback } from 'react'
import { FaMapMarkerAlt, FaCrosshairs, FaSearchLocation, FaSpinner, FaCheckCircle } from 'react-icons/fa'
import {
 getMapboxToken,
 getMapTileConfig,
 searchAddressGeocoding,
 reverseGeocodeCoords,
} from '../../utils/mapboxHelper'
import Swal from '@/components/ui/compat/swal-heroui'

/**
 * AddressMap — Interactive map for address location selection using Mapbox (with OpenStreetMap fallback).
 * Automatically fetches Road Name, Province, City/Kabupaten, Kecamatan, and Kelurahan when pin is moved or clicked.
 */
export default function AddressMap({ latitude, longitude, onLocationChange, onAddressSelect }) {
 const mapRef = useRef(null)
 const mapInstanceRef = useRef(null)
 const markerRef = useRef(null)
 const tileLayerRef = useRef(null)
 const [mapboxToken, setMapboxToken] = useState('')
 const [isLoaded, setIsLoaded] = useState(false)
 const [searchQuery, setSearchQuery] = useState('')
 const [isSearching, setIsSearching] = useState(false)
 const [isGeocoding, setIsGeocoding] = useState(false)
 const [lastDetectedAddress, setLastDetectedAddress] = useState('')

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

 const defaultLat = latitude ? parseFloat(latitude) : -0.9471
 const defaultLng = longitude ? parseFloat(longitude) : 100.4172

 // Reverse Geocoding via Mapbox (fallback Nominatim OSM)
 const performReverseGeocode = useCallback(async (lat, lng) => {
 onLocationChange?.(lat, lng)
 setIsGeocoding(true)
 try {
 const data = await reverseGeocodeCoords(lat, lng, mapboxToken)
 if (data) {
 const fullRoadName = data.road || ''
 const provinsi = data.province || ''
 const kota = data.city || ''
 const kecamatan = data.district || ''
 const kelurahan = data.subdistrict || ''
 const postcode = data.postalCode || ''

 const addressSummary = data.summary || [fullRoadName, kelurahan, kecamatan, kota, provinsi].filter(Boolean).join(', ')
 setLastDetectedAddress(addressSummary)

 onAddressSelect?.({
 lat,
 lng,
 road: fullRoadName,
 provinsi,
 kota,
 kecamatan,
 kelurahan,
 postcode,
 displayName: data.displayName || addressSummary
 })
 }
 } catch (err) {
 console.error('Reverse geocoding error:', err)
 } finally {
 setIsGeocoding(false)
 }
 }, [onLocationChange, onAddressSelect, mapboxToken])

 // Dynamically inject Leaflet CDN CSS & JS
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
 script.onerror = () => console.error('Failed to load Leaflet CDN')
 document.head.appendChild(script)
 } else {
 const script = document.getElementById('leaflet-js')
 const handleLoad = () => setIsLoaded(true)
 script.addEventListener('load', handleLoad)
 return () => script.removeEventListener('load', handleLoad)
 }
 }, [])

 // Initialize map when Leaflet is ready
 useEffect(() => {
 if (!isLoaded || !window.L || !mapRef.current || mapInstanceRef.current) return

 const L = window.L

 delete L.Icon.Default.prototype._getIconUrl
 L.Icon.Default.mergeOptions({
 iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
 iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
 shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
 })

 const initialLat = !isNaN(defaultLat) ? defaultLat : -0.9471
 const initialLng = !isNaN(defaultLng) ? defaultLng : 100.4172

 const map = L.map(mapRef.current, {
 center: [initialLat, initialLng],
 zoom: 14,
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

 const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map)

 marker.on('dragend', () => {
 const pos = marker.getLatLng()
 performReverseGeocode(pos.lat, pos.lng)
 })

 map.on('click', (e) => {
 marker.setLatLng(e.latlng)
 performReverseGeocode(e.latlng.lat, e.latlng.lng)
 })

 mapInstanceRef.current = map
 markerRef.current = marker

 setTimeout(() => map.invalidateSize(), 300)

 return () => {
 map.remove()
 mapInstanceRef.current = null
 markerRef.current = null
 }
 }, [isLoaded, performReverseGeocode])

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

 // Update marker when lat/lng props change externally
 useEffect(() => {
 if (mapInstanceRef.current && markerRef.current && latitude && longitude) {
 const lat = parseFloat(latitude)
 const lng = parseFloat(longitude)
 if (!isNaN(lat) && !isNaN(lng)) {
 markerRef.current.setLatLng([lat, lng])
 mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom())
 }
 }
 }, [latitude, longitude])

 const handleUseMyLocation = useCallback(() => {
 if (!navigator.geolocation) {
 Swal.fire({
 title: 'Geolocation Tidak Didukung',
 text: 'Fitur Geolocation tidak didukung atau tidak diizinkan oleh peramban Anda.',
 icon: 'warning',
 confirmButtonColor: '#059669',
 })
 return
 }
 navigator.geolocation.getCurrentPosition(
 (pos) => {
 const { latitude: lat, longitude: lng } = pos.coords
 if (mapInstanceRef.current && markerRef.current) {
 markerRef.current.setLatLng([lat, lng])
 mapInstanceRef.current.setView([lat, lng], 16)
 }
 performReverseGeocode(lat, lng)
 },
 (err) => {
 Swal.fire({
 title: 'Gagal Mengambil Lokasi GPS',
 text: 'Gagal mendapatkan lokasi. Pastikan izin akses lokasi telah diaktifkan pada peramban Anda.',
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 console.error('Geolocation error:', err)
 },
 { enableHighAccuracy: true, timeout: 10000 }
 )
 }, [performReverseGeocode])

 const handleSearch = useCallback(async () => {
 if (!searchQuery.trim()) return
 setIsSearching(true)
 try {
 const data = await searchAddressGeocoding(searchQuery, mapboxToken)
 if (data) {
 const parsedLat = data.lat
 const parsedLng = data.lng
 if (mapInstanceRef.current && markerRef.current) {
 markerRef.current.setLatLng([parsedLat, parsedLng])
 mapInstanceRef.current.setView([parsedLat, parsedLng], 16)
 }
 performReverseGeocode(parsedLat, parsedLng)
 } else {
 Swal.fire({
 title: 'Lokasi Tidak Ditemukan',
 text: 'Lokasi tidak ditemukan. Silakan masukkan kata kunci nama jalan, kelurahan, atau kota lain.',
 icon: 'info',
 confirmButtonColor: '#059669',
 })
 }
 } catch (err) {
 console.error('Search error:', err)
 Swal.fire({
 title: 'Gagal Mencari Lokasi',
 text: 'Terjadi kesalahan jaringan saat mencari lokasi geocoding.',
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 } finally {
 setIsSearching(false)
 }
 }, [searchQuery, performReverseGeocode, mapboxToken])

 return (
 <div className="space-y-3">
 <div className="flex items-center justify-between">
 <label className="block text-xs font-semibold text-slate-700">
 📍 Peta Alamat Interaktif (Klik/Geser Pin untuk Isi Otomatis Alamat)
 </label>
 {isGeocoding && (
 <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 animate-pulse">
 <FaSpinner className="animate-spin text-xs" /> Mendeteksi Alamat...
 </span>
 )}
 </div>

 {/* Search Bar & Geolocation Button */}
 <div className="flex gap-2">
 <div className="relative flex-1">
 <FaSearchLocation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
 placeholder="Cari jalan / daerah, misal: Khatib Sulaiman Padang..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none transition"
 />
 </div>
 <button
 type="button"
 onClick={handleSearch}
 disabled={isSearching}
 className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 {isSearching ? 'Mencari...' : 'Cari'}
 </button>
 <button
 type="button"
 onClick={handleUseMyLocation}
 className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-100 cursor-pointer"
 title="Gunakan lokasi saya saat ini"
 >
 <FaCrosshairs className="text-sm" />
 </button>
 </div>

 {/* Interactive Map Box */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 shadow-inner">
 {!isLoaded && (
 <div className="flex h-56 items-center justify-center">
 <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
 <div className="h-5 w-5 animate-spin rounded-full border border-emerald-200/80 dark:border-emerald-800/60 border-t-transparent" />
 Memuat Peta Pilihan Alamat...
 </div>
 </div>
 )}
 <div
 ref={mapRef}
 className="h-56 w-full"
 style={{ display: isLoaded ? 'block' : 'none', zIndex: 0 }}
 />
 </div>

 {/* Last Detected Address Card */}
 {lastDetectedAddress && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 p-3 text-xs space-y-1">
 <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
 <FaCheckCircle className="text-emerald-600" />
 <span>Alamat Terdeteksi dari Peta:</span>
 </div>
 <p className="text-slate-800 font-medium leading-relaxed pl-5">
 {lastDetectedAddress}
 </p>
 </div>
 )}

 {/* Selected Coordinates Badge */}
 {latitude && longitude && (
 <div className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 px-3 py-1.5">
 <FaMapMarkerAlt className="text-xs text-emerald-700" />
 <span className="text-xs font-medium text-slate-600">
 Koordinat: <span className="font-bold text-slate-800">{parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}</span>
 </span>
 </div>
 )}

 <p className="text-[10px] text-slate-500">
 * Klik lokasi atau geser pin pada peta untuk mengisi otomatis Nama Jalan, Provinsi, Kota/Kabupaten, Kecamatan, dan Kelurahan ke dalam form.
 </p>
 </div>
 )
}
