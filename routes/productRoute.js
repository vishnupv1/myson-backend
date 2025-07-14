const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const upload = require('../middlewares/multerConfig');
const {
    getProducts,
    getProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
    replaceImage,
    deleteImage,
    toggleProductListing,
    searchProducts,
    toggleBestSeller,
    toggleTrending
} = require('../controllers/productController');

// All routes below require authentication
router.use(auth);

// List, filter, paginate
router.get('/', getProducts);
router.get('/:id', getProduct);

// Create product with at least 1 image
router.post('/', upload.array('images', 10), addProduct);

// Add images to product
router.post('/:id/images', upload.array('images', 10), require('../controllers/productController').addProductImages);
// Delete a specific image by filename
router.delete('/:id/images/:imageName', require('../controllers/productController').deleteProductImage);

// Update product details (with images)
router.put('/:id', upload.array('images', 10), updateProduct);

// Soft delete (unlist)
router.patch('/:id/listing', toggleProductListing);
// Toggle bestSeller
router.patch('/:id/best-seller', toggleBestSeller);
// Toggle trending
router.patch('/:id/trending', toggleTrending);
// Hard delete
router.delete('/:id', deleteProduct);

module.exports = router;
