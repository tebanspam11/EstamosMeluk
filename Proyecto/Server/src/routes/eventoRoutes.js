import express from 'express';
import { crearEvento, obtenerEventos, editarEvento, eliminarEvento } from '../controllers/eventoController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', verificarToken, crearEvento);
router.get('/', verificarToken, obtenerEventos);
router.put('/:id', verificarToken, editarEvento);
router.delete('/:id', verificarToken, eliminarEvento);

export default router;
