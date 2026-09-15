import React, { useState, useEffect } from 'react';
import api from '../config/api';

export const SalidaVehiculo = ({ onSalidaExitosa }) => {
  const [placa, setPlaca] = useState('');
  const [vehiculosActivos, setVehiculosActivos] = useState([]);
  const [ticketLiquidado, setTicketLiquidado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingActivos, setLoadingActivos] = useState(false);

  // Cargar lista de vehículos que se encuentran adentro actualmente
  const cargarVehiculosActivos = async () => {
    try {
      setLoadingActivos(true);
      const res = await api.get('/estacionamiento/historial');
      if (res.data.status === 'success') {
        const activos = res.data.data.filter(item => item.estado === 'ACTIVO');
        setVehiculosActivos(activos);
      }
    } catch (err) {
      console.error('Error al cargar vehículos activos:', err);
    } finally {
      setLoadingActivos(false);
    }
  };

  useEffect(() => {
    cargarVehiculosActivos();
  }, []);

  const handleLiquidarSalida = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setTicketLiquidado(null);

    if (!placa.trim()) {
      setError('Por favor ingrese o seleccione la placa del vehículo a liquidar.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/estacionamiento/salida', {
        placa: placa.trim().toUpperCase()
      });

      if (res.data.status === 'success') {
        setTicketLiquidado(res.data.data);
        setPlaca('');
        cargarVehiculosActivos();
        if (onSalidaExitosa) onSalidaExitosa();
      }
    } catch (err) {
      console.error('Error al liquidar salida:', err);
      setError(err.response?.data?.message || 'No se pudo liquidar la salida del vehículo.');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarVehiculo = (placaVehiculo) => {
    setPlaca(placaVehiculo);
    setError(null);
  };

  return (
    <div className="view-container">
      <div className="card">
        <h2 className="card-title">Registrar Salida y Liquidación de Cobro (Check-out)</h2>
        <p className="card-description">
          Calcula automáticamente la permanencia, descuenta de la bolsa de horas o aplica la tarifa escalonada y libera el espacio.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLiquidarSalida}>
          <div className="form-grid">
            <div className="form-group" style={{ maxWidth: 360 }}>
              <label htmlFor="placaSalida">Placa del Vehículo</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  id="placaSalida"
                  type="text"
                  className="form-input"
                  placeholder="Ej. P-111AAA o TMP-999"
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  maxLength={15}
                  required
                />
                <button type="submit" className="btn-primary" disabled={loading} style={{ whiteSpace: 'nowrap' }}>
                  {loading ? 'Calculando...' : 'Liquidar'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Recibo / Ticket de Liquidación Generado */}
        {ticketLiquidado && (
          <div className="ticket-receipt">
            <div className="ticket-receipt-title">Comprobante de Salida</div>
            
            <div className="ticket-row">
              <span>Placa:</span>
              <strong>{ticketLiquidado.placa}</strong>
            </div>

            <div className="ticket-row">
              <span>Espacio Liberado:</span>
              <span>{ticketLiquidado.espacioLiberado} (Disponible)</span>
            </div>

            <div className="ticket-row">
              <span>Tiempo de Estancia:</span>
              <span>{ticketLiquidado.minutosEstancia} minutos ({ticketLiquidado.horasConsumidas} hrs)</span>
            </div>

            <div className="ticket-row">
              <span>Modalidad de Cobro:</span>
              <span>{ticketLiquidado.modalidad}</span>
            </div>

            <div className="ticket-row">
              <span>Detalle de Tarifa:</span>
              <span style={{ color: '#555555' }}>{ticketLiquidado.detalleCobro}</span>
            </div>

            {ticketLiquidado.saldoRestanteHoras !== null && (
              <div className="ticket-row">
                <span>Saldo Restante en Bolsa:</span>
                <strong>{ticketLiquidado.saldoRestanteHoras} horas</strong>
              </div>
            )}

            <div className="ticket-row ticket-total">
              <span>Total Cobrado:</span>
              <span>Q {Number(ticketLiquidado.montoTotal).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Sección de Vehículos Adentro para Liquidación Rápida */}
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #e5e5e5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#333333' }}>
              Vehículos con estancia activa adentro ({vehiculosActivos.length})
            </span>
            <button 
              type="button" 
              className="btn-link" 
              onClick={cargarVehiculosActivos}
              disabled={loadingActivos}
            >
              {loadingActivos ? 'Actualizando...' : 'Recargar lista'}
            </button>
          </div>

          {vehiculosActivos.length === 0 ? (
            <p style={{ fontSize: 13, color: '#777777' }}>
              No hay vehículos adentro en este momento.
            </p>
          ) : (
            <div className="active-vehicles-grid">
              {vehiculosActivos.map(v => (
                <div key={v.id} className="active-vehicle-card">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{v.placa}</div>
                    <div style={{ fontSize: 12, color: '#666666' }}>
                      Espacio {v.codigo_espacio} · {v.tipo_vehiculo_nombre}
                    </div>
                    <div style={{ fontSize: 11, color: '#888888', marginTop: 2 }}>
                      {v.cliente_nombre ? `Cliente: ${v.cliente_nombre}` : 'Rotativo'}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: '5px 10px' }}
                    onClick={() => seleccionarVehiculo(v.placa)}
                  >
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
