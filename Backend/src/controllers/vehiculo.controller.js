const VehiculoModel = require('../models/vehiculo.model');
const TipoVehiculoModel = require('../models/tipoVehiculo.model');
const ClienteModel = require('../models/cliente.model');

const VehiculoController = {
  obtenerVehiculos: async (req, res) => {
    try {
      const vehiculos = await VehiculoModel.obtenerTodos();
      res.json({
        status: 'success',
        total: vehiculos.length,
        data: vehiculos
      });
    } catch (error) {
      console.error('Error al obtener vehículos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al obtener los vehículos'
      });
    }
  },

  buscarPorPlaca: async (req, res) => {
    try {
      const { placa } = req.params;

      if (!placa) {
        return res.status(400).json({
          status: 'error',
          message: 'La placa es obligatoria'
        });
      }

      const vehiculo = await VehiculoModel.obtenerPorPlaca(placa.toUpperCase().trim());
      if (!vehiculo) {
        return res.status(404).json({
          status: 'error',
          message: 'Vehículo no encontrado'
        });
      }

      res.json({
        status: 'success',
        data: vehiculo
      });
    } catch (error) {
      console.error('Error al buscar vehículo por placa:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al buscar el vehículo'
      });
    }
  },

  registrarVehiculo: async (req, res) => {
    try {
      const { placa, tipo_vehiculo_id, cliente_id, es_temporal } = req.body;

      // Validación de campos obligatorios
      if (!placa || !tipo_vehiculo_id) {
        return res.status(400).json({
          status: 'error',
          message: 'La placa y el tipo de vehículo son obligatorios'
        });
      }

      const placaNormalizada = placa.toUpperCase().trim();

      // Validar si el tipo de vehículo existe
      const tipoExiste = await TipoVehiculoModel.obtenerPorId(tipo_vehiculo_id);
      if (!tipoExiste) {
        return res.status(404).json({
          status: 'error',
          message: 'El tipo de vehículo seleccionado no es válido'
        });
      }

      // Validar si la placa ya existe
      const vehiculoExistente = await VehiculoModel.obtenerPorPlaca(placaNormalizada);
      if (vehiculoExistente) {
        return res.status(409).json({
          status: 'error',
          message: `El vehículo con placa ${placaNormalizada} ya está registrado`
        });
      }

      // Si se asocia a un cliente, validar que el cliente exista
      if (cliente_id) {
        const clienteExiste = await ClienteModel.obtenerPorId(cliente_id);
        if (!clienteExiste) {
          return res.status(404).json({
            status: 'error',
            message: 'El cliente asociado no existe'
          });
        }
      }

      const vehiculoId = await VehiculoModel.crear({
        placa: placaNormalizada,
        tipo_vehiculo_id,
        cliente_id: cliente_id || null,
        es_temporal: Boolean(es_temporal)
      });

      res.status(201).json({
        status: 'success',
        message: es_temporal
          ? 'Vehículo temporal de taller registrado exitosamente'
          : 'Vehículo registrado exitosamente',
        data: { vehiculoId }
      });
    } catch (error) {
      console.error('Error al registrar vehículo:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al registrar el vehículo'
      });
    }
  }
};

module.exports = VehiculoController;
