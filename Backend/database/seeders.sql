-- =============================================================================
-- SEEDERS / REGISTROS DE PRUEBA (DATOS BÁSICOS)
-- =============================================================================

USE parqueadero_db;

-- 1. TIPO_VEHICULO
INSERT INTO tipo_vehiculo (id, tipo, descripcion) VALUES
(1, 'Automovil', 'Sedan, hatchback, camionetas y SUVs'),
(2, 'Motocicleta', 'Motos y ciclomotores');

-- 2. CLIENTE
INSERT INTO cliente (id, nombre, documento, telefono, email) VALUES
(1, 'Roberto Díaz', '100300400', '3003334455', 'roberto.diaz@gmail.com'),
(2, 'María Torres', '100400500', '3004445566', 'maria.torres@gmail.com');

-- 3. VEHICULO
-- Roberto (cliente 1) tiene su auto principal (1) y su auto temporal de taller (2)
-- María (cliente 2) tiene su moto (3)
-- P-333CCC es un rotativo de paso sin cliente (cliente_id = NULL)
INSERT INTO vehiculo (id, placa, tipo_vehiculo_id, cliente_id, es_temporal) VALUES
(1, 'P-111AAA', 1, 1, FALSE), -- Auto principal de Roberto
(2, 'TMP-999',  1, 1, TRUE),  -- Auto temporal por taller de Roberto
(3, 'M-222BBB', 2, 2, FALSE), -- Moto de María
(4, 'P-333CCC', 1, NULL, FALSE); -- Auto rotativo (sin suscripción)

-- 4. ESPACIO
INSERT INTO espacio (id, codigo_espacio, tipo_vehiculo_id, estado) VALUES
(1, 'A-01', 1, 'OCUPADO'),    -- Ocupado por TMP-999
(2, 'A-02', 1, 'DISPONIBLE'),
(3, 'M-01', 2, 'DISPONIBLE');

-- 5. PLANES_SUSCRIPCION
INSERT INTO planes_suscripcion (id, tipo, horas_incluidas, precio, estado) VALUES
(1, 'Basico', 30, 150.00, 'ACTIVO'),
(2, 'Ilimitado', 0, 300.00, 'ACTIVO');

-- 6. SUSCRIPCIONES_CLIENTE
-- Roberto tiene el plan Básico con 18.50 horas restantes
-- María tiene el plan Ilimitado
INSERT INTO suscripciones_cliente (id, cliente_id, plan_id, saldo_horas, estado) VALUES
(1, 1, 1, 18.50, 'ACTIVO'),
(2, 2, 2, 9999.00, 'ACTIVO');

-- 7. TARIFAS
INSERT INTO tarifas (id, tipo, precio) VALUES
(1, '15 min', 5.00),
(2, '30 min', 8.00),
(3, '45 min', 11.00),
(4, '60 min', 14.00),
(5, 'hora o fraccion', 10.00);

-- 8. REGISTROS_ESTACIONAMIENTO
-- Ticket 1: TMP-999 adentro actualmente en A-01 (Entrada abierta)
-- Ticket 2: P-333CCC rotativo que estuvo 40 min y pagó Q11.00
INSERT INTO registros_estacionamiento (id, vehiculo_id, espacio_id, fecha_entrada, fecha_salida, monto_total, estado) VALUES
(1, 2, 1, '2026-09-14 09:00:00', NULL, 0.00, 'ACTIVO'),
(2, 4, 2, '2026-09-13 14:00:00', '2026-09-13 14:40:00', 11.00, 'FINALIZADO');

-- 9. PAGOS
INSERT INTO pagos (id, registro_id, suscripcion_id, monto, fecha) VALUES
(1, NULL, 1, 150.00, '2026-09-01 08:05:00'), -- Pago suscripción de Roberto
(2, 2, NULL, 11.00, '2026-09-13 14:40:30');  -- Pago ticket rotativo finalizado
