/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Komponen Visualisasi & Analisis Data SPPG Grobogan
 * Diagram Recharts Multi-Warna Presentasi & Direktori Kepala Dapur
 */

import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ChefHat,
  Search,
  CheckCircle,
  Building,
  Phone,
  BarChart3,
  PieChart as PieIcon,
  Award,
  Download,
  Filter,
  Users,
  Home,
  MapPin,
  Trophy,
  UtensilsCrossed,
  Layers,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';
import { SPPGUnit, calculateTotals } from '../data/groboganData';

interface AnalyticsChartsProps {
  sppgList: SPPGUnit[];
  allSppgList: SPPGUnit[];
  selectedKecamatan: string;
}

interface KecamatanAgg {
  kecamatan: string;
  sppgCount: number;
  totalPM: number;
  kelompok3B: number;
  pendidikan: number;
  isSelected: boolean;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  sppgList,
  allSppgList,
  selectedKecamatan,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Semua' | string>('Semua');
  const [rankingDisplayLimit, setRankingDisplayLimit] = useState<'all' | 'top10'>('all');

  const totals = calculateTotals(sppgList);

  // 1. Agregasi Data per Kecamatan untuk Seluruh Grobogan (19 Kecamatan)
  const kecamatanStats = useMemo(() => {
    const map: Record<string, KecamatanAgg> = {};

    allSppgList.forEach((sppg) => {
      const kec = (sppg.kecamatan || 'Lainnya').trim();
      if (!map[kec]) {
        map[kec] = {
          kecamatan: kec,
          sppgCount: 0,
          totalPM: 0,
          kelompok3B: 0,
          pendidikan: 0,
          isSelected: false,
        };
      }
      map[kec].sppgCount += 1;

      const pm3B =
        (sppg.kelompok3B?.bumil || 0) +
        (sppg.kelompok3B?.busui || 0) +
        (sppg.kelompok3B?.balita || 0);

      const pmEdu =
        (sppg.jenjangPendidikan?.paudTkRa || 0) +
        (sppg.jenjangPendidikan?.sdMi || 0) +
        (sppg.jenjangPendidikan?.smpMts || 0) +
        (sppg.jenjangPendidikan?.smaSmkMa || 0) +
        (sppg.jenjangPendidikan?.slb || 0) +
        (sppg.jenjangPendidikan?.pesantren || 0) +
        (sppg.jenjangPendidikan?.seminari || 0) +
        (sppg.jenjangPendidikan?.pkbm || 0);

      const totalItemPM = pm3B + pmEdu > 0 ? pm3B + pmEdu : sppg.kapasitasHarian || 0;

      map[kec].totalPM += totalItemPM;
      map[kec].kelompok3B += pm3B;
      map[kec].pendidikan += pmEdu;
    });

    // Mark selected kecamatan
    Object.values(map).forEach((item) => {
      item.isSelected =
        selectedKecamatan !== 'Semua' &&
        item.kecamatan.toLowerCase() === selectedKecamatan.toLowerCase();
    });

    return Object.values(map);
  }, [allSppgList, selectedKecamatan]);

  // Peringkat 1: Kecamatan dengan Jumlah Dapur SPPG Terbanyak (diurutkan menurun)
  const rankingBySppgCount = useMemo(() => {
    const sorted = [...kecamatanStats].sort((a, b) => b.sppgCount - a.sppgCount);
    return rankingDisplayLimit === 'top10' ? sorted.slice(0, 10) : sorted;
  }, [kecamatanStats, rankingDisplayLimit]);

  // Peringkat 2: Kecamatan dengan Sasaran Penerima Manfaat Terbanyak (diurutkan menurun)
  const rankingByTotalPM = useMemo(() => {
    const sorted = [...kecamatanStats].sort((a, b) => b.totalPM - a.totalPM);
    return rankingDisplayLimit === 'top10' ? sorted.slice(0, 10) : sorted;
  }, [kecamatanStats, rankingDisplayLimit]);

