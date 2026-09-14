import React, { useState, useEffect } from 'react';
import api from '../config/api';

export const HistorialConsumos = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/estacionamiento/historial');
      if (res.data.status === 'success') {
        setHistorial(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar historial:', err);
      setError('No se pudo cargar el historial de movimientos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  // Formateador de fecha/hora simple y legible
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return '--';
    const d = new Date(fechaStr);
    return d.toLocaleString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Métricas rápidas
  const totalMovimientos = historial.length;
  const activosAdentro = historial.filter(h => h.estado === 'ACTIVO').length;
  const totalRecaudado = historial.reduce((acc, h) => acc + Number(h.monto_total || 0), 0);

  return (
    <div className="view-container">
      {/* Resumen de Movimientos */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Total Movimientos</span>
          <p className="metric-value">{totalMovimientos}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Vehículos Adentro</span>
          <p className="metric-value" style={{ color: '#111111' }}>{activosAdentro}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Recaudación Total</span>
          <p className="metric-value" style={{ color: '#166534' }}>
            Q {totalRecaudado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabla de Entradas, Salidas y Consumos */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Registro de Entradas, Salidas y Consumos</h2>
            <p className="card-description" style={{ marginBottom: 0 }}>
              Consulta detallada de permanencia, recargos y montos cobrados por vehículo.
            </p>
          </div>
          <button className="btn-secondary" onClick={cargarHistorial}>
            Actualizar
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: '#666666', fontSize: 13 }}>Cargando registros...</p>
        ) : historial.length === 0 ? (
          <p style={{ color: '#666666', fontSize: 13 }}>No hay registros de movimientos aún.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Placa</th>
                  <th>Tipo</th>
                  <th>Espacio</th>
                  <th>Propietario / Modo</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Permanencia</th>
                  <th>Monto / Recargo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((reg) => (
                  <tr key={reg.id}>
                    <td><strong>{reg.placa}</strong></td>
                    <td>{reg.tipo_vehiculo_nombre}</td>
                    <td>Espacio {reg.codigo_espacio}</td>
                    <td>
                      {reg.cliente_nombre ? (
                        <span title="Cliente con suscripción">{reg.cliente_nombre}</span>
                      ) : (
                        <span style={{ color: '#888888' }}>Rotativo</span>
                      )}
                    </td>
                    <td>{formatearFecha(reg.fecha_entrada)}</td>
                    <td>
                      {reg.estado === 'ACTIVO' ? (
                        <span style={{ color: '#166534', fontWeight: 500 }}>En parqueo</span>
                      ) : (
                        formatearFecha(reg.fecha_salida)
                      )}
                    </td>
                    <td>
                      {reg.minutos_estancia !== null ? (
                        <span>
                          {reg.minutos_estancia} min ({(reg.minutos_estancia / 60).toFixed(1)} h)
                        </span>
                      ) : '--'}
                    </td>
                    <td>
                      <strong>Q {Number(reg.monto_total || 0).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`badge ${reg.estado === 'ACTIVO' ? 'badge-activo' : 'badge-finalizado'}`}>
                        {reg.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
