const express = require('express');
const router = express.Router();
const { login } = require('../controllers/adminController');

router.post('/', login);

module.exports = router; 