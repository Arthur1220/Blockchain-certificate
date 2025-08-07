import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function cleanDatabase() {
  await prisma.revocation.deleteMany({}); 
  await prisma.blockchainRecord.deleteMany({}); 
  await prisma.certificate.deleteMany({});
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