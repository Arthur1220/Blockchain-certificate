import { z } from 'zod';

// Define o esquema de validação para o corpo da requisição de registro
export const registerSchema = z.object({
  username: z.string({ required_error: 'Username is required' }).min(3, 'Username must be at least 3 characters long'),
  email: z.string({ required_error: 'Email is required' }).email('Not a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters long'),
  // userType é opcional, pois o banco de dados já define um valor padrão ('STUDENT')
  userType: z.enum(['STUDENT', 'STAFF', 'ADMIN']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  userType: z.enum(['STUDENT', 'STAFF', 'ADMIN']).optional(),
});

export const updateSchema = z.object({
  username: z.string().min(3).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  userType: z.enum(['STUDENT', 'STAFF', 'ADMIN']).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  isActive: z.boolean().optional(),
  phone: z.string().optional(),
  cpf: z.string().optional(),
  emailInstitutional: z.string().email().optional(),
});

export default {
  registerSchema,
  updateSchema,
};