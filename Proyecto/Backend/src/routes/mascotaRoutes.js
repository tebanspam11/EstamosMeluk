import express from 'express';
import { crearMascota } from '../controllers/mascotaController.js';

const router = express.Router();

router.post('/', crearMascota);

export default router;
