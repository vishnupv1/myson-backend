// /server.js
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const brandRoutes = require("./routes/brandRoute");
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// MongoDB connection
mongoose.connect("mongodb://localhost:27017/myson", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/brands", brandRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
