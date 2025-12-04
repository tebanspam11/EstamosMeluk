import prisma from '../../prisma/client.js';

export const crearEvento = async (req, res) => {
  const { id_mascota, titulo, descripcion, fecha_inicio, fecha_fin, estado, repeticion } = req.body;

  const nuevoEvento = await prisma.evento.create({
    data: { id_mascota, titulo, descripcion, fecha_inicio: new Date(fecha_inicio), fecha_fin: fecha_fin ? new Date(fecha_fin) : null, estado: estado || 'pendiente', repeticion },
  });

  res.status(201).json({ message: 'Tu evento ha sido creado correctamente', nuevoEvento });
};

export const obtenerEventos = async (req, res) => {
  const { userId } = req.user;

  const eventosMascota = await prisma.evento.findMany({
    where: { mascota: { id_usuario: userId } },
    include: { mascota: { select: { id: true, nombre: true, especie: true, foto: true } } },
    orderBy: { fecha_inicio: 'asc' },
  });

  res.status(201).json(eventosMascota);
};

export const editarEvento = async (req, res) => {
  const { id } = req.params;

  const { titulo, descripcion, fecha_inicio, fecha_fin, estado, repeticion } = req.body;

  const eventoActualizado = await prisma.evento.update({
    where: { id: parseInt(id) },
    data: {
      ...(titulo && { titulo }),
      ...(descripcion && { descripcion }),
      ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
      ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
      ...(estado && { estado }),
      ...(repeticion && { repeticion }),
    },
  });

  res.status(201).json({ message: 'Tu evento ha sido actualizado correctamente', eventoActualizado });
};

export const eliminarEvento = async (req, res) => {
  const { id } = req.params;

  await prisma.notificacion.deleteMany({ where: { id_evento: parseInt(id) } });

  await prisma.evento.delete({ where: { id: parseInt(id) } });

  res.status(201).json({ message: 'El evento ha sido eliminado correctamente' });
};
