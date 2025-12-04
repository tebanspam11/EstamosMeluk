import prisma from '../../prisma/client.js';

export const obtenerMascotas = async (request, response) => {
  
  const { userId } = request.user;

  const mascotas = await prisma.mascota.findMany({where: { id_usuario: userId }, orderBy: { created_at: 'desc' }});

  response.status(201).json(mascotas);
};

export const crearMascota = async (req, res) => {

  const { userId } = req.user;
  
  const datosNuevaMascota = req.body;

  const nuevaMascota = await prisma.mascota.create({data: { ...datosNuevaMascota, id_usuario: userId }});

  res.status(201).json({ message: 'Tu mascota ha sido creada exitosamente', nuevaMascota });
};

export const editarMascota = async (req, res) => {

  const { mascotaId } = req.params;

  const datosMascotaActualizada = req.body;
  
  const mascotaActualizada = await prisma.mascota.update({where: { id: parseInt(mascotaId) }, data: datosMascotaActualizada});

  res.status(201).json({ message: 'Tu mascota ha sido actualizada exitosamente', mascotaActualizada });
};

export const eliminarMascota = async (req, res) => {
    
    const { mascotaId } = req.params;

    await prisma.evento.deleteMany({where: { id_mascota: parseInt(mascotaId) }});

    await prisma.documento_Mascota.deleteMany({where: { id_mascota: parseInt(mascotaId) }});

    await prisma.carnet_Digital.deleteMany({where: { id_mascota: parseInt(mascotaId) }});

    await prisma.mascota.delete({where: { id: parseInt(mascotaId) }});

    res.status(201).json({ message: 'Tu mascota ha sido eliminada exitosamente' });
};
