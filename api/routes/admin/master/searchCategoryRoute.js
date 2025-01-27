const express = require("express")
const router = express.Router()
const searchCategoryController = require('../../../controller/admin/master/searchCategoryController')

router.get("/get",  searchCategoryController.listCategoriesWithSubcategories);

module.exports = router