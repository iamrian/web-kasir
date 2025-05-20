const session = require('express-session');

const express = require('express');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'rahasia-kasir',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,           // Harus false kalau di localhost tanpa HTTPS
    maxAge: 1000 * 60 * 60 * 24,  // Session bertahan 1 hari
  },
}));

// Middleware: proteksi rute jika belum login
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

// Import routes
const authRouter = require('./routes/auth');
const barangRouter = require('./routes/barang');
const transaksiRouter = require('./routes/transaksi');

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Dashboard hanya bisa diakses jika sudah login
app.get('/dashboard', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Gunakan routes dengan proteksi session
app.use('/', authRouter);
app.use('/products', requireLogin, barangRouter);
app.use('/transactions', requireLogin, transaksiRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
