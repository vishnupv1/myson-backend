const Category = require('../models/Category');
const Product = require('../models/Product');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');

exports.getCategories = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, listed, search } = req.query;
    const filter = {};

    if (listed !== undefined && listed !== '') filter.listed = listed === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };

    const categories = await Category.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const total = await Category.countDocuments(filter);

    res.json({ total, page: Number(page), limit: Number(limit), categories });
});

exports.addCategory = catchAsync(async (req, res, next) => {
    const { name } = req.body;
    if (!name) return next(new AppError('Name is required', 400));
    const category = await Category.create({ name });
    res.status(201).json(category);
});

exports.updateCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const update = req.body;
    const category = await Category.findByIdAndUpdate(id, update, { new: true });
    if (!category) return next(new AppError('Category not found', 404));
    res.json(category);
});

exports.unlistCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const category = await Category.findByIdAndUpdate(id, { listed: false }, { new: true });
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ message: 'Category unlisted', category });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const products = await Product.find({ category: id });
    if (products.length > 0) {
        return next(new AppError('Cannot delete: category is referenced by products', 400));
    }
    const category = await Category.findByIdAndDelete(id);
    if (!category) return next(new AppError('Category not found', 404));
    res.json({ message: 'Category deleted' });
});
