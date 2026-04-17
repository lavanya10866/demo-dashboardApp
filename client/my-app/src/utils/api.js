const API_BASE = process.env.REACT_APP_API_URL || '';

export async function apiRequest(requestPath, options = {}) {
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
