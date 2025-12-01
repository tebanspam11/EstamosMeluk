
import multer from 'multer';
import fs from 'fs';

const uploadPath = 'uploads/mascotas';
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

export const uploadPdf = multer({ storage });
