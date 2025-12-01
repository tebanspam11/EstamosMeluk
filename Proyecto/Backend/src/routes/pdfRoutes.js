import express from 'express';
import { uploadPdf } from '../middlewares/multerPdf.js';
import { uploadDocumentoMascota } from '../controllers/pdfController.js';

const router = express.Router();
router.post('/uploads', uploadPdf.single('file'), uploadDocumentoMascota);
export default router;
