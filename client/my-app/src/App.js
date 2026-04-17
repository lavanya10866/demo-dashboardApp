import { useEffect, useMemo, useState } from 'react';
import './App.css';

const EMPTY_RESPONSE = {
  currentUser: {
    id: 0,
    name: 'Talent Bank',
    role: 'Admin',
    initials: 'TB',
    email: '',
  },
  dashboard: {
    overviewCards: [],
    leadStats: [],
    salesTrend: [],
    supportSummary: [],
  },
  users: [],
  projects: [],
  tickets: [],
};

const USER_STATUS_OPTIONS = ['Active', 'Inactive', 'Resign'];
const PROJECT_PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const PROJECT_STATUS_OPTIONS = ['Assigned', 'In progress', 'Review', 'Final'];
const TICKET_PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
const TICKET_STATUS_OPTIONS = ['Solved', 'Unsolved', 'In progress'];

const pageTitles = {
  dashboard: 'Dashboard',
  users: 'User management',
  projects: 'Project management',
  tickets: 'Support tickets',
};

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { key: 'users', label: 'User management', icon: 'people' },
  { key: 'projects', label: 'Project management', icon: 'kanban' },
  { key: 'tickets', label: 'Support tickets', icon: 'headset' },
];

const API_BASE = process.env.REACT_APP_API_URL || '';

function getInitials(name = '') {
  const tokens = String(name)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (tokens.length === 0) {
    return 'TB';
  }

  return tokens.map((token) => token[0].toUpperCase()).join('');
}

function normalizeCurrentUser(user) {
  return {
    id: user?.id || 0,
    name: user?.name || 'Talent Bank',
    role: user?.role || 'Admin',
    email: user?.email || '',
    initials: user?.initials || getInitials(user?.name),
  };
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

const EMPLOYEE_ID_PATTERN = /^TAL\d{3,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\d{10}$/;
const EMPLOYEE_NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]{1,119}$/;

function normalizeEmployeeId(value = '') {
  return String(value).trim().toUpperCase();
}

function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase();
}

function getFieldClassName(baseClassName, hasError) {
  return hasError ? `${baseClassName} field-invalid` : baseClassName;
}

function getNextEmployeeId(users = []) {
  const highestValue = users.reduce((currentMax, user) => {
    const match = normalizeEmployeeId(user.employeeId).match(/^TAL(\d+)$/);

    if (!match) {
      return currentMax;
    }

    return Math.max(currentMax, Number.parseInt(match[1], 10));
  }, 0);

  return `TAL${String(highestValue + 1).padStart(3, '0')}`;
}

function buildNewUserFormState(employeeId = '') {
  return {
    employeeId,
    name: '',
    mobile: '',
    email: '',
    role: '',
    status: USER_STATUS_OPTIONS[0],
    joinedOn: getTodayInputValue(),
  };
}

function sanitizeUserFormValues(values) {
  const sanitized = {
    employeeId: normalizeEmployeeId(values.employeeId),
    name: String(values.name || '').trim(),
    mobile: String(values.mobile || '').trim(),
    email: normalizeEmail(values.email),
    role: String(values.role || '').trim(),
    status: String(values.status || USER_STATUS_OPTIONS[0]).trim(),
  };

  if (Object.prototype.hasOwnProperty.call(values, 'joinedOn')) {
    sanitized.joinedOn = String(values.joinedOn || '').trim();
  }

  return sanitized;
}

function getUserFormErrors(
  values,
  { existingUsers = [], currentEmployeeId = '', requireEmployeeId = false, requireJoinedOn = false } = {}
) {
  const errors = {};
  const employeeId = normalizeEmployeeId(values.employeeId);
  const email = normalizeEmail(values.email);
  const normalizedCurrentEmployeeId = normalizeEmployeeId(currentEmployeeId);

  if (requireEmployeeId) {
    if (!employeeId) {
      errors.employeeId = 'Employee ID is required.';
    } else if (!EMPLOYEE_ID_PATTERN.test(employeeId)) {
      errors.employeeId = 'Employee ID must use the format TAL001.';
    } else if (
      existingUsers.some(
        (user) =>
          normalizeEmployeeId(user.employeeId) === employeeId &&
          normalizeEmployeeId(user.employeeId) !== normalizedCurrentEmployeeId
      )
    ) {
      errors.employeeId = 'Employee ID already exists.';
    }
  }

  if (!values.name) {
    errors.name = 'Employee name is required.';
  } else if (!EMPLOYEE_NAME_PATTERN.test(values.name)) {
    errors.name = 'Use at least 2 letters. Spaces, apostrophes, periods, and hyphens are allowed.';
  }

  if (!values.mobile) {
    errors.mobile = 'Mobile number is required.';
  } else if (!MOBILE_PATTERN.test(values.mobile)) {
    errors.mobile = 'Mobile number must be exactly 10 digits.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  } else if (
    existingUsers.some(
      (user) =>
        normalizeEmail(user.email) === email &&
        normalizeEmployeeId(user.employeeId) !== normalizedCurrentEmployeeId
    )
  ) {
    errors.email = 'That email address is already used by another employee.';
  }

  if (!values.role) {
    errors.role = 'Role is required.';
  } else if (values.role.length < 2) {
    errors.role = 'Role must be at least 2 characters.';
  }

  if (!USER_STATUS_OPTIONS.includes(values.status)) {
    errors.status = 'Select a valid status.';
  }

  if (requireJoinedOn) {
    if (!values.joinedOn) {
      errors.joinedOn = 'Joined date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.joinedOn)) {
      errors.joinedOn = 'Joined date must be in YYYY-MM-DD format.';
    }
  }

  return errors;
}

