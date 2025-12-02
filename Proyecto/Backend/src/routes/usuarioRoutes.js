import express from 'express';
import { crearUsuario, obtenerUsuario, editarUsuario, eliminarUsuario } from '../controllers/usuarioController.js';
import { verificarToken } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/', crearUsuario);     
router.get('/', verificarToken, obtenerUsuario);      
router.put('/', verificarToken, editarUsuario);       
router.delete('/', verificarToken, eliminarUsuario);  

export default router;
