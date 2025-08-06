import { PrismaClient } from '@prisma/client';
import * as courseService from '../services/courseService.js';

const prisma = new PrismaClient();

// Criar um curso para uma instituição
export const create = async (req, res) => {
  const { institutionId } = req.params;
  const user = req.user;

  // Se o usuário for STAFF, precisamos garantir que ele pertence à instituição
  if (user.role === 'STAFF') {
    const membership = await prisma.institutionMembership.findFirst({
      where: { userId: user.id, institutionId: institutionId },
    });
    if (!membership) {
      return res.status(403).json({ message: 'Forbidden: You can only create courses for your own institution.' });
    }
  }

  const course = await courseService.createCourse(req.body, institutionId, user);
  res.status(201).json(course);
};

// Listar todos os cursos de uma instituição
export const getAll = async (req, res) => {
  const { institutionId } = req.params;
  const courses = await courseService.getCoursesByInstitution(institutionId);
  res.status(200).json(courses);
};

// Atualizar um curso
export const update = async (req, res) => {
  const { courseId } = req.params;
  const course = await courseService.updateCourse(courseId, req.body, req.user);
  res.status(200).json(course);
};

// Deletar um curso
export const remove = async (req, res) => {
  const { courseId } = req.params;
  await courseService.deleteCourse(courseId, req.user);
  res.status(204).send();
};