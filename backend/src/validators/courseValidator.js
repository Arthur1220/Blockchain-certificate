import { z } from 'zod';

const courseParamsSchema = z.object({
  params: z.object({
    institutionId: z.string().cuid({ message: 'Invalid institution ID format' }),
    courseId: z.string().cuid({ message: 'Invalid course ID format' }),
  }),
});

export const createCourseSchema = z.object({
  params: courseParamsSchema.shape.params.pick({ institutionId: true }),
  body: z.object({
    name: z.string({ required_error: 'Course name is required' }),
    description: z.string().optional(),
    workload: z.number({ required_error: 'Workload is required' }).positive(),
  }),
});

export const updateCourseSchema = z.object({
  params: courseParamsSchema.shape.params,
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    workload: z.number().positive().optional(),
  }),
});

export default {
  courseParamsSchema,
  createCourseSchema,
  updateCourseSchema,
};