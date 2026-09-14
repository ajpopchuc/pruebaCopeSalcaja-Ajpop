export const TablaPrestamos = ({ prestamos = [] }) => {
  if (!prestamos.length) {
    return <p>No hay préstamos para mostrar.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Monto</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {prestamos.map((prestamo) => (
          <tr key={prestamo.id}>
            <td>{prestamo.id}</td>
            <td>{prestamo.monto}</td>
            <td>{prestamo.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
