const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', userController.getUsers);
router.put('/profile', userController.updateProfile);

module.exports = router;