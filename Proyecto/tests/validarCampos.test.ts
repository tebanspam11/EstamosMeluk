import { validatePetFields } from '../Frontend/src/utils/validatePet';

describe('validatePetFields()', () => {
  test('Debe retornar false si algún campo está vacío', () => {
    const petData = {
      petImage: '',
      name: '',
      species: 'Perro',
      breed: 'Labrador',
      weight: '10',
      age: '2',
    };

    expect(validatePetFields(petData)).toBe(false);
  });

  test('Debe retornar true si todos los campos están llenos', () => {
    const petData = {
      petImage: 'imagen.png',
      name: 'Firulais',
      species: 'Perro',
      breed: 'Labrador',
      weight: '20',
      age: '3',
    };

    expect(validatePetFields(petData)).toBe(true);
  });

  test('Debe retornar false si falta **cualquier** campo', () => {
    const petData = {
      petImage: 'imagen.png',
      name: 'Firulais',
      species: 'Perro',
      breed: 'Labrador',
      // weight falta
      age: '3',
    };

    expect(validatePetFields(petData)).toBe(false);
  });
});
