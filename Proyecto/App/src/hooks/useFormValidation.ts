import { useState, useEffect, useMemo } from 'react';
import { validateEmailFields } from '../utils/validateEmail';
import { validatePasswordChecklist, PasswordChecklistType } from '../utils/validatePassword';
import { validatePhoneFields } from '../utils/validatePhone';
import { validateConfirmPasswordFields } from '../utils/validateConfirmPassword';

export const useFormValidation = (nombre: string, correo: string, telefono: string, contraseña: string, confirmPassword: string) => {
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [passwordChecklist, setPasswordChecklist] = useState<PasswordChecklistType>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    noSpaces: false,
  });
  const [passwordValid, setPasswordValid] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  useEffect(() => {
    setEmailError(correo ? (validateEmailFields(correo).valido ? null : validateEmailFields(correo).error) : null);
  }, [correo]);

  useEffect(() => {
    setPhoneError(telefono ? (validatePhoneFields(telefono) ? null : 'ⓘ El número no es válido') : null);
  }, [telefono]);

  useEffect(() => {
    setPasswordChecklist(validatePasswordChecklist(contraseña).checklist);
    setPasswordValid(contraseña ? validatePasswordChecklist(contraseña).valido : false);
  }, [contraseña]);

  useEffect(() => {
    if (confirmPassword && contraseña) {
      setConfirmPasswordError(validateConfirmPasswordFields(contraseña, confirmPassword).valido ? null : validateConfirmPasswordFields(contraseña, confirmPassword).error);
    } else {
      setConfirmPasswordError(null);
    }
  }, [confirmPassword, contraseña]);

  const isFormValid = useMemo(() => {
    const confirmPasswordIsValid = confirmPassword && contraseña ? validateConfirmPasswordFields(contraseña, confirmPassword).valido : false;

    return (
      nombre.trim().length > 0 &&
      (correo ? validateEmailFields(correo).valido : false) &&
      (telefono ? validatePhoneFields(telefono) : true) &&
      (contraseña ? validatePasswordChecklist(contraseña).valido : false) &&
      confirmPasswordIsValid
    );
  }, [nombre, correo, contraseña, telefono, confirmPassword]);

  return { emailError, phoneError, passwordChecklist, passwordValid, confirmPasswordError, isFormValid };
};
