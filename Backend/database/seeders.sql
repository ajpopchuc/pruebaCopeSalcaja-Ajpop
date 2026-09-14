-- =============================================================================
-- SEEDERS / DATOS DE PRUEBA REALISTAS (5 CASOS COMPLETOS PARA DEMO EN VIVO)
-- =============================================================================

USE parqueadero_db;

-- Limpiar tablas previas para inserción limpia
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE pagos;
TRUNCATE TABLE registros_estacionamiento;
TRUNCATE TABLE tarifas;
TRUNCATE TABLE suscripciones_cliente;
TRUNCATE TABLE planes_suscripcion;
TRUNCATE TABLE espacio;
TRUNCATE TABLE vehiculo;
TRUNCATE TABLE cliente;
TRUNCATE TABLE tipo_vehiculo;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. TIPO_VEHICULO (Automovil y Motocicleta)
INSERT INTO tipo_vehiculo (id, tipo, descripcion) VALUES
(1, 'Automovil', 'Sedan, hatchback, camionetas y SUVs'),
(2, 'Motocicleta', 'Motos y ciclomotores');

-- 2. CLIENTES (5 Clientes para pruebas)
INSERT INTO cliente (id, nombre, documento, telefono, email) VALUES
(1, 'Roberto Díaz', '100300400', '30033344', 'roberto.diaz@gmail.com'),
(2, 'María Torres', '100400500', '30044455', 'maria.torres@gmail.com'),
(3, 'Carlos Mendoza', '100500600', '30055566', 'carlos.mendoza@gmail.com'),
(4, 'Ana Lucía Gómez', '100600700', '30066677', 'ana.gomez@gmail.com'),
(5, 'Fernando Ruiz', '100700800', '30077788', 'fernando.ruiz@gmail.com');

-- 3. PLANES_SUSCRIPCION (Básico 30h e Ilimitado)
INSERT INTO planes_suscripcion (id, tipo, horas_incluidas, precio, estado) VALUES
(1, 'Basico', 30, 150.00, 'ACTIVO'),
(2, 'Ilimitado', 0, 300.00, 'ACTIVO');

-- 4. SUSCRIPCIONES_CLIENTE
INSERT INTO suscripciones_cliente (id, cliente_id, plan_id, saldo_horas, estado) VALUES
(1, 1, 1, 18.50, 'ACTIVO'),   -- Roberto: Plan Básico con 18.50 horas restantes
(2, 2, 2, 9999.00, 'ACTIVO'),  -- María: Plan Ilimitado
(3, 3, 1, 0.00, 'ACTIVO');     -- Carlos: Plan Básico con saldo agotado (probar cobro de exceso a Q10)

-- 5. VEHICULOS (Variedad de casos de prueba)
INSERT INTO vehiculo (id, placa, tipo_vehiculo_id, cliente_id, es_temporal) VALUES
(1, 'P-111AAA', 1, 1, FALSE),  -- Auto principal de Roberto (Plan Básico)
(2, 'TMP-999',  1, 1, TRUE),   -- Auto TEMPORAL DE TALLER de Roberto (usa su misma bolsa de horas)
(3, 'M-222BBB', 2, 2, FALSE),  -- Moto de María (Plan Ilimitado)
(4, 'P-333CCC', 1, 3, FALSE),  -- Auto de Carlos (Plan Básico agotado)
(5, 'P-444DDD', 1, NULL, FALSE), -- Auto rotativo de paso (sin suscripción)
(6, 'M-555EEE', 2, NULL, FALSE); -- Moto rotativa de paso (sin suscripción)

-- 6. ESPACIOS (Distribución física para Automóvil y Motocicleta)
INSERT INTO espacio (id, codigo_espacio, tipo_vehiculo_id, estado) VALUES
(1, 'A-01', 1, 'OCUPADO'),       -- Ocupado por TMP-999
(2, 'A-02', 1, 'DISPONIBLE'),    -- Libre para Automóvil
(3, 'A-03', 1, 'DISPONIBLE'),    -- Libre para Automóvil
(4, 'A-04', 1, 'MANTENIMIENTO'), -- En mantenimiento
(5, 'M-01', 2, 'OCUPADO'),       -- Ocupado por M-222BBB
(6, 'M-02', 2, 'DISPONIBLE');    -- Libre para Motocicleta

-- 7. TARIFAS (Los 5 tramos escalonados)
INSERT INTO tarifas (id, tipo, precio) VALUES
(1, '15 min', 5.00),
(2, '30 min', 8.00),
(3, '45 min', 11.00),
(4, '60 min', 14.00),
(5, 'hora o fraccion', 10.00);

-- 8. REGISTROS_ESTACIONAMIENTO (5 casos reales para ver en el Historial y probar salidas)
INSERT INTO registros_estacionamiento (id, vehiculo_id, espacio_id, fecha_entrada, fecha_salida, monto_total, estado) VALUES
-- Caso 1: TMP-999 (Auto taller de Roberto) adentro actualmente en A-01 (Entrada abierta en curso)
(1, 2, 1, DATE_SUB(NOW(), INTERVAL 75 MINUTE), NULL, 0.00, 'ACTIVO'),

-- Caso 2: M-222BBB (Moto de María) adentro actualmente en M-01 (Entrada abierta en curso)
(2, 3, 5, DATE_SUB(NOW(), INTERVAL 35 MINUTE), NULL, 0.00, 'ACTIVO'),

-- Caso 3: P-444DDD (Rotativo) que estuvo 40 minutos (Tramo 31-45 min -> Q11.00 cobrado)
(3, 5, 2, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 140 MINUTE), 11.00, 'FINALIZADO'),

-- Caso 4: M-555EEE (Moto rotativa) que estuvo 12 minutos (Tramo hasta 15 min -> Q5.00 cobrado)
(4, 6, 6, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 288 MINUTE), 5.00, 'FINALIZADO'),

-- Caso 5: P-111AAA (Principal de Roberto) que vino ayer 2 horas (descontó de su plan, cobro Q0.00)
(5, 1, 1, '2026-09-13 08:00:00', '2026-09-13 10:00:00', 0.00, 'FINALIZADO');

-- 9. PAGOS (5 Pagos para auditoría y recaudación)
INSERT INTO pagos (id, registro_id, suscripcion_id, monto, fecha) VALUES
(1, NULL, 1, 150.00, '2026-09-01 08:00:00'), -- Compra Plan Básico Roberto
(2, NULL, 2, 300.00, '2026-09-05 08:00:00'), -- Compra Plan Ilimitado María
(3, NULL, 3, 150.00, '2026-09-02 08:00:00'), -- Compra Plan Básico Carlos
(4, 3, NULL, 11.00, DATE_SUB(NOW(), INTERVAL 140 MINUTE)), -- Cobro ticket rotativo 40m
(5, 4, NULL, 5.00, DATE_SUB(NOW(), INTERVAL 288 MINUTE));  -- Cobro ticket moto 12m
