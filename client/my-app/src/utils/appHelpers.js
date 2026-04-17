export function getInitials(name = '') {
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

export function normalizeCurrentUser(user) {
  return {
    id: user?.id || 0,
    name: user?.name || 'Talent Bank',
    role: user?.role || 'Admin',
    email: user?.email || '',
    initials: user?.initials || getInitials(user?.name),
  };
}

export function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export function getPageFromHash() {
  const route = window.location.hash.replace('#/', '').trim();

  if (!route) {
    return 'login';
  }

  return route;
}

export function setHash(route) {
  window.location.hash = `/${route}`;
}
