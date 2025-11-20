import express from 'express';
import cors from 'cors';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import mascotaRoutes from './src/routes/mascotaRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/usuarios', usuarioRoutes);
app.use('/mascotas', mascotaRoutes);

app.listen(4000, () => console.log('✅ Servidor corriendo en https://pocketvet-db.onrender.com'));