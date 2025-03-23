const Brand = require("../models/Brand");

const getBrand = async (req, res) => {
  try {
    const brands = await Brand.find();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: "Error fetching brands", error });
  }
};

const addBrand = async (req, res) => {
  try {
    const newBrand = new Brand(req.body);
    await newBrand.save();
    res.json(newBrand);
  } catch (error) {
    res.status(500).json({ message: "Error adding Brand", error });
  }
};

const deleteBrand = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteBrand = await Brand.findByIdAndDelete(id);
    if (!deleteBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Brand", error });
  }
};

const updateBrand = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBrand) {
      return res.status(404).json({ message: "Brand not found" });
    }
    res.json(updatedBrand);
  } catch (error) {
    res.status(500).json({ message: "Error updating Brand", error });
  }
};

module.exports = {
  getBrand,
  addBrand,
  deleteBrand,
  updateBrand,
};
