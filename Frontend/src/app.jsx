import { usePrestamos } from './features/prestamos/hooks/usePrestamos';
import { TablaPrestamos } from './features/prestamos/components/TablaPrestamos';

export const App = () => {
  const { data: prestamos, loading, error } = usePrestamos();

  if (loading) return <p>Cargando información...</p>;
  if (error) return <p>Error al cargar préstamos: {error.message}</p>;

  return (
    <main>
      <h1>Gestión de Préstamos</h1>
      <TablaPrestamos prestamos={prestamos} />
    </main>
  );
};

export default App;
