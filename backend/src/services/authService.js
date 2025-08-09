import prisma from '../config/prismaClient.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import AppError from '../errors/AppError.js';

// Função para buscar o usuário e checar se ele ainda existe/está ativo
async function validateUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    throw new AppError('User not found or is not active.', 401);
  }
  return user;
}

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('Invalid credentials.', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials.', 401);
  }

  // Payload consistente para o Access Token
  const accessTokenPayload = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  // Payload para o Refresh Token (apenas o necessário)
  const refreshTokenPayload = {
    id: user.id,
  };

  const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {
    expiresIn: config.jwt.accessExpiresIn,
  });
  const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: config.jwt.refreshExpiresIn,
  });

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    
    // Valida se o usuário do token ainda existe antes de emitir um novo token
    const user = await validateUser(decoded.id);

    // Usa o mesmo payload consistente do login
    const accessTokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };
    
    const accessToken = jwt.sign(accessTokenPayload, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    return accessToken;

  } catch (error) {
    if (error.statusCode === 401) throw new AppError('User not found or is not active.', 401); // Repassa o erro de usuário não encontrado

    throw new AppError('Invalid or expired refresh token.', 403);
  }
};