  // Top 3 Kecamatan untuk Unit SPPG
  const top3Sppg = useMemo(() => {
    return [...kecamatanStats].sort((a, b) => b.sppgCount - a.sppgCount).slice(0, 3);
  }, [kecamatanStats]);

  // Top 3 Kecamatan untuk Penerima Manfaat
  const top3PM = useMemo(() => {
    return [...kecamatanStats].sort((a, b) => b.totalPM - a.totalPM).slice(0, 3);
  }, [kecamatanStats]);

  // Sebaran per Desa jika Kecamatan Tertentu Dipilih
  const villageData = useMemo(() => {
    if (selectedKecamatan === 'Semua') return [];
    const desaMap: Record<string, { name: string; sppg: number; pm: number }> = {};
    sppgList.forEach((sppg) => {
      const desaName = sppg.desa || 'Desa Belum Ditentukan';
      if (!desaMap[desaName]) {
        desaMap[desaName] = { name: desaName, sppg: 0, pm: 0 };
      }
      desaMap[desaName].sppg += 1;
      const pmTotal =
        (sppg.kelompok3B?.bumil || 0) +
        (sppg.kelompok3B?.busui || 0) +
        (sppg.kelompok3B?.balita || 0) +
        (sppg.jenjangPendidikan?.paudTkRa || 0) +
        (sppg.jenjangPendidikan?.sdMi || 0) +
        (sppg.jenjangPendidikan?.smpMts || 0) +
        (sppg.jenjangPendidikan?.smaSmkMa || 0) +
        (sppg.jenjangPendidikan?.slb || 0) +
        (sppg.jenjangPendidikan?.pesantren || 0) +
        (sppg.jenjangPendidikan?.seminari || 0) +
        (sppg.jenjangPendidikan?.pkbm || 0);

      desaMap[desaName].pm += pmTotal > 0 ? pmTotal : sppg.kapasitasHarian || 0;
    });
    return Object.values(desaMap).sort((a, b) => b.pm - a.pm);
  }, [sppgList, selectedKecamatan]);

  // 2. Data Donut Komposisi Sasaran (Kelompok 3B vs Jenjang Pendidikan)
  const comparisonData = [
    { name: 'Kelompok 3B (Ibu & Balita)', value: totals.kelompok3B.total, color: '#f43f5e' }, // Rose
    { name: 'PAUD / TK / RA', value: totals.jenjangPendidikan.paudTkRa, color: '#eab308' }, // Yellow
    { name: 'SD / MI', value: totals.jenjangPendidikan.sdMi, color: '#10b981' }, // Emerald
    { name: 'SMP / MTs', value: totals.jenjangPendidikan.smpMts, color: '#0ea5e9' }, // Sky
    { name: 'SMA / SMK / MA', value: totals.jenjangPendidikan.smaSmkMa, color: '#6366f1' }, // Indigo
    { name: 'Pondok Pesantren', value: totals.jenjangPendidikan.pesantren, color: '#8b5cf6' }, // Purple
    { name: 'SLB & PKBM', value: totals.jenjangPendidikan.slb + totals.jenjangPendidikan.pkbm, color: '#f97316' }, // Orange
  ];

  // 3. Data Bar Chart Rincian Jenjang Pendidikan (Warna Variatif)
  const educationBreakdownData = [
    { name: 'PAUD/TK', jumlah: totals.jenjangPendidikan.paudTkRa, fill: '#eab308' },
    { name: 'SD/MI', jumlah: totals.jenjangPendidikan.sdMi, fill: '#10b981' },
    { name: 'SMP/MTs', jumlah: totals.jenjangPendidikan.smpMts, fill: '#0ea5e9' },
    { name: 'SMA/SMK', jumlah: totals.jenjangPendidikan.smaSmkMa, fill: '#6366f1' },
    { name: 'Pesantren', jumlah: totals.jenjangPendidikan.pesantren, fill: '#8b5cf6' },
    { name: 'SLB', jumlah: totals.jenjangPendidikan.slb, fill: '#f97316' },
    { name: 'PKBM', jumlah: totals.jenjangPendidikan.pkbm, fill: '#14b8a6' },
  ];

