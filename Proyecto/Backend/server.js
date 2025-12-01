import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./src/routes/authRoutes.js";
import pdfRoutes from "./src/routes/pdfRoutes.js";
import passwordResetRoutes from "./src/routes/passwordResetRoutes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/documentos', pdfRoutes);
app.use('/api/password', passwordResetRoutes);

app.get('/', (req, res) => {
  res.send('API running');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


