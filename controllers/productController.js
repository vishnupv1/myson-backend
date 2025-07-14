const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const fs = require('fs');


// List products with pagination and filtering
exports.getProducts = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, category, brand, listed, search, bestSeller, trending } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (brand) filter.brand = brand;
    if (listed !== undefined && listed !== '') filter.listed = listed === 'true';
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (bestSeller !== undefined && bestSeller !== '') filter.bestSeller = bestSeller === 'true';
    if (trending !== undefined && trending !== '') filter.trending = trending === 'true';

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
        products: products.map(p => p.toObject())
    });
});

// Get single product
exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('category')
        .populate('brand');

    if (!product) return next(new AppError('Product not found', 404));

    res.json({
        product: product.toObject()
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
        ...product.toObject()
    });
});

// Update product details
exports.updateProduct = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    let update = req.body;

    // Parse toBeDeleted if present
    let toBeDeleted = [];
    if (update.toBeDeleted) {
        try {
            toBeDeleted = JSON.parse(update.toBeDeleted);
        } catch (e) {
            return next(new AppError('Invalid toBeDeleted format', 400));
        }
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));

    // Remove images marked for deletion
    if (toBeDeleted.length > 0) {
        product.images = product.images.filter(img => {
            if (toBeDeleted.includes(img)) {
                // Delete from disk
                const imgPath = path.join(__dirname, '../public/images', img);
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                return false;
            }
            return true;
        });
    }

    // Add new uploaded images
    if (req.files && req.files.length > 0) {
        product.images.push(...req.files.map(f => f.filename));
    }

    // Update other fields
    if (update.name !== undefined) product.name = update.name;
    if (update.description !== undefined) product.description = update.description;
    if (update.price !== undefined) product.price = update.price;
    if (update.category !== undefined) product.category = update.category;
    if (update.brand !== undefined) product.brand = update.brand;

    await product.save();

    res.json(product);
});

// Replace the unlistProduct export with toggleProductListing
exports.toggleProductListing = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { listed } = req.body;
    if (typeof listed !== 'boolean') {
        return next(new AppError('Missing or invalid "listed" boolean in request body', 400));
    }
    const product = await Product.findByIdAndUpdate(id, { listed }, { new: true });
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ message: `Product ${listed ? 'listed' : 'unlisted'}`, product });
});

// Toggle bestSeller
exports.toggleBestSeller = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { bestSeller } = req.body;
    if (typeof bestSeller !== 'boolean') {
        return next(new AppError('Missing or invalid "bestSeller" boolean in request body', 400));
    }
    const product = await Product.findByIdAndUpdate(id, { bestSeller }, { new: true });
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ message: `Product ${bestSeller ? 'marked as best-seller' : 'removed from best-sellers'}`, product });
});

// Toggle trending
exports.toggleTrending = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { trending } = req.body;
    if (typeof trending !== 'boolean') {
        return next(new AppError('Missing or invalid "trending" boolean in request body', 400));
    }
    const product = await Product.findByIdAndUpdate(id, { trending }, { new: true });
    if (!product) return next(new AppError('Product not found', 404));
    res.json({ message: `Product ${trending ? 'marked as trending' : 'removed from trending'}`, product });
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

exports.addProductImages = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));
    if (!req.files || req.files.length === 0) {
        return next(new AppError('No images uploaded', 400));
    }
    product.images.push(...req.files.map(f => f.filename));
    await product.save();
    res.json(product);
});

exports.deleteProductImage = catchAsync(async (req, res, next) => {
    const { id, imageName } = req.params;
    const product = await Product.findById(id);
    if (!product) return next(new AppError('Product not found', 404));
    if (!product.images.includes(imageName)) {
        return next(new AppError('Image not found in product', 404));
    }
    if (product.images.length <= 1) {
        return next(new AppError('A product must have at least one image', 400));
    }
    // Remove from array
    product.images = product.images.filter(img => img !== imageName);
    // Delete from disk
    const imgPath = path.join(__dirname, '../public/images', imageName);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    await product.save();
    res.json(product);
});