import config from '../config/index.js'; // Importa nossa configuração central

export const errorHandler = (err, req, res, next) => {
  // Só imprime o erro no console se não estivermos em ambiente de teste
  if (config.env !== 'test') {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};