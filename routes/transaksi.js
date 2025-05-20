const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Ambil semua transaksi (join untuk tampil detail)
router.get('/', (req, res) => {
  const query = `
    SELECT 
      ti.id AS id,
      p.name AS nama,
      ti.quantity AS qty,
      (ti.quantity * ti.price) AS total_harga,
      t.date AS tanggal
    FROM transaction_items ti
    JOIN transactions t ON ti.transaction_id = t.id
    JOIN products p ON ti.product_id = p.id
    ORDER BY t.date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Gagal ambil data transaksi');
    }
    res.json(rows);
  });
});

// Tambah transaksi baru
router.post('/', (req, res) => {
  const { product_id, quantity } = req.body;
  const userId = req.session.userId || 1; // default user id 1 jika belum login
  const date = new Date().toISOString();

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).send('Data tidak valid');
  }

  db.serialize(() => {
    // Insert ke transactions
    db.run('INSERT INTO transactions (user_id, date) VALUES (?, ?)', [userId, date], function (err) {
      if (err) {
        console.error(err);
        return res.status(500).send('Gagal simpan transaksi');
      }

      const transactionId = this.lastID;

      // Ambil harga dan stok produk
      db.get('SELECT price, stock FROM products WHERE id = ?', [product_id], (err, product) => {
        if (err || !product) {
          return res.status(500).send('Gagal ambil data produk');
        }

        if (product.stock < quantity) {
          return res.status(400).send('Stok tidak cukup');
        }

        // Simpan item transaksi
        db.run(
          `INSERT INTO transaction_items (transaction_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
          [transactionId, product_id, quantity, product.price],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).send('Gagal simpan item transaksi');
            }

            // Update stok produk
            db.run(
              'UPDATE products SET stock = stock - ? WHERE id = ?',
              [quantity, product_id],
              (err) => {
                if (err) {
                  console.error(err);
                  return res.status(500).send('Gagal update stok produk');
                }
                res.sendStatus(200);
              }
            );
          }
        );
      });
    });
  });
});

module.exports = router;
