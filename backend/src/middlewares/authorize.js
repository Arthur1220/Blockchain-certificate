// Este middleware verifica se o papel do usuário está na lista de papéis permitidos.
// Ele deve ser usado DEPOIS do middleware 'protect'.
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to perform this action.' });
    }
    next();
  };
};