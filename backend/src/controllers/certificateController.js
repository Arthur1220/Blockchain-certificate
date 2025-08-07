import * as certificateService from '../services/certificateService.js';

export const issue = async (req, res) => {
  const certificate = await certificateService.issueCertificate(req.body, req.user);
  res.status(201).json(certificate);
};

export const getAll = async (req, res) => {
  const certificates = await certificateService.getCertificatesForUser(req.user);
  res.status(200).json(certificates);
};

export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const certificate = await certificateService.updateCertificateStatus(id, status, req.user);
  res.status(200).json(certificate);
};