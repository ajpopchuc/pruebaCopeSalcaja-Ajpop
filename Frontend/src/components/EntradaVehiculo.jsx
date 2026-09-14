import React, { useState, useEffect } from 'react';
import api from '../config/api';

export const EntradaVehiculo = ({ onEntradaExitosa }) => {
  const [placa, setPlaca] = useState('');
  const [tipoVehiculoId, setTipoVehiculoId] = useState(1); // 1: Automóvil por defecto
  const [espacioId, setEspacioId] = useState('');
  
  const [tipos, setTipos] = useState([]);
  const [espaciosDisponibles, setEspaciosDisponibles] = useState([]);
  
  const [mensaje, setMensaje] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Cargar tipos de vehículo al montar
  useEffect(() => {
    const cargarTipos = async () => {
      try {
        const res = await api.get('/tipos-vehiculo');
        if (res.data.status === 'success') {
          setTipos(res.data.data);
          if (res.data.data.length > 0) {
            setTipoVehiculoId(res.data.data[0].id);
          }
        }
      } catch (err) {
        console.error('Error al cargar tipos de vehículo:', err);
      }
    };
    cargarTipos();
  }, []);

  // Cargar espacios libres compatibles cada vez que cambie el tipo de vehículo
  useEffect(() => {
    const cargarEspaciosCompatibles = async () => {
      if (!tipoVehiculoId) return;
      try {
        const res = await api.get(`/espacios/disponibles/${tipoVehiculoId}`);
        if (res.data.status === 'success') {
          setEspaciosDisponibles(res.data.data);
          if (res.data.data.length > 0) {
            setEspacioId(res.data.data[0].id);
          } else {
            setEspacioId('');
          }
        }
      } catch (err) {
        console.error('Error al cargar espacios compatibles:', err);
      }
    };
    cargarEspaciosCompatibles();
  }, [tipoVehiculoId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);

    // Validación en Frontend
    if (!placa.trim()) {
      setError('Por favor ingrese la placa del vehículo.');
      return;
    }

    if (!espacioId) {
      setError('No hay espacios disponibles compatibles para este tipo de vehículo.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/estacionamiento/entrada', {
        placa: placa.trim().toUpperCase(),
        espacio_id: Number(espacioId),
        tipo_vehiculo_id: Number(tipoVehiculoId)
      });

      if (res.data.status === 'success') {
        const data = res.data.data;
        setMensaje({
          titulo: 'Entrada registrada con éxito',
          ticket: data.registroId,
          placa: data.placa,
          espacio: data.espacio,
          tipoIngreso: data.tipoIngreso,
          suscripcion: data.suscripcion
        });

        // Limpiar campo placa
        setPlaca('');
        // Recargar espacios disponibles
        const resEsp = await api.get(`/espacios/disponibles/${tipoVehiculoId}`);
        if (resEsp.data.status === 'success') {
          setEspaciosDisponibles(resEsp.data.data);
          setEspacioId(resEsp.data.data[0]?.id || '');
        }

        if (onEntradaExitosa) onEntradaExitosa();
      }
    } catch (err) {
      console.error('Error en entrada:', err);
      // Muestra el mensaje de validación del backend (ej. Anti-passback, espacio ocupado)
      setError(err.response?.data?.message || 'Error al procesar la entrada del vehículo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container">
      <div className="card">
        <h2 className="card-title">Registrar Ingreso de Vehículo (Check-in)</h2>
        <p className="card-description">
          Valida compatibilidad de espacio, ausencia de entrada abierta y suscripción activa.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        
        {mensaje && (
          <div className="alert alert-success" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <strong>{mensaje.titulo}</strong>
            <span style={{ fontSize: 13, marginTop: 4 }}>
              Placa: <b>{mensaje.placa}</b> | Espacio: <b>{mensaje.espacio}</b> | Modalidad: <b>{mensaje.tipoIngreso}</b>
            </span>
            {mensaje.suscripcion && (
              <span style={{ fontSize: 12, marginTop: 2, color: '#166534' }}>
                Plan: {mensaje.suscripcion.plan} (Saldo: {mensaje.suscripcion.saldoHoras} hrs) 
                {mensaje.suscripcion.esTemporal && ' [Auto temporal de taller autorizado]'}
              </span>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="placa">Placa del Vehículo</label>
              <input
                id="placa"
                type="text"
                className="form-input"
                placeholder="Ej. P-123ABC"
                value={placa}
                onChange={(e) => setPlaca(e.target.value)}
                maxLength={15}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipoVehiculo">Tipo de Vehículo</label>
              <select
                id="tipoVehiculo"
                className="form-select"
                value={tipoVehiculoId}
                onChange={(e) => setTipoVehiculoId(e.target.value)}
              >
                {tipos.map(t => (
                  <option key={t.id} value={t.id}>{t.tipo}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="espacio">Espacio Compatible Disponible</label>
              <select
                id="espacio"
                className="form-select"
                value={espacioId}
                onChange={(e) => setEspacioId(e.target.value)}
                disabled={espaciosDisponibles.length === 0}
              >
                {espaciosDisponibles.length === 0 ? (
                  <option value="">No hay espacios libres para este tipo</option>
                ) : (
                  espaciosDisponibles.map(esp => (
                    <option key={esp.id} value={esp.id}>
                      Espacio {esp.codigo_espacio} (Disponible)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading || espaciosDisponibles.length === 0}
          >
            {loading ? 'Validando...' : 'Confirmar Ingreso'}
          </button>
        </form>
      </div>
    </div>
  );
};
