export function validateEmailFields(email: string) {
  if (!email || email.trim() === '')
    return { valido: false, error: 'ⓘ Por favor ingrese un correo' };

  if (/\s/.test(email)) return { valido: false, error: 'ⓘ El formato no es válido' };

  const forbidden = /[";()*,]/;
  if (forbidden.test(email)) return { valido: false, error: 'ⓘ El formato no es válido' };

  const parts = email.split('@');
  if (parts.length !== 2) return { valido: false, error: 'ⓘ El formato no es válido' };

  const [local, domain] = parts;
  if (!local || !domain) return { valido: false, error: 'ⓘ El formato no es válido' };

  if (local.startsWith('.') || local.endsWith('.'))
    return { valido: false, error: 'ⓘ El formato no es válido' };
  if (domain.startsWith('.') || domain.endsWith('.'))
    return { valido: false, error: 'ⓘ El formato no es válido' };

  const domainParts = domain.split('.');
  if (domainParts.length < 2) return { valido: false, error: 'ⓘ El formato no es válido' };

  const tld = domainParts[domainParts.length - 1];
  if (!/^[A-Za-z]{2,}$/.test(tld)) return { valido: false, error: 'ⓘ El formato no es válido' };

  const localRegex = /^[A-Za-z0-9._%+-]+$/;
  if (!localRegex.test(local)) return { valido: false, error: 'ⓘ El formato no es válido' };

  const domainRegex = /^[A-Za-z0-9.-]+$/;
  if (!domainRegex.test(domain)) return { valido: false, error: 'ⓘ El formato no es válido' };

  return { valido: true, error: null };
}
