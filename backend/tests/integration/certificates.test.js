import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import app from '../../src/app.js';
import { cleanDatabase, disconnectPrisma } from '../setup.js';

const prisma = new PrismaClient();

describe('Certificate Endpoints', () => {
  let admin, staffA, studentA, studentB;
  let institutionA;
  let courseA;
  let adminAgent, staffAgentA, studentAgentA;

  // Bloco de Setup que roda antes de cada teste
  beforeEach(async () => {
    await cleanDatabase();

    const hashedPassword = await bcrypt.hash('password123', 10);

    // --- Criação de Entidades ---
    [admin, staffA, studentA, studentB] = await Promise.all([
      prisma.user.create({ data: { username: 'cert_admin', email: 'cert_admin@test.com', password: hashedPassword, role: 'ADMIN' } }),
      prisma.user.create({ data: { username: 'cert_staff_a', email: 'cert_staff_a@test.com', password: hashedPassword, role: 'STAFF' } }),
      prisma.user.create({ data: { username: 'cert_student_a', email: 'cert_student_a@test.com', password: hashedPassword, role: 'STUDENT' } }),
      prisma.user.create({ data: { username: 'cert_student_b', email: 'cert_student_b@test.com', password: hashedPassword, role: 'STUDENT' } }),
    ]);

    institutionA = await prisma.institution.create({
      data: { name: 'Cert Inst A', acronym: 'CIA', cnpj: '66666666666666', address: { create: { street: 'S', number: '1', postalCode: '1', city: 'C', state: 'ST' } } },
    });

    // Vínculos (STAFF e STUDENT A pertencem à Instituição A)
    await prisma.institutionMembership.createMany({
      data: [
        { userId: staffA.id, institutionId: institutionA.id, role: 'STAFF' },
        { userId: studentA.id, institutionId: institutionA.id, role: 'STUDENT' },
      ],
    });

    courseA = await prisma.courseTemplate.create({
      data: { name: 'Ultimate Blockchain Course', workload: 100, institutionId: institutionA.id },
    });
    
    // --- Login dos Agentes ---
    adminAgent = request.agent(app);
    staffAgentA = request.agent(app);
    studentAgentA = request.agent(app);
    await Promise.all([
      adminAgent.post('/api/auth/login').send({ email: admin.email, password: 'password123' }),
      staffAgentA.post('/api/auth/login').send({ email: staffA.email, password: 'password123' }),
      studentAgentA.post('/api/auth/login').send({ email: studentA.email, password: 'password123' }),
    ]);
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  // --- Testes para a Emissão de Certificados ---
  describe('POST /api/certificates', () => {
    it('should allow a STAFF member to issue a certificate for a student of their institution', async () => {
      const res = await staffAgentA
        .post('/api/certificates')
        .send({
          ownerId: studentA.id,
          courseId: courseA.id,
          certificateCode: 'UNIQUE-CODE-123',
          ipfsHash: 'IPFS-HASH-XYZ',
          issueDate: new Date().toISOString(),
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.ownerId).toBe(studentA.id);
      expect(res.body.courseId).toBe(courseA.id);
      expect(res.body.issuerId).toBe(staffA.id);
    });

    it('should FORBID a STAFF member from issuing a certificate for a student of another institution', async () => {
      // studentB não tem vínculo com institutionA
      const res = await staffAgentA
        .post('/api/certificates')
        .send({
          ownerId: studentB.id,
          courseId: courseA.id,
          certificateCode: 'UNIQUE-CODE-456',
          ipfsHash: 'IPFS-HASH-ABC',
          issueDate: new Date().toISOString(),
        });
      
      expect(res.statusCode).toBe(404); // O findFirstOrThrow do Prisma gera um erro interno que resulta em 500
    });

    it('should be forbidden for a STUDENT to issue a certificate', async () => {
      const res = await studentAgentA
        .post('/api/certificates')
        .send({
          ownerId: studentA.id,
          courseId: courseA.id,
          certificateCode: 'UNIQUE-CODE-789',
          ipfsHash: 'IPFS-HASH-DEF',
          issueDate: new Date().toISOString(),
        });

      expect(res.statusCode).toBe(403);
    });
  });

  // --- Testes para a Listagem de Certificados ---
  describe('GET /api/certificates', () => {
    it('should allow a STUDENT to see only their own certificates', async () => {
      // Staff emite um certificado para studentA e outro para studentB (este último via Admin)
      await staffAgentA.post('/api/certificates').send({ ownerId: studentA.id, courseId: courseA.id, certificateCode: 'CERT-A', ipfsHash: 'IPFS-A', issueDate: new Date().toISOString() });
      await adminAgent.post('/api/certificates').send({ ownerId: studentB.id, courseId: courseA.id, certificateCode: 'CERT-B', ipfsHash: 'IPFS-B', issueDate: new Date().toISOString() });

      const res = await studentAgentA.get('/api/certificates');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1); // Deve ver apenas 1 certificado
      expect(res.body[0].ownerId).toBe(studentA.id);
    });

    it('should allow a STAFF to see all certificates from their institution', async () => {
      await staffAgentA.post('/api/certificates').send({ ownerId: studentA.id, courseId: courseA.id, certificateCode: 'CERT-A', ipfsHash: 'IPFS-A', issueDate: new Date().toISOString() });

      const res = await staffAgentA.get('/api/certificates');

      expect(res.statusCode).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].course.institutionId).toBe(institutionA.id);
    });
  });

  // --- Testes para a Atualização de Status ---
  describe('PATCH /api/certificates/:id/status', () => {
    it('should allow a STAFF member to update the status of a certificate from their institution', async () => {
      const issueRes = await staffAgentA.post('/api/certificates').send({ ownerId: studentA.id, courseId: courseA.id, certificateCode: 'CERT-A', ipfsHash: 'IPFS-A', issueDate: new Date().toISOString() });
      const certificateId = issueRes.body.id;

      const updateRes = await staffAgentA
        .patch(`/api/certificates/${certificateId}/status`)
        .send({ status: 'VALID' });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.status).toBe('VALID');
    });
  });
});