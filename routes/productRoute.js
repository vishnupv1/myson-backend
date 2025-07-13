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
    unlistProduct
} = require('../controllers/productController');

// All routes below require authentication
router.use(auth);

// List, filter, paginate
router.get('/', getProducts);
router.get('/:id', getProduct);

// Create product with at least 1 image
router.post('/', upload.array('images', 10), addProduct);

// Update product details
router.put('/:id', updateProduct);

// Soft delete (unlist)
router.patch('/:id/unlist', unlistProduct);

// Hard delete
router.delete('/:id', deleteProduct);

// Add images to product
router.post('/:id/images', upload.array('images', 10), uploadImages);

// Replace a specific image
router.put('/:id/images/:imageIndex', upload.single('image'), replaceImage);

// Delete a specific image
router.delete('/:id/images/:imageIndex', deleteImage);

module.exports = router;
