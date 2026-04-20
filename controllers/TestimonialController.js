const path = require("path")
const Testimonial = require("../models/Testimonial")
const fs = require("fs")

async function createRecord(req, res) {                   //POST
    try {
        let data = new Testimonial(req.body)
        await data.save()
        res.send({
            result: "Done",
            data: data
        })
    } catch (error) {
        let errorMessage = Object.fromEntries(Object.keys(error?.errors).map(key => [key, error?.errors[key]?.message]))
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function getRecord(req, res) {                      //GET
    try {
        let data = await Testimonial.find().sort({ _id: -1 })
            .populate("user", ["name"])
            .populate("product", ["name"])
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
        let data = await Testimonial.findOne({ _id: req.params._id })
            .populate("user", ["name"])
            .populate("product", ["name"])
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
        let data = await Testimonial.findOne({ _id: req.params._id })
        if (data) {
            data.message = req.body.message ?? data.message
            data.star = req.body.star ?? data.star
            await data.save()

            let finalData = await Testimonial.findOne({ _id: data._id })
                .populate("user", ["name"])
                .populate("product", ["name"])

            res.send({
                result: "Done",
                data: finalData
            })
        }
        else {
            res.status(400).send({
                result: "Fail",
                reason: "Record Not Found"
            })
        }
    } catch (error) {
        let errorMessage = Object.fromEntries(Object.keys(error?.errors).map(key => [key, error?.errors[key]?.message]))
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {               //DELETE
    try {
        let data = await Testimonial.findOne({ _id: req.params._id })
        if (data) {
            data.pic.forEach(file => {
                try {
                    fs.unlinkSync(file)
                } catch (error) { }
            })
            if (req.file) {
                try {
                    fs.unlinkSync(req.file.path)
                } catch (error) { }
            }
            try {
                fs.unlinkSync(data.pic)
            } catch (error) { }
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

    }
}


module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}