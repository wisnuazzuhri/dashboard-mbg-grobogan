/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Service untuk memproses Google Sheets CSV Export (Tab: DATA_MASTER_CLEAN)
 * Program Makan Bergizi Gratis (MBG) Grobogan
 */

import Papa from 'papaparse';
import { MASTER_SPPG_GROBOGAN, SPPGUnit, KECAMATAN_GROBOGAN } from '../data/groboganData';

export interface SheetFetchResult {
  data: SPPGUnit[];
  source: 'google_sheets' | 'local_master';
  lastUpdated: string;
  rowCount: number;
  error?: string;
  sheetUrl?: string;
}

const DEFAULT_SHEET_URL_KEY = 'mbg_grobogan_sheet_url';

export const getStoredSheetUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem(DEFAULT_SHEET_URL_KEY) ||
    (import.meta as any).env?.VITE_GOOGLE_SHEETS_CSV_URL ||
    ''
  );
};

export const setStoredSheetUrl = (url: string): void => {
  if (typeof window !== 'undefined') {
    if (!url.trim()) {
      localStorage.removeItem(DEFAULT_SHEET_URL_KEY);
    } else {
      localStorage.setItem(DEFAULT_SHEET_URL_KEY, url.trim());
    }
  }
};

/**
 * Normalizes coordinate by subdistrict name if CSV has missing/invalid lat/lng
 */
function getFallbackCoordinates(kecamatan: string, index: number): { lat: number; lng: number } {
  const kec = KECAMATAN_GROBOGAN.find(
    k => k.nama.toLowerCase() === kecamatan.toLowerCase()
  );
  if (kec) {
    const latOffset = ((index % 5) - 2) * 0.006;
    const lngOffset = (Math.floor(index / 5) - 2) * 0.007;
    return { lat: kec.lat + latOffset, lng: kec.lng + lngOffset };
  }
  return { lat: -7.03 + (index * 0.005), lng: 110.92 + (index * 0.005) };
}

/**
 * Helper untuk mengambil nilai properti secara fleksibel tanpa masalah case/spasi
 */
function getRowValue(row: any, keys: string[]): any {
  const rowKeys = Object.keys(row);
  for (const key of keys) {
    const matchedKey = rowKeys.find(k => k.trim().toLowerCase() === key.toLowerCase());
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null) {
      return row[matchedKey];
    }
  }
  return undefined;
}

/**
 * Helper untuk mem-parsing koordinat (menangani format multi-titik dan skala seperti -705.924 atau 1.108.837)
 */
function parseCoordinate(val: any, isLongitude = false): number {
  if (typeof val === 'number') {
    let num = val;
    if (!isLongitude) {
      if (num > 0) num = -num;
      while (num < -10 && num > -10000) num /= 10;
    } else {
      while (num > 0 && num < 20) num *= 10;
      while (num > 200 && num < 20000) num /= 10;
    }
    return num;
  }

  if (val === undefined || val === null) return NaN;
  let str = String(val).trim();
  if (!str) return NaN;

  str = str.replace(/[^\d.,\-]/g, '');
  if (!str) return NaN;

  const isNegative = str.startsWith('-');
  const cleanNumStr = str.replace(/^-/, '');
  const dotParts = cleanNumStr.split(/[.,]/);

  let num = NaN;
  if (dotParts.length > 2) {
    if (isLongitude && dotParts[0] === '1' && dotParts[1].length >= 3) {
      const combined = dotParts.join('');
      if (combined.startsWith('11') || combined.startsWith('10')) {
        num = parseFloat(combined.slice(0, 3) + '.' + combined.slice(3));
      } else {
        num = parseFloat(dotParts[0] + '.' + dotParts.slice(1).join(''));
      }
    } else {
      num = parseFloat(dotParts[0] + '.' + dotParts.slice(1).join(''));
    }
  } else {
    num = parseFloat(str.replace(/,/g, '.'));
  }

  if (isNegative && num > 0) num = -num;
  if (!isNegative && num < 0) num = Math.abs(num);
  if (isNaN(num)) return NaN;

  // Koreksi orde magnitudo khusus rentang geografis Kabupaten Grobogan
  if (!isLongitude) {
    if (num > 0) num = -num; // Lintang Jawa Tengah selalu selatan (-6.8 s/d -7.5)
    while (num < -10 && num > -10000) num /= 10;
  } else {
    // Bujur Jawa Tengah (Grobogan) berkisar 110.0 s/d 111.6
    while (num > 0 && num < 20) num *= 10;
    while (num > 200 && num < 20000) num /= 10;
  }

  return num;
}

/**
 * Helper untuk merapikan nomor HP Kepala SPPG
 */
function formatPhoneNumber(val: any): string {
  if (!val) return '-';
  let str = String(val).replace(/\D/g, '');
  if (!str) return '-';
  if (str.startsWith('62')) {
    str = '0' + str.slice(2);
  } else if (!str.startsWith('0')) {
    str = '0' + str;
  }
  return str;
}

/**
 * Fetch and parse CSV from Google Sheets
 */
