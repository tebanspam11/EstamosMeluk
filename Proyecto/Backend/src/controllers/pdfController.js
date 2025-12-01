const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const uploadDocumentoUsuario = async (req, res) => {
  try {
    const { id } = req.body; // id del usuario

    if (!req.file) {
      return res.status(400).json({ error: 'Archivo no encontrado' });
    }

    // Crear registro en la tabla DocumentoUsuario
    const documento = await prisma.documentoUsuario.create({
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
