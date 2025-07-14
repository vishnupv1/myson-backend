const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand",
        required: true,
    },
    images: {
        type: [String],
        required: true,
        validate: v => Array.isArray(v) && v.length > 0,
    },
    listed: {
        type: Boolean,
        default: true,
    },
    bestSeller: {
        type: Boolean,
        default: false,
    },
    trending: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);
