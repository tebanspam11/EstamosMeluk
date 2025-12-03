const express = require('express');
const { obtenerMascotas, crearMascota } = require('../controllers/mascotaController');

const router = express.Router();

router.get('/', obtenerMascotas);
router.post('/', crearMascota);

module.exports = router;
