const User = require("../models/User")
const passwordValidator = require("password-validator")
const bcrypt = require("bcrypt")
const mailer = require("../mailer/index")
const jwt = require("jsonwebtoken")

var schema = new passwordValidator()
    .is().min(8)                                        // Minimum length 8
    .is().max(100)                                      // Maximum length 100
    .has().uppercase(1)                                 // Must have at least 1 uppercase letters
    .has().lowercase(1)                                 // Must have at least 1 lowercase letters
    .has().digits(1)                                    // Must have at least 1 digits
    .has().symbols(1)                                   // Must have at least 1 special symbol
    .has().not().spaces()                               // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123'])      // Blacklist these values

async function createRecord(req, res) {                 //POST
    if (req.body.password) {
        if (schema.validate(req.body.password)) {
            bcrypt.hash(req.body.password, 12, async (error, hash) => {
                if (error) {
                    res.status(500).send({
                        result: "Fail",
                        reason: "Internal Server Error During Password Encryption"
                    })
                }
                else {
                    try {
                        let data = new User(req.body)
                        if (!(req.body.option))
                            data.role = "Buyer"
                        data.password = hash
                        await data.save()
                        res.send({
                            result: "Done",
                            data: data
                        })
                        mailer.sendMail({
                            from: process.env.MAILER,
                            to: data.email,
                            subject: `Welcome Onboard ${data.name} – Team ${process.env.SITE_NAME}`,
                            html: `
                                            <tr>
                                                <td align="center" style="background-color:#00aaff; padding:25px;">
                                                <h1 style="color:#ffffff; margin:0; font-size:26px; text-align:center;">
                                                    ${process.env.SITE_NAME}
                                                </h1>
                                                <p style="color:#e6f7ff; margin:5px 0 0; font-size:14px; text-align:center;">
                                                    Your Trusted Shopping Partner
                                                </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:30px; color:#333333;">
                                                <h2 style="margin-top:0; color:#00aaff; text-align:center;">
                                                    🎉 Welcome Onboard ${data.name}
                                                </h2>
                                                <p style="font-size:15px; line-height:1.6;">
                                                    Hi ${data.name},
                                                </p>

                                                <p style="font-size:15px; line-height:1.6;">
                                                    Thank you for creating your account with <strong>Apni Dukan</strong>. 
                                                    We’re excited to have you join our shopping community
                                                </p>

                                                <p style="font-size:15px; line-height:1.6;">
                                                    You can now:
                                                </p>

                                                <ul style="font-size:15px; line-height:1.8; padding-left:20px;">
                                                    <li>🛍️ Browse thousands of products</li>
                                                    <li>💳 Enjoy secure & fast checkout</li>
                                                    <li>🎁 Get exclusive member discounts</li>
                                                    <li>🚚 Track your orders easily</li>
                                                </ul>
                                                <table align="center" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                                                <tr>
                                                    <td align="center" bgcolor="#00aaff" style="border-radius:6px;">
                                                        <a href="${process.env.SITE_URL}" 
                                                        target="_blank"
                                                        style="
                                                            display:inline-block;
                                                            padding:14px 32px;
                                                            font-size:16px;
                                                            font-weight:bold;
                                                            font-family: Arial, sans-serif;
                                                            color:#ffffff;
                                                            text-decoration:none;
                                                            border-radius:6px;
                                                            background-color:#00aaff;
                                                        ">
                                                        Start Shopping
                                                        </a>
                                                    </td>
                                                </tr>
                                                </table>
                                                <p style="font-size:14px; color:#555555; line-height:1.6;">
                                                    If you did not create this account, please contact our support team immediately.
                                                </p>

                                                <p style="margin-top:30px; font-size:15px;">
                                                    Happy Shopping!<br>
                                                    <strong>Team - ${process.env.SITE_NAME}</strong>
                                                </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="center" style="background-color:#f2faff; padding:20px; font-size:12px; color:#777777;">
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
                        let arr = []
                        if (error?.keyValue)
                            arr = Object.keys(error.keyValue).map(key => [key, `${key} Already Exist`])
                        else
                            arr = Object.keys(error.errors).map(key => [key, error.errors[key].message])
                        let errorMessage = Object.fromEntries(arr)
                        res.status(Object.values(errorMessage).length ? 400 : 500).send({
                            result: "Fail",
                            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
                        })
                    }
                }
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: schema.validate(req.body.password, { details: true }).map(x => x.message.replaceAll("string", "Password"))
            })
        }
    }
    else {
        res.send({
            result: "Fail",
            reason: "Password Field is Required"
        })
    }
}

async function getRecord(req, res) {                      //GET
    try {
        let data = await User.find().sort({ _id: -1 })
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

async function getSingleRecord(req, res) {                //GET
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(400).send({
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

async function updateRecord(req, res) {                     //PUT/PATCH
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.username = req.body.username ?? data.username
            data.email = req.body.email ?? data.email
            data.phone = req.body.phone ?? data.phone
            data.role = req.body.role ?? data.role
            data.address = req.body.address ?? data.address
            data.status = req.body.status ?? data.status
            await data.save()

            bcrypt.hash(req.body.password, 12, async (error, hash) => {
                if (error) {
                    res.status(500).send({
                        result: "Fail",
                        reason: "Internal Server Error During Password Encryption"
                    })
                }
                else {
                    data.password = hash
                }
            })
            await data.save()
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        let arr = []
        if (error?.keyValue)
            arr = Object.keys(error.keyValue).map(key => [key, `${key} Already Exist`])
        else
            arr = Object.keys(error.errors).map(key => [key, error.errors[key].message])
        let errorMessage = Object.fromEntries(arr)
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {               //DELETE
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({
                result: "Record Deleted"
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch (error) { }
        }
    }
}

async function login(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username },
            ]
        })
        if (data && await bcrypt.compare(req.body.password, data.password)) {
            jwt.sign({ data }, process.env.JWT_SECRET_KEY_PRIVATE, { expiresIn: "10 days" }, (error, token) => {
                if (error) {
                    res.status(500).send({
                        result: "Fail",
                        reson: "Internal Server Error"
                    })
                }
                else {
                    res.send({
                        result: "Done",
                        data: data,
                        token: token
                    })
                }
            })
        }
        else {
            res.status(401).send({
                result: "Fail",
                reason: "Invalid Username or Password"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })

    }
}


async function forgotpassword1(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username },
            ]
        })
        if (data) {
            let otp = Math.random().toString().slice(2, 8)
            data.otpAuthObject = {
                otp: otp,
                createdAt: Date.now()
            }
            await data.save()
            res.send({
                result: "Done",
                message: "OTP Sent to Registered Email Address"
            })

            mailer.sendMail({
                from: process.env.MAILER,
                to: data.email,
                subject: `Hi! ${data.name} your Password Reset OTP - Team ${process.env.SITE_NAME}`,
                html: `
                        <tr>
                        <td align="center">
                            
                            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden;">
                            
                    <tr>
                        <td align="center" style="background-color:#00aaff; padding:25px;">
                        <h1 style="color:#ffffff; margin:0; font-size:26px; text-align:center;">
                            ${process.env.SITE_NAME}
                        </h1>
                        <p style="color:#e6f7ff; margin:5px 0 0; font-size:14px; text-align:center;">
                            Your Trusted Shopping Partner
                        </p>
                        </td>
                    </tr>
                            
                            <tr>
                                <td style="padding:30px; color:#333333;">
                                <h2 style="margin-top:0; color:#00aaff;">Password Reset Request</h2>
                                
                                <p style="font-size:15px; line-height:1.6;">
                                    Hello,
                                </p>
                                
                                <p style="font-size:15px; line-height:1.6;">
                                    We received a request to reset your password for your Apni Dukan account.
                                    Please use the OTP below to proceed with resetting your password.
                                </p>
                                
                                <!-- OTP Box -->
                                <table align="center" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                                    <tr>
                                    <td align="center" style="background-color:#e6f7ff; border:2px dashed #00aaff; padding:15px 30px; border-radius:6px;">
                                        <span style="font-size:28px; font-weight:bold; letter-spacing:5px; color:#007acc;">
                                        ${otp}
                                        </span>
                                    </td>
                                    </tr>
                                </table>
                                
                                <p style="font-size:14px; line-height:1.6; color:#555555;">
                                    This OTP is valid for <strong>10 minutes</strong>. Please do not share this code with anyone for security reasons.
                                </p>
                                
                                <p style="font-size:14px; line-height:1.6; color:#555555;">
                                    If you did not request a password reset, please ignore this email or contact our support team.
                                </p>
                                
                                <p style="font-size:15px; margin-top:30px;">
                                    Regards,<br>
                                    <strong>${process.env.SITE_NAME}</strong>
                                </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="background-color:#f2faff; padding:20px; font-size:12px; color:#777777;">
                                © 2026 ${process.env.SITE_NAME}. All rights reserved.<br>
                                This is an automated message, please do not reply.
                                </td>
                            </tr>
                            `

            })
        }
        else {
            res.status(401).send({
                result: "Fail",
                reason: "User Not Found"
            })
        }
    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })

    }
}

async function getRecord(req, res) {                      //GET
    try {
        let data = await User.find().sort({ _id: -1 })
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

async function getSingleRecord(req, res) {                //GET
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(400).send({
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

async function updateRecord(req, res) {                     //PUT/PATCH
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.username = req.body.username ?? data.username
            data.email = req.body.email ?? data.email
            data.phone = req.body.phone ?? data.phone
            data.role = req.body.role ?? data.role
            data.address = req.body.address ?? data.address
            data.status = req.body.status ?? data.status
            await data.save()

            res.send({
                result: "Done",
                data: data
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        let arr = []
        if (error?.keyValue)
            arr = Object.keys(error.keyValue).map(key => [key, `${key} Already Exist`])
        else
            arr = Object.keys(error.errors).map(key => [key, error.errors[key].message])
        let errorMessage = Object.fromEntries(arr)
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {               //DELETE
    try {
        let data = await User.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({
                result: "Record Deleted"
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch (error) { }
        }
    }
}

async function forgotpassword2(req, res) {
    try {
        const data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username },
            ]
        })

        if (!data) {
            return res.status(400).send({
                result: "Fail",
                reason: "Invalid OTP or username"
            })
        }

        const isOtpValid =
            data.otpAuthObject?.otp === req.body.otp &&
            Date.now() - new Date(data.otpAuthObject.createdAt).getTime() < 600000

        if (!isOtpValid) {
            return res.status(400).send({
                result: "Fail",
                reason: "OTP is Invalid or Expired"
            })
        }

        const jwt = require("jsonwebtoken")

        const resetToken = jwt.sign(
            { id: data._id },
            process.env.JWT_SECRET_KEY_PRIVATE,
            { expiresIn: "10m" }
        )

        res.send({
            result: "Done",
            resetToken
        })

    } catch (error) {
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function forgotpassword3(req, res) {
    try {
        let data = await User.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username },
            ]
        })
        if (data) {
            if (schema.validate(req.body.password)) {
                bcrypt.hash(req.body.password, 12, async (error, hash) => {
                    if (error) {
                        res.status(500).send({
                            result: "Fail",
                            reason: "Internal Server Error During Password Encryption"
                        })
                    }
                    else {
                        data.password = hash
                        await data.save()
                        res.send({
                            result: "Done",
                            data: data,
                            message: "Password Reset Successfully"
                        })
                    }
                })
            }
            else {
                res.status(400).send({
                    result: "Fail",
                    reason: schema.validate(req.body.password, { details: true }).map(x => x.message.replaceAll("string", "Password"))
                })
            }
        }
        else {
            res.status(401).send({
                result: "Fail",
                reason: "Unauthorized Activity  Detected"
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
    login: login,
    forgotpassword1: forgotpassword1,
    forgotpassword2: forgotpassword2,
    forgotpassword3: forgotpassword3,
}