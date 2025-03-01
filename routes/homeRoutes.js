const express = require('express');
const router = express.Router();
const HomeController = require('../controllers/HomeController');
const controller = new HomeController();

router.get('/', controller.index.bind(controller));
router.get('/status', controller.getServerStatus.bind(controller));

module.exports = router;