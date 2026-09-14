const { Router } = require('express');
const router = Router();
const ClienteController = require('../controllers/cliente.controller');

router.get('/', ClienteController.obtenerClientes);
router.get('/:id', ClienteController.obtenerClientePorId);
router.post('/', ClienteController.crearCliente);

module.exports = router;
