# Sistema de Gestión de Parqueadero

Sistema web para el control de estancias, cobro de tarifas escalonadas, planes de suscripción mensual y validaciones de negocio en tiempo real.

---

## 🛠️ Stack Tecnológico

- **Backend:** Node.js, Express, MySQL2 (Pool con promesas).
- **Frontend:** React 18, Vite, CSS Vanilla (diseño minimalista monocromático).
- **Base de Datos:** MySQL (Modelo relacional normalizado).
- **Pruebas:** Jest y Supertest (Pruebas unitarias/integración) + REST Client (`api.http`).

---

## 📁 Estructura del Repositorio

```text
├── Backend/
│   ├── database/
│   │   ├── schema.sql        # Definición de las 9 tablas y llaves foráneas
│   │   └── seeders.sql       # Datos de prueba con 5 casos reales
│   ├── src/
│   │   ├── config/           # Conexión a base de datos (db.js)
│   │   ├── controllers/      # Lógica de endpoints
│   │   ├── models/           # Consultas SQL directas (DAO)
│   │   └── routes/           # Enrutamiento modular por entidad
│   ├── tests/
│   │   ├── api.http          # Peticiones HTTP interactivas para VS Code
│   │   └── parqueadero.test.js # Suite de pruebas automatizadas con Jest
│   ├── app.js                # Configuración de Express
│   └── package.json
└── Frontend/
    ├── src/
    │   ├── components/       # Componentes de las 5 vistas del sistema
    │   ├── config/           # Cliente Axios / Fetch (api.js)
    │   ├── app.jsx           # Componente principal y navegación
    │   └── index.css         # Estilos minimalistas
    └── package.json
```

---

## 🚀 Puesta en Marcha

### 1. Base de Datos (MySQL)
1. Iniciar el servicio de MySQL (puerto `3306`).
2. Crear la base de datos y cargar las tablas y datos iniciales:
   - Ejecutar el script: `Backend/database/schema.sql`
   - Ejecutar los datos de prueba: `Backend/database/seeders.sql`

### 2. Servidor Backend
```bash
cd Backend
npm install
npm run dev
```
El API quedará disponible en: `http://localhost:3000/api`

### 3. Cliente Frontend
```bash
cd Frontend
npm install
npm run dev
```
La aplicación web abrirá en: `http://localhost:5173`

---

## 🧪 Pruebas del Sistema

### Pruebas Automatizadas (Jest + Supertest)
Para ejecutar la suite completa de pruebas en consola:
```bash
cd Backend
npm test
```
Verifica automáticamente:
- Monitoreo y contadores de disponibilidad de espacios.
- Filtro de compatibilidad para automóviles y motocicletas.
- **Anti-Passback:** Rechazo con HTTP 400 de reingreso de vehículos activos.
- **Control de Ocupación:** Rechazo de asignación de espacios ocupados.
- **Incompatibilidad:** Rechazo de autos en espacios de motocicleta.
- Consulta de historial y cálculo de minutos de permanencia.
- Consulta de tarifas y planes de suscripción.

### Pruebas REST Interactivas (`api.http`)
En `Backend/tests/api.http` se encuentran preparadas las solicitudes organizadas para probar los endpoints con un solo clic usando la extensión REST Client

---

## 📌 Reglas de Negocio Clave

1. **Anti-Passback:** No se permite registrar una entrada si el vehículo ya posee un ticket activo sin salida dentro del parqueo.
2. **Compatibilidad de Espacio:** Solo se pueden asignar vehículos compatibles al tipo de cajón físico (Auto en Auto, Moto en Moto).
3. **Tarificación Escalonada:**
   - Hasta 15 min: Q 5.00
   - Hasta 30 min: Q 8.00
   - Hasta 45 min: Q 11.00
   - Hasta 60 min: Q 14.00
   - Cada hora o fracción adicional: Q 10.00
4. **Suscripciones y Bolsa de Horas:**
   - **Plan Básico:** Bolsa de 30 horas mensuales. Si se agota el saldo, se cobra el tiempo excedente a Q 10.00/hora.
   - **Plan Ilimitado:** Cobertura total sin cobro adicional de tiempo.
5. **Vehículo Temporal de Taller:** Permite que un cliente con suscripción activa registre un auto de reemplazo temporal utilizando su misma bolsa de horas.
