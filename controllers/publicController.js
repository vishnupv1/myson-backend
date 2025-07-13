const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');

function buildImageUrls(req, images) {
    return images.map(img => `${req.protocol}://${req.get('host')}/public/images/${img}`);
}

// Hardcoded subcategory logic
const SUBCATEGORIES = {
    'best-sellers': { field: 'bestSeller', label: 'Best Sellers' },
    'top-picks': { field: 'topPick', label: 'Top Picks' },
    'trending': { field: 'trending', label: 'Trending' },
    'new-commers': { field: 'newCommer', label: 'New Commers' }
};

// For demo, store product IDs for each subcategory in memory (could be in DB or config)
const subcategoryProducts = {
    'best-sellers': [],
    'top-picks': [],
    'trending': [],
    'new-commers': []
};

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
        products: products.map(p => ({
            ...p.toObject(),
            images: buildImageUrls(req, p.images)
        }))
    });
});

// Public: product details (only listed)
exports.publicProductDetails = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ _id: req.params.id, listed: true })
        .populate('category')
        .populate('brand');
    if (!product) return next(new AppError('Product not found', 404));
    res.json({
        ...product.toObject(),
        images: buildImageUrls(req, product.images)
    });
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

// Public: products by subcategory (hardcoded)
exports.publicSubcategoryProducts = catchAsync(async (req, res, next) => {
    const { type } = req.params;
    if (!SUBCATEGORIES[type]) {
        return next(new AppError('Invalid subcategory', 400));
    }
    // For demo, get product IDs from in-memory object
    const ids = subcategoryProducts[type] || [];
    const products = await Product.find({ _id: { $in: ids }, listed: true })
        .populate('category')
        .populate('brand');
    res.json({
        subcategory: SUBCATEGORIES[type].label,
        products: products.map(p => ({
            ...p.toObject(),
            images: buildImageUrls(req, p.images)
        }))
    });
});

// Admin utility: update subcategory products (not public, should be called from admin panel or script)
exports.setSubcategoryProducts = (type, productIds) => {
    if (SUBCATEGORIES[type]) {
        subcategoryProducts[type] = productIds;
    }
};


exports.searchProducts = catchAsync(async (req, res, next) => {
    const q = req.query.q;
    
    if (!q || typeof q !== 'string' || q.trim() === '') {
        return res.status(400).json({ message: 'Missing or invalid search query' });
    }

    const products = await Product.find({
        name: { $regex: q, $options: 'i' },
        listed: true
    }).limit(10).populate("brand");

    res.json(products);
});