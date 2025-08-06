import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
  // A ordem de deleção é crucial para respeitar as chaves estrangeiras.
  // Deletamos das tabelas que "dependem" para as tabelas que "são dependidas".
  await prisma.courseTemplate.deleteMany({});
  await prisma.institutionMembership.deleteMany({});
  await prisma.institution.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});
}

// Uma função para desconectar no final de tudo
export async function disconnectPrisma() {
  await prisma.$disconnect();
}