export async function fetchMBGMasterData(customUrl?: string): Promise<SheetFetchResult> {
  const targetUrl = (customUrl || getStoredSheetUrl()).trim();
  console.log('[MBG DEBUG] Target URL:', targetUrl);

  if (!targetUrl) {
    console.warn('[MBG Service] URL Google Sheets tidak ditemukan, menggunakan data cadangan lokal.');
    return {
      data: MASTER_SPPG_GROBOGAN,
      source: 'local_master',
      lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
      rowCount: MASTER_SPPG_GROBOGAN.length,
    };
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/csv, text/plain, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Gagal mengunduh CSV (HTTP ${response.status})`);
    }

    const csvText = await response.text();

    console.log('[MBG DEBUG] CSV berhasil diunduh:', {
      panjangCSV: csvText.length,
      previewCSV: csvText.substring(0, 500)
    });

    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: (results: any) => {
          if (!results.data || results.data.length === 0) {
            resolve({
              data: MASTER_SPPG_GROBOGAN,
              source: 'local_master',
              lastUpdated: new Date().toLocaleTimeString('id-ID') + ' WIB',
              rowCount: MASTER_SPPG_GROBOGAN.length,
              error: 'Data CSV kosong, memuat cadangan data master Grobogan.',
            });
            return;
          }

          const sppgMap = new Map<string, SPPGUnit>();

          results.data.forEach((row: any) => {
            const rawSppg = getRowValue(row, ['SPPG', 'Nama SPPG', 'namaSppg']);
            if (!rawSppg || !String(rawSppg).trim()) return;

            // Kunci normalisasi nama SPPG
            const sppgNameClean = String(rawSppg).trim().replace(/\s+/g, ' ');
            const sppgKey = sppgNameClean.toUpperCase(); 

            const kec = getRowValue(row, ['Kecamatan', 'kecamatan']) || 'Purwodadi';
            const desa = getRowValue(row, ['Wilayah_Desa', 'Desa', 'desa', 'Kelurahan']) || 'Desa Percontohan';
            const kepala = getRowValue(row, ['Kepala_Dapur', 'kepalaDapur', 'Kepala Dapur']) || 'Petugas Gizi';
            const namaYayasan = getRowValue(row, ['Nama_Yayasan', 'Nama Yayasan', 'Yayasan', 'yayasan']);
            const noHpRaw = getRowValue(row, ['No_HP_Ka_SPPG', 'No_HP', 'No HP', 'Kontak', 'kontak', 'no_hp']);
            const kontakClean = formatPhoneNumber(noHpRaw);

            const rawAlamatDapur = getRowValue(row, [
              'Alamat_Dapur',
              'Alamat Dapur',
              'alamat_dapur',
              'alamatDapur',
              'Alamat SPPG',
              'Alamat',
            ]);
            const alamatDapurClean = rawAlamatDapur ? String(rawAlamatDapur).trim() : undefined;

            const totalPM = Number(getRowValue(row, ['Total_Penerima_Manfaat', 'Jumlah_Siswa', 'Kapasitas']) || 0);
            const kategori = String(getRowValue(row, ['Kategori_Jenjang', 'Kategori']) || '');
            const namaPM = String(getRowValue(row, ['Nama_Penerima_Manfaat', 'Nama Penerima Manfaat']) || '');

            if (!sppgMap.has(sppgKey)) {
              const latVal = parseCoordinate(getRowValue(row, ['Latitude', 'Lat', 'lat', 'latitude']), false);
              const lngVal = parseCoordinate(getRowValue(row, ['Longitude', 'Lng', 'lng', 'longitude']), true);
              
              const hasValidCoords = !isNaN(latVal) && !isNaN(lngVal) && latVal !== 0 && lngVal !== 0;
              const coords = hasValidCoords
                ? { lat: latVal, lng: lngVal } 
                : getFallbackCoordinates(String(kec), sppgMap.size);

              sppgMap.set(sppgKey, {
                id: `SPPG-${sppgMap.size + 1}`,
                namaSppg: sppgNameClean,
                namaYayasan: namaYayasan ? String(namaYayasan).trim() : undefined,
                alamatDapur: alamatDapurClean,
                kecamatan: String(kec).trim(),
                desa: String(desa).trim(),
                alamat: alamatDapurClean || `Desa ${desa}, Kec. ${kec}, Grobogan`,
                lat: coords.lat,
                lng: coords.lng,
                kepalaDapur: String(kepala).trim(),
                kontak: kontakClean,
                kapasitasHarian: 0,
                status: 'Aktif Beroperasi' as any,
                kelompok3B: { bumil: 0, busui: 0, balita: 0 },
                jenjangPendidikan: {
                  paudTkRa: 0,
                  sdMi: 0,
                  smpMts: 0,
                  smaSmkMa: 0,
                  slb: 0,
                  pesantren: 0,
                  seminari: 0,
                  pkbm: 0,
                },
                sertifikasiHigiene: true,
                sertifikasiHalal: true,
                inspeksiTerakhir: '2026-10-28',
              });
            }

            const unit = sppgMap.get(sppgKey)!;
            unit.kapasitasHarian += totalPM;

            // Perbarui nama yayasan, alamat dapur, dan kontak jika di baris ini ditemukan
            if (namaYayasan && !unit.namaYayasan) {
              unit.namaYayasan = String(namaYayasan).trim();
            }
            if (alamatDapurClean && !unit.alamatDapur) {
              unit.alamatDapur = alamatDapurClean;
              unit.alamat = alamatDapurClean;
            }
            if (kontakClean !== '-' && unit.kontak === '-') {
              unit.kontak = kontakClean;
            }

          // ✅ KODE PERBAIKAN BARU:
              const katUpper = String(kategori).toUpperCase().trim();
              const pmUpper = String(namaPM).toUpperCase().trim();

              // 1. Prioritaskan pengecekan Kelompok 3B (Balita, Bumil, Busui)
              if (katUpper.includes('BALITA') || pmUpper.includes('BALITA')) {
                unit.kelompok3B.balita += totalPM;
              } else if (katUpper.includes('BUSUI') || pmUpper.includes('BUSUI')) {
                unit.kelompok3B.busui += totalPM;
              } else if (katUpper.includes('BUMIL') || katUpper.includes('BUHAMIL') || pmUpper.includes('BUMIL')) {
                unit.kelompok3B.bumil += totalPM;
              } 
              // 2. SD / MI (Diperiksa SEBELUM PAUD/TK untuk menghindari kata "SD" atau "MI" bentrok dengan nama sekolah)
              else if (
                katUpper.includes('SD') || katUpper.includes('MI') || 
                pmUpper.includes('SD ') || pmUpper.includes('SDN') || pmUpper.includes(' MI ') || pmUpper.includes('MIN ')
              ) {
                unit.jenjangPendidikan.sdMi += totalPM;
              } 
              // 3. SMP / MTs
              else if (
                katUpper.includes('SMP') || katUpper.includes('MTS') || 
                pmUpper.includes('SMP') || pmUpper.includes('MTS')
              ) {
                unit.jenjangPendidikan.smpMts += totalPM;
              } 
              // 4. SMA / SMK / MA
              else if (
                katUpper.includes('SMA') || katUpper.includes('SMK') || katUpper.includes('MA') || 
                pmUpper.includes('SMA') || pmUpper.includes('SMK') || pmUpper.includes(' MAN ')
              ) {
                unit.jenjangPendidikan.smaSmkMa += totalPM;
              } 
              // 5. Pesantren / Ponpes / Santri
              else if (
                katUpper.includes('PESANTREN') || katUpper.includes('PONPES') || katUpper.includes('SANTRI') ||
                pmUpper.includes('PESANTREN') || pmUpper.includes('PONPES')
              ) {
                unit.jenjangPendidikan.pesantren += totalPM;
              } 
              // 6. PAUD / TK / RA / KB / SPS
              else if (
                katUpper.includes('PAUD') || katUpper.includes('TK') || katUpper.includes('RA') || katUpper.includes('KB') ||
                pmUpper.includes('PAUD') || pmUpper.includes('TK') || pmUpper.includes('RA') || pmUpper.includes('KB ')
              ) {
                unit.jenjangPendidikan.paudTkRa += totalPM;
              } 
              // 7. SLB
              else if (katUpper.includes('SLB') || pmUpper.includes('SLB')) {
                unit.jenjangPendidikan.slb += totalPM;
              } 
              // 8. Seminari
              else if (katUpper.includes('SEMINARI') || pmUpper.includes('SEMINARI')) {
                unit.jenjangPendidikan.seminari += totalPM;
              } 
              // 9. PKBM
              else if (katUpper.includes('PKBM') || pmUpper.includes('PKBM')) {
                unit.jenjangPendidikan.pkbm += totalPM;
              } 
              // 10. Fallback jika kategori berisi informasi jenjang dasar
              else {
                unit.jenjangPendidikan.sdMi += totalPM;
              }
          });

          const parsedList = Array.from(sppgMap.values());
          console.log(`[MBG Service] Berhasil memuat ${parsedList.length} unit SPPG unik dari Google Sheets.`);

          resolve({
            data: parsedList,
            source: 'google_sheets',
            lastUpdated: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB',
            rowCount: parsedList.length,
            sheetUrl: targetUrl,
          });
        },
        error: (err: any) => {
          console.error('[MBG Service] Error PapaParse:', err);
          resolve({
            data: MASTER_SPPG_GROBOGAN,
            source: 'local_master',
            lastUpdated: new Date().toLocaleTimeString('id-ID') + ' WIB',
            rowCount: MASTER_SPPG_GROBOGAN.length,
            error: `Gagal membaca format CSV: ${err.message}`,
          });
        },
      });
    });
  } catch (error: any) {
    console.error('[MBG Service] Error Fetch Google Sheets:', error);
    return {
      data: MASTER_SPPG_GROBOGAN,
      source: 'local_master',
      lastUpdated: new Date().toLocaleTimeString('id-ID') + ' WIB',
      rowCount: MASTER_SPPG_GROBOGAN.length,
      error: `Koneksi Google Sheets gagal: ${error.message}. Menggunakan database master lokal.`,
    };
  }
}