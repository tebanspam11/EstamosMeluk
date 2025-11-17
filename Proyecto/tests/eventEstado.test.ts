const { validarEstadoEvento } = require('../Backend/src/utils/eventStatusValidation');

describe('Validación de Estado de Evento', () => {
  test('Evento pendiente en fecha futura - VÁLIDO', () => {
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 1);

    const resultado = validarEstadoEvento('Pendiente', fechaFutura);

    expect(resultado.valido).toBe(true);
    expect(resultado.advertencia).toBeUndefined();
  });

  test('Evento completado en fecha pasada - VÁLIDO', () => {
    const fechaPasada = new Date();
    fechaPasada.setDate(fechaPasada.getDate() - 1);

    const resultado = validarEstadoEvento('Completo', fechaPasada);

    expect(resultado.valido).toBe(true);
  });

  test('Evento completado en fecha futura - INVÁLIDO', () => {
    const fechaFutura = new Date();
    fechaFutura.setDate(fechaFutura.getDate() + 1);

    const resultado = validarEstadoEvento('Completo', fechaFutura);

    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('No se puede completar un evento futuro');
  });
});
