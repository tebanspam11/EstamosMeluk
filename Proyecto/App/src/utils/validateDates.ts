export function validateFechaAplicacion(fecha_aplicacion: string) {
  if (isNaN(new Date(fecha_aplicacion).getTime()) || new Date(fecha_aplicacion) > new Date()) {
    return { valido: false, error: 'ⓘ La fecha de aplicación no es valida' };
  }
  return { valido: true, error: null };
}

export function validateProximaDosis(proxima_dosis: string) {
  if (proxima_dosis && isNaN(new Date(proxima_dosis).getTime())) {
    return { valido: false, error: 'ⓘ La fecha de próxima dosis no es valida' };
  }
  return { valido: true, error: null };
}
