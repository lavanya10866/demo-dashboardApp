import { pageTitles } from '../../constants/appConstants';
import DashboardPage from '../../pages/DashboardPage';
import ProjectManagementPage from '../../pages/ProjectManagementPage';
import SupportTicketsPage from '../../pages/SupportTicketsPage';
import UserManagementPage from '../../pages/UserManagementPage';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell({
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
