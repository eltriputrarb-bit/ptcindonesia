// server.js — server sederhana untuk Sudut Rasa Coffee
// Menyajikan file website (index.html, profile.html, style.css, assets)
// dan menyimpan pesan dari form kontak ke file data/pesan.json

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'pesan.json');

// Pastikan folder & file data ada sebelum server jalan
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
    console.error('Gagal membaca data/pesan.json:', err);
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

// Lihat semua pesan yang tersimpan (dipakai untuk cek isi data/pesan.json lewat browser)
app.get('/api/pesan', (req, res) => {
  res.json(bacaPesan());
});

pastikanFileData();

app.listen(PORT, () => {
  console.log(`Sudut Rasa Coffee jalan di http://localhost:${PORT}`);
  console.log(`Pesan tersimpan di ${DATA_FILE}`);
});