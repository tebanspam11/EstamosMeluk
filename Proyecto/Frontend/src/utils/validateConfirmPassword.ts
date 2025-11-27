export function validateConfirmPasswordFields(password: string, confirmPassword: string) {
  if (password != confirmPassword || !confirmPassword || confirmPassword === "") return {valido: false, error: 'ⓘ Las contraseñas no coinciden'};

  return {valido: true, error: null};
}