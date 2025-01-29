const express = require('express');
const adminAuthRoutes = require('./admin/auth/authRoutes');
const userAuthRoutes = require('./user/auth/authRoutes');
const countryRoutes = require('./admin/master/countryRoutes');
const categoryRoutes = require('./admin/master/categoryRoutes');
const subCategoryRoutes = require('./admin/master/subCategoryRoutes');
const cityRoutes = require('./admin/master/cityRoutes');
const accountRoutes = require('./user/master/accountRoutes')
const categoryRoute = require('./user/dropdown/categoryRoute')
const cityRoute = require('./user/dropdown/cityRoute');
const countryRoute = require('./user/dropdown/countryRoute');
const subcategoryRoute = require('./user/dropdown/subcategoryRoute');
const categoryWithSubCategoryRoute = require('./admin/list/CategoryWithSubCategoryRoute');
const listUserRoute = require('./admin/user/listUserRoute');
const router = express.Router();


router.use('/admin', adminAuthRoutes);
router.use('/user', userAuthRoutes);
router.use('/country', countryRoutes);
router.use('/category', categoryRoutes);
router.use('/subcategory',subCategoryRoutes );
router.use('/city', cityRoutes);
router.use('/account',accountRoutes);
router.use('/getall',categoryRoute,cityRoute,countryRoute,subcategoryRoute);
router.use('/listall',categoryWithSubCategoryRoute,listUserRoute)


module.exports = router;