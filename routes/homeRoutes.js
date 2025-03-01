const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/HomeController');
const controller = new HomeController();

router.get('/', controller.index.bind(controller));
router.get('/status', controller.getServerStatus.bind(controller));
router.get('/annees', async(req, res) => {
    const annees = await controller.annees;

    return controller.success(res, annees);
});
router.get('/current_annee', async(req, res) => {
    //Last items in the array
    const annees = await controller.annees;
    const annee = annees[annees.length - 1];

    return controller.success(res, annee);
});
module.exports = router;