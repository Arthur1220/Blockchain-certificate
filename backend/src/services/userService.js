import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Opções de seleção para garantir que a senha nunca seja retornada
const userSelectOptions = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  firstName: true,
  lastName: true,
  isActive: true,
  phone: true,
  cpf: true,
  role: true,
};

// --- CREATE ---
export const createUser = async (userData) => {
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email: userData.email }, { username: userData.username }] },
  });

  if (existingUser) {
    const error = new Error('User with this email or username already exists.');
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);

  const newUser = await prisma.user.create({
    data: {
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      cpf: userData.cpf,
      role: userData.role || 'STUDENT',
      password: hashedPassword,
    },
    select: userSelectOptions,
  });

  return newUser;
};

// --- READ ---
export const getAllUsers = async () => {
  // Define uma seleção mais limitada para a lista pública
  const publicUserSelect = {
    id: true,
    username: true,
    email: true,
    role: true,
    isActive: true,
  };
  
  return prisma.user.findMany({
    select: publicUserSelect,
  });
};

export const getUserById = async (id) => {
  // findUniqueOrThrow já lança um erro 'Not Found' se o ID não existir
  return prisma.user.findUniqueOrThrow({
    where: { id },
    select: userSelectOptions,
  });
};

// --- UPDATE ---
export const updateUser = async (id, updateData) => {
  // Se uma nova senha for fornecida, ela precisa ser hasheada
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: userSelectOptions,
  });
};

// --- DELETE ---
export const deleteUser = async (id) => {
  // Apenas para garantir que o usuário existe antes de deletar
  await prisma.user.findUniqueOrThrow({ where: { id } });
  
  return prisma.user.delete({
    where: { id },
    select: userSelectOptions,
  });
};