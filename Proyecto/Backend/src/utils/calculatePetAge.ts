export function calculatePetAge(birthdate: string): number {
  const date = new Date(birthdate);
  if (isNaN(date.getTime())) return -1;

  const now = new Date();
  if (date > now) return -1;

  let age = now.getFullYear() - date.getFullYear();

  const monthDiff = now.getMonth() - date.getMonth();
  const dayDiff = now.getDate() - date.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}