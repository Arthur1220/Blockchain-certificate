// Este middleware será nosso "pegador" de erros geral.
// Não importa onde o erro aconteça, ele vai cair aqui.
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack); // Loga o erro no console para debugging

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
};