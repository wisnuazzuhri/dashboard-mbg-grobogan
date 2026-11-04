# 🍲 Dashboard Eksekutif Monitoring Program Makan Bergizi Gratis (MBG)
## Kabupaten Grobogan, Jawa Tengah (19 Kecamatan)

Aplikasi Dashboard Geospasial (GIS) dan Analitik Agregasi Data Satuan Pelayanan Pemenuhan Gizi (**SPPG**) untuk Program Strategis Nasional Makan Bergizi Gratis (MBG) di 19 Kecamatan Kabupaten Grobogan. Didesain dengan palet warna presentasi eksekutif multi-kategori yang modern, kontras tinggi, dan variatif (Royal Indigo, Cyan, Amber, Rose, Emerald, dan Purple) agar memudahkan pembacaan metrik saat rapat dan presentasi pemangku kepentingan.

---

## 🚀 Panduan Deploy Cepat ke Vercel (One-Click Deployment)

Aplikasi ini dibangun menggunakan **Vite + React 19 + Tailwind CSS + Leaflet GIS + Carto Basemaps** dan 100% siap di-deploy langsung ke Vercel.

### Metode 1: Deploy Melalui Vercel Dashboard (Rekomendasi)

1. Push repository ini ke akun GitHub / GitLab / Bitbucket Anda.
2. Buka dashboard [Vercel](https://vercel.com/) lalu klik **"Add New Project"** -> **"Import Git Repository"**.
3. Pilih repository proyek ini.
4. Pada bagian **Build and Output Settings**, Vercel akan otomatis mendeteksi:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Konfigurasi **Environment Variables** (lihat daftar variabel di bawah).
6. Klik **"Deploy"**.

---

## 🔐 Konfigurasi Environment Variables di Vercel

Pada menu **Settings > Environment Variables** di dashboard Vercel Anda, tambahkan parameter berikut:

| Nama Variabel | Wajib? | Contoh Nilai | Deskripsi |
|---|---|---|---|
| `VITE_GOOGLE_SHEETS_CSV_URL` | Opsional | `https://docs.google.com/spreadsheets/d/1jP0MXb0IYN7ZvFApQliZyCOCQykmBxwIS47B8VPJS_s/gviz/tq?tqx=out:csv&sheet=DATA_MASTER_CLEAN` | Endpoint CSV publik dari tab `DATA_MASTER_CLEAN`. Jika dikosongkan, aplikasi otomatis menggunakan data master internal lengkap 19 kecamatan. |
| `VITE_CARTO_API_KEY` | Opsional | `cb1_50gp_1_4615d499a52f21816eccd120` | API Key Carto Basemaps untuk memuat tile resmi (Dark Matter, Voyager, Positron) tanpa watermark. |

---

## 📊 Struktur & Fitur Utama

1. **Executive Header & KPI Metric Summary**:
   - Total Unit Dapur SPPG Operasional & Kapasitas Porsi Harian (*Royal Indigo*).
   - Total Penerima Manfaat (PM) Jiwa Sasaran (*Cyan & Sky Blue*).
   - Breakdown **Kelompok 3B**: Ibu Hamil (Bumil), Ibu Menyusui (Busui), dan Anak Balita (*Rose & Coral*).
   - Breakdown **Jenjang Pendidikan**: PAUD/TK/RA, SD/MI, SMP/MTs, SMA/SMK/MA, SLB, Pondok Pesantren, Seminari, dan PKBM (*Emerald & Purple*).
   - Filter wilayah interaktif untuk seluruh 19 Kecamatan di Grobogan.

2. **Peta GIS Interaktif Grobogan (Carto Basemaps)**:
   - Berpusat di koordinat Kabupaten Grobogan `(-7.03, 110.92)`.
   - Menggunakan **Carto API Key** resmi dengan pilihan tile:
     - **Carto Dark Matter** (Tema Gelap Eksekutif)
     - **Carto Voyager** (Warna Jelas & Detail Jalan)
     - **Carto Positron** (Terang & Bersih)
     - **Citra Satelit Esri** (Foto Udara Resolusi Tinggi)
   - Visualisasi sebaran unit dapur mandiri SPPG dan radius konsentrasi penerima manfaat tiap kecamatan.
   - Klik area kecamatan untuk memfilter seluruh statistik dashboard secara dinamis.

3. **Subdistrict Analytics & Direktori Dapur SPPG**:
   - Grafik batang perbandingan kapasitas porsi vs jumlah penerima manfaat per kecamatan/desa.
   - Diagram donat komposisi sasaran multi-warna (Bumil, Busui, Balita, Siswa, Santri).
   - Grafik distribusi menurut jenjang pendidikan & pondok pesantren.
   - Tabel direktori Kepala Dapur SPPG lengkap dengan kontak WhatsApp, alamat operasional, status sertifikasi Dinkes & Halal, serta fitur **Ekspor CSV**.

---

## 🗺️ 19 Kecamatan Kabupaten Grobogan yang Terintegrasi

1. **Purwodadi** (Pusat Pemerintahan)
2. **Toroh**
3. **Geyer**
4. **Pulokulon**
5. **Kradenan**
6. **Gabus**
7. **Ngaringan**
8. **Wirosari**
9. **Tawangharjo**
10. **Grobogan**
11. **Brati**
12. **Klambu**
13. **Godong**
14. **Gubug**
15. **Tegowanu**
16. **Tanggungharjo**
17. **Kedungjati**
18. **Karangrayung**
19. **Penawangan**
