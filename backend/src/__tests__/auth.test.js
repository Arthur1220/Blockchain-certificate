import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import app from '../app.js'

const prisma = new PrismaClient();

// Limpa o banco de dados antes de todos os testes neste arquivo
beforeAll(async () => {
  await prisma.institutionMembership.deleteMany({});
  await prisma.institution.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});
});

// Descreve o conjunto de testes para a funcionalidade de Autenticação
describe('Auth Endpoints', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    role: 'STUDENT',
  };

  // Teste para o endpoint de registro
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('should fail to register a user with an existing email', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send(testUser);

    expect(res.statusCode).toEqual(409); // 409 Conflict
  });

  // Teste para o endpoint de login
  it('should log in an existing user and set cookies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    // Verifica se os cookies de autenticação foram definidos
    expect(res.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/accessToken=/),
        expect.stringMatching(/refreshToken=/),
      ])
    );
  });

  it('should fail to log in with an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    
    expect(res.statusCode).toEqual(401); // 401 Unauthorized
  });
});

// Fecha a conexão com o banco depois de todos os testes
afterAll(async () => {
  await prisma.$disconnect();
});