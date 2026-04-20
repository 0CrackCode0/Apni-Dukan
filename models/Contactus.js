const mongoose = require("mongoose")

const ContactusSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Full Name is Mandatory"]
    },
    email: {
        type: String,
        required: [true, "Email Address is Mandatory"]
    },
    phone: {
        type: String,
        required: [true, "Phone Number is Mandatory"]
    },
    subject: {
        type: String,
        required: [true, "Subject is Mandatory"]
    },
    message: {
        type: String,
        required: [true, "Message is Mandatory"]
    },
    status: {
        type: String,
        default: true
    },
}, { timestamps: true })

const Contactus = mongoose.model("Contactus", ContactusSchema)
module.exports = Contactus