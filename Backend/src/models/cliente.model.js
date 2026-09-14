const pool = require('../config/db');

const ClienteModel = {
  obtenerTodos: async () => {
    const [rows] = await pool.query('SELECT * FROM cliente ORDER BY nombre ASC');
    return rows;
  },

  obtenerPorId: async (id) => {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE id = ?', [id]);
    return rows[0] || null;
  },

  obtenerPorDocumento: async (documento) => {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE documento = ?', [documento]);
    return rows[0] || null;
  },

  crear: async ({ nombre, documento, telefono, email }) => {
    const [result] = await pool.query(
      'INSERT INTO cliente (nombre, documento, telefono, email) VALUES (?, ?, ?, ?)',
      [nombre, documento, telefono, email]
    );
    return result.insertId;
  }
};

module.exports = ClienteModel;
