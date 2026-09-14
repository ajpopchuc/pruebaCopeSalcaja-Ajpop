const EspacioModel = require('../models/espacio.model');

const EspacioController = {
  // 1. Obtener todos los espacios y resumen del estado del parqueo
  obtenerEspacios: async (req, res) => {
    try {
      const espacios = await EspacioModel.obtenerTodos();

      // Cálculo de métricas para el tablero en tiempo real
      const total = espacios.length;
      const disponibles = espacios.filter(e => e.estado === 'DISPONIBLE').length;
      const ocupados = espacios.filter(e => e.estado === 'OCUPADO').length;
      const mantenimiento = espacios.filter(e => e.estado === 'MANTENIMIENTO').length;

      res.json({
        status: 'success',
        resumen: {
          total,
          disponibles,
          ocupados,
          mantenimiento
        },
        data: espacios
      });
    } catch (error) {
      console.error('Error al obtener espacios:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al obtener los espacios del parqueo'
      });
    }
  },

  // 2. Obtener espacios disponibles según el tipo de vehículo (Automovil o Motocicleta)
  obtenerDisponiblesPorTipo: async (req, res) => {
    try {
      const { tipoVehiculoId } = req.params;

      if (!tipoVehiculoId) {
        return res.status(400).json({
          status: 'error',
          message: 'El ID del tipo de vehículo es requerido'
        });
      }

      const espacios = await EspacioModel.obtenerDisponiblesPorTipo(tipoVehiculoId);

      res.json({
        status: 'success',
        total: espacios.length,
        data: espacios
      });
    } catch (error) {
      console.error('Error al obtener espacios disponibles:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al buscar espacios disponibles'
      });
    }
  },

  // 3. Cambiar manualmente el estado de un espacio (ej. enviar a mantenimiento)
  cambiarEstado: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const estadosPermitidos = ['DISPONIBLE', 'OCUPADO', 'MANTENIMIENTO'];
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          status: 'error',
          message: `Estado inválido. Debe ser uno de: ${estadosPermitidos.join(', ')}`
        });
      }

      const espacio = await EspacioModel.obtenerPorId(id);
      if (!espacio) {
        return res.status(404).json({
          status: 'error',
          message: 'Espacio no encontrado'
        });
      }

      await EspacioModel.actualizarEstado(id, estado);

      res.json({
        status: 'success',
        message: `Estado del espacio ${espacio.codigo_espacio} actualizado a ${estado}`
      });
    } catch (error) {
      console.error('Error al actualizar estado del espacio:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al actualizar el estado del espacio'
      });
    }
  }
};

module.exports = EspacioController;
