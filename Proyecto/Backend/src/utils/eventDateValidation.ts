export const validarFechaEvento = (fechaEvento: Date): { 
  valido: boolean; 
  error?: string 
} => {
  const ahora = new Date();
  
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  const fechaEventoSinHora = new Date(
    fechaEvento.getFullYear(), 
    fechaEvento.getMonth(), 
    fechaEvento.getDate()
  );
  
  if (fechaEventoSinHora < hoy) {
    return { 
      valido: false, 
      error: 'La fecha del evento no puede ser en el pasado' 
    };
  }
  
  return { valido: true };
};