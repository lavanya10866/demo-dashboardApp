import { USER_STATUS_OPTIONS } from '../constants/appConstants';
import { getTodayInputValue } from './appHelpers';

const EMPLOYEE_ID_PATTERN = /^TAL\d{3,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\d{10}$/;
const EMPLOYEE_NAME_PATTERN = /^[A-Za-z][A-Za-z\s.'-]{1,119}$/;

export function normalizeEmployeeId(value = '') {
  return String(value).trim().toUpperCase();
}

export function normalizeEmail(value = '') {
  return String(value).trim().toLowerCase();
}

export function getFieldClassName(baseClassName, hasError) {
  return hasError ? `${baseClassName} field-invalid` : baseClassName;
}

export function getNextEmployeeId(users = []) {
  const highestValue = users.reduce((currentMax, user) => {
    const match = normalizeEmployeeId(user.employeeId).match(/^TAL(\d+)$/);

    if (!match) {
      return currentMax;
    }

    return Math.max(currentMax, Number.parseInt(match[1], 10));
  }, 0);

  return `TAL${String(highestValue + 1).padStart(3, '0')}`;
}

export function buildNewUserFormState(employeeId = '') {
  return {
    employeeId,
    name: '',
    mobile: '',
    email: '',
    role: '',
    status: USER_STATUS_OPTIONS[0],
    joinedOn: getTodayInputValue(),
  };
}

export function sanitizeUserFormValues(values) {
  const sanitized = {
    employeeId: normalizeEmployeeId(values.employeeId),
    name: String(values.name || '').trim(),
    mobile: String(values.mobile || '').trim(),
    email: normalizeEmail(values.email),
    role: String(values.role || '').trim(),
    status: String(values.status || USER_STATUS_OPTIONS[0]).trim(),
  };

  if (Object.prototype.hasOwnProperty.call(values, 'joinedOn')) {
    sanitized.joinedOn = String(values.joinedOn || '').trim();
  }

  return sanitized;
}

export function getUserFormErrors(
  values,
  { existingUsers = [], currentEmployeeId = '', requireEmployeeId = false, requireJoinedOn = false } = {}
) {
  const errors = {};
  const employeeId = normalizeEmployeeId(values.employeeId);
  const email = normalizeEmail(values.email);
  const normalizedCurrentEmployeeId = normalizeEmployeeId(currentEmployeeId);

  if (requireEmployeeId) {
    if (!employeeId) {
      errors.employeeId = 'Employee ID is required.';
    } else if (!EMPLOYEE_ID_PATTERN.test(employeeId)) {
      errors.employeeId = 'Employee ID must use the format TAL001.';
    } else if (
      existingUsers.some(
        (user) =>
          normalizeEmployeeId(user.employeeId) === employeeId &&
          normalizeEmployeeId(user.employeeId) !== normalizedCurrentEmployeeId
      )
    ) {
      errors.employeeId = 'Employee ID already exists.';
    }
  }

  if (!values.name) {
    errors.name = 'Employee name is required.';
  } else if (!EMPLOYEE_NAME_PATTERN.test(values.name)) {
    errors.name = 'Use at least 2 letters. Spaces, apostrophes, periods, and hyphens are allowed.';
  }

  if (!values.mobile) {
    errors.mobile = 'Mobile number is required.';
  } else if (!MOBILE_PATTERN.test(values.mobile)) {
    errors.mobile = 'Mobile number must be exactly 10 digits.';
  }

  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.';
  } else if (
    existingUsers.some(
      (user) =>
        normalizeEmail(user.email) === email &&
        normalizeEmployeeId(user.employeeId) !== normalizedCurrentEmployeeId
    )
  ) {
    errors.email = 'That email address is already used by another employee.';
  }

  if (!values.role) {
    errors.role = 'Role is required.';
  } else if (values.role.length < 2) {
    errors.role = 'Role must be at least 2 characters.';
  }

  if (!USER_STATUS_OPTIONS.includes(values.status)) {
    errors.status = 'Select a valid status.';
  }

  if (requireJoinedOn) {
    if (!values.joinedOn) {
      errors.joinedOn = 'Joined date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(values.joinedOn)) {
      errors.joinedOn = 'Joined date must be in YYYY-MM-DD format.';
    }
  }

  return errors;
}
