# My Basecamp 2

My Basecamp 2 is a project collaboration web application built with Node.js, Express, EJS, Sequelize, and SQLite. It extends the original My Basecamp project with project attachments, discussion threads, and thread messages.

## Live Demo

Deployment URL: add your hosted application link here after deployment.

## Features

- User registration, login, and logout
- Admin user management
- Project creation, editing, deletion, and member management
- Project-level attachments with stored file format metadata
- Multiple attachments per project
- Discussion threads inside projects
- Thread creation, editing, and deletion restricted to project admins
- Messages inside threads
- Message creation by any user associated with the project
- Message editing by the message author
- Message deletion by the message author or a project admin

## Tech Stack

- Node.js
- Express
- EJS
- Sequelize
- SQLite
- Multer
- bcrypt
- express-session

## Getting Started

Install dependencies:

```bash
npm install
```

Start the application:

```bash
npm start
```

Open the app in your browser:

```text
http://localhost:3000
```

The application automatically creates a default admin account on first start:

```text
Email: admin@admin.com
Password: admin123
```

## Project Structure

```text
db/                 SQLite and Sequelize setup
server/app.js       Express application entry point
server/controllers  Request handlers
server/middleware   Authentication and authorization middleware
server/models       Sequelize models
server/routes       Express routes
server/views        EJS templates
uploads/            Uploaded project attachments
```

## Notes

- Run commands from the project root, not from the `server/` directory.
- Project owners and global admins are treated as project admins.
- Only users associated with a project can view the project, upload attachments, and post messages.
- Uploaded attachments are served from `/uploads`.
