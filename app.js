const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Middleware untuk parsing form POST
app.use(bodyParser.urlencoded({ extended: true }));

// Serve file statis di folder public
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk halaman utama (index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route untuk menampilkan halaman login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route proses POST login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Contoh validasi statis
  if (username === 'admin' && password === '12345') {
    // Login berhasil
    res.send('<h2>Login berhasil! Selamat datang admin.</h2><a href="/">Kembali ke Home</a>');
  } else {
    // Login gagal
    res.send('<h2>Login gagal! Username atau password salah.</h2><a href="/login">Coba lagi</a>');
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
