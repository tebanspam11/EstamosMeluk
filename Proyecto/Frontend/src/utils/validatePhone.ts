export function validatePhoneFields(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const phoneRegex = /^3\d{9}$/;
  return phoneRegex.test(digits);
}