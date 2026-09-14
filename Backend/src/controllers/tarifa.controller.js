const TarifaModel = require('../models/tarifa.model');

const TarifaController = {
  // Obtener el catálogo de tarifas por tramos de tiempo
  obtenerTarifas: async (req, res) => {
    try {
      const tarifas = await TarifaModel.obtenerTodas();

      res.json({
        status: 'success',
        total: tarifas.length,
        data: tarifas
      });
    } catch (error) {
      console.error('Error al obtener tarifas:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al consultar las tarifas'
      });
    }
  }
};

module.exports = TarifaController;
