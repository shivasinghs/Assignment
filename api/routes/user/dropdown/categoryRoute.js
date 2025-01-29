const express = require("express")
const router = express.Router()
const categoryController = require('../../../controller/user/dropdown/CategoryController')
const userAuthMiddleware = require('../../../middleware/userAuthMiddleware')

router.get('/category',userAuthMiddleware,categoryController);

module.exports = router
