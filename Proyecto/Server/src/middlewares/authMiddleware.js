import jwt from 'jsonwebtoken';

export const verificarToken = async (request, response, next) => {
  const token = request.headers.authorization.split(' ')[1];

  if (!token) return response.status(401).json({ error: '⚠︎ No se envió token' });

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  request.user = { userId: decoded.id_usuario };

  next();
};
