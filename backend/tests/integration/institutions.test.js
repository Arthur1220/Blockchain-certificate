import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import app from '../../src/app.js';
import { cleanDatabase, disconnectPrisma } from '../setup.js';
import * as institutionService from '../../src/services/institutionService.js';

const prisma = new PrismaClient();

describe('Institution Endpoints', () => {
  let admin, staffA, institutionA, institutionB;
  let adminAgent, staffAgentA;

  beforeEach(async () => {
    await cleanDatabase();
    const hashedPassword = await bcrypt.hash('password123', 10);
    admin = await prisma.user.create({ data: { username: 'inst_admin', email: 'inst_admin@test.com', password: hashedPassword, role: 'ADMIN' } });
    staffA = await prisma.user.create({ data: { username: 'inst_staff_a', email: 'inst_staff_a@test.com', password: hashedPassword, role: 'STAFF' } });
    institutionA = await prisma.institution.create({ data: { name: 'Inst A', acronym: 'IA', cnpj: '111', address: { create: { street: 'S', number: '1', postalCode: '1', city: 'C', state: 'S' } } } });
    institutionB = await prisma.institution.create({ data: { name: 'Inst B', acronym: 'IB', cnpj: '222', address: { create: { street: 'S', number: '2', postalCode: '2', city: 'C', state: 'S' } } } });
    await prisma.institutionMembership.create({ data: { userId: staffA.id, institutionId: institutionA.id, role: 'STAFF' } });
    adminAgent = request.agent(app);
    staffAgentA = request.agent(app);
    await adminAgent.post('/api/auth/login').send({ email: admin.email, password: 'password123' });
    await staffAgentA.post('/api/auth/login').send({ email: staffA.email, password: 'password123' });
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it('GET /api/institutions/:id - should allow a STAFF user to get their OWN institution', async () => {
    const res = await staffAgentA.get(`/api/institutions/${institutionA.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(institutionA.id);
  });

  it('GET /api/institutions/:id - should FORBID a STAFF user from getting ANOTHER institution', async () => {
    const res = await staffAgentA.get(`/api/institutions/${institutionB.id}`);
    expect(res.statusCode).toBe(403);
  });
  
  it('DELETE /api/institutions/:id - should allow an ADMIN user to delete an institution', async () => {
    const res = await adminAgent.delete(`/api/institutions/${institutionB.id}`);
    expect(res.statusCode).toBe(204);

    // Agora, a verificação seguinte receberá o 404 correto
    const checkRes = await adminAgent.get(`/api/institutions/${institutionB.id}`);
    expect(checkRes.statusCode).toBe(404);
  });
});