const express = require("express")
const router = express.Router()
const countryController = require('../../../controller/user/dropdown/CountryController')
const userAuthMiddleware = require('../../../middleware/userAuthMiddleware')

router.get('/country',userAuthMiddleware,countryController);

module.exports = router