import express from 'express';
import cors from 'cors';
import mascotaRoutes from './src/routes/mascotaRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use('/mascotas', mascotaRoutes);

app.listen(4000, () => console.log('✅ Servidor corriendo en https://pocketvet-db.onrender.com'));