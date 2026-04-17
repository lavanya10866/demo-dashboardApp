const { getPool } = require('./db');
const { mockData } = require('./mockData');

const allowedUserStatuses = new Set(['Active', 'Inactive', 'Resign']);
const allowedProjectStatuses = new Set(['Assigned', 'In progress', 'Review', 'Final']);
const allowedProjectPriorities = new Set(['Low', 'Medium', 'High']);
const allowedTicketStatuses = new Set(['Solved', 'Unsolved', 'In progress']);
const allowedTicketPriorities = new Set(['Low', 'Medium', 'High']);
const employeeIdPattern = /^TAL\d{3,}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const mobilePattern = /^\d{10}$/;
const employeeNamePattern = /^[A-Za-z][A-Za-z\s.'-]{1,119}$/;

function requirePool(pool) {
  if (pool) {
    return;
  }

  const error = new Error('MySQL is not configured. Import the schema and set your DB env values first.');
  error.statusCode = 503;
  throw error;
}

function mapUserRow(row, index) {
  return {
    id: String(index + 1).padStart(2, '0'),
    employeeId: row.employeeId,
    name: row.name,
    mobile: row.mobile,
    email: row.email,
    role: row.role,
    status: row.status,
    joinedOn: row.joinedOn || null,
  };
}

function mapProjectRow(row) {
  return {
    code: row.code,
    name: row.name,
    owner: row.owner,
    progress: Number(row.progress),
    priority: row.priority,
    status: row.status,
    dueDate: row.dueDate,
  };
}

function mapTicketRow(row) {
  return {
    id: row.id,
    subject: row.subject,
    requester: row.requester,
    team: row.team,
    priority: row.priority,
    status: row.status,
    updatedAt: row.updatedAt,
  };
}

async function getDashboard() {
  const pool = await getPool();

  if (!pool) {
    return mockData.dashboard;
  }

  try {
    const [[projectSummary]] = await pool.query(
      `SELECT COUNT(*) AS totalProjects,
              SUM(CASE WHEN status = 'Review' THEN 1 ELSE 0 END) AS pendingReviews,
              SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) AS assignedProjects,
              SUM(CASE WHEN status = 'In progress' THEN 1 ELSE 0 END) AS inProgressProjects,
              SUM(CASE WHEN status = 'Review' THEN 1 ELSE 0 END) AS reviewProjects,
              SUM(CASE WHEN status = 'Final' THEN 1 ELSE 0 END) AS finalProjects
       FROM projects`
    );
    const [[userSummary]] = await pool.query(
      `SELECT COUNT(*) AS teamMembers,
              SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) AS activeEmployees
       FROM users`
    );
    const [[ticketSummary]] = await pool.query(
      `SELECT SUM(CASE WHEN status = 'Solved' THEN 1 ELSE 0 END) AS solvedTickets,
              SUM(CASE WHEN status = 'Unsolved' THEN 1 ELSE 0 END) AS unsolvedTickets,
              SUM(CASE WHEN status = 'In progress' THEN 1 ELSE 0 END) AS inProgressTickets
       FROM tickets`
    );

    const totalProjects = Number(projectSummary.totalProjects || 0);
    const pendingReviews = Number(projectSummary.pendingReviews || 0);
    const teamMembers = Number(userSummary.teamMembers || 0);
    const activeEmployees = Number(userSummary.activeEmployees || 0);
    const solvedTickets = Number(ticketSummary.solvedTickets || 0);
    const unsolvedTickets = Number(ticketSummary.unsolvedTickets || 0);
    const inProgressTickets = Number(ticketSummary.inProgressTickets || 0);
    const openTickets = unsolvedTickets + inProgressTickets;
    const projectSegments = [
      { label: 'Assigned', value: Number(projectSummary.assignedProjects || 0), color: '#f4c84a' },
      { label: 'In progress', value: Number(projectSummary.inProgressProjects || 0), color: '#6e5a8e' },
      { label: 'Review', value: Number(projectSummary.reviewProjects || 0), color: '#5da16f' },
      { label: 'Final', value: Number(projectSummary.finalProjects || 0), color: '#ee6257' },
    ];

    return {
      overviewCards: [
        { title: 'Total Projects', value: totalProjects, note: 'Live project records', theme: 'coral' },
        { title: 'Team Members', value: teamMembers, note: 'Employees in database', theme: 'sun' },
        { title: 'Active Employees', value: activeEmployees, note: 'Currently active', theme: 'violet' },
        { title: 'Resolved Tickets', value: solvedTickets, note: 'Closed by support', theme: 'mint' },
        { title: 'Pending Reviews', value: pendingReviews, note: 'Projects under review', theme: 'peach' },
        { title: 'Open Tickets', value: openTickets, note: 'Need follow-up', theme: 'sky' },
      ],
      leadStats: projectSegments.map((segment) => ({
        ...segment,
        percent: totalProjects === 0 ? 0 : Math.round((segment.value / totalProjects) * 100),
      })),
      salesTrend: mockData.dashboard.salesTrend,
      supportSummary: [
        { label: 'Solved', value: solvedTickets, color: '#eb5c57' },
        { label: 'Unsolved', value: unsolvedTickets, color: '#f3cb4d' },
        { label: 'In progress', value: inProgressTickets, color: '#63a26f' },
      ],
    };
  } catch (error) {
    return mockData.dashboard;
  }
}

async function getUsers() {
  const pool = await getPool();

  if (!pool) {
    return mockData.users;
  }

  try {
    const [rows] = await pool.query(
      `SELECT employee_id AS employeeId,
              name,
              mobile,
              email,
              role,
              status,
              DATE_FORMAT(joined_on, '%d.%m.%Y') AS joinedOn
       FROM users
       ORDER BY employee_id ASC`
    );

    return rows.map(mapUserRow);
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
      `SELECT project_code AS code,
              name,
              owner,
              progress,
              priority,
              status,
              DATE_FORMAT(due_date, '%d %b %Y') AS dueDate
       FROM projects
       ORDER BY due_date ASC, project_code ASC`
    );

    return rows.map(mapProjectRow);
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
      `SELECT ticket_id AS id,
              subject,
              requester,
              team,
              priority,
              status,
              DATE_FORMAT(updated_at, '%d %b %Y, %l:%i %p') AS updatedAt
       FROM tickets
       ORDER BY updated_at DESC, ticket_id DESC`
    );

    return rows.map(mapTicketRow);
  } catch (error) {
    return mockData.tickets;
  }
}

