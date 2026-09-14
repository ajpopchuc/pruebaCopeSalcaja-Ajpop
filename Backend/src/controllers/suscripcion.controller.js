const SuscripcionModel = require('../models/suscripcion.model');
const PlanesSuscripcionModel = require('../models/planesSuscripcion.model');
const ClienteModel = require('../models/cliente.model');
const PagoModel = require('../models/pago.model');

const SuscripcionController = {
  // 1. Listar catálogo de planes (Básico 30h e Ilimitado)
  obtenerPlanes: async (req, res) => {
    try {
      const planes = await PlanesSuscripcionModel.obtenerTodos();
      res.json({
        status: 'success',
        total: planes.length,
        data: planes
      });
    } catch (error) {
      console.error('Error al obtener planes:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al consultar los planes'
      });
    }
  },

  // 2. Consultar la suscripción activa de un cliente con su saldo de horas
  obtenerSuscripcionCliente: async (req, res) => {
    try {
      const { clienteId } = req.params;

      const cliente = await ClienteModel.obtenerPorId(clienteId);
      if (!cliente) {
        return res.status(404).json({
          status: 'error',
          message: 'Cliente no encontrado'
        });
      }

      const suscripcion = await SuscripcionModel.obtenerPorClienteId(clienteId);

      res.json({
        status: 'success',
        data: suscripcion || null,
        message: suscripcion 
          ? 'Suscripción activa encontrada' 
          : 'El cliente no tiene una suscripción activa'
      });
    } catch (error) {
      console.error('Error al consultar suscripción del cliente:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al consultar la suscripción'
      });
    }
  },

  // 3. Crear / Comprar suscripción para un cliente
  crearSuscripcion: async (req, res) => {
    try {
      const { cliente_id, plan_id } = req.body;

      if (!cliente_id || !plan_id) {
        return res.status(400).json({
          status: 'error',
          message: 'cliente_id y plan_id son obligatorios'
        });
      }

      // Validar que el cliente exista
      const cliente = await ClienteModel.obtenerPorId(cliente_id);
      if (!cliente) {
        return res.status(404).json({
          status: 'error',
          message: 'Cliente no encontrado'
        });
      }

      // Validar que el plan exista
      const plan = await PlanesSuscripcionModel.obtenerPorId(plan_id);
      if (!plan) {
        return res.status(404).json({
          status: 'error',
          message: 'Plan de suscripción no válido'
        });
      }

      // Validar que el cliente no tenga ya una suscripción activa (Regla: 1 por cliente)
      const suscripcionExistente = await SuscripcionModel.obtenerPorClienteId(cliente_id);
      if (suscripcionExistente) {
        return res.status(409).json({
          status: 'error',
          message: 'El cliente ya cuenta con una suscripción activa'
        });
      }

      // Definir la bolsa de horas inicial según el plan
      // Si es Básico = 30 horas. Si es Ilimitado = 9999 horas (simbólico ilimitado)
      const saldoHoras = plan.tipo === 'Basico' ? plan.horas_incluidas : 9999.00;

      const suscripcionId = await SuscripcionModel.crear({
        cliente_id,
        plan_id,
        saldo_horas: saldoHoras
      });

      // Registrar el pago de la suscripción
      await PagoModel.crear({
        suscripcion_id: suscripcionId,
        monto: plan.precio
      });

      res.status(201).json({
        status: 'success',
        message: `Suscripción ${plan.tipo} activada exitosamente para ${cliente.nombre}`,
        data: {
          suscripcionId,
          plan: plan.tipo,
          saldoHoras,
          montoPagado: plan.precio
        }
      });
    } catch (error) {
      console.error('Error al crear suscripción:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error interno al registrar la suscripción'
      });
    }
  }
};

module.exports = SuscripcionController;
