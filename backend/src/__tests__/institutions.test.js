import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import app from '../app.js';

const prisma = new PrismaClient();

describe('Institution Endpoints', () => {
  let admin, staffA, institutionA, institutionB;
  let adminAgent, staffAgentA;

  beforeEach(async () => {
    // Clean slate before each test
    await prisma.institutionMembership.deleteMany({});
    await prisma.institution.deleteMany({});
    await prisma.address.deleteMany({});
    await prisma.user.deleteMany({});

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create users
    admin = await prisma.user.create({ data: { username: 'inst_admin', email: 'inst_admin@test.com', password: hashedPassword, role: 'ADMIN' } });
    staffA = await prisma.user.create({ data: { username: 'staff_a', email: 'staff_a@test.com', password: hashedPassword, role: 'STAFF' } });
    
    // Create institutions
    institutionA = await prisma.institution.create({ data: { name: 'Institution A', acronym: 'IA', cnpj: '11111111111111', address: { create: { street: 'Street A', number: '1', postalCode: '111', city: 'City A', state: 'State A' } } } });
    institutionB = await prisma.institution.create({ data: { name: 'Institution B', acronym: 'IB', cnpj: '22222222222222', address: { create: { street: 'Street B', number: '2', postalCode: '222', city: 'City B', state: 'State B' } } } });
    
    // Create membership
    await prisma.institutionMembership.create({ data: { userId: staffA.id, institutionId: institutionA.id, role: 'STAFF' } });

    // Login agents
    adminAgent = request.agent(app);
    staffAgentA = request.agent(app);
    await adminAgent.post('/api/auth/login').send({ email: admin.email, password: 'password123' });
    await staffAgentA.post('/api/auth/login').send({ email: staffA.email, password: 'password123' });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /api/institutions/:id - should allow a STAFF user to get their OWN institution', async () => {
    const res = await staffAgentA.get(`/api/institutions/${institutionA.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(institutionA.id);
  });

  it('PATCH /api/institutions/:id - should allow a STAFF user to update their OWN institution', async () => {
    const res = await staffAgentA.patch(`/api/institutions/${institutionA.id}`).send({ acronym: 'IA-UPDATED' });
    expect(res.statusCode).toBe(200);
    expect(res.body.acronym).toBe('IA-UPDATED');
  });

  it('DELETE /api/institutions/:id - should allow an ADMIN user to delete an institution', async () => {
    const res = await adminAgent.delete(`/api/institutions/${institutionB.id}`);
    expect(res.statusCode).toBe(204);

    const checkRes = await adminAgent.get(`/api/institutions/${institutionB.id}`);
    expect(checkRes.statusCode).toBe(404);
});
});