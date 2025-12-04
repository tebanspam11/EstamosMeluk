import prisma from '../../prisma/client.js';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '../services/emailService.js';

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
      contraseña: hashedPassword,
    },
  });

  sendWelcomeEmail(correo, nombre);

  return res.json({ ok: true, id: newUser.id, nombre: newUser.nombre, correo: newUser.correo, telefono: newUser.telefono || null });
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
      foto: true,
      cuenta_google: true,
      created_at: true,
    },
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
    const usuario = await prisma.usuario.findUnique({ where: { id: userId }, select: { contraseña: true } });

    const match = await bcrypt.compare(contraseñaActual, usuario.contraseña);
    if (!match) return res.status(401).json({ error: '⚠︎ Contraseña actual incorrecta' });

    const hashedPassword = await bcrypt.hash(contraseñaNueva, 10);
    updateData.contraseña = hashedPassword;
  }

  // Si el usuario intenta cambiar el teléfono, verificar unicidad
  if (telefono !== undefined && telefono !== null && telefono !== '') {
    const existing = await prisma.usuario.findUnique({ where: { telefono } });
    if (existing && existing.id !== userId) {
      return res.status(400).json({ error: '⚠︎ El teléfono ya está en uso por otro usuario' });
    }
  }

  try {
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
      },
    });

    res.json(usuarioActualizado);
  } catch (err) {
    // Manejar error de constraint único por si acaso
    if (err?.code === 'P2002') {
      return res.status(400).json({ error: '⚠︎ Valor duplicado que viola una restricción única' });
    }
    console.error('Error updating user:', err);
    return res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
  const { userId } = req.user; // Del token JWT

  try {
    const mascotas = await prisma.mascota.findMany({ where: { id_usuario: userId }, select: { id: true } });
    const mascotaIds = mascotas.map((m) => m.id);

    if (mascotaIds.length > 0) {
      const eventos = await prisma.evento.findMany({ where: { id_mascota: { in: mascotaIds } }, select: { id: true } });
      const eventoIds = eventos.map((e) => e.id);

      if (eventoIds.length > 0) {
        await prisma.notificacion.deleteMany({ where: { id_evento: { in: eventoIds } } });
      }

      await prisma.evento.deleteMany({ where: { id_mascota: { in: mascotaIds } } });

      await prisma.documento_Mascota.deleteMany({ where: { id_mascota: { in: mascotaIds } } });
      await prisma.carnet_Digital.deleteMany({ where: { id_mascota: { in: mascotaIds } } });
    }

    await prisma.notificacion.deleteMany({ where: { id_usuario: userId } });

    await prisma.mascota.deleteMany({ where: { id_usuario: userId } });
    await prisma.usuario.delete({ where: { id: userId } });

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error eliminando usuario y dependencias:', err);
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
