const RegistroModel = require('../models/registro.model');
const VehiculoModel = require('../models/vehiculo.model');
const EspacioModel = require('../models/espacio.model');
const SuscripcionModel = require('../models/suscripcion.model');
const PagoModel = require('../models/pago.model');

const EstacionamientoController = {
  // ===========================================================================
  // 1. REGISTRAR ENTRADA (Check-in con las 5 Validaciones)
  // ===========================================================================
  registrarEntrada: async (req, res) => {
    try {
      const { placa, espacio_id, tipo_vehiculo_id = 1 } = req.body;

      if (!placa || !espacio_id) {
        return res.status(400).json({
          status: 'error',
          message: 'La placa y el espacio_id son obligatorios'
        });
      }

      const placaNormalizada = placa.toUpperCase().trim();

      // VALIDACIÓN 1: Verificar o registrar el vehículo al vuelo si es nuevo rotativo
      let vehiculo = await VehiculoModel.obtenerPorPlaca(placaNormalizada);
      if (!vehiculo) {
        const nuevoVehiculoId = await VehiculoModel.crear({
          placa: placaNormalizada,
          tipo_vehiculo_id: Number(tipo_vehiculo_id),
          cliente_id: null,
          es_temporal: false
        });
        vehiculo = await VehiculoModel.obtenerPorPlaca(placaNormalizada);
      }

      // VALIDACIÓN 2: Ausencia de otra entrada abierta (Anti-Passback)
      // Impedir reingreso de un vehículo que ya se encuentra adentro
      const entradaAbierta = await RegistroModel.obtenerActivoPorVehiculoId(vehiculo.id);
      if (entradaAbierta) {
        return res.status(400).json({
          status: 'error',
          message: `El vehículo con placa ${placaNormalizada} ya se encuentra dentro de las instalaciones con una entrada abierta`
        });
      }

      // VALIDACIÓN 3: Verificar que el espacio exista
      const espacio = await EspacioModel.obtenerPorId(espacio_id);
      if (!espacio) {
        return res.status(404).json({
          status: 'error',
          message: 'El espacio seleccionado no existe'
        });
      }

      // VALIDACIÓN 4: Impedir uso de espacio ocupado o en mantenimiento
      if (espacio.estado !== 'DISPONIBLE') {
        return res.status(400).json({
          status: 'error',
          message: `El espacio ${espacio.codigo_espacio} no está disponible (Estado actual: ${espacio.estado})`
        });
      }

      // VALIDACIÓN 5: Compatibilidad del espacio (Carro en espacio de Carro, Moto en espacio de Moto)
      if (espacio.tipo_vehiculo_id !== vehiculo.tipo_vehiculo_id) {
        return res.status(400).json({
          status: 'error',
          message: `Incompatibilidad: No se puede asignar un vehículo tipo ${vehiculo.tipo_vehiculo_nombre} en un espacio para ${espacio.tipo_vehiculo_nombre}`
        });
      }

      // Verificar si el vehículo ingresa con suscripción activa (principal o temporal de taller)
      let tipoIngreso = 'ROTATIVO';
      let infoSuscripcion = null;

      if (vehiculo.cliente_id) {
        const suscripcion = await SuscripcionModel.obtenerPorClienteId(vehiculo.cliente_id);
        if (suscripcion && suscripcion.estado === 'ACTIVO') {
          tipoIngreso = 'SUSCRIPCION';
          infoSuscripcion = {
            plan: suscripcion.tipo_plan,
            saldoHoras: suscripcion.saldo_horas,
            esTemporal: Boolean(vehiculo.es_temporal)
          };
        }
      }

      // Registrar la entrada y cambiar el estado del espacio a OCUPADO
      const registroId = await RegistroModel.crearEntrada({
        vehiculo_id: vehiculo.id,
        espacio_id: espacio.id
      });

      await EspacioModel.actualizarEstado(espacio.id, 'OCUPADO');

      res.status(201).json({
        status: 'success',
        message: 'Entrada registrada exitosamente',
        data: {
          registroId,
          placa: vehiculo.placa,
          espacio: espacio.codigo_espacio,
          tipoVehiculo: vehiculo.tipo_vehiculo_nombre,
          tipoIngreso,
          suscripcion: infoSuscripcion,
          fechaEntrada: new Date()
        }
      });
    } catch (error) {
      console.error('Error al registrar entrada:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al registrar la entrada del vehículo'
      });
    }
  },

  // ===========================================================================
  // 2. REGISTRAR SALIDA (Check-out con Liquidación de Cobro y Liberación)
  // ===========================================================================
  registrarSalida: async (req, res) => {
    try {
      const { registro_id, placa } = req.body;

      if (!registro_id && !placa) {
        return res.status(400).json({
          status: 'error',
          message: 'Debe proporcionar el registro_id o la placa del vehículo'
        });
      }

      // Buscar el ticket activo
      let registro = null;
      if (registro_id) {
        registro = await RegistroModel.obtenerPorId(registro_id);
      } else if (placa) {
        registro = await RegistroModel.obtenerActivoPorPlaca(placa.toUpperCase().trim());
      }

      if (!registro || registro.estado !== 'ACTIVO') {
        return res.status(404).json({
          status: 'error',
          message: 'No se encontró un registro activo de parqueo para los datos indicados'
        });
      }

      // 1. Calcular el tiempo transcurrido en minutos y horas
      const fechaEntrada = new Date(registro.fecha_entrada);
      const fechaSalida = new Date();
      const minutosTranscurridos = Math.max(1, Math.ceil((fechaSalida - fechaEntrada) / (1000 * 60)));
      const horasConsumidas = Number((minutosTranscurridos / 60).toFixed(2));

      let montoTotal = 0.00;
      let detalleCobro = '';
      let saldoRestanteHoras = null;

      // 2. Evaluar modalidad de cobro (Suscripción vs Rotativo)
      let esSuscriptor = false;
      let suscripcion = null;

      if (registro.cliente_id) {
        suscripcion = await SuscripcionModel.obtenerPorClienteId(registro.cliente_id);
        if (suscripcion && suscripcion.estado === 'ACTIVO') {
          esSuscriptor = true;
        }
      }

      if (esSuscriptor) {
        // CASO A: SUSCRIPCIÓN
        if (suscripcion.tipo_plan === 'Ilimitado') {
          montoTotal = 0.00;
          detalleCobro = 'Plan Ilimitado: Sin recargo de tiempo';
          saldoRestanteHoras = suscripcion.saldo_horas;
        } else {
          // Plan Básico: 30 horas mensuales. Si hay exceso: Q10 por hora o fracción adicional
          if (suscripcion.saldo_horas >= horasConsumidas) {
            saldoRestanteHoras = Number((suscripcion.saldo_horas - horasConsumidas).toFixed(2));
            await SuscripcionModel.actualizarSaldoHoras(suscripcion.id, saldoRestanteHoras);
            montoTotal = 0.00;
            detalleCobro = `Descontadas ${horasConsumidas} hrs de la bolsa de horas`;
          } else {
            // El saldo se agota y se cobra el exceso
            const horasExceso = horasConsumidas - suscripcion.saldo_horas;
            const fraccionesExceso = Math.ceil(horasExceso);
            montoTotal = fraccionesExceso * 10.00; // Q10 por hora o fracción extra
            saldoRestanteHoras = 0.00;
            await SuscripcionModel.actualizarSaldoHoras(suscripcion.id, 0.00);
            detalleCobro = `Saldo de horas agotado. Cobro de exceso: ${fraccionesExceso} hr(s) x Q10 = Q${montoTotal}`;
          }
        }
      } else {
        // CASO B: TARIFA ROTATIVA ESCALONADA
        //  - Hasta 15 min: Q5
        //  - Hasta 30 min: Q8
        //  - Hasta 45 min: Q11
        //  - Hasta 60 min: Q14
        //  - Cada hora o fracción adicional: Q10
        if (minutosTranscurridos <= 15) {
          montoTotal = 5.00;
          detalleCobro = 'Tarifa hasta 15 minutos (Q5.00)';
        } else if (minutosTranscurridos <= 30) {
          montoTotal = 8.00;
          detalleCobro = 'Tarifa hasta 30 minutos (Q8.00)';
        } else if (minutosTranscurridos <= 45) {
          montoTotal = 11.00;
          detalleCobro = 'Tarifa hasta 45 minutos (Q11.00)';
        } else if (minutosTranscurridos <= 60) {
          montoTotal = 14.00;
          detalleCobro = 'Tarifa hasta 60 minutos (Q14.00)';
        } else {
          const minutosExtra = minutosTranscurridos - 60;
          const horasExtra = Math.ceil(minutosExtra / 60);
          montoTotal = 14.00 + (horasExtra * 10.00);
          detalleCobro = `Primera hora (Q14.00) + ${horasExtra} hora(s) adicional(es) x Q10.00 = Q${montoTotal}`;
        }
      }

      // 3. Finalizar el registro en la base de datos
      await RegistroModel.registrarSalida(registro.id, montoTotal);

      // 4. Liberar el espacio a DISPONIBLE
      await EspacioModel.actualizarEstado(registro.espacio_id, 'DISPONIBLE');

      // 5. Si hubo cobro monetario, registrar el pago automáticamente
      let pagoId = null;
      if (montoTotal > 0) {
        pagoId = await PagoModel.crear({
          registro_id: registro.id,
          suscripcion_id: null,
          monto: montoTotal
        });
      }

      res.json({
        status: 'success',
        message: 'Salida registrada y espacio liberado exitosamente',
        data: {
          registroId: registro.id,
          placa: registro.placa,
          espacioLiberado: registro.codigo_espacio,
          minutosEstancia: minutosTranscurridos,
          horasConsumidas,
          modalidad: esSuscriptor ? 'SUSCRIPCION' : 'ROTATIVO',
          detalleCobro,
          montoTotal,
          saldoRestanteHoras,
          pagoId,
          fechaSalida
        }
      });
    } catch (error) {
      console.error('Error al registrar salida:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al registrar la salida'
      });
    }
  },

  // ===========================================================================
  // 3. CONSULTAR HISTORIAL DE PARQUEO
  // ===========================================================================
  obtenerHistorial: async (req, res) => {
    try {
      const historial = await RegistroModel.obtenerTodos();
      res.json({
        status: 'success',
        total: historial.length,
        data: historial
      });
    } catch (error) {
      console.error('Error al obtener historial:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al consultar el historial'
      });
    }
  }
};

module.exports = EstacionamientoController;
