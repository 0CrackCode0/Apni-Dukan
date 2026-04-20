const Subcategory = require("../models/Subcaincategory")
const fs = require("fs")

async function createRecord(req, res) {                   //POST
    try {
        let data = new Subcategory(req.body)
        if (req.file) {
            data.pic = req.file.path
        }
        await data.save()
        res.send({
            result: "Done",
            data: data
        })
    } catch (error) {
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch (error) { }
        }

        let errorMessage = {}
        error?.keyValue && error?.keyValue.name ? errorMessage.name = "Subcategory Name is Already Exist" : ""
        error?.errors?.name ? errorMessage.name = error?.errors?.name?.message : ""
        error?.errors?.pic ? errorMessage.pic = error?.errors?.pic?.message : ""
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function getRecord(req, res) {                      //GET
    try {
        let data = await Subcategory.find().sort({ _id: -1 })
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
        let data = await Subcategory.findOne({ _id: req.params._id })
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
        let data = await Subcategory.findOne({ _id: req.params._id })
        if (data) {
            data.name = req.body.name ?? data.name
            data.status = req.body.status ?? data.status

            if (await data.save() && req.file) {
                try {
                    fs.unlinkSync(data.pic)
                } catch (error) { }
                data.pic = req.file.path
                await data.save()
            }
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
        if (req.file) {
            try {
                fs.unlinkSync(req.file.path)
            } catch (error) { }
        }

        let errorMessage = {}
        error?.keyValue && error?.keyValue.name ? errorMessage.name = "Subcategory Name is Already Exist" : ""
        res.status(Object.values(errorMessage).length ? 400 : 500).send({
            result: "Fail",
            reason: Object.values(errorMessage).length ? errorMessage : "Internal Server Error"
        })
    }
}

async function deleteRecord(req, res) {               //DELETE
    try {
        let data = await Subcategory.findOne({ _id: req.params._id })
        if (data) {
            try {
                fs.unlinkSync(data.pic)
            } catch (error) { }
            await data.deleteOne()
            res.send({
                result: "Done"
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