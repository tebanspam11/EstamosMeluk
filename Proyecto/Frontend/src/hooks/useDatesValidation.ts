import { useState, useEffect, useMemo } from 'react';
import { validateFechaAplicacion, validateProximaDosis } from '../utils/validateDates.ts';

export const useDatesValidation = (
  fecha_aplicacion: string,
  proxima_dosis: string
) => {
  const [fechaAplicacionError, setFechaAplicacionError] = useState<string | null>(null);
  const [proximaDosisError, setProximaDosisError] = useState<string | null>(null);

  useEffect(() => {
    setFechaAplicacionError(
      fecha_aplicacion ?
      validateFechaAplicacion(fecha_aplicacion).valido
        ? null
        : validateFechaAplicacion(fecha_aplicacion).error
      : null
    );
  }, [fecha_aplicacion]);

  useEffect(() => {
    setProximaDosisError(
      proxima_dosis ?
      validateProximaDosis(proxima_dosis).valido
        ? null
        : validateProximaDosis(proxima_dosis).error
      : null
    );
  }, [proxima_dosis]);

  const areDatesValid = useMemo(() => {
    return (
      (fecha_aplicacion ? validateFechaAplicacion(fecha_aplicacion).valido : false) &&
      (proxima_dosis ? validateProximaDosis(proxima_dosis).valido : true)
    );
  }, [fecha_aplicacion, proxima_dosis]);
  
  return { fechaAplicacionError, proximaDosisError, areDatesValid };
};