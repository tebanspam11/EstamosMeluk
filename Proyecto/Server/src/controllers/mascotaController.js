import prisma from '../../prisma/client.js';

export const obtenerMascotas = async (request, response) => {
  const { userId } = request.user;

  const mascotas = await prisma.mascota.findMany({ where: { id_usuario: userId }, orderBy: { created_at: 'desc' } });

  response.status(201).json(mascotas);
};

export const crearMascota = async (req, res) => {
  const { userId } = req.user;

  const datosNuevaMascota = req.body;

  const nuevaMascota = await prisma.mascota.create({ data: { ...datosNuevaMascota, id_usuario: userId } });

  res.status(201).json({ message: 'Tu mascota ha sido creada exitosamente', nuevaMascota });
};

export const editarMascota = async (req, res) => {
  const { id } = req.params;

  const datosMascotaActualizada = req.body;

  const mascotaActualizada = await prisma.mascota.update({ where: { id: parseInt(id) }, data: datosMascotaActualizada });
  res.status(201).json({ message: 'Tu mascota ha sido actualizada exitosamente', mascotaActualizada });
};

export const eliminarMascota = async (req, res) => {
  const { id } = req.params;

  await prisma.evento.deleteMany({ where: { id_mascota: parseInt(id) } });

  await prisma.documento_Mascota.deleteMany({ where: { id_mascota: parseInt(id) } });
  
  await prisma.carnet_Digital.deleteMany({ where: { id_mascota: parseInt(id) } });

  await prisma.mascota.delete({ where: { id: parseInt(id) } });

  res.status(201).json({ message: 'Tu mascota ha sido eliminada exitosamente' });
};
