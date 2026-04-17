import { useEffect, useState } from 'react';
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from '../../constants/appConstants';

export default function CreateTicketModal({ open, saving, error, onClose, onSave }) {
  const [formValues, setFormValues] = useState({
    id: '',
    subject: '',
    requester: '',
    team: '',
    priority: TICKET_PRIORITY_OPTIONS[1],
    status: TICKET_STATUS_OPTIONS[1],
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues({
      id: '',
      subject: '',
      requester: '',
      team: '',
      priority: TICKET_PRIORITY_OPTIONS[1],
      status: TICKET_STATUS_OPTIONS[1],
    });
  }, [open]);

  if (!open) {
    return null;
  }

  const updateField = (field) => (event) => {
    const { value } = event.target;
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(formValues);
  };

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={saving ? undefined : onClose}></div>
      <div className="edit-user-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Support Ticket</span>
            <h4 className="modal-title mb-1">Create ticket</h4>
            <p className="resignation-subtitle mb-0">
              Add a new support issue and push it to the tickets table immediately.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={saving}></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pt-0">
          <div className="edit-form-grid">
            <div className="resignation-field">
              <label className="form-label">Ticket ID</label>
              <input className="form-control" value={formValues.id} onChange={updateField('id')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Requester</label>
              <input className="form-control" value={formValues.requester} onChange={updateField('requester')} disabled={saving} required />
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Subject</label>
              <input className="form-control" value={formValues.subject} onChange={updateField('subject')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Team</label>
              <input className="form-control" value={formValues.team} onChange={updateField('team')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Priority</label>
              <select className="form-select" value={formValues.priority} onChange={updateField('priority')} disabled={saving}>
                {TICKET_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Status</label>
              <select className="form-select" value={formValues.status} onChange={updateField('status')} disabled={saving}>
                {TICKET_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error ? <div className="form-feedback error">{error}</div> : null}

          <div className="resignation-modal-footer edit-user-footer">
            <button className="btn btn-light resignation-secondary-btn" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-success resignation-primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
