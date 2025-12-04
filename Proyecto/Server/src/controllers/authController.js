import prisma from '../../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../services/emailService.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

export const login = async (request, response) => {
  const { identifier, contraseña, keepLogged } = request.body;

  const isEmail = identifier.includes('@');
  const isPhone = /^\d+$/.test(identifier);

  let usuario = null;

  if (isEmail) usuario = await prisma.usuario.findFirst({ where: { correo: identifier } });
  else if (isPhone) {
    const allUsers = await prisma.usuario.findMany();
    usuario = allUsers.find((u) => u.telefono && u.telefono.replace(/[\s\-()]/g, '') === identifier);
  }

  if (!usuario) return response.status(404).json({ ok: false, error: '⚠︎ Usuario no encontrado' });

  const passwordMatches = await bcrypt.compare(contraseña, usuario.contraseña);

  if (!passwordMatches) return response.status(401).json({ ok: false, error: '⚠︎ Contraseña incorrecta' });

  const expiresIn = keepLogged ? '3650d' : '30d';

  const token = jwt.sign({ id_usuario: usuario.id }, process.env.JWT_SECRET, { expiresIn });

  return response.json({ ok: true, userId: usuario.id, token, keepLogged });
};

export const googleAuth = async (request, response) => {
  const { idToken } = request.body;

  if (!idToken) return response.status(400).json({ ok: false, error: '⚠ Token de Google no proporcionado' });

  const ticket = await googleClient.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });

  const payload = ticket.getPayload();

  if (!payload) return response.status(401).json({ ok: false, error: '⚠ Token inválido' });

  const { email, name, sub: googleId } = payload;

  let usuario = await prisma.usuario.findFirst({ where: { OR: [{ correo: email }, { googleId: googleId }] } });

  if (!usuario) {
    usuario = await prisma.usuario.create({ data: { nombre: name, correo: email, googleId: googleId, contraseña: '' } });

    sendWelcomeEmail(email, name);
  } else if (!usuario.googleId) usuario = await prisma.usuario.update({ where: { id: usuario.id }, data: { googleId: googleId } });

  const token = jwt.sign({ id_usuario: usuario.id }, process.env.JWT_SECRET, { expiresIn: '3650d' });

  return response.json({ ok: true, userId: usuario.id, correo: usuario.correo, token, keepLogged: true });
};
