import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app.js';
import { cleanDatabase, disconnectPrisma } from '../setup.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Authentication Endpoints', () => {
  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectPrisma();
  });

  const testUser = {
    username: 'auth_user',
    email: 'auth@test.com',
    password: 'password123',
    role: 'STUDENT',
  };

  it('POST /api/users/register - should register a new user successfully', async () => {
    const res = await request(app).post('/api/users/register').send(testUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty('id');
  });

  it('POST /api/users/register - should fail to register with an existing email', async () => {
    await request(app).post('/api/users/register').send(testUser);
    const res = await request(app).post('/api/users/register').send(testUser);
    expect(res.statusCode).toEqual(409);
  });

  it('POST /api/auth/login - should log in an existing user', async () => {
    await request(app).post('/api/users/register').send(testUser);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });
    expect(res.statusCode).toEqual(200);
    expect(res.headers['set-cookie']).toBeDefined();
  });
});