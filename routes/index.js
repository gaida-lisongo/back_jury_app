const express = require('express');
const router = express.Router();

const homeRoutes = require('./homeRoutes');
const userRoutes = require('./userRoutes');
const dashboardRoutes = require('./dashboardRoutes');
// const promotionRoutes = require('./promotionRoutes');
// const produitRoutes = require('./produitRoutes');

router.use('/', homeRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
// router.use('/promotions', promotionRoutes);
// router.use('/produits', produitRoutes);

module.exports = router;