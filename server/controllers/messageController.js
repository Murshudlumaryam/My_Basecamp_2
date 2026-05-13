const DiscussionThread = require('../models/DiscussionThread');
const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');

async function renderThreadPage(res, project, thread, currentUser, options = {}) {
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
  const threadAuthor = usersById[thread.userId] || null;

  res.status(options.statusCode || 200).render('threads/show', {
    project,
    thread,
    threadAuthor,
    messages,
    usersById,
    error: options.error || null,
    editMessageId: options.editMessageId || null
  });
}

exports.create = async (req, res) => {
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

  const body = (req.body.body || '').trim();
  if (!body) {
    return renderThreadPage(res, project, thread, req.currentUser, {
      statusCode: 422,
      error: 'Message cannot be empty'
    });
  }

  await Message.create({
    threadId: thread.id,
    projectId: project.id,
    userId: req.currentUser.id,
    body
  });

  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.update = async (req, res) => {
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

  const message = await Message.findOne({
    where: { id: req.params.messageId, threadId: thread.id }
  });
  if (!message) {
    return res.status(404).send('Message not found');
  }

  if (message.userId !== req.currentUser.id) {
    return res.status(403).send('Forbidden');
  }

  const body = (req.body.body || '').trim();
  if (!body) {
    return renderThreadPage(res, project, thread, req.currentUser, {
      statusCode: 422,
      error: 'Message cannot be empty',
      editMessageId: message.id
    });
  }

  message.body = body;
  await message.save();
  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};

exports.destroy = async (req, res) => {
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

  const message = await Message.findOne({
    where: { id: req.params.messageId, threadId: thread.id }
  });
  if (!message) {
    return res.status(404).send('Message not found');
  }

  if (message.userId !== req.currentUser.id && !Project.isProjectAdmin(project, req.currentUser)) {
    return res.status(403).send('Forbidden');
  }

  await message.destroy();
  res.redirect(`/projects/${project.id}/threads/${thread.id}`);
};