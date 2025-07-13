const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/errorHandler');
const catchAsync = require('../utils/catchAsync');

exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return next(new AppError('Username and password are required', 400));
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
        return next(new AppError('Invalid credentials', 401));
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
        return next(new AppError('Invalid credentials', 401));
    }

    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
    
    res.json({ token });
}); 