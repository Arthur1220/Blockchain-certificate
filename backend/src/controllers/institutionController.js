import * as institutionService from '../services/institutionService.js';

// CREATE
export const create = async (req, res) => {
  const institution = await institutionService.createInstitution(req.body);
  res.status(201).json(institution);
};

// READ
export const getAll = async (req, res) => {
  const institutions = await institutionService.getAllInstitutions();
  res.status(200).json(institutions);
};

export const getById = async (req, res) => {
  const institution = await institutionService.getInstitutionById(req.params.id, req.user);
  res.status(200).json(institution);
};

// UPDATE
export const update = async (req, res) => {
  const updatedInstitution = await institutionService.updateInstitution(req.params.id, req.body, req.user);
  res.status(200).json(updatedInstitution);
};

// DELETE
export const remove = async (req, res) => {
  await institutionService.deleteInstitution(req.params.id);
  res.status(204).send();
};