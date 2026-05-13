const fs = require('fs');
const path = require('path');
const Attachment = require('../models/Attachment');
const Project = require('../models/Project');

const uploadsDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', '..', 'uploads');

exports.create = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  if (!Project.canAccess(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  if (!req.file) {
    return res.redirect(`/projects/${project.id}`);
  }

  const format = path.extname(req.file.originalname).replace('.', '').toLowerCase() || 'unknown';

  await Attachment.create({
    projectId: project.id,
    userId: req.currentUser.id,
    originalName: req.file.originalname,
    storedName: req.file.filename,
    format,
    size: req.file.size || 0
  });

  res.redirect(`/projects/${project.id}`);
};

exports.destroy = async (req, res) => {
  const attachment = await Attachment.findByPk(req.params.attachmentId);
  if (!attachment) {
    return res.status(404).send('Attachment not found');
  }

  const project = await Project.findByPk(attachment.projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  const canDelete = attachment.userId === req.currentUser.id || Project.isProjectAdmin(project, req.currentUser);
  if (!canDelete) {
    return res.status(403).send('Forbidden');
  }

  const filePath = path.join(uploadsDir, attachment.storedName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  await attachment.destroy();
  res.redirect(`/projects/${project.id}`);
};
