const pool = require('../config/db');

const VehiculoModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query(`
      SELECT v.*, tv.tipo AS tipo_vehiculo_nombre, c.nombre AS cliente_nombre 
      FROM vehiculo v
      JOIN tipo_vehiculo tv ON v.tipo_vehiculo_id = tv.id
      LEFT JOIN cliente c ON v.cliente_id = c.id
    `);
    return rows;
  },

  obtenerPorPlaca: async (placa) => {
    const [rows] = await pool.query(`
      SELECT v.*, tv.tipo AS tipo_vehiculo_nombre, c.nombre AS cliente_nombre 
      FROM vehiculo v
      JOIN tipo_vehiculo tv ON v.tipo_vehiculo_id = tv.id
      LEFT JOIN cliente c ON v.cliente_id = c.id
      WHERE v.placa = ?
    `, [placa]);
    return rows[0] || null;
  },

  crear: async ({ placa, tipo_vehiculo_id, cliente_id = null, es_temporal = false }) => {
    const [result] = await pool.query(
      'INSERT INTO vehiculo (placa, tipo_vehiculo_id, cliente_id, es_temporal) VALUES (?, ?, ?, ?)',
      [placa, tipo_vehiculo_id, cliente_id, es_temporal]
    );
    return result.insertId;
  },

  obtenerPorClienteId: async (clienteId) => {
    const [rows] = await pool.query('SELECT * FROM vehiculo WHERE cliente_id = ?', [clienteId]);
    return rows;
  }
};

module.exports = VehiculoModel;
