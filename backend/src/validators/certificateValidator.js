import { z } from 'zod';

// Schema para a emissão de um novo certificado
export const issueCertificateSchema = z.object({
  // O ID do aluno que receberá o certificado
  ownerId: z.string({ required_error: 'Owner ID (student ID) is required' }).cuid(),
  // O ID do "molde" do curso
  courseId: z.string({ required_error: 'Course ID is required' }).cuid(),
  // O código único do certificado (ex: gerado pela instituição)
  certificateCode: z.string({ required_error: 'Certificate Code is required' }),
  // O hash do IPFS onde o documento do certificado (PDF, etc.) está armazenado
  ipfsHash: z.string({ required_error: 'IPFS Hash is required' }),
  // A data de emissão
  issueDate: z.string({ required_error: 'Issue Date is required' }).datetime(),
});

// Schema para atualizar o status de um certificado
export const updateCertificateStatusSchema = z.object({
  status: z.enum(['VALID', 'REVOKED', 'PENDING']),
});


export default {
  issueCertificateSchema,
  updateCertificateStatusSchema,
};