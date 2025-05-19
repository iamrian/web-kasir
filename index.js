const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware supaya bisa akses file statis (CSS, gambar) di folder 'public'
app.use(express.static(path.join(__dirname, 'public')));

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

// Route login
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

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
