const { validarFechaEvento } = require('../Backend/src/utils/eventDateValidation');

describe('Validación de Fecha de Evento', () => {
  test('Fecha futura - VÁLIDO', () => {
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 5);

    const resultado = validarFechaEvento(fechaFutura);

    expect(resultado.valido).toBe(true);
  });

  test('Fecha de hoy - VÁLIDO', () => {
    const hoy = new Date();

    const resultado = validarFechaEvento(hoy);

    expect(resultado.valido).toBe(true);
  });

  test('Fecha pasada - INVÁLIDO', () => {
    const fechaPasada = new Date();
    fechaPasada.setDate(fechaPasada.getDate() - 1);

    const resultado = validarFechaEvento(fechaPasada);

    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('La fecha del evento no puede ser en el pasado');
  });
});
