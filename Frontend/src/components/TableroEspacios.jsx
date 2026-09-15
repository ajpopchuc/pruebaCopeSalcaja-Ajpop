import React, { useState, useEffect } from 'react';
import api from '../config/api';

export const TableroEspacios = () => {
  const [espacios, setEspacios] = useState([]);
  const [resumen, setResumen] = useState({ total: 0, disponibles: 0, ocupados: 0, mantenimiento: 0 });
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEspacios = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/espacios');
      if (res.data.status === 'success') {
        setEspacios(res.data.data);
        setResumen(res.data.resumen);
      }
    } catch (err) {
      console.error('Error al cargar espacios:', err);
      setError('No se pudo conectar con el servidor para cargar los espacios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEspacios();
  }, []);

  // Filtrado reactivo por tipo de vehículo
  const espaciosFiltrados = espacios.filter(esp => {
    if (filtroTipo === 'AUTO') return esp.tipo_vehiculo_id === 1;
    if (filtroTipo === 'MOTO') return esp.tipo_vehiculo_id === 2;
    return true;
  });

  return (
    <div className="view-container">
      {/* 1. Métricas de Ocupación */}
      <div className="metrics-grid">
        <div className="metric-box">
          <span className="metric-label">Espacios Totales</span>
          <p className="metric-value">{resumen.total}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Disponibles</span>
          <p className="metric-value">{resumen.disponibles}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Ocupados</span>
          <p className="metric-value">{resumen.ocupados}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Mantenimiento</span>
          <p className="metric-value">{resumen.mantenimiento}</p>
        </div>
      </div>

      {/* 2. Grid de Espacios Individuales */}
      <div className="card">
        <div className="card-header-flex">
          <div>
            <h2 className="card-title">Distribución y Estado de Espacios</h2>
            <p className="card-description" style={{ marginBottom: 0 }}>
              Cajones físicos clasificados por compatibilidad de vehículo.
            </p>
          </div>

          <div className="card-actions-flex">
            {/* Filtro minimalista por tipo */}
            <div className="filter-group">
              <button 
                type="button" 
                className={`filter-btn ${filtroTipo === 'TODOS' ? 'active' : ''}`}
                onClick={() => setFiltroTipo('TODOS')}
              >
                Todos ({espacios.length})
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filtroTipo === 'AUTO' ? 'active' : ''}`}
                onClick={() => setFiltroTipo('AUTO')}
              >
                Autos ({espacios.filter(e => e.tipo_vehiculo_id === 1).length})
              </button>
              <button 
                type="button" 
                className={`filter-btn ${filtroTipo === 'MOTO' ? 'active' : ''}`}
                onClick={() => setFiltroTipo('MOTO')}
              >
                Motos ({espacios.filter(e => e.tipo_vehiculo_id === 2).length})
              </button>
            </div>

            <button className="btn-secondary" onClick={cargarEspacios}>
              Actualizar
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: '#666666', fontSize: 13, padding: '20px 0' }}>Cargando disponibilidad...</p>
        ) : (
          <div className="espacios-grid">
            {espaciosFiltrados.map(esp => (
              <div 
                key={esp.id} 
                className={`espacio-card ${esp.estado.toLowerCase()}`}
              >
                <div className="espacio-codigo">{esp.codigo_espacio}</div>
                <div className="espacio-tipo">{esp.tipo_vehiculo_nombre}</div>
                <span className="espacio-badge">{esp.estado}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
