import StatusBadge from '../components/common/StatusBadge';

export default function SupportTicketsPage({ tickets, onOpenCreateTicket }) {
  const solvedCount = tickets.filter((ticket) => ticket.status === 'Solved').length;
  const progressCount = tickets.filter((ticket) => ticket.status === 'In progress').length;
  const unsolvedCount = tickets.filter((ticket) => ticket.status === 'Unsolved').length;

  return (
    <div className="content-stack">
      <div className="row g-4">
        <div className="col-md-4">
          <div className="summary-card solved">
            <span>Solved</span>
            <strong>{solvedCount}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card progress-card">
            <span>In progress</span>
            <strong>{progressCount}</strong>
          </div>
        </div>
        <div className="col-md-4">
          <div className="summary-card unsolved">
            <span>Unsolved</span>
            <strong>{unsolvedCount}</strong>
          </div>
        </div>
      </div>

      <div className="panel-card">
        <div className="section-heading">
          <div>
            <h3>Support queue</h3>
            <p>Latest issues raised by internal teams</p>
          </div>
          <button className="btn btn-success" type="button" onClick={onOpenCreateTicket}>
            <i className="bi bi-life-preserver me-2"></i>
            Create ticket
          </button>
        </div>

        <div className="table-responsive">
          <table className="table align-middle custom-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject</th>
                <th>Requester</th>
                <th>Team</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td>{ticket.requester}</td>
                  <td>{ticket.team}</td>
                  <td>{ticket.priority}</td>
                  <td>
                    <StatusBadge value={ticket.status} />
                  </td>
                  <td>{ticket.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
