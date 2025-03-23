// /server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const brandRoutes = require("./routes/brandRoute");
const PORT = process.env.PORT || 5000;
require("dotenv").config();
// Middleware
const corsOptions = {
  origin: "*", // Allow all origins (change this to restrict access)
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brands", brandRoutes);

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
