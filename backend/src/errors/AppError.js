class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Para diferenciar erros de negócio de erros de programação

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;