export default function Home() {
  return (
    <div>
      <h2>Inicio</h2>
      <p>
        Esta es una demo del flujo genérico de aprobación. Desde aquí puedes:
      </p>
      <ul>
        <li>Crear solicitudes</li>
        <li>Ver solicitudes pendientes para un aprobador</li>
        <li>Aprobar o rechazar solicitudes</li>
      </ul>
      <p>
        Primero asegúrate de tener usuarios creados en la base de datos (o con
        Postman), al menos:
      </p>
      <ul>
        <li>Un solicitante</li>
        <li>Un aprobador</li>
      </ul>
    </div>
  );
}
