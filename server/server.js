const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

let mysql = null;

try {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
} catch (error) {
  // The server can still run when dotenv has not been installed yet.
}

try {
  // Optional dependency: the server still runs with mock data when mysql2 is not installed.
  mysql = require('mysql2/promise');
} catch (error) {
  mysql = null;
}

const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '0.0.0.0';
const buildDir = path.resolve(__dirname, '../client/my-app/build');

const mockData = {
  currentUser: {
    id: 1,
    name: 'Holland',
    role: 'Admin',
    email: 'admin@talentbank.com',
  },
  dashboard: {
    overviewCards: [
      { title: 'Total Projects', value: 20, note: 'Delivery pipeline', theme: 'coral' },
      { title: 'Team Members', value: 20, note: 'Across all units', theme: 'sun' },
      { title: 'Open Leads', value: 20, note: 'Need follow-up', theme: 'violet' },
      { title: 'Resolved Tickets', value: 20, note: 'This month', theme: 'mint' },
      { title: 'Pending Reviews', value: 20, note: 'Waiting on approvals', theme: 'peach' },
      { title: 'New Requests', value: 20, note: 'Raised this week', theme: 'sky' },
    ],
    leadStats: [
      { label: 'Assigned', value: 8, percent: 25, color: '#f4c84a' },
      { label: 'In progress', value: 1, percent: 15, color: '#6e5a8e' },
      { label: 'Review', value: 1, percent: 25, color: '#5da16f' },
      { label: 'Final', value: 2, percent: 35, color: '#ee6257' },
    ],
    salesTrend: [
      { day: 'Mon', total: 3, converted: 1 },
      { day: 'Tue', total: 8, converted: 1 },
      { day: 'Wed', total: 6, converted: 4 },
      { day: 'Thu', total: 10, converted: 5 },
      { day: 'Fri', total: 8, converted: 1 },
      { day: 'Sat', total: 8, converted: 7 },
      { day: 'Sun', total: 4, converted: 3 },
    ],
    supportSummary: [
      { label: 'Solved', value: 18, color: '#eb5c57' },
      { label: 'Unsolved', value: 8, color: '#f3cb4d' },
      { label: 'In progress', value: 26, color: '#63a26f' },
    ],
  },
  users: [
    {
      id: '01',
      employeeId: 'TAL001',
      name: 'Tom Holland',
      mobile: '9876543210',
      email: 'tomholland@gmail.com',
      role: 'Executive manager',
      status: 'Active',
      highlight: true,
    },
    {
      id: '02',
      employeeId: 'TAL002',
      name: 'Tom Hiddleston',
      mobile: '9123456780',
      email: 'tom.h@talentbank.com',
      role: 'Sales manager',
      status: 'Active',
    },
    {
      id: '03',
      employeeId: 'TAL003',
      name: 'Zendaya Coleman',
      mobile: '9000154321',
      email: 'zendaya@talentbank.com',
      role: 'Sales manager',
      status: 'Resign',
    },
    {
      id: '04',
      employeeId: 'TAL004',
      name: 'Jacob Batalon',
      mobile: '9345678123',
      email: 'jacob@talentbank.com',
      role: 'Sales manager',
      status: 'Active',
    },
    {
      id: '05',
      employeeId: 'TAL005',
      name: 'Benedict Wong',
      mobile: '9234567812',
      email: 'benedict@talentbank.com',
      role: 'General manager',
      status: 'Inactive',
    },
  ],
  projects: [
    {
      code: 'PRJ-001',
      name: 'Core Banking Revamp',
      owner: 'Holland',
      progress: 72,
      priority: 'High',
      status: 'In progress',
      dueDate: '24 Apr 2026',
    },
    {
      code: 'PRJ-002',
      name: 'Loan Onboarding Flow',
      owner: 'Zendaya',
      progress: 54,
      priority: 'Medium',
      status: 'Review',
      dueDate: '28 Apr 2026',
    },
    {
      code: 'PRJ-003',
      name: 'Recruitment Dashboard',
      owner: 'Tom Holland',
      progress: 88,
      priority: 'High',
      status: 'Final',
      dueDate: '03 May 2026',
    },
    {
      code: 'PRJ-004',
      name: 'Support Automation',
      owner: 'Jacob',
      progress: 39,
      priority: 'Low',
      status: 'Assigned',
      dueDate: '07 May 2026',
    },
  ],
  tickets: [
    {
      id: 'TIC-101',
      subject: 'Unable to approve user leaves',
      requester: 'Sarah M',
      team: 'HR',
      priority: 'High',
      status: 'Solved',
      updatedAt: '17 Apr 2026, 2:30 PM',
    },
    {
      id: 'TIC-102',
      subject: 'Sales report export failing',
      requester: 'Ron C',
      team: 'Sales',
      priority: 'Medium',
      status: 'In progress',
      updatedAt: '17 Apr 2026, 1:05 PM',
    },
    {
      id: 'TIC-103',
      subject: 'Need project role access',
      requester: 'Julie A',
      team: 'Operations',
      priority: 'Low',
      status: 'Unsolved',
      updatedAt: '17 Apr 2026, 11:18 AM',
    },
    {
      id: 'TIC-104',
      subject: 'Dashboard widget mismatch',
      requester: 'Megan P',
      team: 'Management',
      priority: 'High',
      status: 'Solved',
      updatedAt: '16 Apr 2026, 5:42 PM',
    },
  ],
};

