const express = require('express');
const router = express.Router();
const { getSalesman, updateSalesman } = require('../controllers/salesmanController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.get('/', getSalesman);
router.put('/', protect, adminOnly, updateSalesman);

module.exports = router;
