const express = require("express")
const router = express.Router()
const subCategoryController = require('../../../controller/user/dropdown/SubCategoryController')
const userAuthMiddleware = require('../../../middleware/userAuthMiddleware')

router.get('/subcategory',userAuthMiddleware,subCategoryController);

module.exports = router