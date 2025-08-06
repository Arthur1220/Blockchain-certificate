import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import app from '../../src/app.js';
import { cleanDatabase, disconnectPrisma } from '../setup.js';

const prisma = new PrismaClient();

describe('Course Endpoints', () => {
  let admin, staffA, institutionA, institutionB, adminAgent, staffAgentA;

  beforeEach(async () => {
    await cleanDatabase();
    const hashedPassword = await bcrypt.hash('password123', 10);
    [admin, staffA] = await Promise.all([
      prisma.user.create({ data: { username: 'course_admin', email: 'course_admin@test.com', password: hashedPassword, role: 'ADMIN' } }),
      prisma.user.create({ data: { username: 'course_staff_a', email: 'course_staff_a@test.com', password: hashedPassword, role: 'STAFF' } }),
    ]);
    [institutionA, institutionB] = await Promise.all([
      prisma.institution.create({ data: { name: 'Course Inst A', acronym: 'CIA', cnpj: '444', address: { create: { street: 'S', number: '1', postalCode: '1', city: 'C', state: 'S' } } } }),
      prisma.institution.create({ data: { name: 'Course Inst B', acronym: 'CIB', cnpj: '555', address: { create: { street: 'S', number: '2', postalCode: '2', city: 'C', state: 'S' } } } }),
    ]);
    await prisma.institutionMembership.create({
      data: { userId: staffA.id, institutionId: institutionA.id, role: 'STAFF' },
    });
    adminAgent = request.agent(app);
    staffAgentA = request.agent(app);
    await adminAgent.post('/api/auth/login').send({ email: admin.email, password: 'password123' });
    await staffAgentA.post('/api/auth/login').send({ email: staffA.email, password: 'password123' });
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it('POST /api/institutions/:institutionId/courses - should allow STAFF to create a course for their OWN institution', async () => {
    const res = await staffAgentA
      .post(`/api/institutions/${institutionA.id}/courses`)
      .send({ name: 'Intro to Blockchain', workload: 40 });
    expect(res.statusCode).toBe(201);
  });
});