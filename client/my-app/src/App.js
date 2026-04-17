import { useEffect, useMemo, useState } from 'react';
import './App.css';

const MOCK_RESPONSE = {
  currentUser: {
    name: 'Holland',
    role: 'Admin',
    initials: 'HL',
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

async function fetchJson(path, fallback) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed for ${path}`);
    }

    return await response.json();
  } catch (error) {
    return fallback;
  }
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
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100 py-5">
          <div className="col-12 col-lg-11">
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
                      <div className="preview-card muted">
                        <span>Demo access</span>
                        <strong>admin@talentbank.com</strong>
                        <small>Password: admin123</small>
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
      <div className="sidebar-footnote">
        Built with React, Node.js, Bootstrap, and MySQL-ready APIs.
      </div>
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
                  <h3>Leads Overview</h3>
                  <p>Total projects</p>
                </div>
              </div>
              <strong className="headline-number">20</strong>
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
                  <p>Total sales 35</p>
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
              <h3>Support tickets</h3>
              <p>Total tickets 26</p>
            </div>
          </div>
          <span className="week-tag">This week</span>
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

function UserManagementPage({ users, onOpenResignation }) {
  return (
    <div className="panel-card">
      <div className="section-heading align-items-start">
        <div>
          <h3>User List</h3>
        </div>
        <button className="btn btn-success" type="button">
          <i className="bi bi-person-plus me-2"></i>
          Add Employee
        </button>
      </div>

      <div className="toolbar-row">
        <div className="search-box">
          <i className="bi bi-search"></i>
          <input type="text" className="form-control" placeholder="Search" />
        </div>
        <div className="toolbar-actions">
          <select className="form-select">
            <option>By role</option>
          </select>
          <select className="form-select">
            <option>By status</option>
          </select>
          <select className="form-select">
            <option>List View</option>
          </select>
          <button className="btn btn-outline-success" type="button" onClick={onOpenResignation}>
            Resignation
          </button>
        </div>
      </div>

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
            {users.map((user) => (
              <tr key={user.employeeId}>
                <td>{user.id}</td>
                <td>{user.employeeId}</td>
                <td>
                  <span className={user.highlight ? 'name-highlight' : ''}>{user.name}</span>
                </td>
                <td>{user.mobile}</td>
                <td>{user.email}</td>
                <td>
                  <a href="#/users" className="table-link">
                    {user.role}
                  </a>
                </td>
                <td>
                  <StatusBadge value={user.status} />
                </td>
                <td className="action-links">
                  <a href="#/users" className="table-link">
                    <i className="bi bi-eye me-1"></i>
                    View
                  </a>
                  <a href="#/users" className="table-link">
                    <i className="bi bi-pencil me-1"></i>
                    Edit
                  </a>
                  <a href="#/users" className="text-danger text-decoration-none">
                    <i className="bi bi-trash me-1"></i>
                    Delete
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

function ProjectManagementPage({ projects }) {
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
          <button className="btn btn-success" type="button">
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

function SupportTicketsPage({ tickets }) {
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
          <button className="btn btn-success" type="button">
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

function ResignationModal({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={onClose}></div>
      <div className="resignation-modal">
        <div className="modal-header border-0 pb-2">
          <div>
            <h4 className="modal-title">Resignation Form</h4>
          </div>
          <button className="btn-close" type="button" onClick={onClose}></button>
        </div>
        <div className="modal-body pt-0">
          <div className="mb-3">
            <label className="form-label">Date of joining</label>
            <input className="form-control" defaultValue="09.04.2026" />
          </div>
          <div className="mb-3">
            <label className="form-label">Date of relieving</label>
            <input className="form-control" placeholder="Date of relieving" />
          </div>
          <div className="mb-3">
            <label className="form-label">Notice period</label>
            <input className="form-control" placeholder="Notice period" />
          </div>
          <div className="mb-3">
            <label className="form-label">Reason for relieving</label>
            <textarea className="form-control" rows="3" placeholder="Reason for relieving"></textarea>
          </div>
        </div>
        <div className="modal-footer border-0">
          <button className="btn btn-outline-success px-4" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-success px-4" type="button" onClick={onClose}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

function AppShell({ data, activePage, onNavigate, onLogout, onOpenResignation }) {
  const title = pageTitles[activePage] || 'Dashboard';

  return (
    <div className="dashboard-shell">
      <Sidebar activePage={activePage} onNavigate={onNavigate} />
      <main className="dashboard-main">
        <TopBar title={title} user={data.currentUser} onLogout={onLogout} />
        {activePage === 'dashboard' ? <DashboardPage dashboard={data.dashboard} /> : null}
        {activePage === 'users' ? (
          <UserManagementPage users={data.users} onOpenResignation={onOpenResignation} />
        ) : null}
        {activePage === 'projects' ? <ProjectManagementPage projects={data.projects} /> : null}
        {activePage === 'tickets' ? <SupportTicketsPage tickets={data.tickets} /> : null}
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
  const [data, setData] = useState(MOCK_RESPONSE);

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

    Promise.all([
      fetchJson('/api/dashboard', MOCK_RESPONSE.dashboard),
      fetchJson('/api/users', MOCK_RESPONSE.users),
      fetchJson('/api/projects', MOCK_RESPONSE.projects),
      fetchJson('/api/tickets', MOCK_RESPONSE.tickets),
    ]).then(([dashboard, users, projects, tickets]) => {
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
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid login');
      }

      setAuthenticated(true);
      setHash('dashboard');
      setPage('dashboard');
    } catch (requestError) {
      const isDemoLogin =
        credentials.email === 'admin@talentbank.com' && credentials.password === 'admin123';

      if (isDemoLogin) {
        setAuthenticated(true);
        setHash('dashboard');
        setPage('dashboard');
      } else {
        setError('Use the demo credentials or connect the backend login API.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setHash('login');
    setPage('login');
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
      />
      <ResignationModal
        open={showResignationModal}
        onClose={() => setShowResignationModal(false)}
      />
    </>
  );
}

export default App;
