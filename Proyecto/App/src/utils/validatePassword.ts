export type PasswordChecklistType = {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  noSpaces: boolean;
};

export function validatePasswordChecklist(password: string): {
  checklist: PasswordChecklistType;
  valido: boolean;
} {
  const checklist: PasswordChecklistType = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*\-_]/.test(password),
    noSpaces: !/\s/.test(password),
  };

  const isPasswordOk = Object.values(checklist).every((v) => v === true);

  return { checklist: checklist, valido: isPasswordOk };
}