  // Filtered Kitchen List for Detail Table
  const filteredSppgList = sppgList.filter((item) => {
    const matchesSearch =
      item.namaSppg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kepalaDapur.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.desa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.alamatDapur ? item.alamatDapur.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      (item.namaYayasan ? item.namaYayasan.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
      item.kontak.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Semua' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Nama SPPG',
      'Nama Yayasan',
      'Alamat Dapur',
      'Kecamatan',
      'Desa',
      'Kepala Dapur',
      'No HP Ka SPPG',
      'Sasaran PM / Porsi',
      'Status',
      'Latitude',
      'Longitude',
    ];
    const rows = filteredSppgList.map((s) => [
      `"${s.id}"`,
      `"${s.namaSppg}"`,
      `"${s.namaYayasan || '-'}"`,
      `"${(s.alamatDapur || s.alamat || '-').replace(/"/g, '""')}"`,
      `"${s.kecamatan}"`,
      `"${s.desa}"`,
      `"${s.kepalaDapur}"`,
      `"${s.kontak}"`,
      s.kapasitasHarian,
      `"${s.status}"`,
      s.lat,
      s.lng,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `DATA_SPPG_GROBOGAN_${selectedKecamatan.toUpperCase()}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* SECTION 1: PERINGKAT KECAMATAN TERBANYAK (SPPG & SASARAN PM) */}
      <div className="space-y-4">
        {/* Header Section with Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Peringkat Kecamatan se-Kabupaten Grobogan
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Analisis komparatif kecamatan dengan unit dapur operasional dan sasaran penerima manfaat terbesar
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 hidden md:inline">Tampilan:</span>
            <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                onClick={() => setRankingDisplayLimit('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  rankingDisplayLimit === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({kecamatanStats.length} Kec)
              </button>
              <button
                onClick={() => setRankingDisplayLimit('top10')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  rankingDisplayLimit === 'top10'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Top 10 Teratas
              </button>
            </div>
          </div>
        </div>

        {/* Top 3 Quick Highlights Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 3 Dapur SPPG */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-indigo-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                🍲
              </div>
              <div>
                <span className="font-bold text-indigo-300 block">Top 3 Kecamatan (Dapur SPPG):</span>
                <span className="text-[11px] text-slate-400">Konsentrasi unit operasional terbanyak</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {top3Sppg.map((item, idx) => (
                <span
                  key={item.kecamatan}
                  className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                    idx === 0
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                      : idx === 1
                      ? 'bg-slate-300/15 border-slate-400/40 text-slate-200'
                      : 'bg-amber-800/20 border-amber-700/40 text-amber-400'
                  }`}
                >
                  <span className="text-[10px]">#{idx + 1}</span>
                  {item.kecamatan} ({item.sppgCount} Dapur)
                </span>
              ))}
            </div>
          </div>

