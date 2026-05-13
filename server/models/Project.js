const { DataTypes } = require('sequelize');
const sequelize = require('../../db/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
  owner: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  members: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      return JSON.parse(this.getDataValue('members') || '[]');
    },
    set(val) {
      this.setDataValue('members', JSON.stringify(val));
    },
  },
}, {
  tableName: 'projects',
});

Project.getMemberIds = (project) => {
  if (!project) {
    return [];
  }

  const members = Array.isArray(project.members) ? project.members : [];
  return Array.from(new Set([project.owner, ...members]));
};

Project.isAssociatedUser = (project, user) => {
  if (!project || !user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  return Project.getMemberIds(project).includes(user.id);
};

Project.isProjectAdmin = (project, user) => {
  if (!project || !user) {
    return false;
  }

  return project.owner === user.id || user.role === 'admin';
};

Project.createProject = async (data) => {
  return Project.create({
    name: data.name,
    description: data.description || '',
    owner: data.owner,
    members: data.members || [],
  });
};

Project.getAllProjects = async () => {
  return Project.findAll();
};

Project.getVisibleProjects = async (currentUser) => {
  if (!currentUser) {
    return [];
  }

  if (currentUser.role === 'admin') {
    return Project.findAll({ order: [['createdAt', 'DESC']] });
  }

  const projects = await Project.findAll({ order: [['createdAt', 'DESC']] });
  return projects.filter((project) => Project.isAssociatedUser(project, currentUser));
};

Project.canAccess = (project, currentUser) => {
  return Project.isAssociatedUser(project, currentUser);
};

Project.canManage = Project.isProjectAdmin;

Project.addMember = async (project, userId) => {
  const members = Project.getMemberIds(project).filter((id) => id !== project.owner);
  if (!members.includes(userId)) {
    members.push(userId);
  }
  project.members = members;
  await project.save();
  return project;
};

Project.removeMember = async (project, userId) => {
  project.members = Project.getMemberIds(project)
    .filter((id) => id !== project.owner && id !== userId);
  await project.save();
  return project;
};

Project.updateProject = async (id, data) => {
  const project = await Project.findByPk(id);
  if (!project) return null;
  project.name = data.name;
  project.description = data.description || '';
  await project.save();
  return project;
};

Project.deleteProject = async (id) => {
  const Attachment = require('./Attachment');
  const DiscussionThread = require('./DiscussionThread');
  const Message = require('./Message');
  const project = await Project.findByPk(id);
  if (!project) {
    return;
  }

  const threads = await DiscussionThread.findAll({ where: { projectId: id } });
  const threadIds = threads.map((thread) => thread.id);

  if (threadIds.length > 0) {
    await Message.destroy({ where: { threadId: threadIds } });
  }

  await DiscussionThread.destroy({ where: { projectId: id } });
  await Attachment.destroy({ where: { projectId: id } });
  await project.destroy();
};

module.exports = Project;