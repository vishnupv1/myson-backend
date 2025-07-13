const express = require('express');
const router = express.Router();
const {
    publicProducts,
    publicProductDetails,
    publicCategories,
    publicBrands,
    publicSubcategoryProducts
} = require('../controllers/publicController');

router.get('/products', publicProducts);
router.get('/products/:id', publicProductDetails);
router.get('/categories', publicCategories);
router.get('/brands', publicBrands);
router.get('/subcategories/:type', publicSubcategoryProducts); // e.g. best-sellers, trending

module.exports = router; 