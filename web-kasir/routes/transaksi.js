
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Halaman Transaksi (nanti ditambah fungsinya)');
});

module.exports = router;
