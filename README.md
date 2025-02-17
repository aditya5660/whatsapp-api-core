# WhatsApp API Core

Implementasi sederhana dari library [@WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) untuk berinteraksi dengan WhatsApp melalui RESTful API.

## 🚀 Fitur Utama

- Multi-session WhatsApp
- Pengiriman pesan teks
- Pengiriman pesan media (gambar, video, dokumen)
- Pengiriman pesan massal (bulk messaging)
- Manajemen sesi (create, check status, logout)
- Penanganan memory leak yang optimal
- Graceful shutdown
- Error handling yang robust
- Sistem reconnection yang handal
- Logging yang terstruktur
- Utilitas WhatsApp:
  - Cek status nomor
  - Daftar grup & peserta

## 📋 Prasyarat

- Node.js (versi 18 atau lebih baru)
- NPM atau Yarn
- API Key (untuk autentikasi)

## 🛠️ Instalasi & Penggunaan

1. Install dependensi:
```bash
npm install
```

2. Salin file .env.example ke .env dan sesuaikan:
```env
NODE_ENV=local
APP_URL=127.0.0.1
APP_PORT=3000
ENABLE_API_KEY=true
API_KEY=your_api_key
BASE_URL=http://localhost:3000 # ganti dengan URL produksi
```

3. Jalankan server:
```bash
npm run start
```

## 📱 Endpoint API

### Sessions
- `POST /sessions/:sessionId` - Membuat/menggunakan sesi
- `GET /sessions/:sessionId` - Cek status sesi
- `POST /sessions/:sessionId/logout` - Logout sesi

### Messages
- `POST /messages/send` - Kirim pesan (teks/media)
  ```json
  {
    "sender": "session_id_1",
    "receiver": "6285123456789",
    "message": "Hello World!",
    "file": "https://example.com/image.jpg", // Optional
    "viewOnce": false // Optional, default: false
  }
  ```

### Utility
- `GET /utility/groups/:sessionId` - Daftar grup & peserta
- `POST /utility/check-number` - Cek status nomor WhatsApp

## 🔄 Update Terbaru

### 1. Peningkatan Stabilitas
- Perbaikan error handling untuk error 515
- Sistem reconnection yang lebih handal
- Timeout dan cleanup yang optimal
- Logging yang lebih informatif dengan format [sessionId]

### 2. Fitur Utility
- Endpoint groups dengan informasi lengkap (peserta, admin, pengaturan)
- Verifikasi nomor WhatsApp yang lebih akurat
- Format nomor otomatis (08/+62 -> 62)

### 3. Optimasi
- Penyederhanaan path resolver
- Cleanup sesi yang lebih menyeluruh
- Penanganan memory leak yang lebih baik

### 4. Dokumentasi
- Swagger UI di `/docs`
- Contoh request & response yang lebih lengkap
- Penjelasan error handling yang lebih detail

## 📚 API Documentation

Dokumentasi API tersedia melalui Swagger UI di:
```
http://localhost:3000/docs
```

Anda dapat:
- Melihat semua endpoint yang tersedia
- Mencoba endpoint secara langsung
- Melihat schema request dan response
- Menggunakan authorization dengan API key

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat pull request atau laporkan issues jika menemukan bug.

## 📜 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

