/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Peta Geospasial GIS Interaktif Kabupaten Grobogan (Leaflet.js)
 * Menggunakan Carto Basemaps Resmi dengan API Key
 */

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  Layers,
  Maximize2,
  Utensils,
  Building,
  Users,
  Compass,
} from 'lucide-react';
import { SPPGUnit, KECAMATAN_GROBOGAN } from '../data/groboganData';
import { getStoredCartoKey } from '../services/cartoService';

interface MapViewProps {
  sppgList: SPPGUnit[];
  allSppgList: SPPGUnit[];
  selectedKecamatan: string;
  onSelectKecamatan: (kecamatan: string) => void;
}

const cartoKey = getStoredCartoKey();
console.log("Kunci Carto yang aktif:", cartoKey);

const normalizeKecamatan = (value: string | undefined | null) =>
  String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('id-ID');

export const MapView: React.FC<MapViewProps> = ({
  sppgList,
  allSppgList,
  selectedKecamatan,
  onSelectKecamatan,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const areasLayerRef = useRef<L.LayerGroup | null>(null);

  // Carto themes: dark_matter (default), voyager, positron, satellite
  const [mapTile, setMapTile] = useState<'carto_dark' | 'carto_voyager' | 'carto_light' | 'satellite'>('carto_dark');
  const [showSppgPins, setShowSppgPins] = useState(true);
  const [showSubdistrictAuras, setShowSubdistrictAuras] = useState(true);

  // Default center Grobogan
  const DEFAULT_CENTER: [number, number] = [-7.065, 110.92];
  const DEFAULT_ZOOM = 10;

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    L.control
      .attribution({
        position: 'bottomleft',
        prefix: '<span>Peta GIS MBG Grobogan &bull; Carto Basemaps</span>',
      })
      .addTo(map);

    
    const cartoKey = getStoredCartoKey().trim();

    // Gunakan parameter key sesuai dokumentasi CARTO terbaru
    const cartoKeyParam = `?key=${encodeURIComponent(cartoKey)}`;

    let tileUrl = `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png${cartoKeyParam}`;
    let subdomains = 'abcd';
    let maxZoom = 19;

    if (mapTile === 'carto_voyager') {
      tileUrl = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png${cartoKeyParam}`;
    } else if (mapTile === 'carto_light') {
      tileUrl = `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${cartoKeyParam}`;
    } else if (mapTile === 'satellite') {
      tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
      maxZoom = 18;
    }

    const baseLayer = L.tileLayer(tileUrl, {
      maxZoom,
      subdomains,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    });

    baseLayer.on('tileerror', (error) => {
      console.error('Gagal memuat tile peta:', error);
    });

    baseLayer.addTo(map);


    const areasLayer = L.layerGroup().addTo(map);
    const markersLayer = L.layerGroup().addTo(map);

    areasLayerRef.current = areasLayer;
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapTile]);

  // Update map contents when data or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current || !areasLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    areasLayerRef.current.clearLayers();

    // Map subdistricts with SPPG counts and capacities
    const subdistrictStats: Record<string, { count: number; pm: number; kapasitas: number }> = {};

    KECAMATAN_GROBOGAN.forEach((k) => {
      subdistrictStats[k.nama] = { count: 0, pm: 0, kapasitas: 0 };
    });

    allSppgList.forEach((sppg) => {
      if (subdistrictStats[sppg.kecamatan]) {
        subdistrictStats[sppg.kecamatan].count += 1;
        subdistrictStats[sppg.kecamatan].kapasitas += sppg.kapasitasHarian;
        const totalPM =
          sppg.kelompok3B.bumil +
          sppg.kelompok3B.busui +
          sppg.kelompok3B.balita +
          sppg.jenjangPendidikan.paudTkRa +
          sppg.jenjangPendidikan.sdMi +
          sppg.jenjangPendidikan.smpMts +
          sppg.jenjangPendidikan.smaSmkMa +
          sppg.jenjangPendidikan.slb +
          sppg.jenjangPendidikan.pesantren +
          sppg.jenjangPendidikan.seminari +
          sppg.jenjangPendidikan.pkbm;
        subdistrictStats[sppg.kecamatan].pm += totalPM;
      }
    });

    // Color palettes for varied presentation styling
    const colorAuras = [
      { border: '#6366f1', fill: '#4f46e5' }, // Indigo
      { border: '#06b6d4', fill: '#0891b2' }, // Cyan
      { border: '#8b5cf6', fill: '#7c3aed' }, // Violet
      { border: '#f59e0b', fill: '#d97706' }, // Amber
      { border: '#10b981', fill: '#059669' }, // Emerald
      { border: '#ec4899', fill: '#db2777' }, // Pink
    ];

    // Render 19 Kecamatan Area Hubs
    if (showSubdistrictAuras) {
      const visibleKecamatan =
          selectedKecamatan === 'Semua'
            ? KECAMATAN_GROBOGAN
            : KECAMATAN_GROBOGAN.filter(
                (kec) =>
                  normalizeKecamatan(kec.nama) ===
                  normalizeKecamatan(selectedKecamatan)
              );

        visibleKecamatan.forEach((kec, idx) => {
              const stats = subdistrictStats[kec.nama] || { count: 0, pm: 0, kapasitas: 0 };
              const isCurrentSelected = selectedKecamatan === kec.nama;

              const auraStyle = colorAuras[idx % colorAuras.length];
              const baseRadius = 3200 + stats.count * 550;

              const circle = L.circle([kec.lat, kec.lng], {
                radius: baseRadius,
                color: isCurrentSelected ? '#38bdf8' : auraStyle.border,
                weight: isCurrentSelected ? 3.5 : 1.5,
                opacity: isCurrentSelected ? 0.95 : 0.65,
                fillColor: isCurrentSelected ? '#0284c7' : auraStyle.fill,
                fillOpacity: isCurrentSelected ? 0.35 : 0.16,
        });

        // Tooltip
        const tooltipContent = `
          <div style="font-family:'Plus Jakarta Sans', sans-serif; min-width: 180px; padding: 2px;">
            <div style="font-weight: 800; color: #38bdf8; font-size: 13px; margin-bottom: 2px;">
              Kecamatan ${kec.nama}
            </div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 6px;">
              ${kec.pusatKecamatan} (${kec.jumlahDesa} Desa/Kel)
            </div>
            <div style="display:flex; justify-content:space-between; font-size: 11px; border-top: 1px solid #334155; padding-top: 5px; margin-bottom: 3px;">
              <span style="color: #cbd5e1;">Unit SPPG:</span>
              <strong style="color: #ffffff;">${stats.count} Unit</strong>
            </div>
            <div style="display:flex; justify-content:space-between; font-size: 11px; margin-bottom: 3px;">
              <span style="color: #cbd5e1;">Sasaran Penerima Manfaat:</span>
              <strong style="color: #38bdf8;">${stats.pm.toLocaleString('id-ID')} Jiwa/Hari</strong>
            </div>
            <div style="margin-top: 6px; font-size: 10px; color: #a5b4fc; text-align: center; font-style: italic;">
              Klik untuk filter statistik wilayah ini
            </div>
          </div>
        `;

        circle.bindTooltip(tooltipContent, {
          className: 'custom-leaflet-popup',
          direction: 'top',
          offset: [0, -10],
          opacity: 0.98,
        });

        circle.on('click', () => {
          onSelectKecamatan(kec.nama);
        });

        areasLayerRef.current?.addLayer(circle);

        // Center hub label badge
        const centerIcon = L.divIcon({
          className: 'custom-hub-icon',
          html: `
            <div class="cursor-pointer transition-transform hover:scale-110 flex flex-col items-center">
              <div style="
                background: ${isCurrentSelected ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#0f172a'};
                border: 1.5px solid ${isCurrentSelected ? '#38bdf8' : auraStyle.border};
                color: #ffffff;
                font-weight: 700;
                font-size: 11px;
                padding: 2.5px 8px;
                border-radius: 9999px;
                box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.5);
                white-space: nowrap;
                display: flex;
                align-items: center;
                gap: 5px;
              ">
                <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:${isCurrentSelected ? '#ffffff' : auraStyle.border};"></span>
                ${kec.nama}
              </div>
            </div>
          `,
          iconSize: [85, 26],
          iconAnchor: [42, 13],
        });

        const centerMarker = L.marker([kec.lat, kec.lng], { icon: centerIcon });
        centerMarker.on('click', () => {
          onSelectKecamatan(kec.nama);
        });
        areasLayerRef.current?.addLayer(centerMarker);
      });
    }

    // Render SPPG Individual Kitchen Pins with varied modern styling
    if (showSppgPins) {
      // Pastikan jika kecamatan dipilih, yang muncul di peta HANYA dapur pada kecamatan tersebut
      const activeList = selectedKecamatan === 'Semua'
        ? allSppgList
        : allSppgList.filter(
            (s) =>
              normalizeKecamatan(s.kecamatan) ===
              normalizeKecamatan(selectedKecamatan)
          );

      activeList.forEach((sppg, i) => {
        const pinGradients = [
          'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Indigo
          'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', // Sky
          'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
          'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
          'linear-gradient(135deg, #10b981 0%, #047857 100%)', // Emerald
        ];
        const gradient = pinGradients[i % pinGradients.length];

        const kitchenIcon = L.divIcon({
          className: 'custom-sppg-pin',
          html: `
            <div style="position: relative; width: 30px; height: 30px; cursor: pointer;">
              <div style="
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: ${gradient};
                border: 2px solid #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ffffff;
                font-size: 14px;
              ">
                🍲
              </div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 15],
        });

        const marker = L.marker([sppg.lat, sppg.lng], { icon: kitchenIcon });

        const pmTotal =
          sppg.kelompok3B.bumil +
          sppg.kelompok3B.busui +
          sppg.kelompok3B.balita +
          sppg.jenjangPendidikan.paudTkRa +
          sppg.jenjangPendidikan.sdMi +
          sppg.jenjangPendidikan.smpMts +
          sppg.jenjangPendidikan.smaSmkMa +
          sppg.jenjangPendidikan.slb +
          sppg.jenjangPendidikan.pesantren +
          sppg.jenjangPendidikan.seminari +
          sppg.jenjangPendidikan.pkbm;

        const cleanPhone = (sppg.kontak || '').replace(/\D/g, '');
        const waLink = cleanPhone && cleanPhone !== '-'
          ? `https://wa.me/${cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone.startsWith('62') ? cleanPhone : '62' + cleanPhone}`
          : '';

        const displayAlamatDapur = sppg.alamatDapur || sppg.alamat || 'Alamat dapur sedang dalam verifikasi';

        const sppgPopupHtml = `
          <div style="font-family:'Plus Jakarta Sans', sans-serif; min-width: 260px; max-width: 320px; padding: 4px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
              <span style="font-size:10px; background:#1e1b4b; color:#a5b4fc; padding:2px 7px; border-radius:5px; font-weight:700; border:1px solid #4338ca;">${sppg.id}</span>
              <span style="font-size:10px; color:#38bdf8; font-weight:600;">${sppg.status}</span>
            </div>
            
            <div style="font-weight:800; color:#ffffff; font-size:14px; line-height:1.3; margin-bottom:3px;">
              ${sppg.namaSppg}
            </div>

            ${sppg.namaYayasan ? `
              <div style="display:inline-flex; align-items:center; gap:4px; background:#1e1b4b/80; border:1px solid rgba(99,102,241,0.4); color:#c7d2fe; padding:2px 7px; border-radius:5px; font-size:10.5px; font-weight:600; margin-bottom:6px;">
                🏛️ ${sppg.namaYayasan}
              </div>
            ` : ''}

            <div style="font-size:11px; color:#cbd5e1; margin-bottom:6px;">
              Kecamatan <strong>${sppg.kecamatan}</strong> &bull; Desa ${sppg.desa}
            </div>

            <!-- Wadah Informasi Alamat Dapur SPPG -->
            <div style="background:#0f172a; border:1px solid #334155; border-radius:8px; padding:6px 9px; margin-bottom:6px;">
              <div style="font-size:10px; font-weight:700; color:#38bdf8; display:flex; align-items:center; gap:4px; margin-bottom:2px; text-transform:uppercase; letter-spacing:0.5px;">
                <span>🏠</span> Alamat Dapur:
              </div>
              <div style="font-size:11px; color:#f1f5f9; line-height:1.35; word-break:break-word;">
                ${displayAlamatDapur}
              </div>
            </div>

            <div style="background:#090d16; border:1px solid #334155; border-radius:8px; padding:7px; font-size:11px; margin-bottom:6px;">
              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span style="color:#94a3b8;">Kepala Dapur:</span>
                <strong style="color:#ffffff;">${sppg.kepalaDapur}</strong>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:3px;">
                <span style="color:#94a3b8;">No. HP Ka SPPG:</span>
                ${waLink ? `
                  <a href="${waLink}" target="_blank" rel="noreferrer" style="color:#34d399; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:3px; background:#064e3b; padding:1.5px 6px; border-radius:4px; font-size:10.5px;">
                    📱 ${sppg.kontak}
                  </a>
                ` : `<span style="color:#cbd5e1;">${sppg.kontak || '-'}</span>`}
              </div>

              <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
                <span style="color:#94a3b8;">Sasaran Penerima Manfaat:</span>
                <strong style="color:#38bdf8;">${pmTotal.toLocaleString('id-ID')} Jiwa (Porsi)</strong>
              </div>

              <div style="display:flex; justify-content:space-between; border-top:1px solid #1e293b; padding-top:3px; margin-top:3px;">
                <span style="color:#94a3b8;">Koordinat GPS:</span>
                <a href="https://www.google.com/maps?q=${sppg.lat},${sppg.lng}" target="_blank" rel="noreferrer" style="color:#38bdf8; font-family:monospace; font-size:10px; text-decoration:underline;">
                  ${sppg.lat.toFixed(5)}, ${sppg.lng.toFixed(5)}
                </a>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(sppgPopupHtml, {
          className: 'custom-leaflet-popup',
          offset: [0, -10],
        });

        markersLayerRef.current?.addLayer(marker);
      });
    }

    // Fly / fit bounds to selected subdistrict
    if (selectedKecamatan !== 'Semua') {
      const kecKitchens = allSppgList.filter(
        (s) => s.kecamatan.trim().toLowerCase() === selectedKecamatan.trim().toLowerCase()
      );
      const validKitchens = kecKitchens.filter((s) => {
          const lat = Number(s.lat);
          const lng = Number(s.lng);

          return (
            Number.isFinite(lat) &&
            Number.isFinite(lng) &&
            lat >= -90 &&
            lat <= 90 &&
            lng >= -180 &&
            lng <= 180 &&
            lat !== 0 &&
            lng !== 0
          );
        });

      if (validKitchens.length > 0) {
        const bounds = L.latLngBounds(validKitchens.map((s) => [s.lat, s.lng]));
        map.fitBounds(bounds.pad(0.35), { duration: 1.0, maxZoom: 13.5 });
      } else {
        const selectedInfo = KECAMATAN_GROBOGAN.find(
          (k) => k.nama.toLowerCase() === selectedKecamatan.toLowerCase()
        );
        if (selectedInfo) {
          map.flyTo([selectedInfo.lat, selectedInfo.lng], 12.5, { duration: 1.0 });
        }
      }
    } else {
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
    }
  }, [allSppgList, sppgList, selectedKecamatan, showSppgPins, showSubdistrictAuras]);

  const handleResetMap = () => {
    onSelectKecamatan('Semua');
    mapInstanceRef.current?.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
  };

  return (
    <div className="relative w-full h-[540px] lg:h-[620px] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 flex flex-col">
      {/* Top Map Action Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Title Tag */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-white tracking-wide">
            Peta Geospasial SPPG Grobogan
          </span>
          <span className="text-xs text-indigo-300 font-semibold border-l border-slate-700 pl-2">
            {selectedKecamatan === 'Semua' ? '19 Kecamatan' : `Kecamatan ${selectedKecamatan}`}
          </span>
        </div>

        {/* Map Layer Controls */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700 p-1 rounded-xl shadow-lg">
          {/* Tile Layer Selector */}
          <select
            value={mapTile}
            onChange={(e) => setMapTile(e.target.value as any)}
            className="bg-slate-950 border border-slate-700 hover:border-indigo-400 text-xs text-indigo-300 font-semibold rounded-lg px-2.5 py-1 outline-none cursor-pointer transition-colors"
            title="Ganti Lapisan Peta Carto"
          >
            <option value="carto_dark">Carto Dark Matter (Resmi)</option>
            <option value="carto_voyager">Carto Voyager (Warna Jelas)</option>
            <option value="carto_light">Carto Positron (Terang)</option>
            <option value="satellite">Citra Satelit (Esri World)</option>
          </select>

          <button
            onClick={() => setShowSppgPins(!showSppgPins)}
            title="Tampilkan / Sembunyikan Titik Dapur SPPG"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              showSppgPins
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Dapur SPPG</span>
          </button>

          <button
            onClick={() => setShowSubdistrictAuras(!showSubdistrictAuras)}
            title="Tampilkan / Sembunyikan Wilayah Kecamatan"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              showSubdistrictAuras
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Wilayah</span>
          </button>

          <button
            onClick={handleResetMap}
            title="Reset Posisi Peta ke Seluruh Grobogan"
            className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay at Bottom */}
      <div className="absolute bottom-3 left-3 z-[400] max-w-xs sm:max-w-md bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-[11px] shadow-xl text-slate-300">
        <div className="font-bold text-slate-200 mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Legenda Peta Geospasial
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 border border-white shrink-0" />
            <span>Titik Dapur SPPG</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-500/40 border border-indigo-400 shrink-0" />
            <span>Cakupan Kecamatan</span>
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
          <span>*Klik area kecamatan untuk filter analitik</span>
          {selectedKecamatan !== 'Semua' && (
            <button
              onClick={handleResetMap}
              className="text-cyan-400 hover:text-white font-semibold underline"
            >
              Tampilkan Semua
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
