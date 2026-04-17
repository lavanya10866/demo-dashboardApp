import { useEffect, useState } from 'react';
import { PROJECT_PRIORITY_OPTIONS, PROJECT_STATUS_OPTIONS } from '../../constants/appConstants';
import { getTodayInputValue } from '../../utils/appHelpers';

export default function CreateProjectModal({ open, saving, error, onClose, onSave }) {
  const [formValues, setFormValues] = useState({
    code: '',
    name: '',
    owner: '',
    progress: '0',
    priority: PROJECT_PRIORITY_OPTIONS[1],
    status: PROJECT_STATUS_OPTIONS[0],
    dueDate: getTodayInputValue(),
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues({
      code: '',
      name: '',
      owner: '',
      progress: '0',
      priority: PROJECT_PRIORITY_OPTIONS[1],
      status: PROJECT_STATUS_OPTIONS[0],
      dueDate: getTodayInputValue(),
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
            <span className="resignation-kicker">Project Record</span>
            <h4 className="modal-title mb-1">Create project</h4>
            <p className="resignation-subtitle mb-0">
              Add a project card and tracker row from one form.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={saving}></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pt-0">
          <div className="edit-form-grid">
            <div className="resignation-field">
              <label className="form-label">Project code</label>
              <input className="form-control" value={formValues.code} onChange={updateField('code')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Owner</label>
              <input className="form-control" value={formValues.owner} onChange={updateField('owner')} disabled={saving} required />
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Project name</label>
              <input className="form-control" value={formValues.name} onChange={updateField('name')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Progress</label>
              <input className="form-control" type="number" min="0" max="100" value={formValues.progress} onChange={updateField('progress')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Due date</label>
              <input className="form-control" type="date" value={formValues.dueDate} onChange={updateField('dueDate')} disabled={saving} required />
            </div>
            <div className="resignation-field">
              <label className="form-label">Priority</label>
              <select className="form-select" value={formValues.priority} onChange={updateField('priority')} disabled={saving}>
                {PROJECT_PRIORITY_OPTIONS.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            <div className="resignation-field">
              <label className="form-label">Status</label>
              <select className="form-select" value={formValues.status} onChange={updateField('status')} disabled={saving}>
                {PROJECT_STATUS_OPTIONS.map((status) => (
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
              {saving ? 'Saving...' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
