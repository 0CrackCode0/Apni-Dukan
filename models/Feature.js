const mongoose = require("mongoose")

const FeatureSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: [true, "Feature Name is Mandatory"]
    },
    icon: {
        type: String,
        required: [true, "Feature Icon is Mandatory"]
    },
    shortDescription: {
        type: String,
        required: [true, "Feature Short-Description is Mandatory"]
    },
    status: {
        type: String,
        default: true
    },
}, { timestamps: true })

const Feature = mongoose.model("Feature", FeatureSchema)
module.exports = Feature