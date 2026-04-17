import { useState } from 'react';

export default function LoginPage({ onLogin, loading, error }) {
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
