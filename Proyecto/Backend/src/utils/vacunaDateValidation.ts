export const validarFechasVacuna = (fechaAplicacion: Date, fechaVencimiento: Date): { 
  valido: boolean; 
  error?: string 
} => {
  if (fechaVencimiento <= fechaAplicacion) {
    return { 
      valido: false, 
      error: 'La fecha de vencimiento no puede ser menor o igual a la fecha de aplicación' 
    };
  }

  const ahora = new Date();
  if (fechaVencimiento < ahora) {
    return { 
      valido: false, 
      error: 'La vacuna está vencida' 
    };
  }
  
  return { valido: true };
};