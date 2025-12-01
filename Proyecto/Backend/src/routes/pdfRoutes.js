const express = require('express');
const router = express.Router();

const { uploadPdf } = require('../middlewares/multerPdf'); 
const { uploadDocumentoUsuario } = require('../controllers/pdfController'); 

router.post('/uploads', uploadPdf.single('file'), uploadDocumentoUsuario);

module.exports = router; 
