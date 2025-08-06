import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string({ required_error: 'Course name is required' }),
  description: z.string().optional(),
  workload: z.number({ required_error: 'Workload is required' }).positive(),
});

export const updateCourseSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  workload: z.number().positive().optional(),
});

export default {
  createCourseSchema,
  updateCourseSchema,
};