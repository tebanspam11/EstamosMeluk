import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const obtenerUsuarios = async (req, res) => {
  const usuarios = await prisma.usuario.findMany({
    include: { Mascotas: true },
  });

  if (!usuarios || usuarios.length === 0) {
    res.status(404).json({ mensaje: 'No hay usuarios registrados' });
    return;
  }

  res.json(usuarios);
};

export const crearUsuario = async (req, res) => {
  const datos = req.body;

  if (!datos.correo) {
    res.status(400).json({ error: "Falta el campo 'correo'" });
    return;
  }

  const usuarioExistente = await prisma.usuario.findUnique({
    where: { correo: datos.correo },
  });

  if (usuarioExistente) {
    res.status(409).json({ error: 'El correo ya está registrado' });
    return;
  }

  const nuevo = await prisma.usuario.create({ data: datos });
  res.status(201).json(nuevo);
};
