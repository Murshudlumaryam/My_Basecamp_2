const DiscussionThread = require('../models/DiscussionThread');
const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');

async function loadThreadPageData(thread) {
  const messages = await Message.findAll({
    where: { threadId: thread.id },
    order: [['createdAt', 'ASC']]
  });

  const userIds = Array.from(new Set([
    thread.userId,
    ...messages.map((message) => message.userId)
  ]));
  const users = await User.findAll({ where: { id: userIds } });
  const usersById = Object.fromEntries(users.map((user) => [user.id, user]));

  return {
    messages,
    usersById
  };
}

exports.create = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  if (!Project.isProjectAdmin(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const title = (req.body.title || '').trim();
  const body = (req.body.body || '').trim();
  if (!title) {
    return res.redirect(`/projects/${project.id}`);
  }

  const thread = await DiscussionThread.create({
    projectId: project.id,
    userId: req.currentUser.id,
    title,
    body
  });

  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.show = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  if (!Project.canAccess(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const thread = await DiscussionThread.findOne({
    where: { id: req.params.threadId, projectId: project.id }
  });
  if (!thread) {
    return res.status(404).send('Thread not found');
  }

  const threadAuthor = await User.findByPk(thread.userId);
  const { messages, usersById } = await loadThreadPageData(thread);

  res.render('threads/show', {
    project,
    thread,
    threadAuthor,
    messages,
    usersById,
    error: null,
    editMessageId: req.query.editMessageId || null
  });
};

exports.editForm = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  if (!Project.isProjectAdmin(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const thread = await DiscussionThread.findOne({
    where: { id: req.params.threadId, projectId: project.id }
  });
  if (!thread) {
    return res.status(404).send('Thread not found');
  }

  res.render('threads/edit', { project, thread, error: null });
};

exports.update = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  if (!Project.isProjectAdmin(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const thread = await DiscussionThread.findOne({
    where: { id: req.params.threadId, projectId: project.id }
  });
  if (!thread) {
    return res.status(404).send('Thread not found');
  }

  const title = (req.body.title || '').trim();
  const body = (req.body.body || '').trim();
  if (!title) {
    thread.title = title;
    thread.body = body;
    return res.status(422).render('threads/edit', {
      project,
      thread,
      error: 'Thread title is required'
    });
  }

  thread.title = title;
  thread.body = body;
  await thread.save();

  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.destroy = async (req, res) => {
  const project = await Project.findByPk(req.params.projectId);
  if (!project) {
    return res.status(404).send('Project not found');
  }

  if (!Project.isProjectAdmin(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  const thread = await DiscussionThread.findOne({
    where: { id: req.params.threadId, projectId: project.id }
  });
  if (!thread) {
    return res.status(404).send('Thread not found');
  }

  await Message.destroy({ where: { threadId: thread.id } });
  await thread.destroy();

  res.redirect(`/projects/${project.id}`);
};
