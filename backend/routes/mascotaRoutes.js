import express from "express";
import {
  obtenerMascotas,
  crearMascota,
} from "../controllers/mascotaController.js";

const router = express.Router();

router.get("/", obtenerMascotas);
router.post("/", crearMascota);

export default router;
