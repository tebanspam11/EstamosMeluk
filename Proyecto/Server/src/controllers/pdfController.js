import prisma from '../../prisma/client.js';

export const uploadDocumentoMascota = async (request, response) => {
  const { id_mascota, tipo, titulo, descripcion } = request.body;

  if (!request.file) return response.status(400).json({ error: '⚠︎ Archivo no encontrado' });
  const documento = await prisma.documento_Mascota.create({
    data: {
      id_mascota: parseInt(id_mascota),
      tipo: tipo || 'documento',
      titulo: titulo || request.file.originalname,
      descripcion: descripcion || '',
      archivo_pdf: request.file.filename,
    },
  });

  response.status(200).json({ message: 'PDF de mascota subido correctamente', documento });
};

export const obtenerDocumentosPorMascota = async (request, response) => {
  const { id_mascota } = request.params;
  const documentos = await prisma.documento_Mascota.findMany({
    where: { id_mascota: parseInt(id_mascota) },
    orderBy: { uploadedAt: 'desc' },
  });

  response.status(200).json(documentos);
};

export const eliminarDocumento = async (request, response) => {
  const { id } = request.params;
  await prisma.documento_Mascota.delete({ where: { id: parseInt(id) } });

  response.status(200).json({ message: 'Documento eliminado correctamente' });
};
