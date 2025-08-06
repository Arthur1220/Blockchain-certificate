import { ZodError } from 'zod';

// Este middleware recebe um esquema Zod e o usa para validar a requisição
export const validate = (schema) => (req, res, next) => {
  try {
    // Tenta validar o corpo da requisição com o schema fornecido
    schema.parse(req.body);
    // Se a validação for bem-sucedida, passa para o próximo middleware (o controlador)
    next();
  } catch (error) {
    // Se um erro for capturado, primeiro verificamos se é um erro do Zod
    if (error instanceof ZodError) {
      // Se for, formatamos as mensagens de erro e retornamos uma resposta 400
      const validationErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors,
      });
    }
    // Se for qualquer outro tipo de erro, passamos para o nosso tratador de erros global
    next(error);
  }
};