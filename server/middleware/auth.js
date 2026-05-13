const User = require('../models/User');

module.exports = async (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/session/login');
  }

  const user = await User.findByPk(req.session.userId);
  if (!user) {
    req.session.destroy(() => res.redirect('/session/login'));
    return;
  }

  req.currentUser = user;
  res.locals.currentUser = req.currentUser;
  next();
};