          {/* Top 3 Penerima Manfaat */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                👥
              </div>
              <div>
                <span className="font-bold text-cyan-300 block">Top 3 Sasaran Penerima Manfaat:</span>
                <span className="text-[11px] text-slate-400">Volume layanan makanan bergizi terbesar</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {top3PM.map((item, idx) => (
                <span
                  key={item.kecamatan}
                  className={`px-2 py-1 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                    idx === 0
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300'
                      : idx === 1
                      ? 'bg-sky-500/15 border-sky-500/40 text-sky-300'
                      : 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                  }`}
                >
                  <span className="text-[10px]">#{idx + 1}</span>
                  {item.kecamatan} ({item.totalPM.toLocaleString('id-ID')} PM)
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2 Primary Bar Charts: SPPG Count Ranking & Total PM Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Chart 1: Ranking Kecamatan Berdasarkan Jumlah Dapur SPPG Terbanyak */}
          <div className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-indigo-400" />
                  Kecamatan dengan Dapur SPPG Terbanyak
                </h3>
                <p className="text-xs text-slate-400">
                  Urutan kecamatan berdasarkan jumlah unit dapur mandiri yang beroperasi
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                Total {allSppgList.length} Dapur
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankingBySppgCount}
                  margin={{ top: 10, right: 10, left: -20, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="kecamatan"
                    stroke="#94a3b8"
                    fontSize={11}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as KecamatanAgg;
                        return (
                          <div className="bg-slate-900 border border-indigo-500/40 p-3 rounded-xl shadow-2xl text-xs min-w-[200px]">
                            <p className="font-extrabold text-white text-sm mb-1.5 flex items-center justify-between">
                              <span>Kecamatan {data.kecamatan}</span>
                              {data.isSelected && (
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                                  Aktif
                                </span>
                              )}
                            </p>
                            <p className="text-indigo-400 font-bold text-xs flex items-center justify-between">
                              <span>Jumlah Dapur SPPG:</span>
                              <span className="text-sm font-black">{data.sppgCount} Unit</span>
                            </p>
                            <p className="text-slate-300 mt-1 flex items-center justify-between">
                              <span>Sasaran Penerima:</span>
                              <strong className="text-cyan-300">{data.totalPM.toLocaleString('id-ID')} Jiwa</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="sppgCount" name="Jumlah SPPG" radius={[6, 6, 0, 0]}>
                    {rankingBySppgCount.map((entry, index) => {
                      const isSel = entry.isSelected;
                      const fillColor = isSel
                        ? '#38bdf8' // Cyan highlight if selected
                        : index === 0
                        ? '#818cf8' // First gets brighter indigo
                        : index < 3
                        ? '#6366f1' // Top 3 indigo
                        : '#4f46e5'; // Standard dark indigo
                      return <Cell key={`sppg-cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>* Diurutkan dari kecamatan dengan dapur terbanyak ke paling sedikit</span>
              <span className="text-indigo-300 font-semibold">1 Porsi = 1 Penerima Manfaat</span>
            </div>
          </div>

          {/* Chart 2: Ranking Kecamatan Berdasarkan Jumlah Sasaran Penerima Manfaat (PM) */}
          <div className="rounded-2xl bg-slate-900/90 border border-cyan-500/30 p-5 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Kecamatan dengan Sasaran PM Terbanyak
                </h3>
                <p className="text-xs text-slate-400">
                  Urutan kecamatan berdasarkan jumlah penerima manfaat (Kelompok 3B &amp; Jenjang Pendidikan)
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {totals.totalPM.toLocaleString('id-ID')} Jiwa Se-Grobogan
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankingByTotalPM}
                  margin={{ top: 10, right: 10, left: -10, bottom: 45 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="kecamatan"
                    stroke="#94a3b8"
                    fontSize={11}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={50}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as KecamatanAgg;
                        return (
                          <div className="bg-slate-900 border border-cyan-500/40 p-3 rounded-xl shadow-2xl text-xs min-w-[210px]">
                            <p className="font-extrabold text-white text-sm mb-1.5 flex items-center justify-between">
                              <span>Kecamatan {data.kecamatan}</span>
                              {data.isSelected && (
                                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded">
                                  Aktif
                                </span>
                              )}
                            </p>
                            <p className="text-cyan-300 font-bold text-xs flex items-center justify-between">
                              <span>Penerima Manfaat:</span>
                              <span className="text-sm font-black">{data.totalPM.toLocaleString('id-ID')} Jiwa</span>
                            </p>
                            <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 text-[11px] text-slate-300">
                              <div className="flex justify-between">
                                <span className="text-rose-400">Kelompok 3B (Ibu/Balita):</span>
                                <strong className="text-white">{data.kelompok3B.toLocaleString('id-ID')}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-emerald-400">Pendidikan &amp; Ponpes:</span>
                                <strong className="text-white">{data.pendidikan.toLocaleString('id-ID')}</strong>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-indigo-400">Dapur Unit SPPG:</span>
                                <strong className="text-white">{data.sppgCount} Unit</strong>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="totalPM" name="Sasaran PM" radius={[6, 6, 0, 0]}>
                    {rankingByTotalPM.map((entry, index) => {
                      const isSel = entry.isSelected;
                      const fillColor = isSel
                        ? '#38bdf8' // Cyan highlight
                        : index === 0
                        ? '#06b6d4' // Cyan leader
                        : index < 3
                        ? '#0ea5e9' // Sky top 3
                        : '#0284c7'; // Standard deep sky
                      return <Cell key={`pm-cell-${index}`} fill={fillColor} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
              <span>* Diurutkan dari kecamatan dengan sasaran jiwa terbanyak</span>
              <span className="text-cyan-300 font-semibold">Cakupan Gizi 100% Target</span>
            </div>
          </div>
        </div>
      </div>

      {/* JIKA KECAMATAN TERTENTU DIPILIH: RINCIAN SEBARAN PER DESA */}
      {selectedKecamatan !== 'Semua' && villageData.length > 0 && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                Sebaran Dapur &amp; Penerima Manfaat per Desa di Kec. {selectedKecamatan}
              </h3>
              <p className="text-xs text-slate-400">
                Rincian sebaran {sppgList.length} dapur SPPG di {villageData.length} desa wilayah {selectedKecamatan}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              {villageData.length} Desa Terlayani
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageData} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs">
                          <p className="font-bold text-white mb-1">Desa {data.name}</p>
                          <p className="text-cyan-300 font-semibold">
                            Penerima Manfaat: <strong>{data.pm.toLocaleString('id-ID')} Jiwa</strong>
                          </p>
                          <p className="text-indigo-400 font-semibold">
                            Jumlah SPPG: <strong>{data.sppg} Dapur</strong>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="pm" name="Penerima Manfaat" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* SECTION 2: KOMPOSISI SASARAN (DONUT) & RINCIAN JENJANG PENDIDIKAN (BAR CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart A: Komposisi Sasaran Penerima Manfaat (Donut Multi-Warna) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-cyan-400" />
                Komposisi Sasaran (Kelompok 3B vs Pendidikan)
              </h3>
              <p className="text-xs text-slate-400">
                Proporsi pembagian penerima manfaat menurut kategori target
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              {totals.totalPM.toLocaleString('id-ID')} Jiwa
            </span>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={comparisonData.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const percent = ((data.value / (totals.totalPM || 1)) * 100).toFixed(1);
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-2xl text-xs">
                          <p className="font-bold text-white mb-1">{data.name}</p>
                          <p style={{ color: data.color }} className="font-bold">
                            Jumlah: {data.value.toLocaleString('id-ID')} Jiwa
                          </p>
                          <p className="text-slate-400">Persentase: {percent}% dari total sasaran</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Rincian Jenjang Pendidikan & Pesantren (Warna Variatif) */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Sebaran Siswa &amp; Santri per Jenjang
              </h3>
              <p className="text-xs text-slate-400">
                Total {totals.jenjangPendidikan.total.toLocaleString('id-ID')} peserta didik terlayani
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              7 Jenjang Belajar
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={educationBreakdownData}
                margin={{ top: 10, right: 10, left: -15, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs">
                          <p className="font-bold text-white mb-1">Jenjang {data.name}</p>
                          <p style={{ color: data.fill }} className="font-bold">
                            Total: {data.jumlah.toLocaleString('id-ID')} Jiwa
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="jumlah" radius={[6, 6, 0, 0]}>
                  {educationBreakdownData.map((entry, index) => (
                    <Cell key={`edu-cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SECTION 3: DIREKTORI KEPALA DAPUR SPPG & ALAMAT OPERASIONAL */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-700/80 p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-indigo-400" />
              Direktori Kepala Dapur &amp; Unit SPPG ({filteredSppgList.length} Dapur)
            </h3>
            <p className="text-xs text-slate-400">
              Informasi lengkap penanggung jawab, sasaran penerima manfaat, dan alamat operasional dapur
            </p>
          </div>

          {/* Search, Filter & Export */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari SPPG, Kepala Dapur, Desa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 focus:border-indigo-400 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
              />
            </div>

            <select
              aria-label="Filter Status Operasional SPPG"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aktif Beroperasi">Aktif Beroperasi</option>
              <option value="Uji Coba Distribusi">Uji Coba Distribusi</option>
              <option value="Verifikasi Higiene">Verifikasi Higiene</option>
            </select>

            <button
              onClick={handleExportCSV}
              title="Unduh Data SPPG ke format CSV"
              className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ekspor CSV</span>
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-indigo-300 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3.5">ID / Nama SPPG</th>
                <th className="py-3 px-3.5">Kecamatan &amp; Desa</th>
                <th className="py-3 px-3.5">Kepala Dapur &amp; Kontak</th>
                <th className="py-3 px-3.5 text-right">Sasaran PM (Porsi)</th>
                <th className="py-3 px-3.5 text-center">Mutu Higiene &amp; Halal</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSppgList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Tidak ditemukan data SPPG yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredSppgList.map((item) => {
                  const cleanPhone = (item.kontak || '').replace(/\D/g, '');
                  const waLink =
                    cleanPhone && cleanPhone !== '-'
                      ? `https://wa.me/${
                          cleanPhone.startsWith('0')
                            ? '62' + cleanPhone.slice(1)
                            : cleanPhone.startsWith('62')
                            ? cleanPhone
                            : '62' + cleanPhone
                        }`
                      : '';

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      {/* SPPG Name & Address */}
                      <td className="py-3 px-3.5 max-w-[340px]">
                        <div className="font-bold text-white text-sm">{item.namaSppg}</div>
                        {item.namaYayasan && (
                          <div className="inline-flex items-center gap-1 my-1 px-2 py-0.5 rounded text-[10.5px] font-medium bg-indigo-950/80 text-indigo-300 border border-indigo-500/30">
                            <Building className="w-3 h-3 text-cyan-400" />
                            <span>{item.namaYayasan}</span>
                          </div>
                        )}

                        {/* Wadah Khusus Informasi Alamat Dapur SPPG */}
                        <div className="mt-1.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-0.5">
                            <Home className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>Alamat Dapur:</span>
                          </div>
                          <div className="text-slate-200 leading-snug break-words">
                            {item.alamatDapur || item.alamat}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="font-mono text-cyan-400 font-bold">{item.id}</span>
                          {item.lat !== 0 && (
                            <>
                              <span className="text-slate-600">&bull;</span>
                              <a
                                href={`https://www.google.com/maps?q=${item.lat},${item.lng}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-400 hover:text-white flex items-center gap-0.5 hover:underline"
                              >
                                <MapPin className="w-3 h-3" />
                                <span>Peta GPS</span>
                              </a>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Kecamatan & Desa */}
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-white">Kec. {item.kecamatan}</div>
                        <div className="text-slate-400 text-[11px]">Desa {item.desa}</div>
                      </td>

                      {/* Kepala Dapur & Kontak */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-200">{item.kepalaDapur}</div>
                        {waLink ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-lg mt-1 transition-colors"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{item.kontak}</span>
                          </a>
                        ) : (
                          <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" />
                            <span>{item.kontak || '-'}</span>
                          </div>
                        )}
                      </td>

                      {/* Sasaran PM / Porsi Harian */}
                      <td className="py-3 px-3.5 text-right">
                        <div className="font-black text-white text-sm">
                          {item.kapasitasHarian.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[11px] text-cyan-400">Jiwa (Porsi/Hari)</div>
                      </td>

                      {/* Sertifikasi */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle className="w-2.5 h-2.5" /> Dinkes Lolos
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            <Award className="w-2.5 h-2.5" /> Halal MUI
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10.5px] font-bold border ${
                            item.status === 'Aktif Beroperasi'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
