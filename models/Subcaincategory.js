const mongoose = require("mongoose")

const SubcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Subcategory Name is Mandatory"]
    },
    pic: {
        type: String,
        required: [true, "Subcategory Pic is Mandatory"]
    },
    status: {
        type: String,
        default: true
    },
}, { timestamps: true })

const Subcategory = mongoose.model("Subcategory", SubcategorySchema)
module.exports = Subcategory