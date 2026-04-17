export const EMPTY_RESPONSE = {
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

export const USER_STATUS_OPTIONS = ['Active', 'Inactive', 'Resign'];
export const PROJECT_PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
export const PROJECT_STATUS_OPTIONS = ['Assigned', 'In progress', 'Review', 'Final'];
export const TICKET_PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];
export const TICKET_STATUS_OPTIONS = ['Solved', 'Unsolved', 'In progress'];

export const pageTitles = {
  dashboard: 'Dashboard',
  users: 'User management',
  projects: 'Project management',
  tickets: 'Support tickets',
};

export const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'grid' },
  { key: 'users', label: 'User management', icon: 'people' },
  { key: 'projects', label: 'Project management', icon: 'kanban' },
  { key: 'tickets', label: 'Support tickets', icon: 'headset' },
];

export const userBoardDates = ['03.06.2025', '05.06.2025', '08.06.2025', '10.06.2025', '13.06.2025'];
export const userStatusOrder = ['Active', 'Inactive', 'Resign'];
