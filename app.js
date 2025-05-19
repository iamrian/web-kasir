const express = require('express');
const path = require('path');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'rahasia-kasir',
  resave: false,
  saveUninitialized: false,
}));

// Inisialisasi database
const db = new sqlite3.Database('./database/kasir.db');

// Import route
const authRouter = require('./routes/auth');

// ✅ Explicit route untuk halaman landing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Route auth untuk login/register/dashboard/logout
app.use('/', authRouter);

// Jalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
