const { Router } = require('express');
const router = Router();
const VehiculoController = require('../controllers/vehiculo.controller');

router.get('/', VehiculoController.obtenerVehiculos);
router.get('/buscar/:placa', VehiculoController.buscarPorPlaca);
router.post('/', VehiculoController.registrarVehiculo);

module.exports = router;
