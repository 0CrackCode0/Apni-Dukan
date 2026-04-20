const mongoose = require("mongoose")

const BrandSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Brand Name is Mandatory"]
    },
    pic: {
        type: String,
        required: [true, "Brand Pic is Mandatory"]
    },
    status: {
        type: String,
        default: true
    },
}, { timestamps: true })

const Brand = mongoose.model("Brand", BrandSchema)
module.exports = Brand