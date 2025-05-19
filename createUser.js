const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./database/kasir.db');

db.serialize(() => {
  // Buat tabel users
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password_hash TEXT
    )
  `);

  // Buat tabel barang
  db.run(`
    CREATE TABLE IF NOT EXISTS barang (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nama TEXT,
      harga INTEGER,
      stok INTEGER
    )
  `);

  // Buat tabel transaksi
  db.run(`
    CREATE TABLE IF NOT EXISTS transaksi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barang_id INTEGER,
      qty INTEGER,
      total_harga INTEGER,
      tanggal TEXT,
      FOREIGN KEY(barang_id) REFERENCES barang(id)
    )
  `);

  // Insert user admin awal (username: admin, password: admin123)
  const passwordPlain = 'admin123';
  bcrypt.hash(passwordPlain, 10, (err, hash) => {
    if (err) return console.error(err);
    db.run(
      'INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)',
      ['admin', hash],
      () => {
        console.log('User admin siap, username: admin, password: admin123');
        db.close();
      }
    );
  });
});
