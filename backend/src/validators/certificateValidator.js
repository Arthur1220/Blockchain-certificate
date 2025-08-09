import { z } from 'zod';

export const issueCertificateSchema = z.object({
  body: z.object({
    ownerId: z.string({ required_error: 'Owner ID is required' }).cuid(),
    courseId: z.string({ required_error: 'Course ID is required' }).cuid(),
    certificateCode: z.string({ required_error: 'Certificate Code is required' }),
    ipfsHash: z.string({ required_error: 'IPFS Hash is required' }),
    issueDate: z.string({ required_error: 'Issue Date is required' }).datetime(),
  }),
});

export const updateCertificateStatusSchema = z.object({
  params: z.object({
    id: z.string().cuid({ message: 'Invalid certificate ID format' }),
  }),
  body: z.object({
    status: z.enum(['VALID', 'REVOKED', 'PENDING']),
  }),
});

export default {
  issueCertificateSchema,
  updateCertificateStatusSchema,
};