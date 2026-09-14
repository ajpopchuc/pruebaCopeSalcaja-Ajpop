const { Router } = require('express');
const router = Router();

const espacioRoutes = require('./espacio.routes');
const tarifaRoutes = require('./tarifa.routes');
const tipoVehiculoRoutes = require('./tipoVehiculo.routes');
const clienteRoutes = require('./cliente.routes');
const vehiculoRoutes = require('./vehiculo.routes');
const suscripcionRoutes = require('./suscripcion.routes');
const estacionamientoRoutes = require('./estacionamiento.routes');
const pagoRoutes = require('./pago.routes');

// Enrutador central del API
router.use('/espacios', espacioRoutes);
router.use('/tarifas', tarifaRoutes);
router.use('/tipos-vehiculo', tipoVehiculoRoutes);
router.use('/clientes', clienteRoutes);
router.use('/vehiculos', vehiculoRoutes);
router.use('/suscripciones', suscripcionRoutes);
router.use('/estacionamiento', estacionamientoRoutes);
router.use('/pagos', pagoRoutes);

module.exports = router;
