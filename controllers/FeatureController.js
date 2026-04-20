const Feature = require("../models/Feature")
const fs = require("fs")

async function createRecord(req, res) {                   //POST
    try {
        let data = new Feature(req.body)
        if (req.file) {
            data.pic = req.file.path
        }
        await data.save()
        res.send({
            result: "Done",
            data: data
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

async function getRecord(req, res) {                      //GET
    try {
        let data = await Feature.find().sort({ _id: -1 })
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
        let data = await Feature.findOne({ _id: req.params._id })
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
        let data = await Feature.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.icon = req.body.icon ?? data.icon
            data.description = req.body.description ?? data.description
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
        let errorMessage = {}
        error?.keyValue && error?.keyValue.name ? errorMessage.name = "Feature Name is Already Exist" : ""
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {               //DELETE
    try {
        let data = await Feature.findOne({ _id: req.params._id })
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


module.exports = {
    createRecord: createRecord,
    getRecord: getRecord,
    getSingleRecord: getSingleRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord
}