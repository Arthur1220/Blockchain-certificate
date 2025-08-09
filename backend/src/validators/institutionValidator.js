import { z } from 'zod';

const idParamSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: 'Invalid institution ID format' }),
  }),
});

export const createInstitutionSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    acronym: z.string({ required_error: 'Acronym is required' }),
    cnpj: z.string({ required_error: 'CNPJ is required' }),
    address: z.object({
      street: z.string({ required_error: 'Street is required' }),
      number: z.string({ required_error: 'Number is required' }),
      postalCode: z.string({ required_error: 'Postal Code is required' }),
      city: z.string({ required_error: 'City is required' }),
      state: z.string({ required_error: 'State is required' }),
    }, { required_error: 'Address information is required' }),
  }),
});

export const updateInstitutionSchema = z.object({
  params: idParamSchema.shape.params,
  body: z.object({
    name: z.string().optional(),
    acronym: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_REVIEW']).optional(),
    address: z.object({
      street: z.string().optional(),
      number: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
    }).optional(),
  }),
});

export default {
  idParamSchema,
  createInstitutionSchema,
  updateInstitutionSchema,
};