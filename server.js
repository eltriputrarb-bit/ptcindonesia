// server.js — server sederhana untuk Sudut Rasa Coffee
// Menyajikan file website (index.html, profile.html, style.css, assets)
// dan menyimpan pesan dari form kontak.
//
// CATATAN UNTUK DEPLOY DI VERCEL:
// Vercel tidak menyediakan penyimpanan file permanen. Folder /tmp bisa ditulisi,
// tapi isinya bisa hilang kapan saja (server serverless "tidur" lalu bangun lagi
// dengan folder /tmp yang kosong). Jadi di Vercel, data pesan HANYA sementara.
// Untuk penyimpanan permanen di production, nanti sebaiknya pindah ke database
// (misalnya Vercel Postgres, atau Supabase).

const express = require('express');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 3000;

// Jalan di Vercel? pakai folder /tmp (satu-satunya yang bisa ditulisi di sana).
// Jalan di komputer sendiri? tetap pakai folder data/ seperti biasa.
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? path.join(os.tmpdir(), 'sudutrasa-data') : path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'pesan.json');

function pastikanFileData() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
  }
}

function bacaPesan() {
  pastikanFileData();
  try {
    const isi = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(isi);
  } catch (err) {
    console.error('Gagal membaca pesan.json:', err);
    return [];
  }
}

function simpanPesan(daftarPesan) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(daftarPesan, null, 2), 'utf-8');
}

app.use(express.json());
app.use(express.static(__dirname)); // menyajikan index.html, profile.html, style.css, assets/...

// Terima pesan baru dari form kontak
app.post('/api/pesan', (req, res) => {
  const nama = (req.body.nama || '').toString().trim();
  const pesan = (req.body.pesan || '').toString().trim();

  if (!nama || !pesan) {
    return res.status(400).json({ ok: false, error: 'Nama dan pesan wajib diisi.' });
  }

  const daftarPesan = bacaPesan();

  const entriBaru = {
    id: Date.now(),
    nama,
    pesan,
    waktu: new Date().toISOString()
  };

  daftarPesan.push(entriBaru);
  simpanPesan(daftarPesan);

  res.status(201).json({ ok: true, data: entriBaru });
});

// Lihat semua pesan yang tersimpan
app.get('/api/pesan', (req, res) => {
  res.json(bacaPesan());
});

pastikanFileData();

// Di komputer sendiri: jalankan server seperti biasa dengan app.listen().
// Di Vercel: JANGAN app.listen() — Vercel yang mengurus itu sendiri lewat module.exports.
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`Sudut Rasa Coffee jalan di http://localhost:${PORT}`);
    console.log(`Pesan tersimpan di ${DATA_FILE}`);
  });
}

module.exports = app;