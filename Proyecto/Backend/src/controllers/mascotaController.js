import prisma from '../../prisma/client.ts';

export const obtenerMascotas = async (req, res) => {
  const mascotas = await prisma.mascota.findMany({
    include: { usuario: true },
  });

  if (!mascotas || mascotas.length === 0) {
    res.status(404).json({ mensaje: 'No hay mascotas registradas' });
    return;
  }

  res.json(mascotas);
};

export const crearMascota = async (req, res) => {
  const datos = req.body;

  if (!datos.nombre) {
    res.status(400).json({ error: 'Faltan datos obligatorios (nombre)' });
    return;
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: datos.id_usuario },
  });

  if (!usuario) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const nueva = await prisma.mascota.create({ data: datos });
  res.status(201).json(nueva);
};
