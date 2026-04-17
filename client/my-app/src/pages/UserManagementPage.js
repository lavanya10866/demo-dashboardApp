import { useMemo, useState } from 'react';
import StatusBadge from '../components/common/StatusBadge';
import { userBoardDates, userStatusOrder } from '../constants/appConstants';

function getUserColumnTone(status) {
  if (status === 'Active') {
    return 'active';
  }

  if (status === 'Inactive') {
    return 'inactive';
  }

  return 'resign';
}

export default function UserManagementPage({
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

  const roleOptions = useMemo(() => ['all', ...new Set(users.map((user) => user.role))], [users]);
  const statusOptions = useMemo(() => ['all', ...new Set(users.map((user) => user.status))], [users]);

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
  }, [users, roleFilter, searchTerm, statusFilter]);

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
                  <span>
                    {filteredUsers.length === 0
                      ? '0%'
                      : `${Math.round((group.users.length / filteredUsers.length) * 100)}%`}
                  </span>
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
