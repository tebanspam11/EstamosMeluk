export function formatPhoneColombia(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 0) return '';

  const part2 = digits.slice(0, 3);      
  const part3 = digits.slice(3, 6);       
  const part4 = digits.slice(6, 10);      

  let formatted = part2;
  if (part3) formatted += ' ' + part3;
  if (part4) formatted += ' ' + part4;

  return formatted;
}
