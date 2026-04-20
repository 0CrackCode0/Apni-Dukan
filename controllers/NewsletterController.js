const Newsletter = require("../models/Newsletter")
const mailer = require("../mailer/index")

async function createRecord(req, res) {                   //POST
    try {
        let data = new Newsletter(req.body)
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
            subject: `Subscription is Confirmed - Team ${process.env.SITE_NAME}`,
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
                            <h2 style="margin-top:0; color:#00aaff; text-align:center;">🎉 Subscription Confirmed</h2>
                            <p style="font-size:15px; line-height:1.6;">Hello! Shopaholic,</p>
                            <p style="font-size:15px; line-height:1.6;">Thank you for subscribing to the <strong>Apni Dukan Newsletter</strong>.You will now receive updates about:</p>
                            
              <ul style="font-size:15px; line-height:1.8; padding-left:20px;">
                <li>🛍️ Exclusive offers & discounts</li>
                <li>🚀 New product launches</li>
                <li>🎁 Special festive deals</li>
                <li>🔥 Limited-time promotions</li>
              </ul>
              <table align="center" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                <tr>
                  <td align="center" style="background-color:#00aaff; padding:12px 25px; border-radius:5px;">
                    <a href="${process.env.SITE_URL}" 
                       style="color:#ffffff; text-decoration:none; font-size:15px; font-weight:bold;">
                       Shop Now
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px; color:#555555; line-height:1.6;">
                If you did not subscribe to this newsletter, you can safely ignore this email 
                or unsubscribe anytime from the link provided in future emails.
              </p>

              <p style="margin-top:30px; font-size:15px;">
                Regards,<br>
                <strong>Team ${process.env.SITE_NAME}</strong>
              </p>

            </td>
          </tr>
          <tr>
            <td align="center" style="background-color:#f2faff; padding:20px; font-size:12px; color:#777777;">
              © 2026 ${process.env.SITE_NAME}. All rights reserved.<br>
              You are receiving this email because you subscribed to our newsletter.
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
            arr = Object.keys(error.keyValue).map(key => [key, `This ${key} is Already Exist`])
        else
            arr = Object.keys(error.errors).map(key => [key, error.errors[key].message])
        let errorMessage = Object.fromEntries(arr)
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function getRecord(req, res) {                      //GET
    try {
        let data = await Newsletter.find().sort({ _id: -1 })
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
        let data = await Newsletter.findOne({ _id: req.params._id })
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
        let data = await Newsletter.findOne({ _id: req.params._id })
        if (data) {
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
        res.status(500).send({
            result: "Fail",
            reason: "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {               //DELETE
    try {
        let data = await Newsletter.findOne({ _id: req.params._id })
        if (data) {
            await data.deleteOne()
            res.send({
                result: "You have Unsubscribed Successfully"
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