import { PrismaClient } from '@prisma/client';
import AppError from '../errors/AppError.js';

const prisma = new PrismaClient();

// Função auxiliar para verificar permissão
const checkCoursePermission = async (courseId, user) => {
  const course = await prisma.courseTemplate.findUniqueOrThrow({
    where: { id: courseId },
  });

  if (user.role === 'STAFF') {
    const membership = await prisma.institutionMembership.findFirst({
      where: {
        userId: user.id,
        institutionId: course.institutionId, // Verifica se o staff pertence à instituição do curso
      },
    });
    if (!membership) {
      throw new AppError('Forbidden: You do not have permission for this course.', 403);
    }
  }
  // Admin tem acesso a tudo
  return course;
};

// --- CREATE ---
export const createCourse = async (data, institutionId, user) => {
  // A rota já garante que apenas ADMIN e STAFF cheguem aqui.
  // A lógica do controlador já garante que o STAFF só crie para a sua instituição.
  return prisma.courseTemplate.create({
    data: {
      ...data,
      institutionId: institutionId,
    },
  });
};

// --- READ ---
export const getCoursesByInstitution = async (institutionId) => {
  return prisma.courseTemplate.findMany({
    where: { institutionId },
  });
};

// --- UPDATE ---
export const updateCourse = async (courseId, data, user) => {
  // Garante que o usuário tem permissão para editar este curso
  await checkCoursePermission(courseId, user);
  return prisma.courseTemplate.update({
    where: { id: courseId },
    data: data,
  });
};

// --- DELETE ---
export const deleteCourse = async (courseId, user) => {
  // Garante que o usuário tem permissão para deletar este curso
  await checkCoursePermission(courseId, user);
  return prisma.courseTemplate.delete({
    where: { id: courseId },
  });
};