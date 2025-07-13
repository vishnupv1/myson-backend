const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
    getCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    unlistCategory
} = require('../controllers/categoryController');

router.use(auth);

router.get('/', getCategories);
router.post('/', addCategory);
router.put('/:id', updateCategory);
router.patch('/:id/unlist', unlistCategory);
router.delete('/:id', deleteCategory);

module.exports = router;
