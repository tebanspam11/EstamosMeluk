export const validarEstadoEvento = (
  estado: string,
  fechaEvento: Date
): {
  valido: boolean;
  error?: string;
  advertencia?: string;
} => {
  const estadosValidos = ['Pendiente', 'Completo', 'Cancelado'];
  const ahora = new Date();

  if (!estadosValidos.includes(estado)) {
    return { valido: false, error: 'Estado de evento no válido' };
  }

  if (estado === 'Completo' && fechaEvento > ahora) {
    return {
      valido: false,
      error: 'No se puede completar un evento futuro',
    };
  }

  if (estado === 'Pendiente' && fechaEvento < ahora) {
    return {
      valido: true,
      advertencia: 'Evento pendiente en fecha pasada',
    };
  }

  return { valido: true };
};
