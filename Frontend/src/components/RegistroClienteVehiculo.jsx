import React, { useState, useEffect } from 'react';
import api from '../config/api';

export const RegistroClienteVehiculo = () => {
  // Estado para Formulario de Cliente
  const [nombreCliente, setNombreCliente] = useState('');
  const [documentoCliente, setDocumentoCliente] = useState('');
  const [telefonoCliente, setTelefonoCliente] = useState('');
  const [emailCliente, setEmailCliente] = useState('');
  const [msgCliente, setMsgCliente] = useState(null);
  const [errCliente, setErrCliente] = useState(null);

  // Estado para Formulario de Vehículo
  const [placaVehiculo, setPlacaVehiculo] = useState('');
  const [tipoVehiculoId, setTipoVehiculoId] = useState(1);
  const [clienteAsociadoId, setClienteAsociadoId] = useState('');
  const [esTemporal, setEsTemporal] = useState(false);
  const [msgVehiculo, setMsgVehiculo] = useState(null);
  const [errVehiculo, setErrVehiculo] = useState(null);

  // Listas de apoyo
  const [clientes, setClientes] = useState([]);
  const [tipos, setTipos] = useState([]);

  const cargarCatalogos = async () => {
    try {
      const [resClientes, resTipos] = await Promise.all([
        api.get('/clientes'),
        api.get('/tipos-vehiculo')
      ]);
      if (resClientes.data.status === 'success') setClientes(resClientes.data.data);
      if (resTipos.data.status === 'success') {
        setTipos(resTipos.data.data);
        if (resTipos.data.data.length > 0) setTipoVehiculoId(resTipos.data.data[0].id);
      }
    } catch (err) {
      console.error('Error al cargar catálogos:', err);
    }
  };

  useEffect(() => {
    cargarCatalogos();
  }, []);

  // 1. Guardar Cliente
  const handleCrearCliente = async (e) => {
    e.preventDefault();
    setMsgCliente(null);
    setErrCliente(null);

    if (!nombreCliente.trim() || !documentoCliente.trim()) {
      setErrCliente('El nombre y el documento son obligatorios.');
      return;
    }

    try {
      const res = await api.post('/clientes', {
        nombre: nombreCliente.trim(),
        documento: documentoCliente.trim(),
        telefono: telefonoCliente.trim() || null,
        email: emailCliente.trim() || null
      });

      if (res.data.status === 'success') {
        setMsgCliente(`Cliente "${nombreCliente}" registrado exitosamente.`);
        setNombreCliente('');
        setDocumentoCliente('');
        setTelefonoCliente('');
        setEmailCliente('');
        cargarCatalogos(); // refrescar select de clientes
      }
    } catch (err) {
      setErrCliente(err.response?.data?.message || 'Error al registrar cliente.');
    }
  };

  // 2. Guardar Vehículo
  const handleCrearVehiculo = async (e) => {
    e.preventDefault();
    setMsgVehiculo(null);
    setErrVehiculo(null);

    if (!placaVehiculo.trim()) {
      setErrVehiculo('La placa es obligatoria.');
      return;
    }

    try {
      const res = await api.post('/vehiculos', {
        placa: placaVehiculo.trim().toUpperCase(),
        tipo_vehiculo_id: Number(tipoVehiculoId),
        cliente_id: clienteAsociadoId ? Number(clienteAsociadoId) : null,
        es_temporal: esTemporal
      });

      if (res.data.status === 'success') {
        setMsgVehiculo(res.data.message);
        setPlacaVehiculo('');
        setEsTemporal(false);
      }
    } catch (err) {
      setErrVehiculo(err.response?.data?.message || 'Error al registrar vehículo.');
    }
  };

  return (
    <div className="view-container">
      {/* Panel 1: Crear Cliente */}
      <div className="card">
        <h2 className="card-title">Registrar Nuevo Cliente</h2>
        <p className="card-description">Crea la ficha del propietario para asociarle vehículos o suscripciones.</p>

        {errCliente && <div className="alert alert-error">{errCliente}</div>}
        {msgCliente && <div className="alert alert-success">{msgCliente}</div>}

        <form onSubmit={handleCrearCliente}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="nombre">Nombre Completo *</label>
              <input
                id="nombre"
                type="text"
                className="form-input"
                placeholder="Ej. Roberto Díaz"
                value={nombreCliente}
                onChange={(e) => setNombreCliente(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="documento">Documento de Identidad (DPI/NIT) *</label>
              <input
                id="documento"
                type="text"
                className="form-input"
                placeholder="Ej. 100300400"
                value={documentoCliente}
                onChange={(e) => setDocumentoCliente(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="text"
                className="form-input"
                placeholder="Ej. 30033344"
                value={telefonoCliente}
                onChange={(e) => setTelefonoCliente(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Ej. cliente@gmail.com"
                value={emailCliente}
                onChange={(e) => setEmailCliente(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary">Guardar Cliente</button>
        </form>
      </div>

      {/* Panel 2: Registrar Vehículo */}
      <div className="card">
        <h2 className="card-title">Registrar Vehículo</h2>
        <p className="card-description">
          Registra vehículos vinculados a un cliente. Puedes marcar la opción de vehículo temporal de taller.
        </p>

        {errVehiculo && <div className="alert alert-error">{errVehiculo}</div>}
        {msgVehiculo && <div className="alert alert-success">{msgVehiculo}</div>}

        <form onSubmit={handleCrearVehiculo}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="placaVehiculo">Placa *</label>
              <input
                id="placaVehiculo"
                type="text"
                className="form-input"
                placeholder="Ej. P-123ABC o TMP-999"
                value={placaVehiculo}
                onChange={(e) => setPlacaVehiculo(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipoV">Tipo de Vehículo</label>
              <select
                id="tipoV"
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
              <label htmlFor="clienteAsociado">Propietario / Cliente (Opcional)</label>
              <select
                id="clienteAsociado"
                className="form-select"
                value={clienteAsociadoId}
                onChange={(e) => setClienteAsociadoId(e.target.value)}
              >
                <option value="">-- Sin Cliente (Vehículo Rotativo) --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} (Doc: {c.documento})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkbox de Vehículo Temporal de Taller */}
          {clienteAsociadoId && (
            <div style={{ marginBottom: 20 }}>
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  checked={esTemporal}
                  onChange={(e) => setEsTemporal(e.target.checked)}
                />
                <span>¿Es vehículo temporal de taller / sustitución? (Compartirá la bolsa de horas del cliente)</span>
              </label>
            </div>
          )}

          <button type="submit" className="btn-primary">Guardar Vehículo</button>
        </form>
      </div>
    </div>
  );
};
