import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import app from '../../src/app.js';
import { cleanDatabase, disconnectPrisma } from '../setup.js';

const prisma = new PrismaClient();

describe('User Endpoints & Permissions', () => {
  let adminUser, studentUser, adminAgent, studentAgent;

  beforeEach(async () => {
    await cleanDatabase();
    const hashedPassword = await bcrypt.hash('password123', 10);
    [adminUser, studentUser] = await Promise.all([
      prisma.user.create({ data: { username: 'user_admin', email: 'user_admin@test.com', password: hashedPassword, role: 'ADMIN' } }),
      prisma.user.create({ data: { username: 'user_student', email: 'user_student@test.com', password: hashedPassword, role: 'STUDENT' } }),
    ]);
    adminAgent = request.agent(app);
    studentAgent = request.agent(app);
    await adminAgent.post('/api/auth/login').send({ email: adminUser.email, password: 'password123' });
    await studentAgent.post('/api/auth/login').send({ email: studentUser.email, password: 'password123' });
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  it('GET /api/users - should be forbidden for a STUDENT', async () => {
    const res = await studentAgent.get('/api/users');
    expect(res.statusCode).toEqual(403);
  });
  
  it('GET /api/users/profile/me - should return the profile of the logged-in student', async () => {
    const res = await studentAgent.get('/api/users/profile/me');
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(studentUser.id);
  });

  it('DELETE /api/users/:id - an ADMIN should be able to delete another user', async () => {
    const res = await adminAgent.delete(`/api/users/${studentUser.id}`);
    expect(res.statusCode).toEqual(204);
  });
});