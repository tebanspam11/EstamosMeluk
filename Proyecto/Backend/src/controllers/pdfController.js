import prisma from '../../prisma/client.js';

export const uploadDocumentoUsuario = async (req, res) => {
  const { id_mascota, tipo, titulo, descripcion } = req.body;

  if (!req.file) return res.status(400).json({ error: 'Archivo no encontrado' });

  const mascota = await prisma.mascota.findUnique({where: { id: parseInt(id_mascota) }});

  if (!mascota) return res.status(404).json({ ok: false, message: 'Mascota no encontrada' });

  const documento = await prisma.documento_Mascota.create({
    data: {
      id_mascota: parseInt(id_mascota),
      tipo, 
      titulo, 
      filename: req.file.filename, 
      descripcion: descripcion || null,
    },
  });

  res.status(201).json({ message: 'PDF subido correctamente', documento });
};

