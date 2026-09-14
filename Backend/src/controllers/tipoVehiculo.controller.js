const TipoVehiculoModel = require('../models/tipoVehiculo.model');

const TipoVehiculoController = {
  obtenerTipos: async (req, res) => {
    try {
      const tipos = await TipoVehiculoModel.obtenerTodos();

      res.json({
        status: 'success',
        total: tipos.length,
        data: tipos
      });
    } catch (error) {
      console.error('Error al obtener tipos de vehículo:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al consultar los tipos de vehículo'
      });
    }
  }
};

module.exports = TipoVehiculoController;
