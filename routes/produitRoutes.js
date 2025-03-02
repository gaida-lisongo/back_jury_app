const express = require('express');
const router = express.Router();
const ProduitController = require('../controllers/ProduitController');
const auth = require('../middlewares/auth');

const controller = new ProduitController();

router.use(auth);

router.get('/recours/:promotionId', controller.recoursPromotion.bind(controller));
router.get('/fiches/:promotionId', controller.fichesValid.bind(controller));

router.get('/retrait-recours/:promotionId', controller.retrait_recours.bind(controller));
router.get('/retrait-fiches/:promotionId', controller.retraitsFiches.bind(controller));

router.post('/retrait/:type', controller.addRetraits.bind(controller));

module.exports = router;