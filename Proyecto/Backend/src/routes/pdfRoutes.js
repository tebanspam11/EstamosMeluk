import express from "express";
const router = express.Router();

import uploadPdf from "../middlewares/multerPdf.js";
import { uploadDocumentoUsuario } from "../controllers/pdfController.js";

router.post('/uploads', uploadPdf.single('file'), uploadDocumentoUsuario);

export default router;
