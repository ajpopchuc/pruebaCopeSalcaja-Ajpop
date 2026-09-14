const { Router } = require('express');
const router = Router();
const TipoVehiculoController = require('../controllers/tipoVehiculo.controller');

router.get('/', TipoVehiculoController.obtenerTipos);

module.exports = router;
