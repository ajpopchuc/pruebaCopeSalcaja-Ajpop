import React from 'react';

export const Navbar = ({ tabActivo, setTabActivo }) => {
  const tabs = [
    { id: 'tablero', label: '1. Estado del Parqueo' },
    { id: 'entrada', label: '2. Registrar Entrada' },
    { id: 'salida', label: '3. Salida y Cobro' },
    { id: 'historial', label: '4. Historial y Consumos' },
    { id: 'registro', label: '5. Clientes y Vehículos' }
  ];

  return (
    <nav className="nav-buttons">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-btn ${tabActivo === tab.id ? 'active' : ''}`}
          onClick={() => setTabActivo(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
};
