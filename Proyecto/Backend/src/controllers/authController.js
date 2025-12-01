import prisma from '../../prisma/client.js';
import bcrypt from 'bcryptjs';

export const login = async (req, res) => {
  const { correo, telefono, contraseña } = req.body;

  const user = await prisma.usuario.findFirst({where: { OR: [{ correo }, { telefono }] }});

  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const match = await bcrypt.compare(contraseña, user.contraseña);

  if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

  return res.json({ ok: true, userId: user.id });
};

export const register = async (req, res) => {
  const { nombre, correo, telefono, contraseña } = req.body;

  if (!nombre || !contraseña || !correo) {
    return res.status(400).json({ ok: false, message: 'Los campos son obligatorios' });
  }

  let existingPhone = null;
  if (telefono) {
    existingPhone = await prisma.usuario.findUnique({ where: { telefono } });
  }
  existingEmail = await prisma.usuario.findUnique({ where: { correo } });

  if (existingEmail)
    return res.status(400).json({ ok: false, message: 'Este correo ya está registrado' });
  if (existingPhone)
    return res.status(400).json({ ok: false, message: 'Este telefono ya está registrado' });

  const hashedPassword = await bcrypt.hash(contraseña, 10);

  const newUser = await prisma.usuario.create({
    data: { 
      nombre, 
      correo, 
      ...(telefono && { telefono }), 
      contraseña: hashedPassword },
  });

  return res.json({
    ok: true,
    message: 'Usuario registrado correctamente',
    usuario: {
      id: newUser.id,
      nombre: newUser.nombre,
      correo: newUser.correo,
      telefono: newUser.telefono || null,
    },
  });
};
