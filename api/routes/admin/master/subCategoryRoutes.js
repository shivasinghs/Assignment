const express = require("express")
const router = express.Router()
const subCategoryController = require('../../../controller/admin/master/SubCategoryController')
const adminAuthMiddleware = require('../../../middleware/adminAuthMiddleware')

router.post("/add",adminAuthMiddleware, subCategoryController.createSubCategory)
router.get("/get/:subCategoryId",adminAuthMiddleware, subCategoryController.getSubCategoryById)
router.post("/update",adminAuthMiddleware, subCategoryController.updateSubCategory)
router.delete("/delete/:subCategoryId",adminAuthMiddleware, subCategoryController.deleteSubCategory)
module.exports = router

