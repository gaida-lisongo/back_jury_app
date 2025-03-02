const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/PromotionController');
const auth = require('../middlewares/auth');

const controller = new PromotionController();

router.use(auth);

router.get('/grilles/:anneeId/:promotionId/:type?', controller.grillesPromotion.bind(controller));
router.put('/cote/:coteId/:type', controller.changeCote.bind(controller));
router.post('/cote/:type', controller.addCote.bind(controller));
router.post('/notification/:coteId', controller.notificationCote.bind(controller));

module.exports = router;