import express from 'express';
import { crearRegistroCarnet, obtenerRegistrosPorMascota, actualizarRegistroCarnet, eliminarRegistroCarnet } from '../controllers/carnetController.js';

const router = express.Router();

router.post('/', crearRegistroCarnet);
router.get('/mascota/:id_mascota', obtenerRegistrosPorMascota);
router.put('/:id', actualizarRegistroCarnet);
router.delete('/:id', eliminarRegistroCarnet);

export default router;
