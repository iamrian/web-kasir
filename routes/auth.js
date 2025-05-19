const express = require('express');
const router = express.Router();

// Contoh user hardcoded, bisa ganti sesuai database atau lain
const users = [
  { id: 1, username: 'admin', password: '1234' }
];

// Tampilkan form login (optional)
router.get('/login', (req, res) => {
  res.send(`
    <form method="POST" action="/login">
      <input name="username" placeholder="Username" required />
      <input name="password" placeholder="Password" type="password" required />
      <button type="submit">Login</button>
    </form>
  `);
});

// Proses login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).send('Username atau password salah');
  }

  req.session.userId = user.id;
  res.send('Login berhasil');
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;
