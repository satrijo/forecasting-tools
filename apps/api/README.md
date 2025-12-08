# BMKG Weather API

REST API untuk mengambil data cuaca real-time dari stasiun AWS (Automatic Weather Station) dan ARG (Automatic Rain Gauge) BMKG Indonesia.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Tech Stack](#️-tech-stack)
- [Setup](#-setup)
- [API Endpoints](#-api-endpoints)
- [Query Parameters](#-query-parameters)
- [Response Format](#-response-format)
- [Contoh Penggunaan](#-contoh-penggunaan)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)

## ✨ Fitur

- 🌍 **Fetch by Province** - Ambil data semua stasiun dalam satu atau beberapa provinsi
- 🏙️ **Fetch by City** - Cari stasiun berdasarkan nama kota (partial, exact, atau startsWith match)
- 📍 **Fetch by Radius** - Temukan stasiun dalam radius tertentu dari koordinat
- 🎯 **Fetch by Station IDs** - Ambil data stasiun spesifik
- 🔍 **Filter by Type** - Filter AWS saja, ARG saja, atau keduanya
- ⚙️ **Flexible Search** - Support multiple cities, exclude cities, custom match mode
- 🔐 **Secure** - Credentials disimpan di environment variables

## 🛠️ Tech Stack

- **Runtime**: Bun 1.3.3
- **Framework**: Hono 4.10.7
- **Monorepo**: Turborepo 2.6.3
- **Language**: TypeScript
- **Data Source**: BMKG AWS Center API

## 🚀 Setup

### 1. Install Dependencies

```bash
# Di root project
bun install
```

### 2. Setup Environment Variables

```bash
# Copy template .env
cp ../../.env.example ../../.env
```

Edit file `.env` dan isi dengan credentials BMKG Anda:

```env
BMKG_USERNAME=your_station_id
BMKG_PASSWORD=your_password
```

> **Note**: Credentials ini didapat dari BMKG. Hubungi administrator BMKG untuk mendapatkan akses.

### 3. Run Development Server

```bash
# Di root project
bun run dev --filter=api

# Atau di folder apps/api
bun run dev
```

Server akan berjalan di: **http://localhost:3000**

### 4. Test API

```bash
# Test endpoint
curl http://localhost:3000/

# Test fetch data
curl "http://localhost:3000/aws?province=PR013&type=aws"
```

## 📡 API Endpoints

### GET `/`

Info API dan daftar endpoint yang tersedia.

**Response:**

```json
{
  "message": "BMKG Weather API",
  "endpoints": { ... },
  "examples": { ... }
}
```

### GET `/aws`

Fetch data cuaca dari stasiun AWS/ARG dengan berbagai filter.

**Required**: Salah satu dari parameter berikut harus ada:

- `province` - Fetch by province code(s)
- `city` - Fetch by city name(s)
- `lat` + `lon` + `radius` - Fetch by radius
- `stations` - Fetch by station ID(s)

## 🔧 Query Parameters

### Main Parameters (pilih salah satu)

| Parameter  | Type   | Description                                                         | Example                      |
| ---------- | ------ | ------------------------------------------------------------------- | ---------------------------- |
| `province` | string | Kode provinsi (comma-separated untuk multiple)                      | `PR013` atau `PR013,PR015`   |
| `city`     | string | Nama kota (comma-separated untuk multiple, gunakan `_` untuk spasi) | `cilacap` atau `banjar_baru` |
| `stations` | string | Station IDs (comma-separated)                                       | `96805` atau `96805,96807`   |
| `lat`      | number | Latitude center point (wajib bersama `lon` dan `radius`)            | `-7.5`                       |
| `lon`      | number | Longitude center point (wajib bersama `lat` dan `radius`)           | `110.5`                      |
| `radius`   | number | Radius dalam kilometer (wajib bersama `lat` dan `lon`)              | `50`                         |

### Optional Parameters

| Parameter | Type   | Default      | Description                                                      | Example        |
| --------- | ------ | ------------ | ---------------------------------------------------------------- | -------------- |
| `type`    | string | `null` (all) | Filter tipe stasiun: `aws`, `arg`, atau `aws,arg`                | `aws`          |
| `match`   | string | `partial`    | Mode pencarian city: `partial`, `exact`, `startsWith`            | `exact`        |
| `exclude` | string | -            | Exclude kota tertentu (comma-separated, hanya untuk city search) | `banjarnegara` |

### Parameter Details

#### `type`

- `aws` - Hanya stasiun AWS (Automatic Weather Station)
- `arg` - Hanya stasiun ARG (Automatic Rain Gauge)
- `aws,arg` - Kedua tipe
- Kosong/null - Semua tipe (default)

#### `match` (untuk city search)

- `partial` - Contains search (default). Contoh: `banjar` match "Banjar", "Banjarnegara", "Kab. Banjar"
- `exact` - Exact match. Contoh: `kab._banjar` hanya match "Kab. Banjar"
- `startsWith` - Starts with. Contoh: `banjar` match "Banjar", "Banjarnegara" tapi tidak "Kab. Banjar"

#### `exclude` (untuk city search)

Mengecualikan kota dari hasil. Contoh: `city=banjar&exclude=banjarnegara,banjarmasin` hanya return "Kab. Banjar"

#### Underscore `_` untuk Spasi

Gunakan underscore untuk mengganti spasi di nama kota:

- `banjar_baru` → "Banjar Baru"
- `kab._banjar` → "Kab. Banjar"

## 📦 Response Format

### Success Response

```json
{
  "success": true,
  "summary": {
    "total": 33,
    "successful": 32,
    "failed": 1
  },
  "stations": [
    {
      "success": true,
      "stationId": "96805",
      "stationName": "AWS Cilacap",
      "city": "Cilacap",
      "province": "Jawa Tengah",
      "provinceCode": "PR013",
      "lat": "-7.727",
      "lng": "109.015",
      "type": "aws",
      "data": {
        // ... data cuaca dari BMKG
      }
    }
  ],
  "failed": [
    {
      "success": false,
      "stationId": "99999",
      "stationName": "Station Name",
      "city": "City",
      "province": "Province",
      "provinceCode": "PR000",
      "lat": "0",
      "lng": "0",
      "type": "aws",
      "error": "HTTP 404: Not Found"
    }
  ]
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message here",
  "examples": {
    // ... contoh penggunaan yang benar
  }
}
```

## 💡 Contoh Penggunaan

### 1. Fetch by Province

**Single Province:**

```bash
# Semua stasiun di Jawa Tengah
curl "http://localhost:3000/aws?province=PR013"

# Hanya AWS di Jawa Tengah
curl "http://localhost:3000/aws?province=PR013&type=aws"
```

**Multiple Provinces:**

```bash
# Jawa Tengah dan Jawa Timur
curl "http://localhost:3000/aws?province=PR013,PR015"

# Hanya ARG di beberapa provinsi
curl "http://localhost:3000/aws?province=PR013,PR015,PR014&type=arg"
```

**Kode Provinsi:**

- PR013 - Jawa Tengah
- PR014 - DI Yogyakarta
- PR015 - Jawa Timur
- PR010 - Kepulauan Riau
- PR001 - Aceh
- dll (lihat `location.json` untuk kode lengkap)

### 2. Fetch by City

**Single City:**

```bash
# Cari stasiun di Cilacap (partial match)
curl "http://localhost:3000/aws?city=cilacap"

# Cari stasiun di Banjar Baru (gunakan underscore untuk spasi)
curl "http://localhost:3000/aws?city=banjar_baru"
```

**Multiple Cities:**

```bash
# Beberapa kota sekaligus
curl "http://localhost:3000/aws?city=cilacap,banyumas,purwokerto"

# Dengan filter tipe AWS
curl "http://localhost:3000/aws?city=cilacap,bandung,surabaya&type=aws"
```

**Exact Match:**

```bash
# Hanya "Kab. Banjar" (bukan Banjarnegara atau Banjarmasin)
curl "http://localhost:3000/aws?city=kab._banjar&match=exact"
```

**With Exclude:**

```bash
# Cari "banjar" tapi exclude Banjarnegara dan Banjarmasin
curl "http://localhost:3000/aws?city=banjar&exclude=banjarnegara,banjarmasin"

# Hasilnya hanya "Kab. Banjar"
```

**StartsWith Match:**

```bash
# Kota yang diawali "banjar"
curl "http://localhost:3000/aws?city=banjar&match=startsWith"

# Match: Banjar, Banjarnegara, Banjarmasin
# Not match: Kab. Banjar (karena diawali "kab")
```

### 3. Fetch by Radius

**Basic Radius Search:**

```bash
# Stasiun dalam radius 50km dari Yogyakarta (-7.797, 110.370)
curl "http://localhost:3000/aws?lat=-7.797&lon=110.370&radius=50"

# Hanya AWS dalam radius 25km dari Jakarta
curl "http://localhost:3000/aws?lat=-6.2088&lon=106.8456&radius=25&type=aws"
```

**Koordinat Kota-kota Besar:**

```bash
# Jakarta
curl "http://localhost:3000/aws?lat=-6.2088&lon=106.8456&radius=30"

# Surabaya
curl "http://localhost:3000/aws?lat=-7.2575&lon=112.7521&radius=40"

# Bandung
curl "http://localhost:3000/aws?lat=-6.9175&lon=107.6191&radius=35"

# Semarang
curl "http://localhost:3000/aws?lat=-6.9667&lon=110.4167&radius=30"
```

**Fitur Radius:**

- Menggunakan **Haversine formula** untuk akurasi tinggi
- Hasil diurutkan dari **terdekat ke terjauh**
- Support validasi koordinat (lat: -90 to 90, lon: -180 to 180)

### 4. Fetch by Station IDs

**Single Station:**

```bash
# Data satu stasiun
curl "http://localhost:3000/aws?stations=96805"
```

**Multiple Stations:**

```bash
# Data beberapa stasiun sekaligus
curl "http://localhost:3000/aws?stations=96805,96807,96809"

# Banyak stasiun
curl "http://localhost:3000/aws?stations=STA1101,STA1102,STW1103,STG1104"
```

### 5. Kombinasi Filter

```bash
# Multiple cities dengan type filter dan exclude
curl "http://localhost:3000/aws?city=cilacap,banyumas,purbalingga&type=aws&exclude=purbalingga"

# Province dengan type filter
curl "http://localhost:3000/aws?province=PR013,PR014&type=aws"

# Radius dengan type filter
curl "http://localhost:3000/aws?lat=-7.5&lon=110.5&radius=100&type=arg"
```

## 🔐 Security

### Environment Variables

**PENTING**: JANGAN commit file `.env` ke repository!

File `.env` sudah ada di `.gitignore` untuk keamanan.

### Saat Share Code:

1. ✅ File `.env` **TIDAK** akan ter-commit
2. ✅ User lain hanya dapat `.env.example` sebagai template
3. ✅ Setiap user harus setup credentials sendiri

### Setup untuk User Baru:

```bash
# Copy template
cp .env.example .env

# Edit .env dengan credentials sendiri
# BMKG_USERNAME=your_station_id
# BMKG_PASSWORD=your_password
```

### Validasi Runtime:

API akan **error** jika environment variables tidak diset:

```
Error: BMKG_USERNAME and BMKG_PASSWORD must be set in environment variables
```

## 🐛 Troubleshooting

### Server tidak start

**Problem**: Error "BMKG_USERNAME and BMKG_PASSWORD must be set"

**Solution**:

```bash
# Pastikan file .env ada dan berisi credentials
cat .env

# Jika belum ada, copy dari template
cp .env.example .env

# Edit .env dan isi credentials
```

### Data tidak muncul / kosong

**Problem**: Response sukses tapi `stations` array kosong

**Solution**:

- Cek apakah filter terlalu strict (coba tanpa `type` filter)
- Cek nama kota/provinsi code benar
- Coba dengan `match=partial` untuk city search

### Timeout / Request terlalu lama

**Problem**: Browser/client timeout saat fetch banyak stasiun

**Solution**:

- Server timeout sudah diset 240 detik
- Untuk fetch banyak data, gunakan filter `type` untuk mengurangi jumlah stasiun
- Coba fetch per provinsi daripada sekaligus

### Koordinat tidak valid

**Problem**: Error "Invalid coordinates"

**Solution**:

- Latitude harus antara -90 sampai 90
- Longitude harus antara -180 sampai 180
- Gunakan format desimal, bukan DMS (degrees/minutes/seconds)
- Indonesia: lat ≈ -11 to 6, lon ≈ 95 to 141

### Spasi di nama kota

**Problem**: URL encode issue dengan spasi

**Solution**:

- Gunakan underscore `_` sebagai pengganti spasi
- Contoh: `banjar_baru` bukan `banjar%20baru`

## 📚 Additional Resources

### Province Codes

Lihat file `packages/weather-client/src/aws/province.json` untuk daftar lengkap kode provinsi.

### Station Data

Lihat file `packages/weather-client/src/aws/location.json` untuk daftar semua stasiun yang tersedia (21,000+ stations).

### API Source

Data diambil dari: `https://awscenter.bmkg.go.id/monitoring/{type}/{stationId}/json`

## 📝 License

Project ini dibuat untuk keperluan pembelajaran dan integrasi data BMKG.

---

**Developed with ❤️ using Bun + Hono + Turborepo**
