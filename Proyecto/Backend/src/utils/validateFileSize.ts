export function validateFileSize(bytes: number, maxMB: number = 5) {
  const maxBytes = maxMB * 1024 * 1024;

  if (bytes <= 0) {
    return { valido: false, error: 'El tamaño del archivo no es válido' };
  }

  if (bytes > maxBytes) {
    return { valido: false, error: `El archivo supera el límite de ${maxMB} MB` };
  }

  return { valido: true, error: null };
}
