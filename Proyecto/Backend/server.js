import express from 'express';
import cors from 'cors';
import mascotaRoutes from './src/routes/mascotaRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/mascotas', mascotaRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Servidor corriendo en puerto ${PORT}`));
