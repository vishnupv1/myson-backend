// /routes/productRoutes.js
const express = require("express");
const router = express.Router();
const {
  getCategory,
  addCategory,
  deleteCategory,
} = require("../controllers/categoryController");

// Route to get all products
router.get("/", getCategory);

// Route to add a new product
router.post("/", addCategory);
router.delete("/:id", deleteCategory); // Use :id parameter to specify the category to delete

module.exports = router;
