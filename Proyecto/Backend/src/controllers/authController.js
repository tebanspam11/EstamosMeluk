import prisma from '../../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken";
import { sendWelcomeEmail } from '../services/emailService.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

export const login = async (req, res) => {
  const { identifier, contraseña, keepLogged } = req.body;

  const isEmail = identifier.includes("@");
  const isPhone = /^\d+$/.test(identifier);

  let user = null;
  if (isEmail) {
    user = await prisma.usuario.findFirst({where: { correo: identifier }})
  } else if (isPhone) {
    const allUsers = await prisma.usuario.findMany();
    user = allUsers.find(u => u.telefono && u.telefono.replace(/[\s\-()]/g, '') === identifier);
  }

  if (!user) return res.status(404).json({ error: '⚠︎ Usuario no encontrado' });

  const match = await bcrypt.compare(contraseña, user.contraseña);

  if (!match) return res.status(401).json({ error: '⚠︎ Contraseña incorrecta' });

  const expiresIn = keepLogged ? "3650d" : "30d";

  const token = jwt.sign({id_usuario: user.id}, process.env.JWT_SECRET, {expiresIn});

  return res.json({ ok: true, id: user.id, correo: user.correo, token, keepLogged});
};

export const register = async (req, res) => {
  const { nombre, correo, telefono, contraseña } = req.body;

  let existingPhone = null;
  if (telefono) existingPhone = await prisma.usuario.findUnique({ where: { telefono } });

  const existingEmail = await prisma.usuario.findUnique({ where: { correo } });

  if (existingEmail) return res.status(400).json({ error: '⚠︎ Este correo ya está registrado' });
  if (existingPhone) return res.status(400).json({ error: '⚠︎ Este telefono ya está registrado' });

  const hashedPassword = await bcrypt.hash(contraseña, 10);

  const newUser = await prisma.usuario.create({
    data: { 
      nombre, 
      correo, 
      ...(telefono && { telefono }), 
      contraseña: hashedPassword 
    },
  });

  sendWelcomeEmail(correo, nombre).catch(err => {
    console.error('⚠ No se pudo enviar email de bienvenida:', err);
  });

  return res.json({ok: true, id: newUser.id, nombre: newUser.nombre, correo: newUser.correo, telefono: newUser.telefono || null,});
};

export const googleAuth = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) return res.status(400).json({ ok: false, error: '⚠ Token de Google no proporcionado' });

  const ticket = await googleClient.verifyIdToken({idToken, audience: process.env.GOOGLE_CLIENT_ID});

  const payload = ticket.getPayload();
    
  if (!payload) return res.status(401).json({ ok: false, error: '⚠ Token inválido' });

  const { email, name, sub: googleId } = payload;

  let user = await prisma.usuario.findFirst({where: {OR: [{ correo: email }, { googleId: googleId }]}});

  if (!user) {
    user = await prisma.usuario.create({
      data: {
        nombre: name,
        correo: email,
        googleId: googleId,
        contraseña: '',
      },
    });

  sendWelcomeEmail(email, name);

  } else if (!user.googleId) {
    user = await prisma.usuario.update({where: { id: user.id }, data: { googleId: googleId },});
  }

   const token = jwt.sign({ id_usuario: user.id }, process.env.JWT_SECRET, { expiresIn: "3650d" });

  return res.json({ ok: true, userId: user.id, correo: user.correo, token, keepLogged: true });
};
