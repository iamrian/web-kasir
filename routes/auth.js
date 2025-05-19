const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

// db akan diinject lewat middleware di index.js, jadi di sini akses dengan req.db

// Middleware cek apakah sudah login
function isAuthenticated(req, res, next) {
  if (req.session.username) {
    return next();
  }
  res.redirect('/login');
}

// Halaman login GET
router.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input type="text" name="username" placeholder="Username" required /><br/>
      <input type="password" name="password" placeholder="Password" required /><br/>
      <button type="submit">Login</button>
    </form>
  `);
});

// Proses login POST
router.post('/login', (req, res) => {
  const db = req.db;
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) return res.send('Error database');
    if (!user) {
      return res.send('Username tidak ditemukan. <a href="/login">Coba lagi</a>');
    }

    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.username = username;
      res.redirect('/dashboard');
    } else {
      res.send('Password salah. <a href="/login">Coba lagi</a>');
    }
  });
});

// Halaman dashboard (harus login)
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`
    <h1>Dashboard</h1>
    <p>Selamat datang, ${req.session.username}!</p>
    <a href="/logout">Logout</a>
  `);
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send('Error saat logout');
    res.redirect('/login');
  });
});

// Halaman register GET
router.get('/register', (req, res) => {
  res.send(`
    <h2>Register</h2>
    <form method="POST" action="/register">
      <input type="text" name="username" placeholder="Username" required /><br/>
      <input type="password" name="password" placeholder="Password" required /><br/>
      <button type="submit">Daftar</button>
    </form>
  `);
});

// Proses register POST
router.post('/register', async (req, res) => {
  const db = req.db;
  const { username, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, passwordHash], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return res.send('Username sudah dipakai. <a href="/register">Coba lagi</a>');
      }
      return res.send('Error database');
    }
    res.send('User berhasil didaftarkan. <a href="/login">Login sekarang</a>');
  });
});

module.exports = router;
