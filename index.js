const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware supaya bisa akses file statis (CSS, gambar) di folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk parsing form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Dummy data user untuk contoh login
const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'user123' },
];

// Route utama (home)
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Web Kasir</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <div class="container">
        <h1>Selamat datang di Web Kasir</h1>
        <a class="btn" href="/login">Login</a>
      </div>
    </body>
    </html>
  `);
});

// Route login GET
app.get('/login', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login - Web Kasir</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <div class="container">
        <h2>Login</h2>
        <form method="POST" action="/login">
          <input type="text" name="username" placeholder="Username" required /><br/>
          <input type="password" name="password" placeholder="Password" required /><br/>
          <button type="submit">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
});

// Route login POST (proses login)
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    // Kalau login sukses, redirect ke dashboard
    res.redirect('/dashboard');
  } else {
    // Kalau gagal login, kasih pesan error sederhana
    res.send(`
      <p>Login gagal! Username atau password salah.</p>
      <a href="/login">Kembali ke login</a>
    `);
  }
});

// Route dashboard (halaman setelah login sukses)
app.get('/dashboard', (req, res) => {
  res.send(`
    <h1>Dashboard Web Kasir</h1>
    <p>Selamat datang, Anda sudah login!</p>
    <a href="/">Kembali ke halaman utama</a>
  `);
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
