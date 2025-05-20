const express = require('express');
const router = express.Router();
const db = require('../database/db'); // sesuaikan path sesuai struktur proyek

// GET all products - Ambil semua produk dari database
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM products ORDER BY id';
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Gagal ambil data produk:', err.message);
      return res.status(500).json({ error: 'Gagal mengambil data produk' });
    }
    res.json(rows);
  });
});

// POST add new product - Tambah produk baru
router.post('/', (req, res) => {
  let { name, price, stock } = req.body;

  // Validasi input
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Nama produk harus diisi dan berupa teks.' });
  }
  name = name.trim();
  price = Number(price);
  stock = Number(stock);

  if (name.length === 0 || isNaN(price) || isNaN(stock) || price < 0 || stock < 0) {
    return res.status(400).json({ error: 'Data tidak lengkap atau harga dan stok harus angka >= 0.' });
  }

  const sql = `INSERT INTO products (name, price, stock) VALUES (?, ?, ?)`;
  db.run(sql, [name, price, stock], function (err) {
    if (err) {
      console.error('Gagal menambah produk:', err.message);
      return res.status(500).json({ error: 'Gagal menambah produk' });
    }
    // Berikan respon ID produk baru
    res.status(201).json({ id: this.lastID, message: 'Produk berhasil ditambahkan' });
  });
});

module.exports = router;
