const express = require("express")
const router = express.Router()
const cityController = require('../../../controller/user/dropdown/CityController')
const userAuthMiddleware = require('../../../middleware/userAuthMiddleware')

router.get('/city',userAuthMiddleware,cityController);

module.exports = router