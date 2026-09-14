const pool = require('../config/db');

const PagoModel = {
  // Registrar un pago (de ticket rotativo o de suscripción)
  crear: async ({ registro_id = null, suscripcion_id = null, monto }) => {
    const [result] = await pool.query(
      'INSERT INTO pagos (registro_id, suscripcion_id, monto) VALUES (?, ?, ?)',
      [registro_id, suscripcion_id, monto]
    );
    return result.insertId;
  },

  // Listar historial de pagos
  obtenerTodos: async () => {
    const [rows] = await pool.query('SELECT * FROM pagos ORDER BY fecha DESC');
    return rows;
  },

  obtenerPorId: async (id) => {
    const [rows] = await pool.query('SELECT * FROM pagos WHERE id = ?', [id]);
    return rows[0] || null;
  }
};

module.exports = PagoModel;
