const express = require('express');
const router = express.Router();
const db = require('../database/db'); // sesuaikan
const bcrypt = require('bcrypt');

// POST login
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username dan password harus diisi');
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  db.get(sql, [username], (err, user) => {
    if (err) return res.status(500).send('Error server');

    if (!user) return res.status(401).send('User tidak ditemukan');

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.status(500).send('Error server');

      if (result) {
        // Login berhasil, simpan session
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/dashboard');
      } else {
        res.status(401).send('Password salah');
      }
    });
  });
});

// GET logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/login.html');
  });
});

module.exports = router;
