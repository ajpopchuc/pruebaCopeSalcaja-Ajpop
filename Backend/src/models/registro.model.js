const pool = require('../config/db');

const RegistroModel = {
  // 1. Validación Anti-Passback: ¿El vehículo ya tiene una entrada abierta adentro?
  obtenerActivoPorVehiculoId: async (vehiculoId) => {
    const [rows] = await pool.query(
      'SELECT * FROM registros_estacionamiento WHERE vehiculo_id = ? AND estado = "ACTIVO"',
      [vehiculoId]
    );
    return rows[0] || null;
  },

  // 2. Buscar ticket activo por placa (para agilizar el cobro en la salida)
  obtenerActivoPorPlaca: async (placa) => {
    const [rows] = await pool.query(`
      SELECT r.*, v.placa, v.tipo_vehiculo_id, v.cliente_id, v.es_temporal, e.codigo_espacio 
      FROM registros_estacionamiento r 
      JOIN vehiculo v ON r.vehiculo_id = v.id 
      JOIN espacio e ON r.espacio_id = e.id 
      WHERE v.placa = ? AND r.estado = "ACTIVO"
    `, [placa]);
    return rows[0] || null;
  },

  // 3. Registrar Entrada
  crearEntrada: async ({ vehiculo_id, espacio_id }) => {
    const [result] = await pool.query(
      'INSERT INTO registros_estacionamiento (vehiculo_id, espacio_id, estado) VALUES (?, ?, "ACTIVO")',
      [vehiculo_id, espacio_id]
    );
    return result.insertId;
  },

  // 4. Obtener detalle de un ticket por ID
  obtenerPorId: async (id) => {
    const [rows] = await pool.query(`
      SELECT r.*, v.placa, v.tipo_vehiculo_id, v.cliente_id, v.es_temporal, e.codigo_espacio, tv.tipo AS tipo_vehiculo_nombre 
      FROM registros_estacionamiento r 
      JOIN vehiculo v ON r.vehiculo_id = v.id 
      JOIN espacio e ON r.espacio_id = e.id 
      JOIN tipo_vehiculo tv ON v.tipo_vehiculo_id = tv.id 
      WHERE r.id = ?
    `, [id]);
    return rows[0] || null;
  },

  // 5. Registrar Salida y liquidar monto
  registrarSalida: async (id, montoTotal) => {
    const [result] = await pool.query(`
      UPDATE registros_estacionamiento 
      SET fecha_salida = NOW(), monto_total = ?, estado = "FINALIZADO" 
      WHERE id = ?
    `, [montoTotal, id]);
    return result;
  },

  // 6. Listar historial de registros
  obtenerTodos: async () => {
    const [rows] = await pool.query(`
      SELECT r.*, v.placa, e.codigo_espacio 
      FROM registros_estacionamiento r 
      JOIN vehiculo v ON r.vehiculo_id = v.id 
      JOIN espacio e ON r.espacio_id = e.id 
      ORDER BY r.fecha_entrada DESC
    `);
    return rows;
  }
};

module.exports = RegistroModel;
