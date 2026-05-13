const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const sequelize = require('../db/db');
const User = require('./models/User');
require('./models/Project');
require('./models/Attachment');
require('./models/DiscussionThread');
require('./models/Message');

const app = express();
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '..', 'uploads');
let databaseReadyPromise;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));


app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(session({
  secret: process.env.SESSION_SECRET || 'basecamp-secret',
  resave: false,
  saveUninitialized: false
}));


app.use(async (req, res, next) => {
  try {
    await initializeDatabase();
  } catch (error) {
    return next(error);
  }

  res.locals.currentUser = null;
  if (req.session.userId) {
    try {
      res.locals.currentUser = await User.findByPk(req.session.userId);
    } catch (error) {
      return next(error);
    }
  }
  req.currentUser = res.locals.currentUser;
  next();
});


app.get('/', (req, res) => {
  res.render('index');
});


app.use('/users', require('./routes/userRoutes'));
app.use('/session', require('./routes/sessionRoutes'));
app.use('/projects', require('./routes/projectRoutes'));

app.use((req, res) => {
  res.status(404).send('Page not found');
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send('Internal server error');
});


async function seedAdmin() {
  const existing = await User.findByEmail('admin@admin.com');
  if (!existing) {
    const admin = await User.createUser({
      name: 'Admin',
      email: 'admin@admin.com',
      password: 'admin123',
    });
    await User.setAdmin(admin.id);
    console.log('Default admin created: admin@admin.com / admin123');
  }
}

function initializeDatabase() {
  if (!databaseReadyPromise) {
    databaseReadyPromise = sequelize.sync({ alter: true }).then(async () => {
      console.log('Database synced');
      await seedAdmin();
    });
  }

  return databaseReadyPromise;
}

if (require.main === module) {
  initializeDatabase().then(() => {
    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  }).catch(err => {
    console.error('Failed to sync database:', err);
    process.exit(1);
  });
}

module.exports = app;
