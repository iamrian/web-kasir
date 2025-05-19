const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const router = express.Router();
const db = new sqlite3.Database('./database/kasir.db');

// 👉 Tampilkan halaman login
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// 👉 Tampilkan halaman register
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/register.html'));
});

// 👉 Proses register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.send('Username dan password wajib diisi');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword],
    (err) => {
      if (err) {
        console.error(err);
        return res.send('Gagal register');
      }
      res.redirect('/login');
    }
  );
});

// 👉 Proses login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err || !user) {
      return res.send('User tidak ditemukan');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.send('Password salah');
    }

    req.session.userId = user.id;
    res.redirect('/dashboard');
  });
});

// 👉 Dashboard setelah login
router.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.send(`
    <h2>Dashboard</h2>
    <p>Selamat datang, pengguna!</p>
    <a href="/logout">Logout</a>
  `);
});

// 👉 Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
