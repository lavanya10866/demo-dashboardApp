import { useEffect, useMemo, useState } from 'react';
import { USER_STATUS_OPTIONS } from '../../constants/appConstants';
import {
  buildNewUserFormState,
  getFieldClassName,
  getNextEmployeeId,
  getUserFormErrors,
  sanitizeUserFormValues,
} from '../../utils/userForm';

export default function AddUserModal({ open, saving, error, users, onClose, onSave }) {
  const nextEmployeeId = useMemo(() => getNextEmployeeId(users), [users]);
  const [formValues, setFormValues] = useState(() => buildNewUserFormState(nextEmployeeId));
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues(buildNewUserFormState(nextEmployeeId));
    setFieldErrors({});
  }, [nextEmployeeId, open]);

  if (!open) {
    return null;
  }

  const updateField = (field) => (event) => {
    const nextValue =
      field === 'mobile' ? event.target.value.replace(/\D/g, '').slice(0, 10) : event.target.value;

    setFormValues((current) => ({
      ...current,
      [field]: nextValue,
    }));
    setFieldErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextValues = sanitizeUserFormValues(formValues);
    const nextErrors = getUserFormErrors(nextValues, {
      existingUsers: users,
      requireEmployeeId: true,
      requireJoinedOn: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    onSave(nextValues);
  };

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={saving ? undefined : onClose}></div>
      <div className="edit-user-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker">Employee Record</span>
            <h4 className="modal-title mb-1">Add employee</h4>
            <p className="resignation-subtitle mb-0">
              Create a new employee record and save it directly to MySQL.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={saving}></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body pt-0">
          <div className="edit-form-grid">
            <div className="resignation-field">
              <label className="form-label">Employee ID</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.employeeId))}
                value={formValues.employeeId}
                readOnly
                disabled={saving}
              />
              <div className="field-hint">Auto-generated from the latest employee ID.</div>
              {fieldErrors.employeeId ? <div className="field-feedback">{fieldErrors.employeeId}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Joined date</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.joinedOn))}
                type="date"
                value={formValues.joinedOn}
                onChange={updateField('joinedOn')}
                disabled={saving}
                required
              />
              {fieldErrors.joinedOn ? <div className="field-feedback">{fieldErrors.joinedOn}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Employee name</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.name))}
                value={formValues.name}
                onChange={updateField('name')}
                disabled={saving}
                maxLength={120}
                required
              />
              {fieldErrors.name ? <div className="field-feedback">{fieldErrors.name}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Mobile number</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.mobile))}
                value={formValues.mobile}
                onChange={updateField('mobile')}
                inputMode="numeric"
                maxLength={10}
                disabled={saving}
                required
              />
              {fieldErrors.mobile ? <div className="field-feedback">{fieldErrors.mobile}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Email</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.email))}
                type="email"
                value={formValues.email}
                onChange={updateField('email')}
                disabled={saving}
                required
              />
              {fieldErrors.email ? <div className="field-feedback">{fieldErrors.email}</div> : null}
            </div>
            <div className="resignation-field">
              <label className="form-label">Role</label>
              <input
                className={getFieldClassName('form-control', Boolean(fieldErrors.role))}
                value={formValues.role}
                onChange={updateField('role')}
                disabled={saving}
                maxLength={120}
                required
              />
              {fieldErrors.role ? <div className="field-feedback">{fieldErrors.role}</div> : null}
            </div>
            <div className="resignation-field full-width">
              <label className="form-label">Status</label>
              <select
                className={getFieldClassName('form-select', Boolean(fieldErrors.status))}
                value={formValues.status}
                onChange={updateField('status')}
                disabled={saving}
              >
                {USER_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              {fieldErrors.status ? <div className="field-feedback">{fieldErrors.status}</div> : null}
            </div>
          </div>

          {error ? <div className="form-feedback error">{error}</div> : null}

          <div className="resignation-modal-footer edit-user-footer">
            <button
              className="btn btn-light resignation-secondary-btn"
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button className="btn btn-success resignation-primary-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Create employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
