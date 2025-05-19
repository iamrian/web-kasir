const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./db'); // koneksi dan fungsi DB ada di db.js

const app = express();
const port = 3000;

// Middleware akses file statis
app.use(express.static(path.join(__dirname, 'public')));

// Middleware parsing form data
app.use(express.urlencoded({ extended: true }));

// Setup session
app.use(session({
  secret: 'secret_kamu_123',  // ganti dengan secret yg aman
  resave: false,
  saveUninitialized: false,
}));

// Middleware cek session login
function isLoggedIn(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
}

// Route Home
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
        ${req.session.userId ? `
          <a class="btn" href="/dashboard">Dashboard</a>
          <a class="btn" href="/logout">Logout</a>
        ` : `
          <a class="btn" href="/login">Login</a>
        `}
      </div>
    </body>
    </html>
  `);
});

// Route Login GET
app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
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

// Route Login POST
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.send(`
        <p>Login gagal! Username atau password salah.</p>
        <a href="/login">Kembali ke login</a>
      `);
    }
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/dashboard');
    } else {
      res.send(`
        <p>Login gagal! Username atau password salah.</p>
        <a href="/login">Kembali ke login</a>
      `);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Route Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Dashboard (protected)
app.get('/dashboard', isLoggedIn, (req, res) => {
  res.send(`
    <h1>Dashboard Web Kasir</h1>
    <p>Selamat datang, ${req.session.username}!</p>
    <a href="/products">Data Barang</a><br/>
    <a href="/transactions">Transaksi</a><br/>
    <a href="/logout">Logout</a>
  `);
});

// Route Data Barang (protected)
app.get('/products', isLoggedIn, async (req, res) => {
  const products = await db.getAllProducts();
  let list = products.map(p => `<li>${p.name} - Harga: Rp${p.price} - Stok: ${p.stock}</li>`).join('');
  res.send(`
    <h1>Data Barang</h1>
    <ul>${list}</ul>
    <a href="/dashboard">Kembali ke dashboard</a>
  `);
});

// Route Tambah Barang GET (form)
app.get('/products/add', isLoggedIn, (req, res) => {
  res.send(`
    <h1>Tambah Barang</h1>
    <form method="POST" action="/products/add">
      <input type="text" name="name" placeholder="Nama Barang" required /><br/>
      <input type="number" name="price" placeholder="Harga" required /><br/>
      <input type="number" name="stock" placeholder="Stok" required /><br/>
      <button type="submit">Tambah</button>
    </form>
    <a href="/products">Kembali ke data barang</a>
  `);
});

// Route Tambah Barang POST
app.post('/products/add', isLoggedIn, async (req, res) => {
  const { name, price, stock } = req.body;
  await db.addProduct(name, price, stock);
  res.redirect('/products');
});

// Route Transaksi GET (list transaksi)
app.get('/transactions', isLoggedIn, async (req, res) => {
  const transactions = await db.getAllTransactions();
  let list = transactions.map(t => `<li>ID: ${t.id}, Barang: ${t.product_name}, Jumlah: ${t.quantity}, Total: Rp${t.total_price}, Tanggal: ${t.date}</li>`).join('');
  res.send(`
    <h1>Data Transaksi</h1>
    <ul>${list}</ul>
    <a href="/dashboard">Kembali ke dashboard</a>
  `);
});

// Jalankan server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
