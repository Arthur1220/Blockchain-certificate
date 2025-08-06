import { Prisma } from '@prisma/client';
import config from '../config/index.js';

export const errorHandler = (err, req, res, next) => {
  if (config.env !== 'test') {
    console.error(err.stack);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // PRIMEIRO, checa se é um erro específico do Prisma (P2025 = Not Found)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found.';
  }

  // Envia a resposta com os valores corretos
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};