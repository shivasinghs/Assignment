const express = require('express');
const adminAuthRoutes = require('./adminAuthRoutes');
const userAuthRoutes = require('./userAuthRoutes');

const router = express.Router();


router.use('/admin', adminAuthRoutes);
router.use('/user', userAuthRoutes);

module.exports = router;
