CREATE DATABASE IF NOT EXISTS talent_bank_dashboard;
USE talent_bank_dashboard;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  role VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_admin_users_email (email)
);

CREATE TABLE IF NOT EXISTS users (
  employee_id VARCHAR(20) NOT NULL,
  name VARCHAR(120) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(190) NOT NULL,
  role VARCHAR(120) NOT NULL,
  status ENUM('Active', 'Inactive', 'Resign') NOT NULL,
  joined_on DATE NOT NULL,
  PRIMARY KEY (employee_id),
  UNIQUE KEY uq_users_email (email)
);

CREATE TABLE IF NOT EXISTS projects (
  project_code VARCHAR(20) NOT NULL,
  name VARCHAR(160) NOT NULL,
  owner VARCHAR(120) NOT NULL,
  progress INT NOT NULL,
  priority VARCHAR(40) NOT NULL,
  status VARCHAR(60) NOT NULL,
  due_date DATE NOT NULL,
  PRIMARY KEY (project_code)
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id VARCHAR(20) NOT NULL,
  subject VARCHAR(200) NOT NULL,
  requester VARCHAR(120) NOT NULL,
  team VARCHAR(80) NOT NULL,
  priority VARCHAR(40) NOT NULL,
  status VARCHAR(60) NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (ticket_id)
);

INSERT INTO admin_users (id, name, role, email, password)
VALUES (1, 'Holland', 'Admin', 'admin@talentbank.com', 'admin123')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role),
  password = VALUES(password);

INSERT INTO users (employee_id, name, mobile, email, role, status, joined_on)
VALUES
  ('TAL001', 'Tom Holland', '9876543210', 'tomholland@gmail.com', 'Executive manager', 'Active', '2025-06-03'),
  ('TAL002', 'Tom Hiddleston', '9123456780', 'tom.h@talentbank.com', 'Sales manager', 'Active', '2025-06-05'),
  ('TAL003', 'Zendaya Coleman', '9000154321', 'zendaya@talentbank.com', 'Sales manager', 'Resign', '2025-06-08'),
  ('TAL004', 'Jacob Batalon', '9345678123', 'jacob@talentbank.com', 'Sales manager', 'Active', '2025-06-10'),
  ('TAL005', 'Benedict Wong', '9234567812', 'benedict@talentbank.com', 'General manager', 'Inactive', '2025-06-13')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  mobile = VALUES(mobile),
  email = VALUES(email),
  role = VALUES(role),
  status = VALUES(status),
  joined_on = VALUES(joined_on);

INSERT INTO projects (project_code, name, owner, progress, priority, status, due_date)
VALUES
  ('PRJ-001', 'Core Banking Revamp', 'Holland', 72, 'High', 'In progress', '2026-04-24'),
  ('PRJ-002', 'Loan Onboarding Flow', 'Zendaya', 54, 'Medium', 'Review', '2026-04-28'),
  ('PRJ-003', 'Recruitment Dashboard', 'Tom Holland', 88, 'High', 'Final', '2026-05-03'),
  ('PRJ-004', 'Support Automation', 'Jacob', 39, 'Low', 'Assigned', '2026-05-07')
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  owner = VALUES(owner),
  progress = VALUES(progress),
  priority = VALUES(priority),
  status = VALUES(status),
  due_date = VALUES(due_date);

INSERT INTO tickets (ticket_id, subject, requester, team, priority, status, updated_at)
VALUES
  ('TIC-101', 'Unable to approve user leaves', 'Sarah M', 'HR', 'High', 'Solved', '2026-04-17 14:30:00'),
  ('TIC-102', 'Sales report export failing', 'Ron C', 'Sales', 'Medium', 'In progress', '2026-04-17 13:05:00'),
  ('TIC-103', 'Need project role access', 'Julie A', 'Operations', 'Low', 'Unsolved', '2026-04-17 11:18:00'),
  ('TIC-104', 'Dashboard widget mismatch', 'Megan P', 'Management', 'High', 'Solved', '2026-04-16 17:42:00')
ON DUPLICATE KEY UPDATE
  subject = VALUES(subject),
  requester = VALUES(requester),
  team = VALUES(team),
  priority = VALUES(priority),
  status = VALUES(status),
  updated_at = VALUES(updated_at);
