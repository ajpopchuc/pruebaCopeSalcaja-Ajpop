const express = require('express');
const cors = require('cors');
require('dotenv').config();

const prestamosRoutes = require('./src/routes/prestamos.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de verificación (Health Check)
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Servidor backend corriendo correctamente',
    timestamp: new Date()
  });
});

// Rutas de módulos
app.use('/api/prestamos', prestamosRoutes);

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Ruta no encontrada'
  });
});

// Servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;
