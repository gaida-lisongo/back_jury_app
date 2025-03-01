const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const auth = require('../middlewares/auth');

// Instance du controller
const controller = new UserController();

// Routes publiques
router.post('/login', controller.login.bind(controller));
router.post('/check', controller.checkUser.bind(controller));
router.post('/recovery', controller.recovery.bind(controller));

// Routes protégées
router.use(auth); // Middleware d'authentification pour les routes suivantes

router.put('/profile/:userId', controller.changeUserInfo.bind(controller));

// Export des routes
module.exports = router;