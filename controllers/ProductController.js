const fs = require("fs")

const Product = require("../models/Product")
const Newsletter = require("../models/Newsletter")
const mailer = require("../mailer/index")


async function createRecord(req, res) {
    try {
        let data = new Product(req.body)
        if (req.files) {
            data.pic = Array.from(req.files).map(x => x.path)
        }
        await data.save()

        let finalData = await Product.findOne({ _id: data._id })
            .populate("maincategory", ["name", "pic"])
            .populate("subcategory", ["name", "pic"])
            .populate("brand", ["name", "pic"])
        res.send({
            result: "Done",
            data: finalData
        })

        let newsletter = await Newsletter.find()
        newsletter.forEach(item => {
            mailer.sendMail({
                from: process.env.MAILER,
                to: item.email,
                subject: `Exciting New Arrival Just for You : Team ${process.env.SITE_NAME}`,
                html: `
                    <tr>
                    <td style="background-color:#0b3d91; padding:20px; text-align:center;">
                        <h1 style="color:#ffffff; margin:0; font-size:24px;">${process.env.SITE_NAME}</h1>
                    </td>
                    </tr>

                   <tr>
                        <td style="padding:30px; color:#333333;">
                            <h2 style="color:#0b3d91; margin-top:0;">We’ve Launched Something New!</h2>

                            <p style="font-size:16px; line-height:24px; margin:15px 0;">
                            Dear Customer,
                            </p>

                            <p style="font-size:16px; line-height:24px; margin:15px 0;">
                            We are excited to introduce our latest product – designed with premium quality, modern style, and unbeatable comfort.
                            </p>

                            <p style="font-size:16px; line-height:24px; margin:15px 0;">
                            Be among the first to explore this new arrival and upgrade your wardrobe with something truly special. Limited stock available!
                            </p>

                            <div style="text-align:center; margin:30px 0;">
                            <a href="${process.env.SITE_URL}/product/${data._id}" style="display:inline-block; padding:12px 25px; background-color:#0b3d91; color:#ffffff; text-decoration:none; font-size:16px; border-radius:4px;">
                                Shop Now
                            </a>
                            </div>

                            <p style="font-size:15px; line-height:22px; color:#555555;">
                            Thank you for being a valued customer of ${process.env.SITE_NAME}. Stay tuned for more exciting updates and exclusive offers.
                            </p>

                            <p style="font-size:16px; margin-top:30px;">
                            Warm Regards,<br>
                            <strong style="color:#0b3d91;">Team ${process.env.SITE_NAME}</strong>
                            </p>
                        </td>
                    </tr>

                    <tr>
                    <td style="background-color:#0b3d91; padding:15px; text-align:center;">
                        <p style="color:#ffffff; font-size:12px; margin:0;">
                        © 2026 ${process.env.SITE_NAME}. All Rights Reserved.
                        </p>
                    </td>
                    </tr>
                                                        `
            }, (error) => {
                if (error)
                    console.log(error)
            })
        })
    } catch (error) {
        console.log(error)
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch (error) { }
        }
        let errorMessage = Object.fromEntries(Object.keys(error?.errors).map(key => [key, error.errors[key].message]))
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function getRecord(req, res) {
    try {
        let data = await Product.find()
            .populate("maincategory", ["name", "pic"])
            .populate("subcategory", ["name", "pic"])
            .populate("brand", ["name", "pic"]).sort({ _id: -1 })
        res.send({
            result: "Done",
            count: data.length,
            data: data
        })
    } catch (error) {
        res.send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function getSingleRecord(req, res) {
    try {
        let data = await Product.findOne({ _id: req.params._id })
            .populate("maincategory", ["name", "pic"])
            .populate("subcategory", ["name", "pic"])
            .populate("brand", ["name", "pic"])
        if (data) {
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function updateRecord(req, res) {
    try {
        let data = await Product.findOne({ _id: req.params._id })
        if (data) {
            if (req.body.option) {
                data.stock = req.body.stock ?? data.stock
                data.stockQuantity = req.body.stockQuantity ?? data.stockQuantity
                await data.save()
            }
            else {
                data.name = req.body.name ?? data.name
                data.maincategory = req.body.maincategory ?? data.maincategory
                data.subcategory = req.body.subcategory ?? data.subcategory
                data.brand = req.body.brand ?? data.brand
                data.color = req.body.color ?? data.color
                data.size = req.body.size ?? data.size
                data.basePrice = req.body.basePrice ?? data.basePrice
                data.discount = req.body.discount ?? data.discount
                data.finalPrice = req.body.finalPrice ?? data.finalPrice
                data.stock = req.body.stock ?? data.stock
                data.stockQuantity = req.body.stockQuantity ?? data.stockQuantity
                data.description = req.body.description ?? data.description
                data.status = req.body.status ?? data.status

                await data.save()

                if (await data.save() && req.files) {
                    data.pic.forEach(x => {
                        if (!req.body.oldPics?.includes(x)) {
                            fs.unlink(x, (error) => { })
                        }
                    })
                    if (typeof req.body.oldPics == "undefined")
                        data.pic = Array.from(req.files).map(x => x.path)
                    else
                        data.pic = req.body.oldPics?.concat(Array.from(req.files).map(x => x.path))
                    await data.save()
                }
            }

            let finalData = await Product.findOne({ _id: data._id })
                .populate("maincategory", ["name", "pic"])
                .populate("subcategory", ["name", "pic"])
                .populate("brand", ["name", "pic"])
            res.send({
                result: "Done",
                data: finalData
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        console.log(error)
        if (req.files) {
            Array.from(req.files).forEach(file => {
                try {
                    fs.unlinkSync(file.path)
                } catch (error) { }
            })
        }

        let errorMessage = Object.fromEntries(Object.keys(error?.errors).map(key => [key, error.errors[key].message]))
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {
    try {
        let data = await Product.findOne({ _id: req.params._id })
        if (data) {
            data.pic.forEach(file => {
                try {
                    fs.unlinkSync(file)
                } catch (error) { }
            })
            await data.deleteOne()
            res.send({
                result: "Done"
            })
        }
        else {
            res.status(404).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
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
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
}