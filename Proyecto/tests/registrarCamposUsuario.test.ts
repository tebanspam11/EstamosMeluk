interface Usuario {
  nombre?: any;
  email?: any;
  password?: any;
  edad?: any;
}

function validarUsuario(usuario: Usuario): string[] {
  const faltantes: string[] = [];

  if (!usuario.nombre) faltantes.push('nombre');
  if (!usuario.email) faltantes.push('email');
  if (!usuario.password) faltantes.push('password');

  if (usuario.edad === undefined || usuario.edad === null) {
    faltantes.push('edad');
  }

  return faltantes;
}

describe('Validación de campos faltantes en usuario', () => {
  test('Caso 1: Usuario totalmente vacío', () => {
    const usuario = {};
    const faltantes = validarUsuario(usuario);
    console.log('Campos faltantes detectados:', faltantes);

    expect(faltantes).toEqual(['nombre', 'email', 'password', 'edad']);
  });

  test("Caso 2: Campos presentes pero vacíos ('')", () => {
    const usuario = { nombre: '', email: '', password: '', edad: '' };
    const faltantes = validarUsuario(usuario);
    console.log('Campos faltantes detectados:', faltantes);
    expect(faltantes).toEqual(['nombre', 'email', 'password']);
  });

  test('Caso 3: Edad = 0 (caso límite válido)', () => {
    console.log('→ Probando edad 0 (válida)');
    const usuario = { nombre: 'Ana', email: 'a@b.com', password: '123', edad: 0 };
    const faltantes = validarUsuario(usuario);
    console.log('Campos faltantes detectados:', faltantes);

    expect(faltantes).toEqual([]);
  });

  test('Caso 4: Falta solo 1 campo', () => {
    console.log('→ Falta únicamente el campo email');
    const usuario = { nombre: 'Ana', email: null, password: '123', edad: 20 };
    const faltantes = validarUsuario(usuario);
    console.log('Campos faltantes detectados:', faltantes);

    expect(faltantes).toEqual(['email']);
  });

  test('Caso 5: Usuario completamente válido', () => {
    console.log('→ Probando usuario válido');
    const usuario = { nombre: 'Luis', email: 'l@l.com', password: 'abc', edad: 25 };
    const faltantes = validarUsuario(usuario);

    expect(faltantes).toEqual([]);
  });
});
