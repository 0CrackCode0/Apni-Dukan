const Contactus = require("../models/Contactus")
const mailer = require("../mailer/index")

async function createRecord(req, res) {                   //POST
    try {
        let data = new Contactus(req.body)
        if (req.file) {
            data.pic = req.file.path
        }
        await data.save()
        res.send({
            result: "Done",
            data: data
        })
        mailer.sendMail({
            from: process.env.MAILER,
            to: data.email,
            subject: `Query Received – Team ${process.env.SITE_NAME}`,
            html: `
                <tr>
                <td align="center" style="background-color: #007BFF; padding: 20px;">
                    <h1 style="color: #ffffff; margin: 0;">${process.env.SITE_NAME}</h1>
                    <p style="color:#e6f7ff; margin:5px 0 0; font-size:14px; text-align:center;">Your Trusted Shopping Partner</p>
                </td>
                </tr>
                <tr>
                <td style="padding: 30px; color: #333333;">
                    <h2 style="color: #007BFF;">Hello ${data.name},</h2>
                    <p style="font-size: 15px; line-height: 1.6;">
                    Thank you for reaching out to us. We have successfully received your message and our team will get back to you as soon as possible.
                    </p>

                    <p style="font-size: 15px; line-height: 1.6;">
                    <strong>Summary of your submission:</strong><br>
                    Name: ${data.name}<br>
                    Email: ${data.email}<br>
                    Phone: ${data.phone}<br>
                    Message: ${data.message}</p>
                    Date: ${data.createdAt}</p>

                    <p style="font-size: 15px; line-height: 1.6;">
                    We appreciate your interest and will respond promptly. Meanwhile, you can visit our <a href="${process.env.SITE_URL}" style="color: #007BFF; text-decoration: none;">${process.env.SITE_NAME}</a> for more information.
                    </p>

                    <p style="margin-top: 30px; font-size: 15px;">
                    Best regards,<br>
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
        let errorMessage = Object.fromEntries(Object.keys(error.errors).map(key => [key, error.errors[key].message]))
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function getRecord(req, res) {                      //GET
    try {
        let data = await Contactus.find().sort({ _id: -1 })
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
        let data = await Contactus.findOne({ _id: req.params._id })
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

async function updateRecord(req, res) {               //PUT/PATCH
    try {
        let data = await Contactus.findOne({ _id: req.params._id })
        if (data) {
            data.status = req.body.status ?? data.status
            await data.save()

            res.send({
                result: "Done",
                data: data
            })

            mailer.sendMail({
                from: process.env.MAILER,
                to: data.email,
                subject: `Your Query Has Been Resolved – Team ${process.env.SITE_NAME}`,
                html: `
                <tr>
                    <td align="center" style="background-color: #007BFF; padding: 20px;">
                        <h1 style="color: #ffffff; margin: 0;">${process.env.SITE_NAME}</h1>
                        <p style="color:#e6f7ff; margin:5px 0 0; font-size:14px; text-align:center;">
                            Your Trusted Shopping Partner
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="padding: 30px; color: #333333;">
                        <h2 style="color: #28a745;">Hello ${data.name},</h2>

                        <p style="font-size: 15px; line-height: 1.6;">
                            Good news! Your query has been successfully resolved by our team.
                        </p>

                        <p style="font-size: 15px; line-height: 1.6;">
                            <strong>Summary of your query:</strong><br>
                            Name: ${data.name}<br>
                            Email: ${data.email}<br>
                            Phone: ${data.phone || "N/A"}<br>
                            Message: ${data.message}<br>
                            Submitted On: ${new Date(data.createdAt).toLocaleString()}
                        </p>

                        <p style="font-size: 15px; line-height: 1.6;">
                            If you have any further questions or need assistance, feel free to reply to this email or visit our <a href="${process.env.SITE_URL}" style="color: #28a745; text-decoration: none;">website</a>.
                        </p>

                        <p style="margin-top: 30px; font-size: 15px;">
                            Best regards,<br>
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
                if (error) console.log("Query resolved email failed:", error);
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

async function deleteRecord(req, res) {               //DELETE
    try {
        let data = await Contactus.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({
                result: "Contact details deleted successfully"
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


module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}