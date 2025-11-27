export type PasswordChecklistType = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
};

export function validatePasswordChecklist(password: string): {checklist: PasswordChecklistType; allValid: boolean, isPasswordOk: boolean} {
  const checklist: PasswordChecklistType = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*\-_]/.test(password),
    noSpaces: !/\s/.test(password),
  };

  const allValid = Object.values(checklist).every(v => v === true);
  const isPasswordOk = password.length > 0 && allValid;
  return { checklist, allValid, isPasswordOk };
}