import express from 'express';
import { obtenerUsuario, editarUsuario, eliminarUsuario } from '../controllers/usuarioController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/perfil', verificarToken, obtenerUsuario);
router.put('/perfil', verificarToken, editarUsuario);
router.delete('/perfil', verificarToken, eliminarUsuario);

export default router;
