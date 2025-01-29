const express = require("express")
const router = express.Router()
const categoryWithSubCategoryController = require('../../../controller/admin/list/CategoryWithSubCategoryController')
const adminAuthMiddleware = require('../../../middleware/adminAuthMiddleware')

router.get('/categorywithsubcategory',adminAuthMiddleware,categoryWithSubCategoryController);

module.exports = router