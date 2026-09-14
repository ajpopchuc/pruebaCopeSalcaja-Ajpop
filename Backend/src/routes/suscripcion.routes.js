const { Router } = require('express');
const router = Router();
const SuscripcionController = require('../controllers/suscripcion.controller');

router.get('/planes', SuscripcionController.obtenerPlanes);
router.get('/cliente/:clienteId', SuscripcionController.obtenerSuscripcionCliente);
router.post('/', SuscripcionController.crearSuscripcion);

module.exports = router;
