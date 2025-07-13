const Brand = require('../models/Brand');
const Product = require('../models/Product');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');

exports.getBrands = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, listed, search } = req.query;
    const filter = {};

    if (listed !== undefined && listed !== '') filter.listed = listed === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };
    
    const brands = await Brand.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));
    const total = await Brand.countDocuments(filter);
    
    res.json({ total, page: Number(page), limit: Number(limit), brands });
});

exports.addBrand = catchAsync(async (req, res, next) => {
    const { name } = req.body;
    if (!name) return next(new AppError('Name is required', 400));
    const brand = await Brand.create({ name });
    res.status(201).json(brand);
});

exports.updateBrand = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const update = req.body;
    const brand = await Brand.findByIdAndUpdate(id, update, { new: true });
    if (!brand) return next(new AppError('Brand not found', 404));
    res.json(brand);
});

exports.toggleBrandListing = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { listed } = req.body;

    if (typeof listed !== 'boolean') {
        return next(new AppError('Missing or invalid "listed" boolean in request body', 400));
    }

    const brand = await Brand.findByIdAndUpdate(id, { listed }, { new: true });
    
    if (!brand) return next(new AppError('Brand not found', 404));
    
    res.json({ message: `Brand ${listed ? 'listed' : 'unlisted'}`, brand });
});

exports.deleteBrand = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const products = await Product.find({ brand: id });
    if (products.length > 0) {
        return next(new AppError('Cannot delete: brand is referenced by products', 400));
    }
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) return next(new AppError('Brand not found', 404));
    res.json({ message: 'Brand deleted' });
});
