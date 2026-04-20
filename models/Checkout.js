const mongoose = require("mongoose")

const CheckoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User Id is Mendatory"]
    },
    deliveryAddress: {
        type: Object,
        required: [true, "Delivery Address is Mandatory"]
    },
    orderStatus: {
        type: String,
        default: "Order is Placed"
    },
    paymentMode: {
        type: String,
        default: "COD"
    },
    paymentStatus: {
        type: String,
        default: "Pending"
    },
    rppid: {
        type: String,
        default: ""
    },
    subtotal: {
        type: Number,
        required: [true, "Subtotal Amount is Mendatory"]
    },
    shipping: {
        type: Number,
        required: [true, "Shipping Amount is Mendatory"]
    },
    total: {
        type: Number,
        required: [true, "Total Amount is Mendatory"]
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: [true, "Product Product Id is Mendatory"]
            },
            color: {
                type: String,
                required: [true, "Color Field is Mendatory"]
            },
            size: {
                type: String,
                required: [true, "Size Field is Mendatory"]
            },
            qty: {
                type: Number,
                required: [true, "Product Quantity is Mendatory"]
            },
            total: {
                type: Number,
                required: [true, "Total Amount is Mendatory"]
            }
        }
    ]
}, { timestamps: true })

const Checkout = mongoose.model("Checkout", CheckoutSchema)
module.exports = Checkout