import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Crear una mascota
export const crearMascota = async (req, res) => {
  try {
    const { id_usuario, nombre, especie, raza, edad, peso } = req.body;

    if (!id_usuario || !nombre || !especie) {
      return res.status(400).json({ error: 'id_usuario, nombre y especie son obligatorios' });
    }

    const mascota = await prisma.mascota.create({
      data: {
        id_usuario: parseInt(id_usuario),
        nombre,
        especie,
        raza: raza || null,
        edad: edad ? parseInt(edad) : null,
        peso: peso ? parseFloat(peso) : null,
      },
    });

    res.status(201).json(mascota);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear la mascota' });
  }
};
