const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const fs = require('fs');

// Helper to build image URLs
function buildImageUrls(req, images) {
    return images.map(img => `${req.protocol}://${req.get('host')}/public/images/${img}`);
}

// List products with pagination and filtering
exports.getProducts = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, category, brand, listed = true, search } = req.query;
    const filter = { listed };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (listed !== undefined) filter.listed = listed === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };
    const products = await Product.find(filter)
        .populate('category')
        .populate('brand')
        .skip((page - 1) * limit)
        .limit(Number(limit));
    const total = await Product.countDocuments(filter);
    res.json({
        total,
        page: Number(page),
        limit: Number(limit),
        products: products.map(p => ({
            ...p.toObject(),
            images: buildImageUrls(req, p.images)
        }))
    });
});

// Get single product
exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('category')
        .populate('brand');
    if (!product) return next(new AppError('Product not found', 404));
    res.json({
        ...product.toObject(),
        images: buildImageUrls(req, product.images)
    });
});

// Add product (at least 1 image required)
exports.addProduct = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next(new AppError('At least one image is required', 400));
    }
    const { name, description, price, category, brand } = req.body;
    if (!name || !description || !price || !category || !brand) {
        return next(new AppError('Missing required fields', 400));
    }
    const images = req.files.map(f => f.filename);
    const product = await Product.create({
        name,
        description,
        price,
        category,
        brand,
        images,
        listed: true
    });
    res.status(201).json({
        ...product.toObject(),
        images: buildImageUrls(req, product.images)
    });
});

// Update product details
exports.updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const update = req.body;
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    if (!product) return next(new AppError('Product not found', 404));
    res.json({
        ...product.toObject(),
        images: buildImageUrls(req, product.images)
    });
});

// Soft delete (unlist)
exports.unlistProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { listed: false }, { new: true });
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ message: 'Product unlisted', product });
});

// Hard delete
exports.deleteProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) return next(new AppError('Product not found', 404));
    // Delete images from disk
    product.images.forEach(img => {
        const imgPath = path.join(__dirname, '../public/images', img);
        if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    });
    res.json({ message: 'Product deleted' });
});

// Add images to product
exports.uploadImages = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
        return next(new AppError('No images uploaded', 400));
    }
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));
    product.images.push(...req.files.map(f => f.filename));
    await product.save();
    res.json({
        ...product.toObject(),
        images: buildImageUrls(req, product.images)
    });
});

// Replace a specific image
exports.replaceImage = catchAsync(async (req, res, next) => {
    const { id, imageIndex } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));
    const idx = Number(imageIndex);
    if (isNaN(idx) || idx < 0 || idx >= product.images.length) {
        return next(new AppError('Invalid image index', 400));
    }
    // Delete old image from disk
    const oldImg = product.images[idx];
    const oldImgPath = path.join(__dirname, '../public/images', oldImg);
    if (fs.existsSync(oldImgPath)) fs.unlinkSync(oldImgPath);
    // Replace with new image
    if (!req.file) return next(new AppError('No image uploaded', 400));
    product.images[idx] = req.file.filename;
    await product.save();
    res.json({
        ...product.toObject(),
        images: buildImageUrls(req, product.images)
    });
});

// Delete a specific image
exports.deleteImage = catchAsync(async (req, res, next) => {
    const { id, imageIndex } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));
    const idx = Number(imageIndex);
    if (isNaN(idx) || idx < 0 || idx >= product.images.length) {
        return next(new AppError('Invalid image index', 400));
    }
    // Delete image from disk
    const img = product.images[idx];
    const imgPath = path.join(__dirname, '../public/images', img);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    product.images.splice(idx, 1);
    if (product.images.length === 0) {
        return next(new AppError('At least one image is required', 400));
    }
    await product.save();
    res.json({
        ...product.toObject(),
        images: buildImageUrls(req, product.images)
    });
});
