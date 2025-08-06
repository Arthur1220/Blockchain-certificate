import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  // 1. Lê o token do cookie chamado 'accessToken'
  const token = req.cookies.accessToken;

  if (!token) {
    // Se não houver token, o acesso é negado.
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // 2. Verifica se o token é válido usando o segredo do Access Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Anexa os dados do usuário (id, username, role) à requisição
    req.user = decoded;
    next(); // Permite que a requisição continue para o controlador
  } catch (error) {
    // Adicionamos uma verificação específica para o erro de token expirado.
    // Isso será MUITO útil para o frontend.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Not authorized, token expired',
        error_code: 'TOKEN_EXPIRED' // Um código para o frontend identificar o erro
      });
    }

    // Para outros erros de token (ex: malformado)
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};