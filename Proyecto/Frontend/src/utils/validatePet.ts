export function validatePetFields(pet: any) {
  const { petImage, name, species, breed, weight, age } = pet;

  if (!petImage || !name || !species || !breed || !weight || !age) {
    return false;
  }

  return true;
}
