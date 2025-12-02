import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const crearRegistroCarnet = async (req, res) => {
    const {
      id_mascota,
      tipo_medicamento,
      nombre_medicamento,
      fecha_aplicacion,
      laboratorio,
      id_lote,
      fecha_elaboracion,
      fecha_vencimiento,
      peso,
      nombre_veterinaria,
      telefono_veterinaria,
      direccion_veterinaria,
      proxima_dosis,
      observaciones,
    } = req.body;   

    const registro = await prisma.carnet_Digital.create({
      data: {
        id_mascota: parseInt(id_mascota),
        tipo_medicamento,
        nombre_medicamento,
        fecha_aplicacion: new Date(fecha_aplicacion),
        laboratorio: laboratorio || null,
        id_lote,
        fecha_elaboracion: fecha_elaboracion ? new Date(fecha_elaboracion) : null,
        fecha_vencimiento: new Date(fecha_vencimiento),
        peso: parseFloat(peso),
        nombre_veterinaria,
        telefono_veterinaria: telefono_veterinaria || null,
        direccion_veterinaria,
        proxima_dosis: proxima_dosis ? new Date(proxima_dosis) : null,
        observaciones: observaciones || null,
      },
    });

    res.status(201).json({ message: 'Registro de carnet creado exitosamente', registro });
};

export const obtenerRegistrosPorMascota = async (req, res) => {

    const { id_mascota } = req.params;

    const registros = await prisma.carnet_Digital.findMany({where: { id_mascota: parseInt(id_mascota) }, orderBy: { fecha_aplicacion: 'desc' }});

    res.status(200).json(registros);
};

export const actualizarRegistroCarnet = async (req, res) => {
    const { id } = req.params;
    const {
      tipo_medicamento,
      nombre_medicamento,
      fecha_aplicacion,
      laboratorio,
      id_lote,
      fecha_elaboracion,
      fecha_vencimiento,
      peso,
      nombre_veterinaria,
      telefono_veterinaria,
      direccion_veterinaria,
      proxima_dosis,
      observaciones,
    } = req.body;

    const registro = await prisma.carnet_Digital.update({
      where: { id: parseInt(id) },
      data: {
        tipo_medicamento,
        nombre_medicamento,
        fecha_aplicacion: fecha_aplicacion ? new Date(fecha_aplicacion) : undefined,
        laboratorio,
        id_lote,
        fecha_elaboracion: fecha_elaboracion ? new Date(fecha_elaboracion) : null,
        fecha_vencimiento: fecha_vencimiento ? new Date(fecha_vencimiento) : undefined,
        peso: peso ? parseFloat(peso) : undefined,
        nombre_veterinaria,
        telefono_veterinaria,
        direccion_veterinaria,
        proxima_dosis: proxima_dosis ? new Date(proxima_dosis) : null,
        observaciones,
      },
    });

    res.status(200).json({ message: 'Registro actualizado exitosamente', registro });
};

export const eliminarRegistroCarnet = async (req, res) => {
    const { id } = req.params;

    await prisma.carnet_Digital.delete({where: { id: parseInt(id) }});

    res.status(200).json({ message: 'Registro eliminado exitosamente' });
};
