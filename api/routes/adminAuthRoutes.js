const express = require("express")
const router = express.Router()
const adminController = require("../controller/admin/authController")

router.post("/admin/login", adminController.loginAdmin)

module.exports = router
