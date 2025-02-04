const express = require("express")
const router = express.Router()
const accountController = require('../../../controller/user/master/accountController')
const userAuthMiddleware = require('../../../middleware/userAuthMiddleware')

router.post("/add",userAuthMiddleware, accountController.createAccount)
router.get("/get/:accountId",userAuthMiddleware, accountController.getAccountById)
router.get("/get",userAuthMiddleware, accountController.getAllAccounts)
router.post("/update",userAuthMiddleware, accountController. updateAccount)
router.delete("/delete/:accountId",userAuthMiddleware, accountController.deleteAccount)
module.exports = router