/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Header Eksekutif & Ringkasan Metrik KPI Program MBG Kabupaten Grobogan
 * Desain Presentasi Modern & Palet Warna Variatif Multi-Kategori
 */

import React from 'react';
import {
  UtensilsCrossed,
  Users,
  Baby,
  GraduationCap,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  Filter,
  ChevronDown,
  Sparkles,
  MapPin,
  Heart,
  BookOpen,
} from 'lucide-react';
import { SPPGUnit, KECAMATAN_GROBOGAN, calculateTotals } from '../data/groboganData';

interface HeaderKPIProps {
  sppgList: SPPGUnit[];
  allSppgList: SPPGUnit[];
  selectedKecamatan: string;
  onSelectKecamatan: (kecamatan: string) => void;
  onRefreshData: () => void;
  isLoading: boolean;
  dataSource: 'google_sheets' | 'local_master';
  lastUpdated: string;
}

export const HeaderKPI: React.FC<HeaderKPIProps> = ({
  sppgList,
  allSppgList,
  selectedKecamatan,
  onSelectKecamatan,
  onRefreshData,
  isLoading,
  dataSource,
  lastUpdated,
}) => {
  const currentTotals = calculateTotals(sppgList);
  const isFiltered = selectedKecamatan !== 'Semua';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const percentage3B = ((currentTotals.kelompok3B.total / (currentTotals.totalPM || 1)) * 100).toFixed(1);
  const percentageEdu = ((currentTotals.jenjangPendidikan.total / (currentTotals.totalPM || 1)) * 100).toFixed(1);

  return (
    <header className="w-full space-y-4">
      {/* Top Banner: Brand Identity & Presentation Title */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-700/80 p-5 sm:p-6 shadow-2xl shadow-indigo-950/20">
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Title and Badges */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Executive Dashboard MBG
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-200 border border-cyan-500/30">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Kabupaten Grobogan (19 Kecamatan)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Calendar className="w-3 h-3 text-amber-400" />
                Tahun Anggaran 2026
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
                  Monitoring Program Makan Bergizi Gratis (MBG)
                </h1>
                <p className="text-xs sm:text-sm text-slate-300">
                  Visualisasi Geospasial &amp; Analisis Komprehensif Satuan Pelayanan Pemenuhan Gizi (SPPG)
                </p>
              </div>
            </div>
          </div>

          {/* Controls: Subdistrict Filter, Refresh, Data Source config */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter Dropdown */}
            <div className="relative min-w-[220px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400">
                <Filter className="w-4 h-4" />
              </div>
              <select
                aria-label="Filter Wilayah Kecamatan"
                value={selectedKecamatan}
                onChange={(e) => onSelectKecamatan(e.target.value)}
                className="w-full appearance-none bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 focus:border-indigo-400 rounded-xl pl-9 pr-9 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-indigo-400 transition-all shadow-md cursor-pointer"
              >
                <option value="Semua">Seluruh Grobogan (19 Kecamatan)</option>
                {KECAMATAN_GROBOGAN.map((k) => (
                  <option key={k.nama} value={k.nama}>
                    Kecamatan {k.nama}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefreshData}
              disabled={isLoading}
              title="Perbarui data Google Sheets sekarang"
              className="px-3.5 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sinkronisasi</span>
            </button>
          </div>
        </div>

        {/* Data Source Status Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                dataSource === 'google_sheets' ? 'bg-cyan-400 animate-pulse' : 'bg-indigo-400'
              }`}
            />
            <span>
              Sumber Data:{' '}
              <strong className="text-white">
                {dataSource === 'google_sheets' ? 'Google Sheets (DATA_MASTER_CLEAN)' : 'Database Master Grobogan'}
              </strong>
            </span>
            <span className="text-slate-600">&bull;</span>
            <span>Update: {lastUpdated}</span>
          </div>

          {isFiltered && (
            <div className="flex items-center gap-2">
              <span className="text-cyan-300">
                Wilayah Aktif: <strong>Kecamatan {selectedKecamatan}</strong> ({sppgList.length} Dapur SPPG)
              </span>
              <button
                onClick={() => onSelectKecamatan('Semua')}
                className="text-xs text-indigo-400 hover:text-white underline ml-1 cursor-pointer"
              >
                Reset ke Semua
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KPI Metrics Cards Grid with Varied, Polished Colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Unit Operasional SPPG - Royal Indigo */}
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900/90 border border-indigo-500/30 hover:border-indigo-400 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-950/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Unit Operasional SPPG
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {formatNumber(currentTotals.totalSppg)}
            </span>
            <span className="text-xs font-semibold text-indigo-400">Dapur Mandiri</span>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
            <span className="text-slate-400">Rata-rata Layanan:</span>
            <span className="font-bold text-indigo-300">
              {currentTotals.totalSppg > 0 ? formatNumber(Math.round(currentTotals.kapasitasTotal / currentTotals.totalSppg)) : 0} porsi/dapur
            </span>
          </div>
        </div>

        {/* KPI 2: Total Penerima Manfaat - Cyan & Sky Blue */}
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900/90 border border-cyan-500/30 hover:border-cyan-400 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Total Penerima Manfaat
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-cyan-300">
              {formatNumber(currentTotals.totalPM)}
            </span>
            <span className="text-xs font-semibold text-cyan-400">Jiwa Sasaran</span>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
            <span className="text-slate-400">Cakupan Wilayah:</span>
            <span className="font-bold text-cyan-300">
              {isFiltered ? `Kecamatan ${selectedKecamatan}` : '19 Kecamatan Terpenuhi'}
            </span>
          </div>
        </div>

        {/* KPI 3: Kelompok 3B (Bumil, Busui, Balita) - Rose & Coral */}
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-400 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
              Kelompok 3B (Ibu &amp; Balita)
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Baby className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-rose-400">
              {formatNumber(currentTotals.kelompok3B.total)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 font-bold border border-rose-500/30">
              {percentage3B}% PM
            </span>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
            <span className="text-slate-400">Total Sasaran:</span>
            <span className="font-bold text-rose-300">
              {formatNumber(currentTotals.kelompok3B.total)} Jiwa
            </span>
          </div>
        </div>

        {/* KPI 4: Jenjang Pendidikan & Pesantren - Emerald & Mint */}
        <div className="group relative overflow-hidden rounded-2xl bg-slate-900/90 border border-emerald-500/30 hover:border-emerald-400 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-950/40">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Siswa &amp; Santri (8 Jenjang)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black text-emerald-400">
              {formatNumber(currentTotals.jenjangPendidikan.total)}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
              {percentageEdu}% PM
            </span>
          </div>
          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800/80 pt-2.5">
            <span className="text-slate-400">Santri Ponpes:</span>
            <span className="font-bold text-purple-300">
              {formatNumber(currentTotals.jenjangPendidikan.pesantren)} Jiwa
            </span>
          </div>
        </div>
      </div>

      {/* Comprehensive Category Badges Pill Strip with Multi-Color Coding */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-extrabold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 mr-1">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          Rincian Sasaran:
        </span>
        
        {/* Gabungan Kelompok 3B (Balita, Bumil, Busui) */}
        <span className="px-2.5 py-1 rounded-lg bg-rose-950/70 border border-rose-500/40 text-rose-200">
          Kelompok 3B: <strong className="text-white font-bold">{formatNumber(currentTotals.kelompok3B.bumil + currentTotals.kelompok3B.busui + currentTotals.kelompok3B.balita)}</strong>
        </span>

        <span className="px-2.5 py-1 rounded-lg bg-yellow-950/70 border border-yellow-500/40 text-yellow-200">
          PAUD/TK: <strong className="text-white font-bold">{formatNumber(currentTotals.jenjangPendidikan.paudTkRa)}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-200">
          SD/MI: <strong className="text-white font-bold">{formatNumber(currentTotals.jenjangPendidikan.sdMi)}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-500/40 text-sky-200">
          SMP/MTs: <strong className="text-white font-bold">{formatNumber(currentTotals.jenjangPendidikan.smpMts)}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-indigo-200">
          SMA/SMK: <strong className="text-white font-bold">{formatNumber(currentTotals.jenjangPendidikan.smaSmkMa)}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-purple-950/70 border border-purple-500/40 text-purple-200">
          Pesantren: <strong className="text-white font-bold">{formatNumber(currentTotals.jenjangPendidikan.pesantren)}</strong>
        </span>
        <span className="px-2.5 py-1 rounded-lg bg-orange-950/70 border border-orange-500/40 text-orange-200">
          SLB &amp; PKBM: <strong className="text-white font-bold">{formatNumber(currentTotals.jenjangPendidikan.slb + currentTotals.jenjangPendidikan.pkbm)}</strong>
        </span>
      </div>
    </header>
  );
};
