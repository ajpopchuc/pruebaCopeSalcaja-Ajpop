const pool = require('../config/db');

const PlanesSuscripcionModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query('SELECT * FROM planes_suscripcion WHERE estado = "ACTIVO"');
    return rows;
  },

  obtenerPorId: async (id) => {
    const [rows] = await pool.query('SELECT * FROM planes_suscripcion WHERE id = ?', [id]);
    return rows[0] || null;
  }
};

module.exports = PlanesSuscripcionModel;
