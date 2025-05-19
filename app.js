const express = require('express');
const path = require('path');
const session = require('express-session');
const authRouter = require('./routes/auth');
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
}));

// Import routes
const authRouter = require('./routes/auth');
const barangRouter = require('./routes/barang');
const transaksiRouter = require('./routes/transaksi');

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes untuk autentikasi
app.use('/', authRouter);

// ...
app.use('/', authRouter);

// Routes untuk data barang (products)
app.use('/products', barangRouter);

// Routes untuk transaksi
app.use('/transactions', transaksiRouter);

// 404 handler (optional)
app.use((req, res) => {
  res.status(404).send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
