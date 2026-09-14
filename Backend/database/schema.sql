-- =============================================================================
-- SISTEMA DE GESTIÓN DE PARQUEADERO (PARKING SYSTEM)
-- MODELO MINIMALISTA Y DIRECTO (MYSQL 8.0+)
-- =============================================================================

DROP DATABASE IF EXISTS parqueadero_db;
CREATE DATABASE parqueadero_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parqueadero_db;

-- -----------------------------------------------------------------------------
-- 1. TABLA: tipo_vehiculo
-- Catálogo simple: Automovil, Motocicleta
-- -----------------------------------------------------------------------------
CREATE TABLE tipo_vehiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL UNIQUE, -- 'Automovil', 'Motocicleta'
    descripcion VARCHAR(150) NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. TABLA: cliente
-- Datos básicos del cliente
-- -----------------------------------------------------------------------------
CREATE TABLE cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    documento VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(20) NULL,
    email VARCHAR(120) NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. TABLA: vehiculo
-- Registra los vehículos.
--  - cliente_id: si pertenece a un cliente registrado (o NULL si es rotativo de paso)
--  - es_temporal: para autos prestados/taller que usan el saldo del cliente
-- -----------------------------------------------------------------------------
CREATE TABLE vehiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(15) NOT NULL UNIQUE,
    tipo_vehiculo_id INT NOT NULL,
    cliente_id INT NULL,
    es_temporal BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_vehiculo_tipo FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipo_vehiculo (id) ON DELETE RESTRICT,
    CONSTRAINT fk_vehiculo_cliente FOREIGN KEY (cliente_id) REFERENCES cliente (id) ON DELETE SET NULL,
    INDEX idx_vehiculo_placa (placa)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. TABLA: espacio
-- Cajones de estacionamiento compatibles con Automovil o Motocicleta
-- -----------------------------------------------------------------------------
CREATE TABLE espacio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo_espacio VARCHAR(20) NOT NULL UNIQUE, -- Ej. 'A-01', 'M-01'
    tipo_vehiculo_id INT NOT NULL,
    estado ENUM('DISPONIBLE', 'OCUPADO', 'MANTENIMIENTO') NOT NULL DEFAULT 'DISPONIBLE',
    CONSTRAINT fk_espacio_tipo FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipo_vehiculo (id) ON DELETE RESTRICT,
    INDEX idx_espacio_estado (estado, tipo_vehiculo_id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. TABLA: planes_suscripcion
-- Paquetes comerciales: Basico (30h) e Ilimitado
-- -----------------------------------------------------------------------------
CREATE TABLE planes_suscripcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('Basico', 'Ilimitado') NOT NULL UNIQUE,
    horas_incluidas INT NOT NULL DEFAULT 0, -- 30 para Básico, 0 para Ilimitado
    precio DECIMAL(10, 2) NOT NULL,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO'
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. TABLA: suscripciones_cliente
-- Asocia al cliente con su plan y la bolsa de saldo de horas disponible
-- -----------------------------------------------------------------------------
CREATE TABLE suscripciones_cliente (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL UNIQUE,
    plan_id INT NOT NULL,
    saldo_horas DECIMAL(8, 2) NOT NULL DEFAULT 0.00,
    estado ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_suscripcion_cliente FOREIGN KEY (cliente_id) REFERENCES cliente (id) ON DELETE RESTRICT,
    CONSTRAINT fk_suscripcion_plan FOREIGN KEY (plan_id) REFERENCES planes_suscripcion (id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 7. TABLA: tarifas
-- Tramos para vehículos rotativos (sin suscripción)
-- -----------------------------------------------------------------------------
CREATE TABLE tarifas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('15 min', '30 min', '45 min', '60 min', 'hora o fraccion') NOT NULL UNIQUE,
    precio DECIMAL(10, 2) NOT NULL -- Q5, Q8, Q11, Q14, Q10
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 8. TABLA: registros_estacionamiento (ESTRICTAMENTE NECESARIA)
-- Justificación: Registra entradas y salidas físicas para:
--  a) Saber fecha/hora de entrada y salida.
--  b) Validar la 'ausencia de otra entrada abierta' (si estado = 'ACTIVO').
--  c) Servir de referencia como FK en la tabla pagos (registro_id).
-- -----------------------------------------------------------------------------
CREATE TABLE registros_estacionamiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehiculo_id INT NOT NULL,
    espacio_id INT NOT NULL,
    fecha_entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_salida DATETIME NULL,
    monto_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    estado ENUM('ACTIVO', 'FINALIZADO') NOT NULL DEFAULT 'ACTIVO',
    CONSTRAINT fk_registro_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculo (id) ON DELETE RESTRICT,
    CONSTRAINT fk_registro_espacio FOREIGN KEY (espacio_id) REFERENCES espacio (id) ON DELETE RESTRICT,
    INDEX idx_registro_vehiculo_estado (vehiculo_id, estado),
    INDEX idx_registro_espacio_estado (espacio_id, estado)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 9. TABLA: pagos
-- Simple: id, registro_id, suscripcion_id, monto y fecha
-- -----------------------------------------------------------------------------
CREATE TABLE pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registro_id INT NULL,
    suscripcion_id INT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_registro FOREIGN KEY (registro_id) REFERENCES registros_estacionamiento (id) ON DELETE SET NULL,
    CONSTRAINT fk_pago_suscripcion FOREIGN KEY (suscripcion_id) REFERENCES suscripciones_cliente (id) ON DELETE SET NULL
) ENGINE=InnoDB;
