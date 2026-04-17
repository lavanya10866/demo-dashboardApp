import { useEffect, useMemo, useState } from 'react';
import AddUserModal from './components/modals/AddUserModal';
import CreateProjectModal from './components/modals/CreateProjectModal';
import CreateTicketModal from './components/modals/CreateTicketModal';
import DeleteUserModal from './components/modals/DeleteUserModal';
import EditUserModal from './components/modals/EditUserModal';
import ResignationModal from './components/modals/ResignationModal';
import AppShell from './components/layout/AppShell';
import { EMPTY_RESPONSE } from './constants/appConstants';
import LoginPage from './pages/LoginPage';
import { apiRequest } from './utils/api';
import { getPageFromHash, normalizeCurrentUser, setHash } from './utils/appHelpers';
import './App.css';

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
        deletingUserId={deleteUserPending && deletingUser ? deletingUser.employeeId : ''}
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
