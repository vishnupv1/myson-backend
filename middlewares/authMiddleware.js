const jwt = require('jsonwebtoken');
const AppError = require('../utils/errorHandler');
const Admin = require('../models/Admin');

module.exports = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(new AppError('Not authenticated', 401));
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return next(new AppError('Admin not found', 401));
        }
        
        req.admin = admin;
        next();
    } catch (err) {
        next(new AppError('Invalid or expired token', 401));
    }
}; 