import React, { useState } from 'react';
import api from '../config/api';

export const SalidaVehiculo = ({ onSalidaExitosa }) => {
  const [placa, setPlaca] = useState('');
  const [ticketLiquidado, setTicketLiquidado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLiquidarSalida = async (e) => {
    e.preventDefault();
    setError(null);
    setTicketLiquidado(null);

    if (!placa.trim()) {
      setError('Por favor ingrese la placa del vehículo a liquidar.');
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
        if (onSalidaExitosa) onSalidaExitosa();
      }
    } catch (err) {
      console.error('Error al liquidar salida:', err);
      setError(err.response?.data?.message || 'No se pudo liquidar la salida del vehículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <div className="card">
        <h2 className="card-title">Registrar Salida y Liquidación de Cobro (Check-out)</h2>
        <p className="card-description">
          Calcula automáticamente la permanencia, descuenta bolsa de horas o aplica la tarifa escalonada y libera el espacio.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLiquidarSalida}>
          <div className="form-grid">
            <div className="form-group" style={{ maxWidth: 320 }}>
              <label htmlFor="placaSalida">Placa del Vehículo</label>
              <input
                id="placaSalida"
                type="text"
                className="form-input"
                placeholder="Ej. P-123ABC o TMP-999"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                maxLength={15}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Calculando cobro...' : 'Liquidar y Confirmar Salida'}
          </button>
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
              <div className="ticket-row" style={{ color: '#166534' }}>
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
      </div>
    </div>
  );
};
