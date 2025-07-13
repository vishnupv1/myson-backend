const mongoose = require('mongoose');
const pino = require('pino')();
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.info('MongoDB connected');
    } catch (err) {
        pino.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectDB;
