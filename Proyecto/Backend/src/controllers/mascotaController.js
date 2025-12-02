import prisma from '../../prisma/client.js';

export const obtenerMascotas = async (req, res) => {
  const { userId } = req.user; // Del token JWT

  const mascotas = await prisma.mascota.findMany({where: { id_usuario: userId }, orderBy: { created_at: 'desc' }});

  res.json(mascotas);
};

export const crearMascota = async (req, res) => {
  const { userId } = req.user; // Del token JWT
  const datos = req.body;

  const nueva = await prisma.mascota.create({
    data: {
      ...datos,
      id_usuario: userId
    }
  });

  res.status(201).json(nueva);
};

export const editarMascota = async (req, res) => {
  const { userId } = req.user; // Del token JWT
  const { id } = req.params;
  const datos = req.body;

  const mascota = await prisma.mascota.findFirst({where: {id: parseInt(id), id_usuario: userId}});

  const mascotaActualizada = await prisma.mascota.update({where: { id: parseInt(id) }, data: datos});

  res.json(mascotaActualizada);
};

export const eliminarMascota = async (req, res) => {

    const { userId } = req.user; // Del token JWT
    const { id } = req.params;

    const mascota = await prisma.mascota.findFirst({where: {id: parseInt(id),id_usuario: userId}});

    await prisma.evento.deleteMany({where: { id_mascota: parseInt(id) }});

    await prisma.documento_Mascota.deleteMany({where: { id_mascota: parseInt(id) }});

    await prisma.carnet_Digital.deleteMany({where: { id_mascota: parseInt(id) }});

    await prisma.mascota.delete({where: { id: parseInt(id) }});

    res.json({ message: '⚠︎ Mascota eliminada correctamente' });
};
