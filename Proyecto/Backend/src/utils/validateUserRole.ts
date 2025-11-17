export function validateUserRole(role: string) {
  const validRoles = ['admin', 'cliente', 'veterinario'];

  if (!validRoles.includes(role)) {
    return { valido: false, error: 'Rol de usuario inválido' };
  }

  return { valido: true, error: null };
}
