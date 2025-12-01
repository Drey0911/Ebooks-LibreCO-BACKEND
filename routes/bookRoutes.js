const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { bookValidation, validateBook } = require('../middleware/bookValidation');

// Rutas públicas
router.get('/', bookController.getAllBooks);
router.get('/promocionales', bookController.getPromotionalBooks);
router.get('/categoria/:categoria', bookController.getBooksByCategory);
router.get('/:id', bookController.getBookById);

// Rutas protegidas
router.get('/:id/detalles', authMiddleware, bookController.getBookDetails);

// Rutas de compras (protegidas)
router.post('/comprar', authMiddleware, purchaseController.createPurchase);
router.get('/compras/mis-compras', authMiddleware, purchaseController.getUserPurchases);
router.get('/:libroId/verificar-compra', authMiddleware, purchaseController.checkBookPurchase);

// Rutas de administración (protegidas + admin)
router.post('/', authMiddleware, adminMiddleware, validateBook(bookValidation.createBook), bookController.createBook);
router.put('/:id', authMiddleware, adminMiddleware, validateBook(bookValidation.updateBook), bookController.updateBook);
router.delete('/:id', authMiddleware, adminMiddleware, bookController.deleteBook);

module.exports = router;