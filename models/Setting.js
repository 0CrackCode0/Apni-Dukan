const mongoose = require("mongoose")

const SettingSchema = new mongoose.Schema({
    map1: {
        type: String,
        default: ""
    },
    map2: {
        type: String,
        default: ""
    },
    siteName: {
        type: String,
        default: ""
    },
    logoTop: {
        type: String,
        default: ""
    },
    logoBottom: {
        type: String,
        default: ""
    },
    address: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    whatsapp: {
        type: String,
        default: ""
    },
    privacyPolicy: {
        type: String,
        default: ""
    },
    termsCondition: {
        type: String,
        default: ""
    },
    facebook: {
        type: String,
        default: ""
    },
    twitter: {
        type: String,
        default: ""
    },
    instagram: {
        type: String,
        default: ""
    },
    printerest: {
        type: String,
        default: ""
    },
    linkdin: {
        type: String,
        default: ""
    },
    youtube: {
        type: String,
        default: ""
    },

}, { timestamps: true })

const Setting = mongoose.model("Setting", SettingSchema)
module.exports = Setting