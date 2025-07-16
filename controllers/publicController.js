const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');


// Public: list products (only listed)
exports.publicProducts = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, category, brand, search } = req.query;
    const filter = { listed: true };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;
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
        products: products.map(p => p.toObject())
    });
});

// Public: product details (only listed)
exports.publicProductDetails = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ _id: req.params.id, listed: true })
        .populate('category')
        .populate('brand');
    if (!product) return next(new AppError('Product not found', 404));
    res.json(product.toObject());
});

// Public: categories (only listed)
exports.publicCategories = catchAsync(async (req, res, next) => {
    const categories = await Category.find({ listed: true });
    res.json(categories);
});

// Public: brands (only listed)
exports.publicBrands = catchAsync(async (req, res, next) => {
    const brands = await Brand.find({ listed: true });
    res.json(brands);
});

// Public: featured products (best-sellers or trending)
exports.publicFeaturedProducts = catchAsync(async (req, res, next) => {
    const { type } = req.query;

    let filter = { listed: true };

    if (type === 'best-sellers') {
        filter.bestSeller = true;
    } else if (type === 'trending') {
        filter.trending = true;
    } else {
        return next(new AppError('Invalid type. Use type=best-sellers or type=trending', 400));
    }

    const products = await Product.find(filter)
        .populate('category')
        .populate('brand');

    res.json({
        type,
        products: products.map(p => p.toObject())
    });
});


exports.searchProducts = catchAsync(async (req, res, next) => {
    const q = req.query.q;

    const results = {
        brand: null,
        category: null,
        products: null,
    }

    if (!q || typeof q !== 'string' || q.trim() === '') {
        return res.status(400).json({ message: 'Missing or invalid search query' });
    }

    // Split query into possible brand and category terms
    const [brandQuery, categoryQuery] = q.trim().split(/ (.*)/);

    // Prepare promises for brand and category
    const brandPromise = brandQuery ? Brand.findOne({
        name: { $regex: brandQuery, $options: 'i' },
        listed: true
    }) : Promise.resolve(null);

    const categoryPromise = Category.findOne({
        name: { $regex: categoryQuery || brandQuery, $options: 'i' },
        listed: true
    });

    // Await the results brand and category to resolve
    const [brand, category] = await Promise.all([brandPromise, categoryPromise]);
    results.brand = brand;
    results.category = category;

    // Build product query
    let productFilter = { listed: true };
    let orConditions = [];
    if (q) orConditions.push({ name: { $regex: q, $options: 'i' } });
    if (brand) orConditions.push({ brand: brand.id })
    if (category) orConditions.push({ category: category.id });

    if (orConditions.length > 0) {
        productFilter.$or = orConditions;
    }

    results.products = await Product.find(productFilter)
        .limit(15)
        .populate("brand")
        .populate("category");

    res.json(results);
});