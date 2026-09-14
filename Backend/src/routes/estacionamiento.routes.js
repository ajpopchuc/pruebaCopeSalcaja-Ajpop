const { Router } = require('express');
const router = Router();
const EstacionamientoController = require('../controllers/estacionamiento.controller');

router.post('/entrada', EstacionamientoController.registrarEntrada);
router.post('/salida', EstacionamientoController.registrarSalida);
router.get('/historial', EstacionamientoController.obtenerHistorial);

module.exports = router;
