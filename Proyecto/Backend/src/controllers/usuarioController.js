import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../services/emailService.js';

const prisma = new PrismaClient();

export const crearUsuario = async (req, res) => {
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

  sendWelcomeEmail(correo, nombre);

  return res.json({ok: true, id: newUser.id, nombre: newUser.nombre, correo: newUser.correo, telefono: newUser.telefono || null,});
};

export const obtenerUsuario = async (req, res) => {
    const { userId } = req.user; // Del token JWT

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        correo: true,
        telefono: true,
        cuenta_google: true,
      }
    });

    res.json(usuario);
};

export const editarUsuario = async (req, res) => {
    const { userId } = req.user; // Del token JWT
    const { nombre, telefono, foto, contraseñaActual, contraseñaNueva } = req.body;

    const updateData = {};

    if (nombre) updateData.nombre = nombre;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (foto !== undefined) updateData.foto = foto;

    if (contraseñaNueva) {
      if (!contraseñaActual) return res.status(400).json({ error: '⚠︎ Debes proporcionar tu contraseña actual' });

      const usuario = await prisma.usuario.findUnique({where: { id: userId }, select: { contraseña: true }});
      
      const match = await bcrypt.compare(contraseñaActual, usuario.contraseña);
      if (!match) return res.status(401).json({ error: '⚠︎ Contraseña actual incorrecta' });

      const hashedPassword = await bcrypt.hash(contraseñaNueva, 10);
      updateData.contraseña = hashedPassword;
    }

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        correo: true,
        telefono: true,
        foto: true,
        cuenta_google: true,
        created_at: true,
      }
    });

    res.json(usuarioActualizado);
};

export const eliminarUsuario = async (req, res) => {
    const { userId } = req.user; // Del token JWT

    await prisma.notificacion.deleteMany({where: { id_usuario: userId }});

    await prisma.mascota.deleteMany({where: { id_usuario: userId }});

    await prisma.usuario.delete({where: { id: userId }});

    res.json({ message: 'Usuario eliminado correctamente' });
};
