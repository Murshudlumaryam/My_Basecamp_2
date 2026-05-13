const User = require('../models/User');

exports.newUser = (req, res) => {
  res.render('users/new', { error: null });
};

exports.show = async (req, res) => {
  if (!req.currentUser) {
    return res.redirect('/session/login');
  }

  const isOwnProfile = req.currentUser.id === req.params.id;
  const isAdmin = req.currentUser.role === 'admin';
  if (!isOwnProfile && !isAdmin) {
    return res.status(403).send('Forbidden');
  }

  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).send('User not found');
  res.render('users/show', { user });
};

exports.index = async (req, res) => {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  const users = await User.findAll();
  res.render('users/index', { users });
};

exports.create = async (req, res) => {
  try {
    const payload = {
      name: (req.body.name || '').trim(),
      email: (req.body.email || '').trim().toLowerCase(),
      password: req.body.password || ''
    };

    if (!payload.name || !payload.email || !payload.password) {
      return res.render('users/new', {
        error: 'Name, email, and password are required'
      });
    }

    const existing = await User.findByEmail(payload.email);
    if (existing) return res.render('users/new', { error: 'Email already in use' });

    if (payload.password.length < 6) {
      return res.render('users/new', { error: 'Password must be at least 6 characters' });
    }

    const user = await User.createUser(payload);
    req.session.userId = user.id;
    res.redirect(`/users/${user.id}`);
  } catch (err) {
    console.error(err);
    res.render('users/new', { error: 'Could not create account' });
  }
};

exports.destroy = async (req, res) => {
  if (!req.currentUser || req.currentUser.id !== req.params.id) {
    return res.status(403).send('Forbidden');
  }

  await User.deleteUser(req.params.id);
  req.session.destroy(() => res.redirect('/'));
};

exports.setAdmin = async (req, res) => {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden: Admins only');
  }
  const target = await User.findByPk(req.params.id);
  if (!target) return res.status(404).send('User not found');

  await User.setAdmin(req.params.id);
  res.redirect(`/users/${req.params.id}`);
};

exports.removeAdmin = async (req, res) => {
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).send('Forbidden: Admins only');
  }
  if (req.currentUser.id === req.params.id) {
    return res.status(403).send('Forbidden: You cannot remove your own admin role');
  }
  const target = await User.findByPk(req.params.id);
  if (!target) return res.status(404).send('User not found');

  await User.removeAdmin(req.params.id);
  res.redirect(`/users/${req.params.id}`);
};