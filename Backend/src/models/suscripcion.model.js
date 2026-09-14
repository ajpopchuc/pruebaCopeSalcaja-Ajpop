const pool = require('../config/db');

const SuscripcionModel = {
  // Obtener la suscripción activa de un cliente con su saldo y datos del plan
  obtenerPorClienteId: async (clienteId) => {
    const [rows] = await pool.query(`
      SELECT s.*, p.tipo AS tipo_plan, p.horas_incluidas, p.precio 
      FROM suscripciones_cliente s 
      JOIN planes_suscripcion p ON s.plan_id = p.id 
      WHERE s.cliente_id = ? AND s.estado = "ACTIVO"
    `, [clienteId]);
    return rows[0] || null;
  },

  // Crear una suscripción para un cliente
  crear: async ({ cliente_id, plan_id, saldo_horas }) => {
    const [result] = await pool.query(
      'INSERT INTO suscripciones_cliente (cliente_id, plan_id, saldo_horas, estado) VALUES (?, ?, ?, "ACTIVO")',
      [cliente_id, plan_id, saldo_horas]
    );
    return result.insertId;
  },

  // Actualizar el saldo de horas al consumir tiempo
  actualizarSaldoHoras: async (id, nuevoSaldo) => {
    const [result] = await pool.query(
      'UPDATE suscripciones_cliente SET saldo_horas = ? WHERE id = ?',
      [nuevoSaldo, id]
    );
    return result;
  }
};

module.exports = SuscripcionModel;
