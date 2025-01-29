const express = require("express")
const router = express.Router()
const userController = require('../../../controller/admin/user/UserController')
const adminAuthMiddleware = require('../../../middleware/adminAuthMiddleware')

router.get('/userwithfilter',adminAuthMiddleware,userController);

module.exports = router;