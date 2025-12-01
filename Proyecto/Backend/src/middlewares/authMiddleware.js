import jwt from "jsonwebtoken";
import prisma from "../../prisma/client.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(401).json({ error: "No se envió token" });

    const token = authHeader.split(" ")[1]; 

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.usuario.findUnique({where: { id: decoded.id_usuario }});

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    req.user = user;

    next();

  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Sesion cerrada" });
  }
};
