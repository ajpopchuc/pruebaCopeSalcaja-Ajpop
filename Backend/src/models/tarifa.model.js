const pool = require('../config/db');

const TarifaModel = {
  obtenerTodas: async () => {
    const [rows] = await pool.query('SELECT * FROM tarifas');
    return rows;
  }
};

module.exports = TarifaModel;
