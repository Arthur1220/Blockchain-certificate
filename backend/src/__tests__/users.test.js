import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import app from '../app.js'

const prisma = new PrismaClient();
const agent = request.agent(app); // Cria um agente para manter os cookies

let adminUser, studentUser;
let adminAgent, studentAgent;

// Prepara o ambiente antes de todos os testes
beforeAll(async () => {
  // Limpa o banco
  await prisma.user.deleteMany({});

  const salt = await bcrypt.genSalt(10);
  const adminHashedPassword = await bcrypt.hash('adminpassword', salt);
  const studentHashedPassword = await bcrypt.hash('studentpassword', salt);

  // Cria um usuário ADMIN e um STUDENT para os testes
  adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@test.com',
      password: adminHashedPassword,
      role: 'ADMIN',
    },
  });

  studentUser = await prisma.user.create({
    data: {
      username: 'student',
      email: 'student@test.com',
      password: studentHashedPassword,
      role: 'STUDENT',
    },
  });

  // Cria agentes separados para cada usuário e faz login para obter os cookies
  adminAgent = request.agent(app);
  studentAgent = request.agent(app);

  await adminAgent
    .post('/api/auth/login')
    .send({ email: 'admin@test.com', password: 'adminpassword' });

  await studentAgent
    .post('/api/auth/login')
    .send({ email: 'student@test.com', password: 'studentpassword' });
});

describe('User Endpoints & Permissions', () => {

  it('GET /api/users - should be forbidden for a STUDENT', async () => {
    const res = await studentAgent.get('/api/users');
    expect(res.statusCode).toEqual(403); // 403 Forbidden
  });

  it('GET /api/users - should be successful for an ADMIN', async () => {
    const res = await adminAgent.get('/api/users');
    expect(res.statusCode).toEqual(200);
    // Verifica se o resultado é um array e contém nosso usuário estudante
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(user => user.id === studentUser.id)).toBe(true);
  });
  
  it('GET /api/users/profile/me - should return the profile of the logged-in student', async () => {
    const res = await studentAgent.get('/api/users/profile/me');
    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(studentUser.id);
  });

  it('PATCH /api/users/:id - a STUDENT should be able to update their own profile', async () => {
    const res = await studentAgent
      .patch(`/api/users/${studentUser.id}`)
      .send({ firstName: 'UpdatedFirstName' });
      
    expect(res.statusCode).toEqual(200);
    expect(res.body.user.firstName).toEqual('UpdatedFirstName');
  });

  it('PATCH /api/users/:id - a STUDENT should NOT be able to update another user\'s profile', async () => {
    const res = await studentAgent
      .patch(`/api/users/${adminUser.id}`) // Estudante tentando editar admin
      .send({ firstName: 'Hacked' });
      
    expect(res.statusCode).toEqual(403); // 403 Forbidden
  });

  it('DELETE /api/users/:id - an ADMIN should be able to delete another user', async () => {
    // Primeiro, criamos um usuário para ser deletado
    const userToDelete = await prisma.user.create({
      data: { username: 'todelete', email: 'todelete@test.com', password: 'pw' },
    });

    const res = await adminAgent.delete(`/api/users/${userToDelete.id}`);
    expect(res.statusCode).toEqual(204); // 204 No Content
  });
});

// Limpa e desconecta no final
afterAll(async () => {
  await prisma.user.deleteMany({});
  await prisma.$disconnect();
});