const Project = require('../models/Project');
const User = require('../models/User');
const Attachment = require('../models/Attachment');
const DiscussionThread = require('../models/DiscussionThread');

exports.index = async (req, res) => {
  const projects = await Project.getVisibleProjects(req.currentUser);
  res.render('projects/index', { projects });
};

exports.newProject = (req, res) => {
  res.render('projects/new', { error: null, formData: { name: '', description: '' } });
};

exports.create = async (req, res) => {
  const name = (req.body.name || '').trim();
  const description = (req.body.description || '').trim();

  if (!name) {
    return res.status(422).render('projects/new', {
      error: 'Project name is required',
      formData: { name, description }
    });
  }

  const project = await Project.createProject({
    name,
    description,
    owner: req.session.userId
  });
  res.redirect(`/projects/${project.id}`);
};

exports.show = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (!Project.canAccess(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const memberIds = Project.getMemberIds(project);
  const members = await User.findAll({ where: { id: memberIds } });
  const users = await User.findAll({ order: [['name', 'ASC']] });
  const availableUsers = users.filter((user) => !memberIds.includes(user.id));
  const attachments = await Attachment.findAll({
    where: { projectId: project.id },
    order: [['createdAt', 'DESC']]
  });
  const threads = await DiscussionThread.findAll({
    where: { projectId: project.id },
    order: [['createdAt', 'DESC']]
  });
  const threadAuthors = await User.findAll({
    where: { id: threads.map((thread) => thread.userId) }
  });
  const threadAuthorsById = Object.fromEntries(threadAuthors.map((user) => [user.id, user]));

  res.render('projects/show', {
    project,
    members,
    availableUsers,
    attachments,
    threads,
    threadAuthorsById,
    canManageProject: Project.canManage(project, req.currentUser),
    canCreateThread: Project.isProjectAdmin(project, req.currentUser),
    canParticipate: Project.canAccess(project, req.currentUser),
    memberError: null,
    threadError: null
  });
};

exports.edit = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (!Project.canManage(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  res.render('projects/edit', { project, error: null });
};

exports.update = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (!Project.canManage(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const name = (req.body.name || '').trim();
  const description = (req.body.description || '').trim();
  if (!name) {
    project.name = name;
    project.description = description;
    return res.status(422).render('projects/edit', {
      project,
      error: 'Project name is required'
    });
  }

  await Project.updateProject(req.params.id, { name, description });
  res.redirect(`/projects/${req.params.id}`);
};

exports.addMember = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (!Project.canManage(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const userId = req.body.userId;
  const user = await User.findByPk(userId);
  if (!user) {
    return res.status(404).send('User not found');
  }

  await Project.addMember(project, user.id);
  res.redirect(`/projects/${project.id}`);
};

exports.removeMember = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (!Project.canManage(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  await Project.removeMember(project, req.params.userId);
  res.redirect(`/projects/${project.id}`);
};

exports.destroy = async (req, res) => {
  const project = await Project.findByPk(req.params.id);
  if (!project) return res.status(404).send('Project not found');
  if (!Project.canManage(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  await Project.deleteProject(project.id);
  res.redirect('/projects');
};
