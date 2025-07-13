const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
    getBrands,
    addBrand,
    updateBrand,
    deleteBrand,
    toggleBrandListing
} = require('../controllers/brandController');

router.use(auth);

router.get('/', getBrands);
router.post('/', addBrand);
router.put('/:id', updateBrand);
router.patch('/:id/listing', toggleBrandListing);
router.delete('/:id', deleteBrand);

module.exports = router;
