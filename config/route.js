const express = require('express');
const apiRoutes = require('../api/routes/indexRoutes');

const router = express.Router();

router.use('/api', apiRoutes);

module.exports = router;
