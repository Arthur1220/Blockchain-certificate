import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// --- CREATE (Issue Certificate) ---
export const issueCertificate = async (data, issuerUser) => {
  const { ownerId, courseId } = data;

  // 1. Verifica se o curso existe
  const course = await prisma.courseTemplate.findUniqueOrThrow({
    where: { id: courseId },
  });

  // 2. Verifica se o aluno (owner) existe
  const owner = await prisma.user.findUniqueOrThrow({
    where: { id: ownerId },
  });

  // 3. Lógica de Permissão para o STAFF
  if (issuerUser.role === 'STAFF') {
    // Verifica se o STAFF pertence à mesma instituição do curso
    const staffMembership = await prisma.institutionMembership.findFirstOrThrow({
      where: { userId: issuerUser.id, institutionId: course.institutionId },
    });
    // Opcional, mas recomendado: verificar se o aluno também pertence à instituição
    const studentMembership = await prisma.institutionMembership.findFirstOrThrow({
      where: { userId: ownerId, institutionId: course.institutionId },
    });
  }

  // 4. Cria o certificado
  return prisma.certificate.create({
    data: {
      ...data,
      issuerId: issuerUser.id, // O emissor é o usuário logado
      // blockchainHash será preenchido em uma etapa futura
    },
  });
};

// --- READ ---
export const getCertificatesForUser = async (user) => {
  if (user.role === 'STUDENT') {
    // Aluno vê apenas os seus certificados
    return prisma.certificate.findMany({
      where: { ownerId: user.id },
      include: { course: true, owner: true, issuer: true },
    });
  }

  if (user.role === 'STAFF') {
    // Staff vê os certificados da sua instituição
    const membership = await prisma.institutionMembership.findFirstOrThrow({
      where: { userId: user.id },
    });
    return prisma.certificate.findMany({
      where: { course: { institutionId: membership.institutionId } },
      include: { course: true, owner: true, issuer: true },
    });
  }

  // Admin vê todos
  return prisma.certificate.findMany({
    include: { course: true, owner: true, issuer: true },
  });
};

// --- UPDATE ---
export const updateCertificateStatus = async (certificateId, status, user) => {
  const certificate = await prisma.certificate.findUniqueOrThrow({
    where: { id: certificateId },
    include: { course: true },
  });

  if (user.role === 'STAFF') {
    const membership = await prisma.institutionMembership.findFirstOrThrow({
      where: { userId: user.id, institutionId: certificate.course.institutionId },
    });
  }

  return prisma.certificate.update({
    where: { id: certificateId },
    data: { status },
  });
};