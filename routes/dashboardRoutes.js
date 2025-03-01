const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/DashboardController');
const auth = require('../middlewares/auth');

const controller = new DashboardController();

// Toutes les routes nécessitent une authentification
router.use(auth);

router.get('/resultat/:promotionId/:anneeId', controller.resultat.bind(controller));
router.get('/histogramme/:promotionId', controller.histogramme.bind(controller));
router.get('/best/:anneeId', controller.bestPurcent.bind(controller));
router.get('/selling/:anneeId', controller.selling.bind(controller));
router.get('/stats/:promotionId/:anneeId', controller.statData.bind(controller));

module.exports = router;