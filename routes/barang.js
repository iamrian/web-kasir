const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/kasir.db');

// Middleware pake query token
function isAuthenticated(req, res, next) {
  if (req.query.token === 'rahasia123') {
    next();
  } else {
    res.status(401).send('Unauthorized: token salah atau tidak ada');
  }
}

router.use(isAuthenticated);

// Tampil semua barang
router.get('/', (req, res) => {
  db.all('SELECT * FROM barang', (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

// Tambah barang baru (POST /products)
router.post('/', (req, res) => {
  const { nama, harga, stok } = req.body;
  db.run(
    'INSERT INTO barang (nama, harga, stok) VALUES (?, ?, ?)',
    [nama, harga, stok],
    function (err) {
      if (err) return res.status(500).send(err.message);
      res.json({ id: this.lastID, nama, harga, stok });
    }
  );
});

// Update stok barang (PATCH /products/:id)
router.patch('/:id', (req, res) => {
  const barangId = req.params.id;
  const { stok } = req.body;

  if (stok === undefined || stok < 0) {
    return res.status(400).send('Stok harus diisi dan tidak boleh negatif');
  }

  db.run(
    'UPDATE barang SET stok = ? WHERE id = ?',
    [stok, barangId],
    function (err) {
      if (err) {
        console.error('Error saat update stok:', err.message);
        return res.status(500).send('Gagal memperbarui stok: ' + err.message);
      }
      if (this.changes === 0) {
        return res.status(404).send('Barang tidak ditemukan');
      }
      res.json({ id: barangId, stok });
    }
  );
});

module.exports = router;
