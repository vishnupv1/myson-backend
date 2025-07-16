require('dotenv').config();
const express = require('express');
const fs = require("node:fs")
const path = require('node:path');
const connectDB = require('./config/db');
const errorMiddleware = require('./middlewares/errorMiddleware');
const corsMiddleware = require('./middlewares/corsMiddleware');

const productRoutes = require('./routes/productRoute');
const categoryRoutes = require('./routes/categoryRoute');
const brandRoutes = require('./routes/brandRoute');
const publicRoutes = require('./routes/publicRoute');
const loginRoute = require('./routes/loginRoute');

const app = express();

connectDB();

app.use(express.json());
app.use(corsMiddleware);

// Serve images statically
app.use('/public/images', express.static(path.join(__dirname, 'public/images')));

// API versioning
app.use('/api/v1/login', loginRoute);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/brands', brandRoutes);
app.use('/api/v1/public', publicRoutes); // public content endpoints

// Error handling
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT,
    process.env.NODE_ENV === "development" ? "0.0.0.0" : "127.0.0.1",
    () => {
        const imagesDir = path.join(__dirname, 'public/images');
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
            console.log(`Created missing directory: ${imagesDir}`);
        }

        console.log("Server started @", new Date().toLocaleString("en-GB", {
            hourCycle: "h12",
            timeZone: "Asia/Kolkata"
        }))
        console.info(`Server running on port ${PORT}`);
    });
