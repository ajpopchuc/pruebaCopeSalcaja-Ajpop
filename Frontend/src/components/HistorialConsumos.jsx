import React, { useState, useEffect } from 'react';
import api from '../config/api';

export const HistorialConsumos = () => {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
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
  const finalizados = historial.filter(h => h.estado === 'FINALIZADO').length;
  const totalRecaudado = historial.reduce((acc, h) => acc + Number(h.monto_total || 0), 0);

  // Filtrado reactivo por texto y estado
  const registrosFiltrados = historial.filter(reg => {
    const coincideEstado = 
      filtroEstado === 'TODOS' ? true : reg.estado === filtroEstado;

    const termino = busqueda.trim().toUpperCase();
    const coincideTexto = !termino || 
      reg.placa.toUpperCase().includes(termino) ||
      (reg.cliente_nombre && reg.cliente_nombre.toUpperCase().includes(termino)) ||
      reg.codigo_espacio.toUpperCase().includes(termino);

    return coincideEstado && coincideTexto;
  });

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
          <p className="metric-value">{activosAdentro}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Recaudación Total</span>
          <p className="metric-value">
            Q {totalRecaudado.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Tabla de Entradas, Salidas y Consumos */}
      <div className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Registro de Entradas, Salidas y Consumos</h2>
            <p className="card-description" style={{ marginBottom: 0 }}>
              Consulta detallada de permanencia, recargos y montos liquidados por vehículo.
            </p>
          </div>
          <button className="btn-secondary" onClick={cargarHistorial}>
            Actualizar
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="search-filter-bar">
          <input
            type="text"
            className="form-input"
            style={{ maxWidth: 280 }}
            placeholder="Buscar por placa, cliente o espacio..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />

          <div className="filter-group">
            <button
              type="button"
              className={`filter-btn ${filtroEstado === 'TODOS' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('TODOS')}
            >
              Todos ({totalMovimientos})
            </button>
            <button
              type="button"
              className={`filter-btn ${filtroEstado === 'ACTIVO' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('ACTIVO')}
            >
              En Parqueo ({activosAdentro})
            </button>
            <button
              type="button"
              className={`filter-btn ${filtroEstado === 'FINALIZADO' ? 'active' : ''}`}
              onClick={() => setFiltroEstado('FINALIZADO')}
            >
              Finalizados ({finalizados})
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: '#666666', fontSize: 13, padding: '20px 0' }}>Cargando registros...</p>
        ) : registrosFiltrados.length === 0 ? (
          <p style={{ color: '#666666', fontSize: 13, padding: '20px 0' }}>
            No se encontraron registros con los filtros seleccionados.
          </p>
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
                {registrosFiltrados.map((reg) => (
                  <tr key={reg.id}>
                    <td><strong>{reg.placa}</strong></td>
                    <td>{reg.tipo_vehiculo_nombre}</td>
                    <td>Espacio {reg.codigo_espacio}</td>
                    <td>
                      {reg.cliente_nombre ? (
                        <span>{reg.cliente_nombre}</span>
                      ) : (
                        <span style={{ color: '#888888' }}>Rotativo</span>
                      )}
                    </td>
                    <td>{formatearFecha(reg.fecha_entrada)}</td>
                    <td>
                      {reg.estado === 'ACTIVO' ? (
                        <span style={{ fontWeight: 600 }}>En parqueo</span>
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
