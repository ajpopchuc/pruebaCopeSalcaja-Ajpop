const { Router } = require('express');
const router = Router();
const PagoController = require('../controllers/pago.controller');

router.get('/', PagoController.obtenerPagos);
router.get('/:id', PagoController.obtenerPagoPorId);

module.exports = router;
