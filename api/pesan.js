// api/pesan.js — Vercel otomatis mengubah file ini jadi endpoint: /api/pesan
// Vercel tidak punya penyimpanan file permanen, jadi data di sini bersifat SEMENTARA
// (bisa hilang kapan saja). Untuk penyimpanan permanen di production, nanti perlu
// database (misalnya Vercel Postgres atau Supabase).

const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(os.tmpdir(), 'sudutrasa-data');
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
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

function simpanPesan(daftarPesan) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(daftarPesan, null, 2), 'utf-8');
}

module.exports = (req, res) => {
  pastikanFileData();

  if (req.method === 'POST') {
    const nama = ((req.body && req.body.nama) || '').toString().trim();
    const pesan = ((req.body && req.body.pesan) || '').toString().trim();

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

    return res.status(201).json({ ok: true, data: entriBaru });
  }

  if (req.method === 'GET') {
    return res.status(200).json(bacaPesan());
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ ok: false, error: 'Method tidak diizinkan.' });
};