const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.post('/', purchaseController.createPurchase);
router.get('/', purchaseController.getUserPurchases);
router.get('/check/:libroId', purchaseController.checkBookPurchase);

module.exports = router;