const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error });
  }
};

// Get a single product
const getProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from request params
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};
const getBrandProducts = async (req, res) => {
  const { brand } = req.query; // Get product ID from request params
  try {
    const products = await Product.find({ brand });
    if (!products) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error });
  }
};
// Add a new product
const addProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from request params
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from request params
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error });
  }
};

module.exports = {
  getProducts,
  addProduct,
  deleteProduct,
  updateProduct,
  getProduct,
  getBrandProducts,
};
