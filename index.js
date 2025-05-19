const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// --- Setup Database ---
const db = new sqlite3.Database('./database/kasir.db');
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    price REAL,
    stock INTEGER
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    quantity INTEGER,
    total_price REAL,
    date TEXT,
    FOREIGN KEY(product_id) REFERENCES products(id)
  )`);
});

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'rahasia-kasir-!@#',
  resave: false,
  saveUninitialized: false,
}));

// inject db into req
app.use((req, res, next) => {
  req.db = db;
  next();
});

// auth check
function isLoggedIn(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// --- Routes ---

// Home
app.get('/', (req, res) => {
  res.send(`
    <h1>Web Kasir</h1>
    ${req.session.userId
      ? `<p>Halo, ${req.session.username}!</p>
         <a href="/dashboard">Dashboard</a> | <a href="/logout">Logout</a>`
      : `<a href="/login">Login</a> | <a href="/register">Register</a>`
    }
  `);
});

// Register
app.get('/register', (req, res) => {
  res.send(`
    <h2>Register</h2>
    <form method="POST" action="/register">
      <input name="username" placeholder="Username" required/><br/>
      <input name="password" type="password" placeholder="Password" required/><br/>
      <button>Daftar</button>
    </form>
    <p>Sudah punya akun? <a href="/login">Login</a></p>
  `);
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  req.db.run(
    `INSERT INTO users(username,password) VALUES(?,?)`,
    [username, hash],
    err => {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.send('Username sudah terpakai. <a href="/register">Coba lagi</a>');
        }
        return res.send('Error saat registrasi.');
      }
      res.redirect('/login');
    }
  );
});

// Login
app.get('/login', (req, res) => {
  res.send(`
    <h2>Login</h2>
    <form method="POST" action="/login">
      <input name="username" placeholder="Username" required/><br/>
      <input name="password" type="password" placeholder="Password" required/><br/>
      <button>Login</button>
    </form>
    <p>Belum punya akun? <a href="/register">Daftar</a></p>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  req.db.get(
    `SELECT * FROM users WHERE username = ?`,
    [username],
    async (err, user) => {
      if (err || !user) {
        return res.send('Login gagal. <a href="/login">Coba lagi</a>');
      }
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) {
        return res.send('Login gagal. <a href="/login">Coba lagi</a>');
      }
      req.session.userId = user.id;
      req.session.username = user.username;
      res.redirect('/dashboard');
    }
  );
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Dashboard
app.get('/dashboard', isLoggedIn, (req, res) => {
  res.send(`
    <h1>Dashboard</h1>
    <p>Selamat datang, ${req.session.username}!</p>
    <ul>
      <li><a href="/products">Data Barang</a></li>
      <li><a href="/transactions">Laporan Transaksi</a></li>
      <li><a href="/transactions/new">Jual Barang</a></li>
      <li><a href="/logout">Logout</a></li>
    </ul>
  `);
});

// Products
app.get('/products', isLoggedIn, (req, res) => {
  req.db.all(`SELECT * FROM products`, [], (err, rows) => {
    const list = rows.map(p =>
      `<li>${p.name} | Rp${p.price} | Stok: ${p.stock}</li>`
    ).join('');
    res.send(`
      <h2>Data Barang</h2>
      <ul>${list}</ul>
      <a href="/products/add">Tambah Barang</a><br/>
      <a href="/dashboard">Kembali</a>
    `);
  });
});

app.get('/products/add', isLoggedIn, (req, res) => {
  res.send(`
    <h2>Tambah Barang</h2>
    <form method="POST" action="/products/add">
      <input name="name" placeholder="Nama" required/><br/>
      <input name="price" type="number" placeholder="Harga" required/><br/>
      <input name="stock" type="number" placeholder="Stok" required/><br/>
      <button>Tambah</button>
    </form>
    <a href="/products">Batal</a>
  `);
});

app.post('/products/add', isLoggedIn, (req, res) => {
  const { name, price, stock } = req.body;
  req.db.run(
    `INSERT INTO products(name,price,stock) VALUES(?,?,?)`,
    [name, price, stock],
    () => res.redirect('/products')
  );
});

// Transactions list
app.get('/transactions', isLoggedIn, (req, res) => {
  req.db.all(
    `SELECT t.id, p.name AS product, t.quantity, t.total_price, t.date
     FROM transactions t
     JOIN products p ON t.product_id = p.id`,
    [],
    (err, rows) => {
      const list = rows.map(t =>
        `<li>#${t.id} ${t.product} ×${t.quantity} = Rp${t.total_price} pada ${t.date}</li>`
      ).join('');
      res.send(`
        <h2>Laporan Transaksi</h2>
        <ul>${list}</ul>
        <a href="/dashboard">Kembali</a>
      `);
    }
  );
});

// New Transaction (sell)
app.get('/transactions/new', isLoggedIn, (req, res) => {
  req.db.all(`SELECT * FROM products WHERE stock > 0`, [], (err, products) => {
    const options = products.map(p =>
      `<option value="${p.id}">${p.name} (Rp${p.price}, Stok: ${p.stock})</option>`
    ).join('');
    res.send(`
      <h2>Jual Barang</h2>
      <form method="POST" action="/transactions/new">
        <select name="product_id">${options}</select><br/>
        <input name="quantity" type="number" placeholder="Jumlah" min="1" required/><br/>
        <button>Jual</button>
      </form>
      <a href="/dashboard">Batal</a>
    `);
  });
});

app.post('/transactions/new', isLoggedIn, (req, res) => {
  const { product_id, quantity } = req.body;
  const qty = parseInt(quantity, 10);
  req.db.get(`SELECT * FROM products WHERE id = ?`, [product_id], (err, product) => {
    if (!product || product.stock < qty) {
      return res.send('Stok tidak mencukupi. <a href="/transactions/new">Coba lagi</a>');
    }
    const total = product.price * qty;
    const now = new Date().toISOString();
    req.db.run(
      `INSERT INTO transactions(product_id,quantity,total_price,date) VALUES(?,?,?,?)`,
      [product_id, qty, total, now],
      function() {
        req.db.run(
          `UPDATE products SET stock = stock - ? WHERE id = ?`,
          [qty, product_id],
          () => res.redirect('/transactions')
        );
      }
    );
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
