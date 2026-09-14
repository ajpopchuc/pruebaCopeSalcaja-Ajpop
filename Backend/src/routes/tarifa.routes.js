const { Router } = require('express');
const router = Router();
const TarifaController = require('../controllers/tarifa.controller');

router.get('/', TarifaController.obtenerTarifas);

module.exports = router;
