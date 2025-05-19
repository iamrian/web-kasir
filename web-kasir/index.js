
const express = require('express');
const session = require('express-session');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = process.env.PORT || 3000;

// Database
const db = new sqlite3.Database('./database/kasir.db');

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'rahasia-kasir',
    resave: false,
    saveUninitialized: true,
}));

// Routes
app.use('/', require('./routes/auth'));
app.use('/barang', require('./routes/barang'));
app.use('/transaksi', require('./routes/transaksi'));

// Buat tabel jika belum ada
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS barang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT,
    harga INTEGER,
    stok INTEGER
  )`);
});

// Listen
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
