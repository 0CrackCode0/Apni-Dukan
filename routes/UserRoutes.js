const UserRouter = require("express").Router()

const {
    authPublic,
    authBuyer,
} = require("../middlewares/authentication")


const {
    createRecord,
    getRecord,
    getSingleRecord,
    updateRecord,
    deleteRecord,
    login,
    forgotpassword1,
    forgotpassword2,
    forgotpassword3,
} = require("../controllers/UserController")

UserRouter.post("", authPublic, createRecord)
UserRouter.get("", authBuyer, getRecord)
UserRouter.get("/:_id", authBuyer, getSingleRecord)
UserRouter.put("/:_id", authBuyer, updateRecord)
UserRouter.delete("/:_id", authBuyer, deleteRecord)
UserRouter.post("/login", authPublic, login)
UserRouter.post("/forget-password-1", authPublic, forgotpassword1)
UserRouter.post("/forget-password-2", authPublic, forgotpassword2)
UserRouter.post("/forget-password-3", authPublic, forgotpassword3)

module.exports = UserRouter


// Rule of thumb (important)
// GET → read only. no delete
// DELETE → delete record + file
// PUT/PATCH → update
// POST → create