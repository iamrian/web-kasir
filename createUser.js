const bcrypt = require('bcrypt');
const db = require('./db');

const username = 'admin';
const password = 'admin123';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function(err) {
    if (err) console.log('User sudah ada');
    else console.log('User admin berhasil dibuat');
    process.exit();
  });
});
