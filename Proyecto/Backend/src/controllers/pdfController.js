import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const uploadDocumentoMascota = async (req, res) => {
  const { id_mascota, tipo, titulo, descripcion } = req.body;

  if (!req.file) return res.status(400).json({ error: '⚠︎ Archivo no encontrado' });

  const documento = await prisma.documento_Mascota.create({
    data: {
      id_mascota: parseInt(id_mascota),
      tipo: tipo || 'documento',
      titulo: titulo || req.file.originalname,
      descripcion: descripcion || '',
      archivo_pdf: req.file.filename, 
    },
  });

  res.status(200).json({ message: 'PDF de mascota subido correctamente', documento });
};
