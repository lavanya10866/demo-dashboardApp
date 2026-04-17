import StatusBadge from '../components/common/StatusBadge';

export default function ProjectManagementPage({ projects, onOpenCreateProject }) {
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
          <button className="btn btn-success" type="button" onClick={onOpenCreateProject}>
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
