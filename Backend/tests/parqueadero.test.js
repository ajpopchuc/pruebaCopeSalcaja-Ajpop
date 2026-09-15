const request = require('supertest');
const app = require('../app');
const pool = require('../src/config/db');

describe('Pruebas Automatizadas - Sistema de Parqueadero', () => {

  afterAll(async () => {
    await pool.end();
  });

  // 1. Monitoreo del estado general y clasificación de espacios
  describe('GET /api/espacios', () => {
    test('Debe retornar la lista de espacios con contadores de disponibles y ocupados', async () => {
      const res = await request(app).get('/api/espacios');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body).toHaveProperty('resumen');
      expect(res.body.resumen).toHaveProperty('total');
      expect(res.body.resumen).toHaveProperty('disponibles');
      expect(res.body.resumen).toHaveProperty('ocupados');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Debe filtrar espacios disponibles compatibles para motocicletas (tipo 2)', async () => {
      const res = await request(app).get('/api/espacios/disponibles/2');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      res.body.data.forEach(espacio => {
        expect(espacio.tipo_vehiculo_id).toBe(2);
        expect(espacio.estado).toBe('DISPONIBLE');
      });
    });
  });

  // 2. Validaciones de negocio en el registro de entradas
  describe('POST /api/estacionamiento/entrada (Reglas de Negocio)', () => {

    // Anti-Passback: impide reingreso de un vehículo con estancia activa
    test('Debe rechazar con HTTP 400 si el vehiculo ya esta adentro (Anti-Passback)', async () => {
      const res = await request(app)
        .post('/api/estacionamiento/entrada')
        .send({
          placa: 'P101AAA',
          tipo_vehiculo_id: 1,
          espacio_id: 3
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toMatch(/ya se encuentra dentro/i);
    });

    // Control de ocupación: impide asignar un espacio ocupado
    test('Debe rechazar con HTTP 400 si el espacio seleccionado esta ocupado', async () => {
      const res = await request(app)
        .post('/api/estacionamiento/entrada')
        .send({
          placa: 'P-999TST',
          tipo_vehiculo_id: 1,
          espacio_id: 1 // Espacio A-01 está OCUPADO
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toMatch(/no está disponible/i);
    });

    // Compatibilidad: impide asignar un auto en espacio de motocicleta
    test('Debe rechazar con HTTP 400 si el vehiculo no es compatible con el tipo de espacio', async () => {
      const res = await request(app)
        .post('/api/estacionamiento/entrada')
        .send({
          placa: 'P-999TST',
          tipo_vehiculo_id: 1,
          espacio_id: 6 // Espacio M-02 es tipo 2 (Motocicleta)
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
      expect(res.body.message).toMatch(/incompatibilidad/i);
    });
  });

  // 3. Consulta de historial y consumos
  describe('GET /api/estacionamiento/historial', () => {
    test('Debe listar los movimientos con calculo de minutos de estancia', async () => {
      const res = await request(app).get('/api/estacionamiento/historial');

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).toHaveProperty('placa');
        expect(res.body.data[0]).toHaveProperty('minutos_estancia');
      }
    });
  });

  // 4. Parámetros de tarifación y planes
  describe('GET /api/tarifas y /api/suscripciones/planes', () => {
    test('Debe obtener las tarifas por tipo de vehiculo', async () => {
      const res = await request(app).get('/api/tarifas');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test('Debe obtener los planes de suscripcion activos', async () => {
      const res = await request(app).get('/api/suscripciones/planes');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

});