async function authenticateUser(email, password) {
  const pool = await getPool();

  if (!pool) {
    return email === 'admin@talentbank.com' && password === 'admin123'
      ? mockData.currentUser
      : null;
  }

  try {
    const [rows] = await pool.query(
      `SELECT id, name, role, email
       FROM admin_users
       WHERE LOWER(email) = ? AND password = ?
       LIMIT 1`,
      [email, password]
    );

    return rows[0] || null;
  } catch (error) {
    return null;
  }
}

function validateUserPayload(payload) {
  const sanitized = {
    name: String(payload.name || '').trim(),
    mobile: String(payload.mobile || '').trim(),
    email: String(payload.email || '').trim().toLowerCase(),
    role: String(payload.role || '').trim(),
    status: String(payload.status || '').trim(),
  };

  if (!sanitized.name || !sanitized.mobile || !sanitized.email || !sanitized.role || !sanitized.status) {
    throw new Error('All user fields are required.');
  }

  if (!allowedUserStatuses.has(sanitized.status)) {
    throw new Error('Status must be Active, Inactive, or Resign.');
  }

  if (!employeeNamePattern.test(sanitized.name)) {
    throw new Error(
      'Employee name must be at least 2 letters and can only include spaces, apostrophes, periods, or hyphens.'
    );
  }

  if (!mobilePattern.test(sanitized.mobile)) {
    throw new Error('Mobile number must be exactly 10 digits.');
  }

  if (!emailPattern.test(sanitized.email)) {
    throw new Error('Enter a valid email address.');
  }

  if (sanitized.role.length < 2) {
    throw new Error('Role must be at least 2 characters.');
  }

  return sanitized;
}

function validateNewUserPayload(payload) {
  const employeeId = String(payload.employeeId || '').trim().toUpperCase();
  const joinedOn = String(payload.joinedOn || '').trim();
  const sanitized = validateUserPayload(payload);

  if (!employeeId) {
    throw new Error('Employee ID is required.');
  }

  if (!employeeIdPattern.test(employeeId)) {
    throw new Error('Employee ID must use the format TAL001.');
  }

  if (!joinedOn || !/^\d{4}-\d{2}-\d{2}$/.test(joinedOn)) {
    throw new Error('Joined date must be in YYYY-MM-DD format.');
  }

  return {
    employeeId,
    joinedOn,
    ...sanitized,
  };
}

function validateProjectPayload(payload) {
  const sanitized = {
    code: String(payload.code || '').trim().toUpperCase(),
    name: String(payload.name || '').trim(),
    owner: String(payload.owner || '').trim(),
    progress: Number(payload.progress),
    priority: String(payload.priority || '').trim(),
    status: String(payload.status || '').trim(),
    dueDate: String(payload.dueDate || '').trim(),
  };

  if (!sanitized.code || !sanitized.name || !sanitized.owner || !sanitized.priority || !sanitized.status || !sanitized.dueDate) {
    throw new Error('All project fields are required.');
  }

  if (!Number.isFinite(sanitized.progress) || sanitized.progress < 0 || sanitized.progress > 100) {
    throw new Error('Progress must be a number between 0 and 100.');
  }

  if (!allowedProjectPriorities.has(sanitized.priority)) {
    throw new Error('Priority must be Low, Medium, or High.');
  }

  if (!allowedProjectStatuses.has(sanitized.status)) {
    throw new Error('Status must be Assigned, In progress, Review, or Final.');
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(sanitized.dueDate)) {
    throw new Error('Due date must be in YYYY-MM-DD format.');
  }

  return sanitized;
}

