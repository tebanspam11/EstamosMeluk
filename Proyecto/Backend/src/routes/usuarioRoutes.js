import express from 'express';
import { obtenerUsuarios, crearUsuario } from '../controllers/usuarioController.js';

const router = express.Router();

router.get('/', obtenerUsuarios);

router.post('/', crearUsuario);

export default router;
