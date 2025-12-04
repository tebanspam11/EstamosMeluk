export function validateConfirmPasswordFields(password: string, confirmPassword: string) {
  if (password != confirmPassword || !confirmPassword || confirmPassword.trim() === '') return { valido: false, error: 'ⓘ Las contraseñas no coinciden' };

  return { valido: true, error: null };
}
