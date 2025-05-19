
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/kasir.db');

router.get('/', (req, res) => {
    db.all('SELECT * FROM barang', (err, rows) => {
        res.send(rows);
    });
});

router.post('/tambah', (req, res) => {
    const { nama, harga, stok } = req.body;
    db.run('INSERT INTO barang (nama, harga, stok) VALUES (?, ?, ?)', [nama, harga, stok]);
    res.redirect('/barang');
});

module.exports = router;
