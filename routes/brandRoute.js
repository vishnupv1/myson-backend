const express = require("express");
const router = express.Router();
const {
  getBrand,
  addBrand,
  deleteBrand,
  updateBrand,
} = require("../controllers/brandController");

router.get("/", getBrand);
router.post("/", addBrand);
router.delete("/:id", deleteBrand);
router.put("/:id", updateBrand);

module.exports = router;
