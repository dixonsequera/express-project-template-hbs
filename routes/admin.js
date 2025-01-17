const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.render('all-users')
});

module.exports = router;
