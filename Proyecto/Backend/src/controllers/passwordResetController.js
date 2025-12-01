import prisma from '../../prisma/client.js';
import bcrypt from 'bcryptjs';
import { sendPasswordResetCode, sendPasswordChangedNotification } from '../services/emailService.js';

const resetCodes = new Map();

export const requestPasswordReset = async (req, res) => {
  const { correo } = req.body;

  if (!correo) return res.status(400).json({ error: '⚠ El correo es requerido' });

  const user = await prisma.usuario.findUnique({ where: { correo } });

  if (!user) return res.status(404).json({ error: '⚠ No existe una cuenta con este correo' });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

  resetCodes.set(correo, {
    code,
    expiresAt,
    attempts: 0,
    verified: false
  });

  const emailResult = await sendPasswordResetCode(correo, code);
  
  if (!emailResult.success) {
    console.error('⚠ Error al enviar email:', emailResult.error);
    return res.status(500).json({ error: '⚠No se pudo enviar el email. Intenta de nuevo' });
  }

  // En desarrollo, mostrar el código en consola
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔐 Código para ${correo}: ${code}`);
  }

  return res.json({
    ok: true,
    message: 'Código enviado al correo electrónico',
    devCode: process.env.NODE_ENV === 'development' ? code : undefined
  });
};

export const verifyResetCode = async (req, res) => {
  const { correo, code } = req.body;

  if (!code) return res.status(400).json({ error: '⚠ Un codigo es requerido' });

  const resetData = resetCodes.get(correo);

  if (Date.now() > resetData.expiresAt) {
    resetCodes.delete(correo);
    return res.status(400).json({ error: '⚠ El código ha expirado. Solicita uno nuevo' });
  }

  if (resetData.code !== code) {

    resetData.attempts++;
    
    if (resetData.attempts >= 3) {
      resetCodes.delete(correo);
      return res.status(400).json({ error: '⚠Demasiados intentos. Solicita un nuevo código' });
    }
    
    return res.status(400).json({ error: '⚠ Código incorrecto', attemptsLeft: 3 - resetData.attempts});
  }

  resetData.verified = true;
  return res.json({ ok: true, message: 'Código verificado correctamente' });
};

export const resetPassword = async (req, res) => {
  const { correo, nuevaContraseña } = req.body;

  if (!nuevaContraseña) return res.status(400).json({ error: '⚠ Nueva contraseña es requerida' });

  const resetData = resetCodes.get(correo);
  const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);
  await prisma.usuario.update({where: { correo }, data: { contraseña: hashedPassword }});

  resetCodes.delete(correo);
  await sendPasswordChangedNotification(correo);

  return res.json({ ok: true, message: 'Contraseña actualizada correctamente' });
};