let poolPromise = null;

function withCors(response) {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function json(response, statusCode, payload) {
  withCors(response);
  response.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function sendFile(response, filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
  };

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream' });
    response.end(content);
  });
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let raw = '';

    request.on('data', (chunk) => {
      raw += chunk;
    });

    request.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

function canUseMySql() {
  return (
    mysql &&
    process.env.DB_HOST &&
    process.env.DB_USER &&
    process.env.DB_NAME
  );
}

async function getPool() {
  if (!canUseMySql()) {
    return null;
  }

  if (!poolPromise) {
    poolPromise = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }

  return poolPromise;
}

async function getUsers() {
  const pool = await getPool();

  if (!pool) {
    return mockData.users;
  }

  try {
    const [rows] = await pool.query(
      `SELECT employee_id AS employeeId, name, mobile, email, role, status
       FROM users
       ORDER BY employee_id ASC`
    );

    return rows.map((row, index) => ({
      id: String(index + 1).padStart(2, '0'),
      employeeId: row.employeeId,
      name: row.name,
      mobile: row.mobile,
      email: row.email,
      role: row.role,
      status: row.status,
    }));
  } catch (error) {
    return mockData.users;
  }
}

async function getProjects() {
  const pool = await getPool();

  if (!pool) {
    return mockData.projects;
  }

  try {
    const [rows] = await pool.query(
      `SELECT project_code AS code, name, owner, progress, priority, status, due_date AS dueDate
       FROM projects
       ORDER BY due_date ASC`
    );

    return rows;
  } catch (error) {
    return mockData.projects;
  }
}

async function getTickets() {
  const pool = await getPool();

  if (!pool) {
    return mockData.tickets;
  }

  try {
    const [rows] = await pool.query(
      `SELECT ticket_id AS id, subject, requester, team, priority, status, updated_at AS updatedAt
       FROM tickets
       ORDER BY updated_at DESC`
    );

    return rows;
  } catch (error) {
    return mockData.tickets;
  }
}

async function handleApi(request, response, pathname) {
  if (request.method === 'OPTIONS') {
    withCors(response);
    response.writeHead(204);
    response.end();
    return true;
  }

  if (pathname === '/api/health') {
    json(response, 200, {
      ok: true,
      mode: canUseMySql() ? 'mysql' : 'mock',
      timestamp: new Date().toISOString(),
    });
    return true;
  }

  if (pathname === '/api/dashboard') {
    json(response, 200, mockData.dashboard);
    return true;
  }

  if (pathname === '/api/users') {
    json(response, 200, await getUsers());
    return true;
  }

  if (pathname === '/api/projects') {
    json(response, 200, await getProjects());
    return true;
  }

  if (pathname === '/api/tickets') {
    json(response, 200, await getTickets());
    return true;
  }

  if (pathname === '/api/login' && request.method === 'POST') {
    try {
      const body = await parseBody(request);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '').trim();

      const validDemoUser = email === 'admin@talentbank.com' && password === 'admin123';

      if (!validDemoUser) {
        json(response, 401, { message: 'Invalid credentials' });
        return true;
      }

      json(response, 200, {
        message: 'Login successful',
        user: mockData.currentUser,
      });
    } catch (error) {
      json(response, 400, { message: 'Invalid JSON body' });
    }

    return true;
  }

  return false;
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  const pathname = requestUrl.pathname;

  if (pathname.startsWith('/api/')) {
    const handled = await handleApi(request, response, pathname);
    if (!handled) {
      json(response, 404, { message: 'API route not found' });
    }
    return;
  }

  const assetPath = path.join(buildDir, pathname === '/' ? 'index.html' : pathname);
  const safeAssetPath = path.normalize(assetPath);

  if (safeAssetPath.startsWith(buildDir) && fs.existsSync(safeAssetPath) && fs.statSync(safeAssetPath).isFile()) {
    sendFile(response, safeAssetPath);
    return;
  }

  const indexPath = path.join(buildDir, 'index.html');

  if (fs.existsSync(indexPath)) {
    sendFile(response, indexPath);
    return;
  }

  json(response, 200, {
    message: 'Talent Bank API is running. Build the React client to serve the UI from Node.',
    api: ['/api/health', '/api/login', '/api/dashboard', '/api/users', '/api/projects', '/api/tickets'],
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
