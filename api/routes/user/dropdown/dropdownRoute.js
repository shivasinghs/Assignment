const express = require("express")
const router = express.Router()
const dropdownController = require('../../../controller/user/dropdown/DropdownController')
const userAuthMiddleware = require('../../../middleware/userAuthMiddleware')

router.get('/category',userAuthMiddleware,dropdownController.getAllCategories);
router.get('/city',userAuthMiddleware,dropdownController.getAllCity);
router.get('/country',userAuthMiddleware,dropdownController.getAllCountry);
router.get('/subcategory',userAuthMiddleware,dropdownController.getAllSubCategory);

module.exports = router
