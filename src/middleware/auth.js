const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT
 * Verifica se o token está presente no header Authorization: Bearer <token>
 * e se é válido. Adiciona o userId no req.userId para uso nas rotas.
 */
function autenticarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.userId; // ID do usuário logado
    next();
  } catch (error) {
    return res.status(403).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticarToken;
