/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Aplikasi Dashboard Eksekutif Program Makan Bergizi Gratis (MBG)
 * Kabupaten Grobogan, Jawa Tengah (19 Kecamatan)
 * Desain Presentasi Modern & Penyajian Data Komprehensif
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Map,
  BarChart3,
  Layers,
  ChefHat,
  Building2,
  Calendar,
  CheckCircle2,
  Sparkles,
  Users,
  Compass,
  Download,
} from 'lucide-react';
import { SPPGUnit } from './data/groboganData';
import { fetchMBGMasterData } from './services/googleSheetsService';
import { HeaderKPI } from './components/HeaderKPI';
import { MapView } from './components/MapView';
import { AnalyticsCharts } from './components/AnalyticsCharts';

export default function App() {
  const [allSppgList, setAllSppgList] = useState<SPPGUnit[]>([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState<string>('Semua');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dataSource, setDataSource] = useState<'google_sheets' | 'local_master'>('local_master');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'gis' | 'analytics'>('overview');

  // Load Google Sheets / Master Data
  const loadMBGData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetchMBGMasterData();
      setAllSppgList(result.data);
      setDataSource(result.source);
      setLastUpdated(result.lastUpdated);
    } catch (err) {
      console.error('Error fetching MBG data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMBGData();
  }, [loadMBGData]);

  // Filtered SPPG list based on selected subdistrict
  const currentSppgList = React.useMemo(() => {
    if (selectedKecamatan === 'Semua') {
      return allSppgList;
    }
    return allSppgList.filter(
      (item) => item.kecamatan.toLowerCase() === selectedKecamatan.toLowerCase()
    );
  }, [allSppgList, selectedKecamatan]);

  const totalKapasitasGrobogan = allSppgList.reduce((acc, c) => acc + c.kapasitasHarian, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Fixed Accent Line - Indigo to Cyan */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 w-full" />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
        {/* Header & Executive KPI Summary */}
        <HeaderKPI
          sppgList={currentSppgList}
          allSppgList={allSppgList}
          selectedKecamatan={selectedKecamatan}
          onSelectKecamatan={setSelectedKecamatan}
          onRefreshData={loadMBGData}
          isLoading={isLoading}
          dataSource={dataSource}
          lastUpdated={lastUpdated}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-300" />
              <span>Tampilan Terpadu</span>
            </button>

            <button
              onClick={() => setActiveTab('gis')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'gis'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Map className="w-4 h-4 text-indigo-300" />
              <span>Peta GIS Grobogan (Carto)</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-950/60'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-purple-300" />
              <span>Analisis &amp; Direktori SPPG</span>
            </button>
          </div>

          {/* Active View Quick Note */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>
              Fokus Wilayah:{' '}
              <strong className="text-cyan-300">
                {selectedKecamatan === 'Semua'
                  ? '19 Kecamatan Grobogan'
                  : `Kecamatan ${selectedKecamatan}`}
              </strong>
            </span>
          </div>
        </div>

        {/* Tab Content Display */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* GIS Map & Quick Highlights Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* GIS Map (8 Cols) */}
              <div className="lg:col-span-8">
                <MapView
                  sppgList={currentSppgList}
                  allSppgList={allSppgList}
                  selectedKecamatan={selectedKecamatan}
                  onSelectKecamatan={setSelectedKecamatan}
                />
              </div>

              {/* Quick Status & Regional Highlights (4 Cols) */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
                <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-indigo-400" />
                        Pusat Koordinasi MBG Grobogan
                      </h3>
                      <span className="text-[10px] bg-indigo-500/15 text-indigo-300 font-bold px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                        19 Kecamatan
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      Program Makan Bergizi Gratis (MBG) diselenggarakan terintegrasi melayani seluruh kelompok usia rentan, ibu hamil/menyusui, dan peserta didik dari jenjang PAUD hingga SMA/SMK serta Pondok Pesantren.
                    </p>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Total Dapur SPPG:</span>
                        <strong className="text-indigo-300 font-bold text-sm">{allSppgList.length} Dapur</strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Kapasitas Porsi Se-Kabupaten:</span>
                        <strong className="text-cyan-300 font-bold text-sm">
                          {totalKapasitasGrobogan.toLocaleString('id-ID')} Porsi/Hari
                        </strong>
                      </div>
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                        <span className="text-slate-400">Status Sertifikasi Mutu:</span>
                        <strong className="text-emerald-400 font-bold">
                          100% Dinkes &amp; Halal
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setActiveTab('analytics')}
                      className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <BarChart3 className="w-4 h-4 text-cyan-400" />
                      Buka Rincian Analitik &amp; Data Tabel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Analytics & Table */}
            <AnalyticsCharts
              sppgList={currentSppgList}
              allSppgList={allSppgList}
              selectedKecamatan={selectedKecamatan}
            />
          </div>
        )}

        {activeTab === 'gis' && (
          <div className="space-y-6">
            <MapView
              sppgList={currentSppgList}
              allSppgList={allSppgList}
              selectedKecamatan={selectedKecamatan}
              onSelectKecamatan={setSelectedKecamatan}
            />

            
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsCharts
            sppgList={currentSppgList}
            allSppgList={allSppgList}
            selectedKecamatan={selectedKecamatan}
          />
        )}
      </main>

      {/* Executive Presentation Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md">
              MBG
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                Dashboard Monitoring Makan Bergizi Gratis (MBG) Grobogan
              </div>
              <p className="text-[11px] text-slate-400">
                Pemerintah Kabupaten Grobogan &bull; 19 Kecamatan &bull; Data Teragregasi
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> 19 Kecamatan Terlayani
            </span>
            <span className="text-slate-600">&bull;</span>
            <span>Koordinat Pusat: -7.03, 110.92</span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-indigo-300">Carto Basemaps Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
