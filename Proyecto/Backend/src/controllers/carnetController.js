import prisma from '../../prisma/client.js';

export const crearRegistroCarnet = async (request, response) => {

    const { id_mascota, tipo_medicamento, nombre_medicamento, fecha_aplicacion, laboratorio, id_lote,
      mes_elaboracion_medicamento,
      ano_elaboracion_medicamento,
      mes_vencimiento_medicamento,
      ano_vencimiento_medicamento,
      peso,
      nombre_veterinaria,
      telefono_veterinaria,
      direccion_veterinaria,
      proxima_dosis,
      observaciones,
    } = request.body;

    await prisma.carnet_Digital.create({ data: { id_mascota: parseInt(id_mascota),
      tipo_medicamento,
      nombre_medicamento,
      fecha_aplicacion: new Date(fecha_aplicacion),
      laboratorio,
      id_lote,
      mes_elaboracion_medicamento: mes_elaboracion_medicamento ? parseInt(mes_elaboracion_medicamento) : null,
      ano_elaboracion_medicamento: ano_elaboracion_medicamento ? parseInt(ano_elaboracion_medicamento) : null,
      mes_vencimiento_medicamento: parseInt(mes_vencimiento_medicamento),
      ano_vencimiento_medicamento: parseInt(ano_vencimiento_medicamento),
      peso: parseFloat(peso),
      nombre_veterinaria,
      telefono_veterinaria,
      direccion_veterinaria,
      proxima_dosis: proxima_dosis ? new Date(proxima_dosis) : null,
      observaciones,
      },
    });

    response.json({ ok: true });
};

export const obtenerRegistrosPorMascota = async (request, response) => {

    const { id_mascota } = request.params;

    const registroMascota = await prisma.carnet_Digital.findMany({ where: { id_mascota: parseInt(id_mascota) }, orderBy: { fecha_aplicacion: 'desc' } });

    response.json(registroMascota);
};

export const actualizarRegistroCarnet = async (request, response) => {

    const { id } = request.params;

    const {tipo_medicamento, nombre_medicamento, fecha_aplicacion, laboratorio, id_lote,
      mes_elaboracion_medicamento,
      ano_elaboracion_medicamento,
      mes_vencimiento_medicamento,
      ano_vencimiento_medicamento,
      peso,
      nombre_veterinaria,
      telefono_veterinaria,
      direccion_veterinaria,
      proxima_dosis,
      observaciones,
    } = request.body;

    await prisma.carnet_Digital.update({ where: { id: parseInt(id) },
      data: { tipo_medicamento, nombre_medicamento, fecha_aplicacion: new Date(fecha_aplicacion),
        laboratorio,
        id_lote,
        mes_elaboracion_medicamento: mes_elaboracion_medicamento ? parseInt(mes_elaboracion_medicamento) : null,
        ano_elaboracion_medicamento: ano_elaboracion_medicamento ? parseInt(ano_elaboracion_medicamento) : null,
        mes_vencimiento_medicamento: parseInt(mes_vencimiento_medicamento),
        ano_vencimiento_medicamento: parseInt(ano_vencimiento_medicamento),
        peso: peso ? parseFloat(peso) : undefined,
        nombre_veterinaria,
        telefono_veterinaria,
        direccion_veterinaria,
        proxima_dosis: proxima_dosis ? new Date(proxima_dosis) : null,
        observaciones,
      },
    });

    response.json({ ok: true });
};

export const eliminarRegistroCarnet = async (request, response) => {

    const { id } = request.params;

    await prisma.carnet_Digital.delete({where: { id: parseInt(id) }});

    response.json({ ok: true });
};
