const express = require('express');
const router = express.Router();
const {
    publicProducts,
    publicProductDetails,
    publicCategories,
    publicBrands,
    searchProducts,
    publicFeaturedProducts
} = require('../controllers/publicController');

router.get('/products', publicProducts);
router.get('/products/:id', publicProductDetails);
router.get('/categories', publicCategories);
router.get('/brands', publicBrands);
router.get('/search', searchProducts);
router.get('/featured', publicFeaturedProducts);

module.exports = router; 