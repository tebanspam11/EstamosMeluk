import prisma from '../../prisma/client.js';

const uploadDocumentoUsuario = async (req, res) => {
  try {
    const { id } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no encontrado' });
    }

    const documento = await prisma.documento_Mascota.create({
      data: {
        filename: req.file.filename,
        userId: parseInt(id),
      },
    });

    res.status(200).json({ message: 'PDF subido correctamente', documento });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al subir el PDF' });
  }
};

module.exports = { uploadDocumentoUsuario };
