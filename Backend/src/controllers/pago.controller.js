const PagoModel = require('../models/pago.model');

const PagoController = {
  obtenerPagos: async (req, res) => {
    try {
      const pagos = await PagoModel.obtenerTodos();

      const totalRecaudado = pagos.reduce((acc, p) => acc + Number(p.monto), 0);

      res.json({
        status: 'success',
        totalRegistros: pagos.length,
        totalRecaudado: Number(totalRecaudado.toFixed(2)),
        data: pagos
      });
    } catch (error) {
      console.error('Error al obtener pagos:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al consultar los pagos'
      });
    }
  },

  obtenerPagoPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const pago = await PagoModel.obtenerPorId(id);

      if (!pago) {
        return res.status(404).json({
          status: 'error',
          message: 'Pago no encontrado'
        });
      }

      res.json({
        status: 'success',
        data: pago
      });
    } catch (error) {
      console.error('Error al obtener pago:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al buscar el pago'
      });
    }
  }
};

module.exports = PagoController;
