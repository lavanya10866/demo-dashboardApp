import { navItems } from '../../constants/appConstants';

export default function Sidebar({ activePage, onNavigate }) {
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
