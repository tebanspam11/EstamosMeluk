const { validarFechasVacuna } = require('../Backend/src/utils/vacunaDateValidation');

describe('Validación de Fechas de Vacuna', () => {
  test('Vencimiento después de aplicación - VÁLIDO', () => {
    // Usar fechas futuras
    const fechaAplicacion = new Date('2025-01-01');
    const fechaVencimiento = new Date('2026-01-01');
    
    const resultado = validarFechasVacuna(fechaAplicacion, fechaVencimiento);
    
    expect(resultado.valido).toBe(true);
  });
  
  test('Vencimiento igual a aplicación - INVÁLIDO', () => {
    const mismaFecha = new Date('2024-06-01');
    
    const resultado = validarFechasVacuna(mismaFecha, mismaFecha);
    
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toBe('La fecha de vencimiento no puede ser menor o igual a la fecha de aplicación');
  });
  
  test('Vencimiento antes de aplicación - INVÁLIDO', () => {
    const fechaAplicacion = new Date('2024-06-01');
    const fechaVencimiento = new Date('2023-06-01');
    
    const resultado = validarFechasVacuna(fechaAplicacion, fechaVencimiento);
    
    expect(resultado.valido).toBe(false);
  });
});
