const SettingRoutes = require("express").Router()
const { settingUploader } = require("../middlewares/uploader")

const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord
} = require("../controllers/SettingController")

SettingRoutes.post("", settingUploader.fields([
    { name: "logoTop", maxCount: 1 },
    { name: "logoBottom", maxCount: 1 }
]), createRecord)
SettingRoutes.get("", getRecord)

module.exports = SettingRoutes


// Rule of thumb (important)
// GET → read only. no delete
// DELETE → delete record + file
// PUT/PATCH → update
// POST → create