const express = require('express');
const router = express.Router();
const path = require('path');

// Middleware cek session login (optional, untuk proteksi halaman tertentu)
function cekLogin(req, res, next) {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Routing halaman HTML statis
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

router.get('/dashboard', cekLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

router.get('/data-barang', cekLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/data-barang.html'));
});

router.get('/transaksi', cekLogin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/transaksi.html'));
});

// Jika kamu pakai halaman login dan register statis di folder public
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

module.exports = router;
