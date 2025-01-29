const express = require("express")
const router = express.Router()
const countryController = require('../../../controller/admin/master/CountryController')
const adminAuthMiddleware = require('../../../middleware/adminAuthMiddleware')

router.post("/add",adminAuthMiddleware, countryController.createCountry)
router.get("/get/:countryId",adminAuthMiddleware, countryController.getCountryById)
router.post("/update",adminAuthMiddleware, countryController.updateCountry)
router.delete("/delete/:countryId",adminAuthMiddleware, countryController.deleteCountry)
module.exports = router