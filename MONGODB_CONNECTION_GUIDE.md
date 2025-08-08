# MongoDB Atlas Connection Guide

## Issue Saat Ini
- MongoDB Atlas tidak dapat terhubung karena DNS resolution error: `querySrv ENOTFOUND _mongodb._tcp.cluster0.mongodb.net`
- Website saat ini menggunakan fallback data dengan struktur yang sama seperti MongoDB Atlas

## Solusi untuk Menggunakan Data MongoDB Atlas

### 1. Pastikan Koneksi Internet Stabil
MongoDB Atlas memerlukan koneksi internet yang stabil.

### 2. Periksa MongoDB Atlas Cluster
- Pastikan cluster MongoDB Atlas dalam status "active"
- Periksa whitelist IP address di MongoDB Atlas Security settings
- Tambahkan IP address 0.0.0.0/0 untuk allow all (development only)

### 3. Alternatif Connection String
Jika masalah DNS persisten, coba gunakan connection string dengan IP langsung:
```
mongodb://username:password@shard1.abc.mongodb.net:27017,shard2.abc.mongodb.net:27017/database_name?replicaSet=atlas-xyz&ssl=true
```

### 4. Struktur Data di MongoDB
Pastikan dokumen di collection "contents" memiliki struktur:
```json
{
  "_id": "homepage-content",
  "sections": [
    {
      "key": "hero",
      "title": "Selamat Datang di Website Sangpiak Salu", 
      "description": "Sumber informasi tentang pemerintahan di Sangpiak Salu",
      "image_url": "https://res.cloudinary.com/dpubyir1w/image/upload/v1754153412/desa/z0t..."
    }
    // ... other sections
  ],
  "infografis": { ... },
  "dusun": [ ... ],
  "gallery": [ ... ]
}
```

## Status Saat Ini
✅ Fallback data menggunakan struktur yang sama dengan MongoDB
✅ Website berjalan normal dengan data simulasi  
✅ Semua gambar menggunakan Unsplash (reliable)
⚠️ MongoDB Atlas connection issue (DNS resolution)

## Untuk Production
Setelah koneksi MongoDB Atlas diperbaiki, website akan otomatis menggunakan data dari database.
