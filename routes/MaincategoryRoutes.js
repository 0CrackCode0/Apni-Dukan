const MaincategoryRouter = require("express").Router()
const { maincategoryUploader } = require("../middlewares/uploader")

const {
    authPublic,
    authAdmin,
    authSuperAdmin
} = require("../middlewares/authentication")

const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord
} = require("../controllers/MaincategoryController")

MaincategoryRouter.post("", authAdmin, maincategoryUploader.single("pic"), createRecord)
MaincategoryRouter.get("", authPublic, getRecord)
MaincategoryRouter.get("/:_id", authPublic, getSingleRecord)
MaincategoryRouter.put("/:_id", authAdmin, maincategoryUploader.single("pic"), updateRecord)
MaincategoryRouter.delete("/:_id", authSuperAdmin, deleteRecord)

module.exports = MaincategoryRouter


// Rule of thumb (important)
// GET → read only. no delete
// DELETE → delete record + file
// PUT/PATCH → update
// POST → create