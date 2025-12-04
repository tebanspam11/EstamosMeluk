import express from 'express';
import { crearRegistroCarnet, obtenerRegistrosPorMascota, actualizarRegistroCarnet, eliminarRegistroCarnet } from '../controllers/carnetController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verificarToken, crearRegistroCarnet);
router.get('/mascota/:id_mascota', verificarToken, obtenerRegistrosPorMascota);
router.put('/:id', verificarToken, actualizarRegistroCarnet);
router.delete('/:id', verificarToken, eliminarRegistroCarnet);

export default router;
