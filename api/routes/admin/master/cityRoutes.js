const express = require("express")
const router = express.Router()
const cityController = require('../../../controller/admin/master/CityController')
const adminAuthMiddleware = require('../../../middleware/adminAuthMiddleware')

router.post("/add",adminAuthMiddleware, cityController.createCity)
router.get("/get/:cityId",adminAuthMiddleware, cityController.getCityById)
router.get("/getall",adminAuthMiddleware ,cityController.getAllCity)
router.post("/update",adminAuthMiddleware, cityController.updateCity)
router.delete("/delete/:cityId",adminAuthMiddleware, cityController.deleteCity)
module.exports = router

