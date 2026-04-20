const fs = require("fs")
const Checkout = require("../models/Checkout")
const mailer = require("../mailer/index")
const Razorpay = require("razorpay")


//Payment API
async function order(req, res) {
    try {
        if (!req.body.amount) {
            console.error("Amount missing in request");
            return res.status(400).json({
                message: "Amount is required"
            });
        }
        const instance = new Razorpay({
            key_id: process.env.RZP_TEST_API_KEY,
            key_secret: process.env.RZP_TEST_SECRET_KEY,
        });
        const amountInPaise = Math.round(req.body.amount * 100);

        const options = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        };
        const order = await instance.orders.create(options);
        res.json({ data: order });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Internal Server Error",
            details: error.toString()
        });
    }
}

async function verifyOrder(req, res) {
    try {
        var check = await Checkout.findOne({ _id: req.body.checkid })
        check.rppid = req.body.razorpay_payment_id
        check.paymentStatus = "Done"
        check.paymentMode = "Net Banking"
        await check.save()
        res.status(200).send({ result: "Done", message: "Payment SuccessFull" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error!" });
    }
}


// ================== CREATE (ABDUL AHAD IS WORLD'S ONE OF THE BEST COODER) ==================
async function createRecord(req, res) {
    try {
        const data = new Checkout(req.body)
        await data.save()

        const finalData = await Checkout.findById(data._id)
            .populate("user", ["name", "username"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity stock pic",
                populate: {
                    path: "brand",
                    select: "_id name"
                },
                options: {
                    slice: { pic: 1 }
                }
            })
        res.status(201).send({
            result: "Done",
            data: finalData
        })
        mailer.sendMail({
            from: process.env.MAILER,
            to: data.deliveryAddress?.email,
            subject: `Order Confirmed 🎉 – Team ${process.env.SITE_NAME}`,
            html: `
                    <tr>
                        <td align="center" style="background-color: #007BFF; padding: 20px;">
                            <h1 style="color: #ffffff; margin: 0;">${process.env.SITE_NAME}</h1>
                            <p style="color:#e6f7ff; margin:5px 0 0; font-size:14px;">
                                Your Trusted Shopping Partner
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px; color: #333333;">
                            <h2 style="color: #007BFF;">Hello ${finalData.user.name},</h2>

                            <p style="font-size: 15px; line-height: 1.6;">
                                🎉 Thank you for your order! We’re excited to let you know that your order has been placed successfully.
                            </p>

                            <p style="font-size: 15px; line-height: 1.8;">
                                <strong>Order Details:</strong><br>
                                Order ID: <strong>#${data._id}</strong><br>
                                Order Date: ${new Date(data.createdAt).toLocaleString()}<br>
                                Payment Method: ${data.paymentMode}<br>
                                Total Amount: ₹${data.total}
                            </p>

                            <p style="font-size: 15px; line-height: 1.6;">
                                📦 We are preparing your items and will notify you once your order has been shipped.
                            </p>

                            <!-- Button -->
                            <table align="center" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                                <tr>
                                    <td align="center" bgcolor="#007BFF" style="border-radius: 6px;">
                                        <a href="${process.env.SITE_URL}/profile?option=Orders ${data._id}"
                                        target="_blank"
                                        style="
                                                display:inline-block;
                                                padding:12px 30px;
                                                font-size:16px;
                                                font-weight:bold;
                                                font-family: Arial, sans-serif;
                                                color:#ffffff;
                                                text-decoration:none;
                                                border-radius:6px;
                                                background-color:#007BFF;
                                        ">
                                        Track Your Order
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 14px; color:#555;">
                                If you have any questions, feel free to contact our support team.
                            </p>

                            <p style="margin-top: 30px; font-size: 15px;">
                                Happy Shopping!<br>
                                <strong>Team ${process.env.SITE_NAME}</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #f4f4f4; padding: 15px; font-size: 12px; color: #777777;">
                            © 2026 ${process.env.SITE_NAME}. All rights reserved.<br>
                            This is an automated message, please do not reply.
                        </td>
                    </tr>
                  `
        }, (error) => {
            if (error)
                console.log(error)
        })

    } catch (error) {
        let errorMessage = Object.fromEntries(Object.keys(error?.errors || {}).map(key => [key, error.errors[key]?.message]))
        res.status(Object.keys(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.keys(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

// ================== GET ALL ==================
async function getRecord(req, res) {
    try {
        let data = await Checkout.find()
            .populate("user", ["name", "username"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity stock pic",
                populate: {
                    path: "brand",
                    select: "_id name"
                },
                options: {
                    slice: { pic: 1 }
                }
            }).sort({ _id: -1 })
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })

    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

// ================== GET USER Record ==================
async function getUserRecord(req, res) {
    try {
        let data = await Checkout.find({ user: req.params.userid })
            .populate("user", ["name", "username"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity stock pic",
                populate: {
                    path: "brand",
                    select: "_id name"
                },
                options: {
                    slice: { pic: 1 }
                }
            }).sort({ _id: -1 })
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })

    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

// ================== GET SINGLE ==================
async function getSingleRecord(req, res) {
    try {
        const data = await Checkout.findById(req.params._id)
            .populate("user", ["name", "username"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity stock pic",
                populate: {
                    path: "brand",
                    select: "_id name"
                },
                options: {
                    slice: { pic: 1 }
                }
            })

        if (data) {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }

        res.send({
            result: "Done",
            data: data
        })

    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

// ================== UPDATE ==================
async function updateRecord(req, res) {
    try {
        const data = await Checkout.findOne({ _id: req.params._id })
        if (data) {
            data.orderStatus = req.body.orderStatus ?? data.orderStatus
            data.paymentMode = req.body.paymentMode ?? data.paymentMode
            data.paymentStatus = req.body.paymentStatus ?? data.paymentStatus
            data.rppid = req.body.rppid ?? data.rppid
            await data.save()
        }

        let finalData = await Checkout.findById({ _id: data._id })
            .populate("user", ["name", "username"])
            .populate({
                path: "products.product",
                select: "name brand finalPrice stockQuantity stock pic",
                populate: {
                    path: "brand",
                    select: "_id name"
                },
                options: {
                    slice: { pic: 1 }
                }
            })

        res.send({
            result: "Done",
            data: finalData
        })
        mailer.sendMail({
            from: process.env.MAILER,
            to: data.deliveryAddress?.email,
            subject: `Order Update: ${data.status} – Team ${process.env.SITE_NAME}`,
            html: `
                    <tr>
                        <td align="center" style="background-color: #6c757d; padding: 20px;">
                            <h1 style="color: #ffffff; margin: 0;">
                                ${process.env.SITE_NAME}
                            </h1>
                            <p style="color:#e6f7ff; margin:5px 0 0; font-size:14px;">
                                Your Trusted Shopping Partner
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding: 30px; color: #333333;">
                            <h2 style="color: #333333;">Hello ${finalData.user.name},</h2>

                            <p style="font-size: 15px; line-height: 1.6;">
                                We would like to inform you that the status of your order has been updated.
                            </p>

                            <table width="100%" cellpadding="10" cellspacing="0" style="background-color:#f8f9fa; border-radius:6px; margin:20px 0;">
                                <tr>
                                    <td style="font-size:15px; line-height:1.8;">
                                        <strong>Order ID:</strong> #${data._id} <br>
                                        <strong>Order Updated On:</strong> ${data.updatedAt} <br>
                                        <strong>Total Amount:</strong> ₹${data.totalAmount} <br>
                                        <strong>Current Status:</strong> 
                                        <span style="
                                            padding:6px 12px;
                                            border-radius:20px;
                                            font-size:13px;
                                            font-weight:bold;
                                            color:#ffffff;
                                            background-color:${getStatusColor(data.status)};
                                        ">
                                            ${data.status}
                                        </span>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size: 15px; line-height: 1.6;">
                                ${data.status === "Processing" ? "Your order is currently being prepared." :
                    data.status === "Shipped" ? "Your order has been shipped and is on the way."
                        : data.status === "Out for Delivery" ? "Your order is out for delivery and will reach you soon."
                            : data.status === "Delivered" ? "Your order has been successfully delivered."
                                : data.status === "Cancelled" ? "Your order has been cancelled. If you have any questions, please contact support." : ""
                }
                            </p>

                            <table align="center" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                                <tr>
                                    <td align="center" bgcolor="#007BFF" style="border-radius: 6px;">
                                        <a href="${process.env.SITE_URL}/profile?option=Order/${data._id}"
                                        target="_blank"
                                        style="
                                                display:inline-block;
                                                padding:12px 30px;
                                                font-size:16px;
                                                font-weight:bold;
                                                font-family: Arial, sans-serif;
                                                color:#ffffff;
                                                text-decoration:none;
                                                border-radius:6px;
                                                background-color:#007BFF;
                                        ">
                                        View Order Details
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:14px; color:#555;">
                                If you have any questions, please contact our support team.
                            </p>

                            <p style="margin-top: 30px; font-size: 15px;">
                                Thank you for shopping with us.<br>
                                <strong>${process.env.SITE_NAME} Team</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #f4f4f4; padding: 15px; font-size: 12px; color: #777777;">
                            © 2026 ${process.env.SITE_NAME}. All rights reserved.<br>
                            This is an automated message, please do not reply.
                        </td>
                    </tr>
                `
        }, (error) => {
            if (error)
                console.log(error)
        })

    } catch (error) {
        const errorMessage = Object.fromEntries(
            Object.keys(error?.errors || {}).map(key => [
                key,
                error.errors[key]?.message
            ])
        )

        res.status(Object.keys(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.keys(errorMessage).length
                ? errorMessage
                : "Internal Server Error"
        })
    }
}

// ================== DELETE ==================
async function deleteRecord(req, res) {
    try {
        const data = await Checkout.findById(req.params._id)

        if (data) {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }

        // Delete associated files if exist
        if (Array.isArray(data.pic)) {
            data.pic.forEach(file => {
                try {
                    fs.unlinkSync(file)
                } catch (err) { }
            })
        }

        await data.deleteOne()

        res.send({
            result: "Record Deleted"
        })

    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getUserRecord: getUserRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    order: order,
    verifyOrder: verifyOrder,
}