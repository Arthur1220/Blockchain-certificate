import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Função para buscar o usuário e checar se ele ainda existe/está ativo
async function validateUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.isActive) {
    const error = new Error('User not found or is not active.');
    error.statusCode = 401;
    throw error;
  }
  return user;
}

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials.');
    error.statusCode = 401;
    throw error;
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
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(refreshTokenPayload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
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
    if (error.statusCode === 401) throw error; // Repassa o erro de usuário não encontrado

    const err = new Error('Invalid or expired refresh token.');
    err.statusCode = 403; // Forbidden
    throw err;
  }
};