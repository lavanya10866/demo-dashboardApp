export default function ResignationModal({ open, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={onClose}></div>
      <div className="resignation-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Employee Exit</span>
            <h4 className="modal-title mb-1">Resignation Request</h4>
            <p className="resignation-subtitle mb-0">
              Capture exit details clearly before sending the request for approval.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose}></button>
        </div>

        <div className="resignation-employee-card">
          <div className="employee-avatar">TH</div>
          <div className="employee-meta">
            <strong>Tom Holland</strong>
            <span>TAL001 • Executive manager</span>
          </div>
          <div className="employee-status-chip">Notice period</div>
        </div>

        <div className="modal-body pt-0">
          <div className="resignation-section-title">Employment details</div>
          <div className="resignation-form-grid">
            <div className="resignation-field">
              <label className="form-label">Date of joining</label>
              <div className="input-shell">
                <i className="bi bi-calendar3"></i>
                <input className="form-control" defaultValue="09.04.2026" />
              </div>
            </div>
            <div className="resignation-field">
              <label className="form-label">Last working day</label>
              <div className="input-shell">
                <i className="bi bi-calendar-check"></i>
                <input className="form-control" placeholder="Select date" />
              </div>
            </div>
          </div>

          <div className="resignation-section-title">Exit information</div>
          <div className="resignation-form-grid">
            <div className="resignation-field">
              <label className="form-label">Notice period</label>
              <div className="input-shell">
                <i className="bi bi-hourglass-split"></i>
                <input className="form-control" placeholder="30 days" />
              </div>
            </div>
            <div className="resignation-field">
              <label className="form-label">Reason category</label>
              <div className="input-shell">
                <i className="bi bi-ui-checks-grid"></i>
                <select className="form-select">
                  <option>Career growth</option>
                  <option>Personal reasons</option>
                  <option>Higher studies</option>
                  <option>Relocation</option>
                </select>
              </div>
            </div>
          </div>

          <div className="resignation-field">
            <label className="form-label">Reason for relieving</label>
            <textarea
              className="form-control resignation-textarea"
              rows="4"
              placeholder="Add a short summary about the resignation request"
            ></textarea>
            <small className="field-helper">
              Mention the handover plan, pending tasks, or any important remarks.
            </small>
          </div>
        </div>

        <div className="resignation-modal-footer">
          <button className="btn btn-light resignation-secondary-btn" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-success resignation-primary-btn" type="button" onClick={onClose}>
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