function validateTicketPayload(payload) {
  const sanitized = {
    id: String(payload.id || '').trim().toUpperCase(),
    subject: String(payload.subject || '').trim(),
    requester: String(payload.requester || '').trim(),
    team: String(payload.team || '').trim(),
    priority: String(payload.priority || '').trim(),
    status: String(payload.status || '').trim(),
  };

  if (!sanitized.id || !sanitized.subject || !sanitized.requester || !sanitized.team || !sanitized.priority || !sanitized.status) {
    throw new Error('All ticket fields are required.');
  }

  if (!allowedTicketPriorities.has(sanitized.priority)) {
    throw new Error('Priority must be Low, Medium, or High.');
  }

  if (!allowedTicketStatuses.has(sanitized.status)) {
    throw new Error('Status must be Solved, Unsolved, or In progress.');
  }

  return sanitized;
}

async function updateUser(employeeId, payload) {
  const pool = await getPool();
  requirePool(pool);
  const sanitized = validateUserPayload(payload);

  try {
    const [result] = await pool.query(
      `UPDATE users
       SET name = ?, mobile = ?, email = ?, role = ?, status = ?
       WHERE employee_id = ?`,
      [
        sanitized.name,
        sanitized.mobile,
        sanitized.email,
        sanitized.role,
        sanitized.status,
        employeeId,
      ]
    );

    if (!result.affectedRows) {
      const error = new Error('User not found.');
      error.statusCode = 404;
      throw error;
    }

    const [rows] = await pool.query(
      `SELECT employee_id AS employeeId,
              name,
              mobile,
              email,
              role,
              status,
              DATE_FORMAT(joined_on, '%d.%m.%Y') AS joinedOn
       FROM users
       WHERE employee_id = ?
       LIMIT 1`,
      [employeeId]
    );

    return rows[0];
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('That email address is already used by another employee.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function createUser(payload) {
  const pool = await getPool();
  requirePool(pool);
  const sanitized = validateNewUserPayload(payload);

  try {
    await pool.query(
      `INSERT INTO users (employee_id, name, mobile, email, role, status, joined_on)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitized.employeeId,
        sanitized.name,
        sanitized.mobile,
        sanitized.email,
        sanitized.role,
        sanitized.status,
        sanitized.joinedOn,
      ]
    );

    const [rows] = await pool.query(
      `SELECT employee_id AS employeeId,
              name,
              mobile,
              email,
              role,
              status,
              DATE_FORMAT(joined_on, '%d.%m.%Y') AS joinedOn
       FROM users
       WHERE employee_id = ?
       LIMIT 1`,
      [sanitized.employeeId]
    );

    return rows[0];
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('Employee ID or email already exists.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function deleteUser(employeeId) {
  const pool = await getPool();
  requirePool(pool);

  const [result] = await pool.query(`DELETE FROM users WHERE employee_id = ?`, [employeeId]);

  if (!result.affectedRows) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
}

async function createProject(payload) {
  const pool = await getPool();
  requirePool(pool);
  const sanitized = validateProjectPayload(payload);

  try {
    await pool.query(
      `INSERT INTO projects (project_code, name, owner, progress, priority, status, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        sanitized.code,
        sanitized.name,
        sanitized.owner,
        sanitized.progress,
        sanitized.priority,
        sanitized.status,
        sanitized.dueDate,
      ]
    );

    const [rows] = await pool.query(
      `SELECT project_code AS code,
              name,
              owner,
              progress,
              priority,
              status,
              DATE_FORMAT(due_date, '%d %b %Y') AS dueDate
       FROM projects
       WHERE project_code = ?
       LIMIT 1`,
      [sanitized.code]
    );

    return mapProjectRow(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('Project code already exists.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

async function createTicket(payload) {
  const pool = await getPool();
  requirePool(pool);
  const sanitized = validateTicketPayload(payload);

  try {
    await pool.query(
      `INSERT INTO tickets (ticket_id, subject, requester, team, priority, status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        sanitized.id,
        sanitized.subject,
        sanitized.requester,
        sanitized.team,
        sanitized.priority,
        sanitized.status,
      ]
    );

    const [rows] = await pool.query(
      `SELECT ticket_id AS id,
              subject,
              requester,
              team,
              priority,
              status,
              DATE_FORMAT(updated_at, '%d %b %Y, %l:%i %p') AS updatedAt
       FROM tickets
       WHERE ticket_id = ?
       LIMIT 1`,
      [sanitized.id]
    );

    return mapTicketRow(rows[0]);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const duplicateError = new Error('Ticket ID already exists.');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    throw error;
  }
}

module.exports = {
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
};
