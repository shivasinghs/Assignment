const express = require("express")
const router = express.Router()
const userController = require("../../../controller/user/auth/authController")
const userAuthMiddleware = require('../../../middleware/userAuthMiddleware')
const {upload} = require('../../../../config/multer')

router.post("/signup", userController.SignUp)
router.post("/login", userController.login)
router.post("/update-profile",userAuthMiddleware,upload.single("image"), userController.updateProfile)
router.post("/verify-otp",userController.verifyOTP);
router.post("/forgot-password",userController.forgotPassword)
router.post("/change-password",userController.changePassword)

module.exports = router

