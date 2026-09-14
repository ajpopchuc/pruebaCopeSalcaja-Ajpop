import React, { useState, useEffect } from 'react';
import api from '../config/api';

export const TableroEspacios = () => {
  const [espacios, setEspacios] = useState([]);
  const [resumen, setResumen] = useState({ total: 0, disponibles: 0, ocupados: 0, mantenimiento: 0 });
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
          <p className="metric-value" style={{ color: '#166534' }}>{resumen.disponibles}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Ocupados</span>
          <p className="metric-value" style={{ color: '#991b1b' }}>{resumen.ocupados}</p>
        </div>
        <div className="metric-box">
          <span className="metric-label">Mantenimiento</span>
          <p className="metric-value" style={{ color: '#854d0e' }}>{resumen.mantenimiento}</p>
        </div>
      </div>

      {/* 2. Grid de Espacios Individuales */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 className="card-title">Distribución de Espacios</h2>
            <p className="card-description" style={{ marginBottom: 0 }}>
              Cajones físicos clasificados para Automóvil o Motocicleta.
            </p>
          </div>
          <button className="btn-secondary" onClick={cargarEspacios}>
            Actualizar
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <p style={{ color: '#666666', fontSize: 13 }}>Cargando disponibilidad...</p>
        ) : (
          <div className="espacios-grid">
            {espacios.map(esp => (
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
