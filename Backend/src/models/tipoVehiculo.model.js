const pool = require('../config/db');

const TipoVehiculoModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query('SELECT * FROM tipo_vehiculo');
    return rows;
  },

  obtenerPorId: async (id) => {
    const [rows] = await pool.query('SELECT * FROM tipo_vehiculo WHERE id = ?', [id]);
    return rows[0] || null;
  }
};

module.exports = TipoVehiculoModel;
