export default function TopBar({ title, user, onLogout }) {
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
