import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- CREATE ---
export const createInstitution = async (data) => {
  const { address, ...institutionData } = data;
  return prisma.institution.create({
    data: {
      ...institutionData,
      address: { create: address },
    },
    include: { address: true },
  });
};

// --- READ ---
export const getAllInstitutions = async () => {
  return prisma.institution.findMany({
    include: { address: true },
  });
};

export const getInstitutionById = async (institutionId, user) => {
  // findUniqueOrThrow will automatically throw an error if not found,
  // which our new errorHandler will correctly catch as a 404.
  const institution = await prisma.institution.findUniqueOrThrow({
    where: { id: institutionId },
    include: { address: true },
  });

  // Permission check remains the same
  if (user.role !== 'ADMIN') {
    const membership = await prisma.institutionMembership.findUnique({
      where: {
        userId_institutionId: { userId: user.id, institutionId: institutionId },
      },
    });
    if (!membership) {
      const error = new Error('Forbidden');
      error.statusCode = 403;
      throw error;
    }
  }
  
  return institution;
};

// --- UPDATE ---
export const updateInstitution = async (institutionId, data, user) => {
  await getInstitutionById(institutionId, user); // Reuse the permission check

  const { address, ...institutionData } = data;
  return prisma.institution.update({
    where: { id: institutionId },
    data: {
      ...institutionData,
      ...(address && { address: { update: address } }),
    },
    include: { address: true },
  });
};

// --- DELETE ---
export const deleteInstitution = async (id, user) => {
  // A verificação de permissão está correta
  if (user.role !== 'ADMIN') {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }
  
  // Busca a instituição para pegar o ID do endereço
  const institution = await prisma.institution.findUnique({
    where: { id },
    select: { addressId: true },
  });

  if (!institution) {
    const error = new Error('Institution not found');
    error.statusCode = 404;
    throw error;
  }

  // Executa a deleção em uma transação para garantir que tudo ocorra
  await prisma.$transaction([
    prisma.institutionMembership.deleteMany({ where: { institutionId: id } }),
    prisma.courseTemplate.deleteMany({ where: { institutionId: id } }),
    prisma.institution.delete({ where: { id } }),
    prisma.address.delete({ where: { id: institution.addressId } }),
  ]);
};