import express from 'express';
import { obtenerMascotas, crearMascota, editarMascota, eliminarMascota } from '../controllers/mascotaController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verificarToken, obtenerMascotas);
router.post('/', verificarToken, crearMascota);
router.put('/:id\\', verificarToken, editarMascota);
router.delete('/:id', verificarToken, eliminarMascota);

export default router;
