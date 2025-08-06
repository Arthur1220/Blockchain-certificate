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
  return prisma.institution.findUniqueOrThrow({
    where: { id: institutionId },
    include: { address: true },
  });
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
export const deleteInstitution = async (id) => {
  const institution = await prisma.institution.findUniqueOrThrow({
    where: { id },
    select: { addressId: true },
  });

  return prisma.$transaction([
    prisma.institutionMembership.deleteMany({ where: { institutionId: id } }),
    prisma.institution.delete({ where: { id } }),
    prisma.address.delete({ where: { id: institution.addressId } }),
  ]);
};