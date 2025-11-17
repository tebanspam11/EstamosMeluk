import { getEventsForDate, Event } from '../Frontend/src/utils/getEventsForDate';

describe('getEventsForDate()', () => {
  const mockEvents: Event[] = [
    { nombre: 'Evento A', fecha_inicio: '2024-10-10' },
    { nombre: 'Evento B', fecha_inicio: '2024-10-10' },
    { nombre: 'Evento C', fecha_inicio: '2024-11-01' },
  ];

  test('Filtra eventos correctamente por fecha', () => {
    console.log('→ Probando filtrado por fecha 2024-10-10...');

    const date = new Date('2024-10-10');
    const result = getEventsForDate(date, mockEvents);

    console.log(
      'Eventos encontrados:',
      result.map((e) => e.nombre)
    );

    expect(result.map((e: Event) => e.nombre)).toEqual(['Evento A', 'Evento B']);

    console.log('✔ Test finalizado correctamente.');
  });
});
