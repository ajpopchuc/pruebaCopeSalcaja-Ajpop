import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { TableroEspacios } from './components/TableroEspacios';
import { EntradaVehiculo } from './components/EntradaVehiculo';
import { SalidaVehiculo } from './components/SalidaVehiculo';
import { HistorialConsumos } from './components/HistorialConsumos';
import { RegistroClienteVehiculo } from './components/RegistroClienteVehiculo';

export const App = () => {
  const [tabActivo, setTabActivo] = useState('tablero');
  const [refreshKey, setRefreshKey] = useState(0);

  const forzarRecarga = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Header Principal */}
      <header className="app-header">
        <div>
          <h1 className="app-title">Control de Parqueadero</h1>
          <p className="app-subtitle">Gestión de estancias, suscripciones y liquidación de tarifas</p>
        </div>

        {/* Botones de Selección */}
        <Navbar tabActivo={tabActivo} setTabActivo={setTabActivo} />
      </header>

      {/* Vistas Principales */}
      <main>
        {tabActivo === 'tablero' && (
          <TableroEspacios key={refreshKey} />
        )}

        {tabActivo === 'entrada' && (
          <EntradaVehiculo onEntradaExitosa={forzarRecarga} />
        )}

        {tabActivo === 'salida' && (
          <SalidaVehiculo onSalidaExitosa={forzarRecarga} />
        )}

        {tabActivo === 'historial' && (
          <HistorialConsumos key={refreshKey} />
        )}

        {tabActivo === 'registro' && (
          <RegistroClienteVehiculo />
        )}
      </main>
    </div>
  );
};

export default App;
