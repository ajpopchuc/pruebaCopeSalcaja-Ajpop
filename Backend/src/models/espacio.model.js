const pool = require('../config/db');

const EspacioModel = {
  // 1. Mostrar estado del parqueo (Disponibles, Ocupados y estado individual)
  obtenerTodos: async () => {
    const [rows] = await pool.query(`
      SELECT e.*, tv.tipo AS tipo_vehiculo_nombre 
      FROM espacio e 
      JOIN tipo_vehiculo tv ON e.tipo_vehiculo_id = tv.id 
      ORDER BY e.codigo_espacio ASC
    `);
    return rows;
  },

  obtenerPorId: async (id) => {
    const [rows] = await pool.query('SELECT * FROM espacio WHERE id = ?', [id]);
    return rows[0] || null;
  },

  // 2. Buscar espacios libres compatibles para un tipo de vehículo (Automovil o Motocicleta)
  obtenerDisponiblesPorTipo: async (tipoVehiculoId) => {
    const [rows] = await pool.query(`
      SELECT * FROM espacio 
      WHERE estado = 'DISPONIBLE' AND tipo_vehiculo_id = ? 
      ORDER BY codigo_espacio ASC
    `, [tipoVehiculoId]);
    return rows;
  },

  // 3. Actualizar estado a OCUPADO o DISPONIBLE
  actualizarEstado: async (id, estado) => {
    const [result] = await pool.query(
      'UPDATE espacio SET estado = ? WHERE id = ?',
      [estado, id]
    );
    return result;
  }
};

module.exports = EspacioModel;
