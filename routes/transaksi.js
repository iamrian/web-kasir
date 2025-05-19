const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database/kasir.db');

// Set busy timeout supaya SQLite mau menunggu kunci sampai 3 detik
db.run('PRAGMA busy_timeout = 3000');

function isAuthenticated(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}

router.use(isAuthenticated);

// POST transaksi baru (jual barang)
router.post('/', (req, res) => {
  const { barang_id, qty } = req.body;

  if (!barang_id || !qty || qty <= 0) {
    return res.status(400).send('Barang ID dan jumlah harus valid');
  }

  // Mulai serialize supaya query dieksekusi berurutan
  db.serialize(() => {
    db.get('SELECT * FROM barang WHERE id = ?', [barang_id], (err, barang) => {
      if (err) return res.status(500).send('Kesalahan saat mengambil data barang');
      if (!barang) return res.status(404).send('Barang tidak ditemukan');
      if (barang.stok < qty) return res.status(400).send('Stok barang tidak cukup');

      const total_harga = barang.harga * qty;
      const tanggal = new Date().toISOString();

      // Mulai transaksi SQL
      db.run('BEGIN TRANSACTION');

      // Insert transaksi
      db.run(
        'INSERT INTO transaksi (barang_id, qty, total_harga, tanggal) VALUES (?, ?, ?, ?)',
        [barang_id, qty, total_harga, tanggal],
        function (err) {
          if (err) {
            console.error('Error insert transaksi:', err);
            db.run('ROLLBACK');
            return res.status(500).send('Gagal menyimpan transaksi');
          }

          // Update stok barang
          db.run(
            'UPDATE barang SET stok = stok - ? WHERE id = ?',
            [qty, barang_id],
            (err) => {
              if (err) {
                console.error('Error update stok barang:', err);
                db.run('ROLLBACK');
                return res.status(500).send('Gagal memperbarui stok');
              }

              // Commit transaksi
              db.run('COMMIT');

              res.json({
                id: this.lastID,
                barang_id,
                qty,
                total_harga,
                tanggal,
              });
            }
          );
        }
      );
    });
  });
});

module.exports = router;
