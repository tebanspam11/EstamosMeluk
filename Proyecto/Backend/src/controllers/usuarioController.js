import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
};

export const editarUsuario = async (req, res) => {
    const { userId } = req.user; // Del token JWT
    const { nombre, telefono } = req.body;

    const usuarioActualizado = await prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(nombre && { nombre }),
        ...(telefono && { telefono }),
      },
      select: {
        id: true,
        nombre: true,
        correo: true,
        telefono: true,
        cuenta_google: true,
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
