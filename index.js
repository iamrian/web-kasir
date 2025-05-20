const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware untuk parsing body form dan json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve file statis dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
  secret: 'kasir_rahasia', // ganti dengan secret yang aman
  resave: false,
  saveUninitialized: true,
}));

// Import routes
const authRouter = require('./routes/auth');
const barangRouter = require('./routes/barang');
const transaksiRouter = require('./routes/transaksi');
const pagesRouter = require('./routes/pages');

// Route untuk halaman HTML statis atau dynamic
app.use('/', pagesRouter);

// Route untuk auth (login, register)
app.use('/', authRouter);

// Route API produk barang
app.use('/barang', barangRouter);

// Route API transaksi (protected)
app.use('/transactions', transaksiRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
