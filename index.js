const express = require('express');
const path = require('path');
const session = require('express-session');  // <-- tambah ini

const app = express();
const port = 3000;

// Middleware supaya bisa akses file statis (CSS, gambar) di folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk parsing form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Setup session
app.use(session({
  secret: 'secret_key_rahasia',  // ganti dengan secret yang kuat
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }  // session bertahan 1 jam
}));

// Dummy data user untuk contoh login
const users = [
  { username: 'admin', password: 'admin123' },
  { username: 'user', password: 'user123' },
];

// Middleware untuk cek session login
function isLoggedIn(req, res, next) {
  if (req.session.user) {
    next(); // lanjut ke route berikutnya
  } else {
    res.redirect('/login');
  }
}

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
    // Simpan data user di session
    req.session.user = { username: user.username };

    // Redirect ke dashboard
    res.redirect('/dashboard');
  } else {
    res.send(`
      <p>Login gagal! Username atau password salah.</p>
      <a href="/login">Kembali ke login</a>
    `);
  }
});

// Route dashboard (hanya bisa diakses jika sudah login)
app.get('/dashboard', isLoggedIn, (req, res) => {
  res.send(`
    <h1>Dashboard Web Kasir</h1>
    <p>Selamat datang, ${req.session.user.username}! Anda sudah login.</p>
    <a href="/logout">Logout</a><br/>
    <a href="/">Kembali ke halaman utama</a>
  `);
});

// Route logout untuk menghapus session dan logout user
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Gagal logout');
    }
    res.clearCookie('connect.sid');
    res.send(`
      <p>Kamu sudah logout.</p>
      <a href="/">Kembali ke halaman utama</a>
    `);
  });
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
