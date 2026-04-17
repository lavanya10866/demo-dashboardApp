export default function DeleteUserModal({ user, deleting, error, onClose, onConfirm }) {
  if (!user) {
    return null;
  }

  return (
    <div className="modal-shell" role="dialog" aria-modal="true">
      <div className="modal-backdrop-custom" onClick={deleting ? undefined : onClose}></div>
      <div className="confirm-modal">
        <div className="resignation-modal-header">
          <div>
            <span className="resignation-kicker danger">Delete Record</span>
            <h4 className="modal-title mb-1">Delete employee</h4>
            <p className="resignation-subtitle mb-0">
              This removes {user.name} ({user.employeeId}) from MySQL.
            </p>
          </div>
          <button className="btn-close" type="button" onClick={onClose} disabled={deleting}></button>
        </div>

        <div className="confirm-modal-body">
          <p className="confirm-copy">
            This action cannot be undone. Please confirm before deleting the record.
          </p>
          {error ? <div className="form-feedback error compact">{error}</div> : null}
        </div>

        <div className="resignation-modal-footer">
          <button
            className="btn btn-light resignation-secondary-btn"
            type="button"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            className="btn btn-danger resignation-primary-btn"
            type="button"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete employee'}
          </button>
        </div>
      </div>
    </div>
  );
}
