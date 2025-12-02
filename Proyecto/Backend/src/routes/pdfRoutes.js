import express from 'express';
import { uploadPdf } from '../middlewares/multerPdf.js';
import { uploadDocumentoMascota, obtenerDocumentosPorMascota, eliminarDocumento } from '../controllers/pdfController.js';

const router = express.Router();

router.post('/uploads', uploadPdf.single('file'), uploadDocumentoMascota);
router.get('/mascota/:id_mascota', obtenerDocumentosPorMascota);
router.delete('/:id', eliminarDocumento);

export default router;
