const { Router } = require('express');
const router = Router();
const EspacioController = require('../controllers/espacio.controller');

router.get('/', EspacioController.obtenerEspacios);
router.get('/disponibles/:tipoVehiculoId', EspacioController.obtenerDisponiblesPorTipo);
router.patch('/:id/estado', EspacioController.cambiarEstado);

module.exports = router;