function getPageFromHash() {
  const route = window.location.hash.replace('#/', '').trim();
  if (!route) {
    return 'login';
  }

  return route;
}

function setHash(route) {
  window.location.hash = `/${route}`;
}

async function apiRequest(requestPath, options = {}) {
  const hasJsonBody = options.body !== undefined;
  const response = await fetch(`${API_BASE}${requestPath}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/json',
      ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
    body: hasJsonBody ? JSON.stringify(options.body) : undefined,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed for ${requestPath}`);
  }

  return payload;
}

function LoginPage({ onLogin, loading, error }) {
  const [credentials, setCredentials] = useState({
    email: 'admin@talentbank.com',
    password: 'admin123',
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(credentials);
  };

  return (
    <div className="login-shell">
      <div className="login-backdrop"></div>
      <div className="container login-container">
        <div className="row justify-content-center align-items-center login-stage">
          <div className="col-12 col-xl-11">
            <div className="login-card shadow-lg">
              <div className="row g-0">
                <div className="col-lg-6">
                  <div className="login-brand-panel">
                    <span className="eyebrow">Talent Bank Workspace</span>
                    <h1>Admin dashboard for teams, projects, and support tickets.</h1>
                    <p>
                      Sign in to manage employees, track project delivery, and respond to
                      internal support requests from one place.
                    </p>
                    <div className="login-feature-grid">
                      <div className="feature-chip">
                        <i className="bi bi-people"></i>
                        <span>User management</span>
                      </div>
                      <div className="feature-chip">
                        <i className="bi bi-kanban"></i>
                        <span>Project overview</span>
                      </div>
                      <div className="feature-chip">
                        <i className="bi bi-headset"></i>
                        <span>Ticket workflow</span>
                      </div>
                    </div>
                    <div className="login-preview">
                      <div className="preview-card">
                        <span>Today</span>
                        <strong>20 active projects</strong>
                        <small>26 support tickets in progress</small>
                      </div>
            
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="login-form-panel">
                    <div className="login-logo">TB</div>
                    <h2>Welcome back</h2>
                    <p className="text-muted mb-4">
                      Use your admin credentials to open the dashboard.
                    </p>
                    <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Email address</label>
                        <input
                          className="form-control form-control-lg"
                          type="email"
                          value={credentials.email}
                          onChange={(event) =>
                            setCredentials((current) => ({
                              ...current,
                              email: event.target.value,
                            }))
                          }
                          placeholder="name@company.com"
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                          className="form-control form-control-lg"
                          type="password"
                          value={credentials.password}
                          onChange={(event) =>
                            setCredentials((current) => ({
                              ...current,
                              password: event.target.value,
                            }))
                          }
                          placeholder="Enter password"
                          required
                        />
                      </div>
                      {error ? <div className="alert alert-danger py-2">{error}</div> : null}
                      <button className="btn btn-success btn-lg w-100 mt-3" disabled={loading}>
                        {loading ? 'Signing in...' : 'Login'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopBar({ title, user, onLogout }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="topbar-actions">
        <button className="icon-button" type="button" aria-label="Notifications">
          <i className="bi bi-bell"></i>
          <span className="notification-dot"></span>
        </button>
        <button className="icon-button" type="button" aria-label="Settings">
          <i className="bi bi-gear"></i>
        </button>
        <div className="profile-pill">
          <div className="avatar-circle">{user.initials}</div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-role">{user.role}</div>
          </div>
        </div>
        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="sidebar-panel">
      <div className="brand-card">
        <div className="brand-logo">TB</div>
        <div>
          <div className="brand-title">Talent Bank</div>
          <div className="brand-subtitle">Admin panel</div>
        </div>
      </div>
      <nav className="nav flex-column gap-2">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.key}
            className={`sidebar-link ${activePage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <i className={`bi bi-${item.icon}`}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function MetricCard({ card }) {
  return (
    <div className={`metric-card theme-${card.theme}`}>
      <div className="metric-card-icon">
        <i className="bi bi-wallet2"></i>
      </div>
      <div className="metric-value">{card.value}</div>
      <div className="metric-title">{card.title}</div>
      <div className="metric-note">{card.note}</div>
    </div>
  );
}

function DonutChart({ stats }) {
  const gradient = stats
    .map((item, index) => {
      const start = stats
        .slice(0, index)
        .reduce((total, current) => total + current.percent, 0);
      const end = start + item.percent;
      return `${item.color} ${start}% ${end}%`;
    })
    .join(', ');

  return (
    <div className="donut-wrap">
      <div className="donut-chart" style={{ background: `conic-gradient(${gradient})` }}>
        <div className="donut-core"></div>
      </div>
      <div className="legend-list">
        {stats.map((item) => (
          <div className="legend-row" key={item.label}>
            <span className="legend-label">
              <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
              {item.label}
            </span>
            <strong>{String(item.value).padStart(2, '0')}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function SalesBars({ salesTrend }) {
  const maxValue = Math.max(...salesTrend.map((item) => Math.max(item.total, item.converted)));

  return (
    <div className="sales-chart">
      {salesTrend.map((item) => (
        <div className="bar-group" key={item.day}>
          <div className="bar-pair">
            <div
              className="bar total"
              style={{ height: `${(item.total / maxValue) * 100}%` }}
            ></div>
            <div
              className="bar converted"
              style={{ height: `${(item.converted / maxValue) * 100}%` }}
            ></div>
          </div>
          <small>{item.day}</small>
        </div>
      ))}
    </div>
  );
}

function SupportBubbles({ items }) {
  return (
    <div className="support-bubbles">
      {items.map((item) => (
        <div
          key={item.label}
          className="support-bubble"
          style={{
            backgroundColor: item.color,
            width: `${item.value * 4.6}px`,
            height: `${item.value * 4.6}px`,
          }}
        >
          <strong>{item.value}</strong>
        </div>
      ))}
      <div className="legend-list">
        {items.map((item) => (
          <div className="legend-row" key={item.label}>
            <span className="legend-label">
              <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
              {item.label}
            </span>
            <strong>{String(item.value).padStart(2, '0')}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardPage({ dashboard }) {
  const totalProjects =
    dashboard.overviewCards.find((card) => card.title === 'Total Projects')?.value ?? 0;
  const totalSales = dashboard.salesTrend.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );
  const totalTickets = dashboard.supportSummary.reduce(
    (sum, item) => sum + Number(item.value || 0),
    0
  );

  return (
    <div className="content-stack">
      <div className="panel-card">
        <div className="section-heading">
          <div className="heading-left">
            <span className="section-icon">
              <i className="bi bi-bar-chart"></i>
            </span>
            <div>
              <h3>Overview</h3>
            </div>
          </div>
          <div className="heading-actions">
            <button className="icon-button sm" type="button">
              <i className="bi bi-sliders"></i>
            </button>
            <button className="icon-button sm" type="button">
              <i className="bi bi-calendar3"></i>
            </button>
          </div>
        </div>
        <div className="metric-grid">
          {dashboard.overviewCards.map((card) => (
            <MetricCard card={card} key={card.title} />
          ))}
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="panel-card h-100">
            <div className="section-heading">
              <div className="heading-left">
                <span className="section-icon">
                  <i className="bi bi-bullseye"></i>
                </span>
              <div>
                  <h3>Project Status</h3>
                  <p>Live breakdown from projects table</p>
                </div>
              </div>
              <strong className="headline-number">{totalProjects}</strong>
            </div>
            <DonutChart stats={dashboard.leadStats} />
          </div>
        </div>
        <div className="col-lg-7">
          <div className="panel-card h-100">
            <div className="section-heading">
              <div className="heading-left">
                <span className="section-icon">
                  <i className="bi bi-megaphone"></i>
                </span>
                <div>
                  <h3>Sales</h3>
                  <p>Static demo trend {totalSales}</p>
                </div>
              </div>
              <div className="mini-legend">
                <span className="legend-label">
                  <span className="legend-dot" style={{ backgroundColor: '#eb5c57' }}></span>
                  Total Sales
                </span>
                <span className="legend-label">
                  <span className="legend-dot" style={{ backgroundColor: '#66a16f' }}></span>
                  Converted
                </span>
              </div>
            </div>
            <SalesBars salesTrend={dashboard.salesTrend} />
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-heading">
          <div className="heading-left">
            <span className="section-icon">
              <i className="bi bi-headset"></i>
            </span>
            <div>
              <h3>Support Status</h3>
              <p>Live ticket totals {totalTickets}</p>
            </div>
          </div>
          <span className="week-tag">From database</span>
        </div>
        <SupportBubbles items={dashboard.supportSummary} />
      </div>
    </div>
  );
}

function StatusBadge({ value }) {
  const normalized = value.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status-badge ${normalized}`}>{value}</span>;
}

const userBoardDates = ['03.06.2025', '05.06.2025', '08.06.2025', '10.06.2025', '13.06.2025'];
const userStatusOrder = ['Active', 'Inactive', 'Resign'];

function getUserColumnTone(status) {
  if (status === 'Active') {
    return 'active';
  }

  if (status === 'Inactive') {
    return 'inactive';
  }

  return 'resign';
}

function UserManagementPage({
  users,
  onOpenResignation,
  onOpenAddUser,
  onEditUser,
  onDeleteUser,
  savingUserId,
  deletingUserId,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');

  const roleOptions = useMemo(
    () => ['all', ...new Set(users.map((user) => user.role))],
    [users]
  );

  const statusOptions = useMemo(
    () => ['all', ...new Set(users.map((user) => user.status))],
    [users]
  );

  const filteredUsers = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return users
      .filter((user) => {
        if (roleFilter !== 'all' && user.role !== roleFilter) {
          return false;
        }

        if (statusFilter !== 'all' && user.status !== statusFilter) {
          return false;
        }

        if (!searchValue) {
          return true;
        }

        const searchableText = [
          user.employeeId,
          user.name,
          user.mobile,
          user.email,
          user.role,
          user.status,
        ]
          .join(' ')
          .toLowerCase();

        return searchableText.includes(searchValue);
      })
      .map((user, index) => ({
        ...user,
        joinedOn: user.joinedOn || userBoardDates[index % userBoardDates.length],
      }));
  }, [users, roleFilter, statusFilter, searchTerm]);

  const kanbanGroups = useMemo(() => {
    const groups = userStatusOrder
      .map((status) => ({
        status,
        users: filteredUsers.filter((user) => user.status === status),
      }))
      .filter((group) => group.users.length > 0);

    if (groups.length > 0) {
      return groups;
    }

    return [
      {
        status: statusFilter === 'all' ? 'Active' : statusFilter,
        users: [],
      },
    ];
  }, [filteredUsers, statusFilter]);

  return (
    <div className="panel-card">
      <div className="section-heading align-items-start">
        <div>
          <h3>User List</h3>
          <p className="mb-0 text-muted">{filteredUsers.length} employees shown</p>
        </div>
        <div className="title-actions">
          {/* <span className="toolbar-pill">MySQL-backed records</span> */}
          <button className="btn btn-success" type="button" onClick={onOpenAddUser}>
            <i className="bi bi-person-plus me-2"></i>
            Add Employee
          </button>
        </div>
      </div>

      <div className="toolbar-row">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <div className="toolbar-actions">
          <select
            className="form-select"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">By role</option>
            {roleOptions.slice(1).map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="all">By status</option>
            {statusOptions.slice(1).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="form-select"
            value={viewMode}
            onChange={(event) => setViewMode(event.target.value)}
          >
            <option value="kanban">List View</option>
            <option value="table">Table View</option>
          </select>
          <button className="btn btn-outline-success" type="button" onClick={onOpenResignation}>
            Resignation
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="table-responsive">
          <table className="table align-middle custom-table">
            <thead>
              <tr>
                <th>S No</th>
                <th>Employee ID</th>
                <th>Employee name</th>
                <th>Mobile no</th>
                <th>Email ID</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.employeeId}>
                  <td>{user.id}</td>
                  <td>{user.employeeId}</td>
                  <td>{user.name}</td>
                  <td>{user.mobile}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="table-link">{user.role}</span>
                  </td>
                  <td>
                    <StatusBadge value={user.status} />
                  </td>
                  <td className="action-links">
                    <button
                      className="table-action-button"
                      type="button"
                      onClick={() => onEditUser(user)}
                      disabled={savingUserId === user.employeeId || deletingUserId === user.employeeId}
                    >
                      <i className="bi bi-pencil me-1"></i>
                      {savingUserId === user.employeeId ? 'Saving...' : 'Edit'}
                    </button>
                    <button
                      className="table-action-button danger"
                      type="button"
                      onClick={() => onDeleteUser(user)}
                      disabled={savingUserId === user.employeeId || deletingUserId === user.employeeId}
                    >
                      <i className="bi bi-trash me-1"></i>
                      {deletingUserId === user.employeeId ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="user-board">
          {kanbanGroups.map((group) => (
            <div className="user-board-column" key={group.status}>
              <div className={`user-board-header ${getUserColumnTone(group.status)}`}>
                <div>
                  <strong>{group.status}</strong>
                  <span>{filteredUsers.length === 0 ? '0%' : `${Math.round((group.users.length / filteredUsers.length) * 100)}%`}</span>
                </div>
                <span className="user-board-count">{group.users.length}</span>
              </div>

              <div className="user-board-stack">
                {group.users.length === 0 ? (
                  <div className="user-empty-state">No users found</div>
                ) : (
                  group.users.map((user) => (
                    <div className="user-card" key={user.employeeId}>
                      <div className="user-card-topline">
                        <strong>{user.name}</strong>
                        <span>{user.joinedOn}</span>
                      </div>
                      <div className="user-card-role">{user.role}</div>
                      <div className="user-card-email">{user.email}</div>
                      <div className="user-card-id">{user.employeeId}</div>
                      <div className="user-card-actions">
                        <button
                          className="table-action-button"
                          type="button"
                          onClick={() => onEditUser(user)}
                          disabled={savingUserId === user.employeeId || deletingUserId === user.employeeId}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          {savingUserId === user.employeeId ? 'Saving...' : 'Edit'}
                        </button>
                        <button
                          className="table-action-button danger"
                          type="button"
                          onClick={() => onDeleteUser(user)}
                          disabled={savingUserId === user.employeeId || deletingUserId === user.employeeId}
                        >
                          <i className="bi bi-trash me-1"></i>
                          {deletingUserId === user.employeeId ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="user-empty-banner">No employees match the current search and filters.</div>
      ) : null}

      <div className="pagination-row">
        <button className="page-circle">
          <i className="bi bi-chevron-left"></i>
        </button>
        <button className="page-circle active">1</button>
        <button className="page-circle">2</button>
        <button className="page-circle">3</button>
        <button className="page-circle">4</button>
        <button className="page-circle">5</button>
        <span>...</span>
        <button className="page-circle">10</button>
        <button className="page-circle">
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </div>
  );
}

function ProjectManagementPage({ projects, onOpenCreateProject }) {
  return (
    <div className="content-stack">
      <div className="row g-4">
        {projects.map((project) => (
          <div className="col-md-6 col-xl-3" key={project.code}>
            <div className="project-card">
              <div className="project-topline">
                <span className="project-code">{project.code}</span>
                <StatusBadge value={project.status} />
              </div>
              <h3>{project.name}</h3>
              <p>Owner: {project.owner}</p>
              <div className="progress progress-thin mb-3">
                <div className="progress-bar bg-success" style={{ width: `${project.progress}%` }}></div>
              </div>
              <div className="project-meta">
                <span>{project.progress}% complete</span>
                <span>{project.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="panel-card">
        <div className="section-heading">
          <div>
            <h3>Project tracker</h3>
            <p>Current delivery board</p>
          </div>
          <button className="btn btn-success" type="button" onClick={onOpenCreateProject}>
            <i className="bi bi-plus-lg me-2"></i>
            New project
          </button>
        </div>
        <div className="table-responsive">
          <table className="table align-middle custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Project</th>
                <th>Owner</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Due date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.code}>
                  <td>{project.code}</td>
                  <td>{project.name}</td>
                  <td>{project.owner}</td>
                  <td>{project.priority}</td>
                  <td>
                    <div className="progress project-table-progress">
                      <div
                        className="progress-bar bg-success"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                    <small>{project.progress}%</small>
                  </td>
                  <td>{project.dueDate}</td>
                  <td>
                    <StatusBadge value={project.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SupportTicketsPage({ tickets, onOpenCreateTicket }) {
  const solvedCount = tickets.filter((ticket) => ticket.status === 'Solved').length;
  const progressCount = tickets.filter((ticket) => ticket.status === 'In progress').length;
  const unsolvedCount = tickets.filter((ticket) => ticket.status === 'Unsolved').length;

  return (
    <div className="content-stack">
      <div className="row g-4">
        <div className="col-md-4">
          <div className="summary-card solved">
            <span>Solved</span>
            <strong>{solvedCount}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card progress-card">
            <span>In progress</span>
            <strong>{progressCount}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card unsolved">
            <span>Unsolved</span>
            <strong>{unsolvedCount}</strong>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-heading">
          <div>
            <h3>Support queue</h3>
            <p>Latest issues raised by internal teams</p>
          </div>
          <button className="btn btn-success" type="button" onClick={onOpenCreateTicket}>
            <i className="bi bi-life-preserver me-2"></i>
            Create ticket
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle custom-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Requester</th>
                <th>Team</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.requester}</td>
                  <td>{ticket.team}</td>
                  <td>{ticket.priority}</td>
                  <td>
                    <StatusBadge value={ticket.status} />
                  </td>
                  <td>{ticket.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ open, saving, error, users, onClose, onSave }) {
  const nextEmployeeId = useMemo(() => getNextEmployeeId(users), [users]);
  const [formValues, setFormValues] = useState(() => buildNewUserFormState(nextEmployeeId));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues(buildNewUserFormState(nextEmployeeId));
    setFieldErrors({});
  }, [nextEmployeeId, open]);

  if (!open) {
    return null;
  }

  const updateField = (field) => (event) => {
    const nextValue =
      field === 'mobile' ? event.target.value.replace(/\D/g, '').slice(0, 10) : event.target.value;

    setFormValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextValues = sanitizeUserFormValues(formValues);
    const nextErrors = getUserFormErrors(nextValues, {
      existingUsers: users,
      requireEmployeeId: true,
      requireJoinedOn: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    onSave(nextValues);
  };

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={saving ? undefined : onClose}></div>
      <div className="edit-user-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Employee Record</span>
            <h4 className="modal-title mb-1">Add employee</h4>
            <p className="resignation-subtitle mb-0">
              Create a new employee record and save it directly to MySQL.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={saving}></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pt-0">
          <div className="edit-form-grid">
            <div className="resignation-field">
              <label className="form-label">Employee ID</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.employeeId))}
                value={formValues.employeeId}
                readOnly
                disabled={saving}
              />
              <div className="field-hint">Auto-generated from the latest employee ID.</div>
              {fieldErrors.employeeId ? <div className="field-feedback">{fieldErrors.employeeId}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Joined date</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.joinedOn))}
                type="date"
                value={formValues.joinedOn}
                onChange={updateField('joinedOn')}
                disabled={saving}
                required
              />
              {fieldErrors.joinedOn ? <div className="field-feedback">{fieldErrors.joinedOn}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Employee name</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.name))}
                value={formValues.name}
                onChange={updateField('name')}
                disabled={saving}
                maxLength={120}
                required
              />
              {fieldErrors.name ? <div className="field-feedback">{fieldErrors.name}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Mobile number</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.mobile))}
                value={formValues.mobile}
                onChange={updateField('mobile')}
                inputMode="numeric"
                maxLength={10}
                disabled={saving}
                required
              />
              {fieldErrors.mobile ? <div className="field-feedback">{fieldErrors.mobile}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Email</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.email))}
                type="email"
                value={formValues.email}
                onChange={updateField('email')}
                disabled={saving}
                required
              />
              {fieldErrors.email ? <div className="field-feedback">{fieldErrors.email}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Role</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.role))}
                value={formValues.role}
                onChange={updateField('role')}
                disabled={saving}
                maxLength={120}
                required
              />
              {fieldErrors.role ? <div className="field-feedback">{fieldErrors.role}</div> : null}
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Status</label>
              <select
                className={getFieldClassName('form-select', Boolean(fieldErrors.status))}
                value={formValues.status}
                onChange={updateField('status')}
                disabled={saving}
              >
                {USER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {fieldErrors.status ? <div className="field-feedback">{fieldErrors.status}</div> : null}
            </div>
          </div>

          {error ? <div className="form-feedback error">{error}</div> : null}

          <div className="resignation-modal-footer edit-user-footer">
            <button
              className="btn btn-light resignation-secondary-btn"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="btn btn-success resignation-primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({ user, deleting, error, onClose, onConfirm }) {
  if (!user) {
    return null;
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={deleting ? undefined : onClose}></div>
      <div className="confirm-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker danger">Delete Record</span>
            <h4 className="modal-title mb-1">Delete employee</h4>
            <p className="resignation-subtitle mb-0">
              This removes {user.name} ({user.employeeId}) from MySQL.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={deleting}></button>
        </div>

        <div className="confirm-modal-body">
          <p className="confirm-copy">
            This action cannot be undone. Please confirm before deleting the record.
          </p>
          {error ? <div className="form-feedback error compact">{error}</div> : null}
        </div>

        <div className="resignation-modal-footer">
          <button
            className="btn btn-light resignation-secondary-btn"
            type="button"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button className="btn btn-danger resignation-primary-btn" type="button" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CreateProjectModal({ open, saving, error, onClose, onSave }) {
  const [formValues, setFormValues] = useState({
    code: '',
    name: '',
    owner: '',
    progress: '0',
    priority: PROJECT_PRIORITY_OPTIONS[1],
    status: PROJECT_STATUS_OPTIONS[0],
    dueDate: getTodayInputValue(),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues({
      code: '',
      name: '',
      owner: '',
      progress: '0',
      priority: PROJECT_PRIORITY_OPTIONS[1],
      status: PROJECT_STATUS_OPTIONS[0],
      dueDate: getTodayInputValue(),
    });
  }, [open]);

  if (!open) {
    return null;
  }

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formValues);
  };

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={saving ? undefined : onClose}></div>
      <div className="edit-user-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Project Record</span>
            <h4 className="modal-title mb-1">Create project</h4>
            <p className="resignation-subtitle mb-0">
              Add a project card and tracker row from one form.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={saving}></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pt-0">
          <div className="edit-form-grid">
            <div className="resignation-field">
              <label className="form-label">Project code</label>
              <input className="form-control" value={formValues.code} onChange={updateField('code')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Owner</label>
              <input className="form-control" value={formValues.owner} onChange={updateField('owner')} disabled={saving} required />
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Project name</label>
              <input className="form-control" value={formValues.name} onChange={updateField('name')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Progress</label>
              <input className="form-control" type="number" min="0" max="100" value={formValues.progress} onChange={updateField('progress')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Due date</label>
              <input className="form-control" type="date" value={formValues.dueDate} onChange={updateField('dueDate')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Priority</label>
              <select className="form-select" value={formValues.priority} onChange={updateField('priority')} disabled={saving}>
                {PROJECT_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="resignation-field">
              <label className="form-label">Status</label>
              <select className="form-select" value={formValues.status} onChange={updateField('status')} disabled={saving}>
                {PROJECT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="form-feedback error">{error}</div> : null}

          <div className="resignation-modal-footer edit-user-footer">
            <button className="btn btn-light resignation-secondary-btn" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-success resignation-primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CreateTicketModal({ open, saving, error, onClose, onSave }) {
  const [formValues, setFormValues] = useState({
    id: '',
    subject: '',
    requester: '',
    team: '',
    priority: TICKET_PRIORITY_OPTIONS[1],
    status: TICKET_STATUS_OPTIONS[1],
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues({
      id: '',
      subject: '',
      requester: '',
      team: '',
      priority: TICKET_PRIORITY_OPTIONS[1],
      status: TICKET_STATUS_OPTIONS[1],
    });
  }, [open]);

  if (!open) {
    return null;
  }

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formValues);
  };

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={saving ? undefined : onClose}></div>
      <div className="edit-user-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Support Ticket</span>
            <h4 className="modal-title mb-1">Create ticket</h4>
            <p className="resignation-subtitle mb-0">
              Add a new support issue and push it to the tickets table immediately.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={saving}></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pt-0">
          <div className="edit-form-grid">
            <div className="resignation-field">
              <label className="form-label">Ticket ID</label>
              <input className="form-control" value={formValues.id} onChange={updateField('id')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Requester</label>
              <input className="form-control" value={formValues.requester} onChange={updateField('requester')} disabled={saving} required />
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Subject</label>
              <input className="form-control" value={formValues.subject} onChange={updateField('subject')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Team</label>
              <input className="form-control" value={formValues.team} onChange={updateField('team')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Priority</label>
              <select className="form-select" value={formValues.priority} onChange={updateField('priority')} disabled={saving}>
                {TICKET_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Status</label>
              <select className="form-select" value={formValues.status} onChange={updateField('status')} disabled={saving}>
                {TICKET_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="form-feedback error">{error}</div> : null}

          <div className="resignation-modal-footer edit-user-footer">
            <button className="btn btn-light resignation-secondary-btn" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-success resignation-primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({ user, saving, error, users, onClose, onSave }) {
  const [formValues, setFormValues] = useState({
    employeeId: '',
    name: '',
    mobile: '',
    email: '',
    role: '',
    status: USER_STATUS_OPTIONS[0],
  });
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormValues({
      employeeId: user.employeeId || '',
      name: user.name || '',
      mobile: user.mobile || '',
      email: user.email || '',
      role: user.role || '',
      status: user.status || USER_STATUS_OPTIONS[0],
    });
    setFieldErrors({});
  }, [user]);

  if (!user) {
    return null;
  }

  const updateField = (field) => (event) => {
    const nextValue =
      field === 'mobile' ? event.target.value.replace(/\D/g, '').slice(0, 10) : event.target.value;

    setFormValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextValues = sanitizeUserFormValues(formValues);
    const nextErrors = getUserFormErrors(nextValues, {
      existingUsers: users,
      currentEmployeeId: user.employeeId,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    onSave(nextValues);
  };

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={saving ? undefined : onClose}></div>
      <div className="edit-user-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Employee Record</span>
            <h4 className="modal-title mb-1">Edit employee details</h4>
            <p className="resignation-subtitle mb-0">
              Changes made here are saved to MySQL and shown immediately in the dashboard.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={saving}></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pt-0">
          <div className="edit-form-grid">
            <div className="resignation-field">
              <label className="form-label">Employee ID</label>
              <input className="form-control" value={formValues.employeeId} disabled />
            </div>
            <div className="resignation-field">
              <label className="form-label">Status</label>
              <select
                className={getFieldClassName('form-select', Boolean(fieldErrors.status))}
                value={formValues.status}
                onChange={updateField('status')}
                disabled={saving}
              >
                {USER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {fieldErrors.status ? <div className="field-feedback">{fieldErrors.status}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Employee name</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.name))}
                value={formValues.name}
                onChange={updateField('name')}
                disabled={saving}
                maxLength={120}
                required
              />
              {fieldErrors.name ? <div className="field-feedback">{fieldErrors.name}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Mobile number</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.mobile))}
                value={formValues.mobile}
                onChange={updateField('mobile')}
                inputMode="numeric"
                maxLength={10}
                disabled={saving}
                required
              />
              {fieldErrors.mobile ? <div className="field-feedback">{fieldErrors.mobile}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Email</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.email))}
                type="email"
                value={formValues.email}
                onChange={updateField('email')}
                disabled={saving}
                required
              />
              {fieldErrors.email ? <div className="field-feedback">{fieldErrors.email}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Role</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.role))}
                value={formValues.role}
                onChange={updateField('role')}
                disabled={saving}
                maxLength={120}
                required
              />
              {fieldErrors.role ? <div className="field-feedback">{fieldErrors.role}</div> : null}
            </div>
          </div>

          {error ? <div className="form-feedback error">{error}</div> : null}

          <div className="resignation-modal-footer edit-user-footer">
            <button
              className="btn btn-light resignation-secondary-btn"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="btn btn-success resignation-primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResignationModal({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={onClose}></div>
      <div className="resignation-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Employee Exit</span>
            <h4 className="modal-title mb-1">Resignation Request</h4>
            <p className="resignation-subtitle mb-0">
              Capture exit details clearly before sending the request for approval.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose}></button>
        </div>

        <div className="resignation-employee-card">
          <div className="employee-avatar">TH</div>
          <div className="employee-meta">
            <strong>Tom Holland</strong>
            <span>TAL001 • Executive manager</span>
          </div>
          <div className="employee-status-chip">Notice period</div>
        </div>

        <div className="modal-body pt-0">
          <div className="resignation-section-title">Employment details</div>
          <div className="resignation-form-grid">
            <div className="resignation-field">
              <label className="form-label">Date of joining</label>
              <div className="input-shell">
                <i className="bi bi-calendar3"></i>
                <input className="form-control" defaultValue="09.04.2026" />
              </div>
            </div>
            <div className="resignation-field">
              <label className="form-label">Last working day</label>
              <div className="input-shell">
                <i className="bi bi-calendar-check"></i>
                <input className="form-control" placeholder="Select date" />
              </div>
            </div>
          </div>

          <div className="resignation-section-title">Exit information</div>
          <div className="resignation-form-grid">
            <div className="resignation-field">
              <label className="form-label">Notice period</label>
              <div className="input-shell">
                <i className="bi bi-hourglass-split"></i>
                <input className="form-control" placeholder="30 days" />
              </div>
            </div>
            <div className="resignation-field">
              <label className="form-label">Reason category</label>
              <div className="input-shell">
                <i className="bi bi-ui-checks-grid"></i>
                <select className="form-select">
                  <option>Career growth</option>
                  <option>Personal reasons</option>
                  <option>Higher studies</option>
                  <option>Relocation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="resignation-field">
            <label className="form-label">Reason for relieving</label>
            <textarea
              className="form-control resignation-textarea"
              rows="4"
              placeholder="Add a short summary about the resignation request"
            ></textarea>
            <small className="field-helper">
              Mention the handover plan, pending tasks, or any important remarks.
            </small>
          </div>
        </div>

        <div className="resignation-modal-footer">
          <button className="btn btn-light resignation-secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-success resignation-primary-btn" type="button" onClick={onClose}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}

function AppShell({
  data,
  activePage,
  onNavigate,
  onLogout,
  onOpenResignation,
  onOpenAddUser,
  onEditUser,
  onDeleteUser,
  savingUserId,
  deletingUserId,
  onOpenCreateProject,
  onOpenCreateTicket,
}) {
  const title = pageTitles[activePage] || 'Dashboard';

  return (
    <div className="dashboard-shell">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="dashboard-main">
        <TopBar title={title} user={data.currentUser} onLogout={onLogout} />
        {activePage === 'dashboard' ? <DashboardPage dashboard={data.dashboard} /> : null}
        {activePage === 'users' ? (
          <UserManagementPage
            users={data.users}
            onOpenResignation={onOpenResignation}
            onOpenAddUser={onOpenAddUser}
            onEditUser={onEditUser}
            onDeleteUser={onDeleteUser}
            savingUserId={savingUserId}
            deletingUserId={deletingUserId}
          />
        ) : null}
        {activePage === 'projects' ? (
          <ProjectManagementPage projects={data.projects} onOpenCreateProject={onOpenCreateProject} />
        ) : null}
        {activePage === 'tickets' ? (
          <SupportTicketsPage tickets={data.tickets} onOpenCreateTicket={onOpenCreateTicket} />
        ) : null}
      </main>
    </div>
  );
}

function App() {
  const [page, setPage] = useState(getPageFromHash());
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResignationModal, setShowResignationModal] = useState(false);
  const [data, setData] = useState(EMPTY_RESPONSE);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [savingUser, setSavingUser] = useState(false);
  const [saveUserError, setSaveUserError] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [createUserError, setCreateUserError] = useState('');
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteUserPending, setDeleteUserPending] = useState(false);
  const [deleteUserError, setDeleteUserError] = useState('');
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [createProjectError, setCreateProjectError] = useState('');
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [createTicketError, setCreateTicketError] = useState('');

  const fetchWorkspaceData = () =>
    Promise.all([
      apiRequest('/api/dashboard'),
      apiRequest('/api/users'),
      apiRequest('/api/projects'),
      apiRequest('/api/tickets'),
    ]);

  const syncWorkspaceData = async () => {
    const [dashboard, users, projects, tickets] = await fetchWorkspaceData();

    setData((current) => ({
      ...current,
      dashboard,
      users,
      projects,
      tickets,
    }));
  };

  useEffect(() => {
    if (!window.location.hash) {
      setHash('login');
    }

    const handleHashChange = () => {
      const nextPage = getPageFromHash();
      setPage(nextPage);
      if (nextPage === 'login') {
        setAuthenticated(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    if (!authenticated) {
      return;
    }

    let cancelled = false;

    fetchWorkspaceData()
      .then(([dashboard, users, projects, tickets]) => {
        if (cancelled) {
          return;
        }

        setData((current) => ({
          ...current,
          dashboard,
          users,
          projects,
          tickets,
        }));
      })
      .catch((requestError) => {
        if (cancelled) {
          return;
        }

        setError(requestError.message || 'Unable to load dashboard data.');
      });

    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  const activePage = useMemo(() => {
    if (['dashboard', 'users', 'projects', 'tickets'].includes(page)) {
      return page;
    }

    return 'dashboard';
  }, [page]);

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError('');

    try {
      const payload = await apiRequest('/api/login', {
        method: 'POST',
        body: credentials,
      });

      setData((current) => ({
        ...current,
        currentUser: normalizeCurrentUser(payload.user),
      }));
      setAuthenticated(true);
      setHash('dashboard');
      setPage('dashboard');
    } catch (requestError) {
      setError(requestError.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setData(EMPTY_RESPONSE);
    setShowAddUserModal(false);
    setEditingUser(null);
    setSaveUserError('');
    setCreateUserError('');
    setDeletingUser(null);
    setDeleteUserError('');
    setShowCreateProjectModal(false);
    setCreateProjectError('');
    setShowCreateTicketModal(false);
    setCreateTicketError('');
    setHash('login');
    setPage('login');
  };

  const handleSaveUser = async (nextUser) => {
    setSavingUser(true);
    setSaveUserError('');

    try {
      await apiRequest(`/api/users/${encodeURIComponent(nextUser.employeeId)}`, {
        method: 'PUT',
        body: nextUser,
      });
      await syncWorkspaceData();
      setEditingUser(null);
    } catch (requestError) {
      setSaveUserError(requestError.message || 'Unable to save user changes.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleCreateUser = async (nextUser) => {
    setCreatingUser(true);
    setCreateUserError('');

    try {
      await apiRequest('/api/users', {
        method: 'POST',
        body: nextUser,
      });
      await syncWorkspaceData();
      setShowAddUserModal(false);
    } catch (requestError) {
      setCreateUserError(requestError.message || 'Unable to create employee.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) {
      return;
    }

    setDeleteUserPending(true);
    setDeleteUserError('');

    try {
      await apiRequest(`/api/users/${encodeURIComponent(deletingUser.employeeId)}`, {
        method: 'DELETE',
      });
      await syncWorkspaceData();
      setDeletingUser(null);
    } catch (requestError) {
      setDeleteUserError(requestError.message || 'Unable to delete employee.');
    } finally {
      setDeleteUserPending(false);
    }
  };

  const handleCreateProject = async (project) => {
    setCreatingProject(true);
    setCreateProjectError('');

    try {
      await apiRequest('/api/projects', {
        method: 'POST',
        body: project,
      });
      await syncWorkspaceData();
      setShowCreateProjectModal(false);
    } catch (requestError) {
      setCreateProjectError(requestError.message || 'Unable to create project.');
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateTicket = async (ticket) => {
    setCreatingTicket(true);
    setCreateTicketError('');

    try {
      await apiRequest('/api/tickets', {
        method: 'POST',
        body: ticket,
      });
      await syncWorkspaceData();
      setShowCreateTicketModal(false);
    } catch (requestError) {
      setCreateTicketError(requestError.message || 'Unable to create ticket.');
    } finally {
      setCreatingTicket(false);
    }
  };

  if (!authenticated || page === 'login') {
    return <LoginPage onLogin={handleLogin} loading={loading} error={error} />;
  }

  return (
    <>
      <AppShell
        data={data}
        activePage={activePage}
        onNavigate={setHash}
        onLogout={handleLogout}
        onOpenResignation={() => setShowResignationModal(true)}
        onOpenAddUser={() => {
          setCreateUserError('');
          setShowAddUserModal(true);
        }}
        onEditUser={(user) => {
          setSaveUserError('');
          setEditingUser(user);
        }}
        onDeleteUser={(user) => {
          setDeleteUserError('');
          setDeletingUser(user);
        }}
        savingUserId={savingUser && editingUser ? editingUser.employeeId : ''}
        deletingUserId={
          deleteUserPending && deletingUser ? deletingUser.employeeId : ''
        }
        onOpenCreateProject={() => {
          setCreateProjectError('');
          setShowCreateProjectModal(true);
        }}
        onOpenCreateTicket={() => {
          setCreateTicketError('');
          setShowCreateTicketModal(true);
        }}
      />
      <AddUserModal
        open={showAddUserModal}
        saving={creatingUser}
        error={createUserError}
        users={data.users}
        onClose={() => {
          if (creatingUser) {
            return;
          }

          setShowAddUserModal(false);
          setCreateUserError('');
        }}
        onSave={handleCreateUser}
      />
      <EditUserModal
        user={editingUser}
        saving={savingUser}
        error={saveUserError}
        users={data.users}
        onClose={() => {
          if (savingUser) {
            return;
          }

          setEditingUser(null);
          setSaveUserError('');
        }}
        onSave={handleSaveUser}
      />
      <DeleteUserModal
        user={deletingUser}
        deleting={deleteUserPending}
        error={deleteUserError}
        onClose={() => {
          if (deleteUserPending) {
            return;
          }

          setDeletingUser(null);
          setDeleteUserError('');
        }}
        onConfirm={handleDeleteUser}
      />
      <CreateProjectModal
        open={showCreateProjectModal}
        saving={creatingProject}
        error={createProjectError}
        onClose={() => {
          if (creatingProject) {
            return;
          }

          setShowCreateProjectModal(false);
          setCreateProjectError('');
        }}
        onSave={handleCreateProject}
      />
      <CreateTicketModal
        open={showCreateTicketModal}
        saving={creatingTicket}
        error={createTicketError}
        onClose={() => {
          if (creatingTicket) {
            return;
          }

          setShowCreateTicketModal(false);
          setCreateTicketError('');
        }}
        onSave={handleCreateTicket}
      />
      <ResignationModal
        open={showResignationModal}
        onClose={() => setShowResignationModal(false)}
      />
    </>
  );
}

export default App;
