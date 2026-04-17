const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { getDatabaseMode, getPool } = require('./db');
const {
  authenticateUser,
  createProject,
  createTicket,
  createUser,
  deleteUser,
  getDashboard,
  getProjects,
  getTickets,
  getUsers,
  updateUser,
} = require('./dataService');

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';
const buildDir = path.resolve(__dirname, '../client/my-app/build');

function sendApiError(response, error, fallbackMessage) {
  response.status(error.statusCode || 400).json({
    message: error.message || fallbackMessage,
  });
}

function createApiRouter() {
  const router = express.Router();

  router.get('/health', async (request, response) => {
    response.json({
      ok: true,
      mode: await getDatabaseMode(),
      timestamp: new Date().toISOString(),
    });
  });

  router.get('/dashboard', async (request, response) => {
    response.json(await getDashboard());
  });

  router.get('/users', async (request, response) => {
    response.json(await getUsers());
  });

  router.post('/users', async (request, response) => {
    try {
      const user = await createUser(request.body || {});
      response.status(201).json(user);
    } catch (error) {
      sendApiError(response, error, 'Unable to create user.');
    }
  });

  router.put('/users/:employeeId', async (request, response) => {
    try {
      const updatedUser = await updateUser(request.params.employeeId, request.body || {});
      response.json(updatedUser);
    } catch (error) {
      sendApiError(response, error, 'Unable to update user.');
    }
  });

  router.delete('/users/:employeeId', async (request, response) => {
    try {
      await deleteUser(request.params.employeeId);
      response.json({ message: 'User deleted successfully.' });
    } catch (error) {
      sendApiError(response, error, 'Unable to delete user.');
    }
  });

  router.get('/projects', async (request, response) => {
    response.json(await getProjects());
  });

  router.post('/projects', async (request, response) => {
    try {
      const project = await createProject(request.body || {});
      response.status(201).json(project);
    } catch (error) {
      sendApiError(response, error, 'Unable to create project.');
    }
  });

  router.get('/tickets', async (request, response) => {
    response.json(await getTickets());
  });

  router.post('/tickets', async (request, response) => {
    try {
      const ticket = await createTicket(request.body || {});
      response.status(201).json(ticket);
    } catch (error) {
      sendApiError(response, error, 'Unable to create ticket.');
    }
  });

  router.post('/login', async (request, response) => {
    try {
      const email = String(request.body?.email || '').trim().toLowerCase();
      const password = String(request.body?.password || '').trim();
      const user = await authenticateUser(email, password);

      if (!user) {
        response.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      response.json({
        message: 'Login successful',
        user,
      });
    } catch (error) {
      response.status(400).json({ message: 'Invalid JSON body' });
    }
  });

  router.use((request, response) => {
    response.status(404).json({ message: 'API route not found' });
  });

  return router;
}

function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: false }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use('/api', createApiRouter());

  if (fs.existsSync(buildDir)) {
    app.use(express.static(buildDir));

    app.get('*', (request, response) => {
      response.sendFile(path.join(buildDir, 'index.html'));
    });
  } else {
    app.get('*', (request, response) => {
      response.status(200).json({
        message: 'Talent Bank API is running. Build the React client to serve the UI from Express.',
        api: [
          '/api/health',
          '/api/login',
          '/api/dashboard',
          '/api/users',
          '/api/users/:employeeId',
          '/api/projects',
          '/api/tickets',
        ],
      });
    });
  }

  return app;
}

if (require.main === module) {
  const app = createApp();
  app.listen(PORT, HOST, async () => {
    const mode = await getDatabaseMode();
    console.log(`Express server running at http://${HOST}:${PORT} (${mode})`);
  });
}

module.exports = {
  createApp,
  getPool,
};
