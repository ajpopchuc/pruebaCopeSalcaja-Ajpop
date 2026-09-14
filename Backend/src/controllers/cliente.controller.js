const ClienteModel = require('../models/cliente.model');

const ClienteController = {
  obtenerClientes: async (req, res) => {
    try {
      const clientes = await ClienteModel.obtenerTodos();
      res.json({
        status: 'success',
        total: clientes.length,
        data: clientes
      });
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al obtener los clientes'
      });
    }
  },

  obtenerClientePorId: async (req, res) => {
    try {
      const { id } = req.params;
      const cliente = await ClienteModel.obtenerPorId(id);

      if (!cliente) {
        return res.status(404).json({
          status: 'error',
          message: 'Cliente no encontrado'
        });
      }

      res.json({
        status: 'success',
        data: cliente
      });
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al buscar el cliente'
      });
    }
  },

  crearCliente: async (req, res) => {
    try {
      const { nombre, documento, telefono, email } = req.body;

      if (!nombre || !documento) {
        return res.status(400).json({
          status: 'error',
          message: 'El nombre y el documento de identidad son obligatorios'
        });
      }

      const clienteExistente = await ClienteModel.obtenerPorDocumento(documento.trim());
      if (clienteExistente) {
        return res.status(409).json({
          status: 'error',
          message: 'Ya existe un cliente registrado con ese documento de identidad'
        });
      }

      const clienteId = await ClienteModel.crear({
        nombre: nombre.trim(),
        documento: documento.trim(),
        telefono: telefono ? telefono.trim() : null,
        email: email ? email.trim() : null
      });

      res.status(201).json({
        status: 'success',
        message: 'Cliente registrado exitosamente',
        data: { clienteId }
      });
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al registrar el cliente'
      });
    }
  }
};

module.exports = ClienteController;
