export function validateRegisterFields(data: any) {
  const { email, password, confirmPassword, fullName } = data;

  if (!email || !password || !confirmPassword || !fullName) {
    return {
      valido: false,
      error: 'Por favor completa todos los campos obligatorios',
    };
  }

  if (password !== confirmPassword) {
    return {
      valido: false,
      error: 'Las contraseñas no coinciden',
    };
  }

  if (password.length < 6) {
    return {
      valido: false,
      error: 'La contraseña debe tener al menos 6 caracteres',
    };
  }

  return { valido: true, error: null };
}
