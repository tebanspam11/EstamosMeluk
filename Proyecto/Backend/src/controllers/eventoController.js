import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const crearEvento = async (req, res) => {
    const { userId } = req.user; // Del token JWT
    const { id_mascota, titulo, descripcion, fecha_inicio, fecha_fin, estado, repeticion } = req.body;

    const mascota = await prisma.mascota.findFirst({where: {id: id_mascota, id_usuario: userId}});

    if (!mascota) return res.status(404).json({ message: 'Mascota no encontrada o no pertenece al usuario' });

    const nuevoEvento = await prisma.evento.create({
      data: {
        id_mascota,
        titulo,
        descripcion,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        estado: estado || 'pendiente',
        repeticion
      }
    });

    res.status(201).json(nuevoEvento);
};

export const obtenerEventos = async (req, res) => {
    const { userId } = req.user; // Del token JWT

    const eventos = await prisma.evento.findMany({
      where: {
        mascota: {
          id_usuario: userId
        }
      },
      include: {
        mascota: {
          select: {
            id: true,
            nombre: true,
            especie: true,
            foto: true
          }
        }
      },
      orderBy: {
        fecha_inicio: 'asc'
      }
    });

    res.json(eventos);
};

export const editarEvento = async (req, res) => {
    const { userId } = req.user; // Del token JWT
    const { id } = req.params;
    const { titulo, descripcion, fecha_inicio, fecha_fin, estado, repeticion } = req.body;

    const evento = await prisma.evento.findFirst({where: {id: parseInt(id), mascota: {id_usuario: userId}}});

    if (!evento) return res.status(404).json({ message: 'Evento no encontrado o no pertenece al usuario' });

    const eventoActualizado = await prisma.evento.update({
      where: { id: parseInt(id) },
      data: {
        ...(titulo && { titulo }),
        ...(descripcion && { descripcion }),
        ...(fecha_inicio && { fecha_inicio: new Date(fecha_inicio) }),
        ...(fecha_fin && { fecha_fin: new Date(fecha_fin) }),
        ...(estado && { estado }),
        ...(repeticion && { repeticion })
      }
    });

    res.json(eventoActualizado);
};

export const eliminarEvento = async (req, res) => {
    const { userId } = req.user; // Del token JWT
    const { id } = req.params;

    const evento = await prisma.evento.findFirst({where: {id: parseInt(id), mascota: {id_usuario: userId}}});

    if (!evento) return res.status(404).json({ message: 'Evento no encontrado o no pertenece al usuario' });

    await prisma.notificacion.deleteMany({where: { id_evento: parseInt(id) }});

    await prisma.evento.delete({where: { id: parseInt(id) }});

    res.json({ message: 'Evento eliminado correctamente' });
};
