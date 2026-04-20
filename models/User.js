const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Full Name is Mandatory"]
    },
    username: {
        type: String,
        unique: true,
        required: [true, "Username is Mandatory"]
    },
    email: {
        type: String,
        unique: true,
        required: [true, "User Email is Mandatory"]
    },
    phone: {
        type: String,
        required: [true, "User Phone Number is Mandatory"]
    },
    password: {
        type: String,
        required: [true, "Password is Mandatory"]
    },
    address: {
        type: Array,
        default: []
    },
    role: {
        type: String,
        default: "Buyer"
    },
    otpAuthObject: {
        type: Object,
        default: {}
    },
    status: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const User = mongoose.model("User", UserSchema)
module.exports = User