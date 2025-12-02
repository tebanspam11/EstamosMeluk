import jwt from "jsonwebtoken";
import prisma from "../../prisma/client.js";

export const verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No se envió token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { userId: decoded.id_usuario };
    next();

  } catch (err) {
    console.log(err);
    return res.status(401).json({ error: "Sesion cerrada" });
  }
};
