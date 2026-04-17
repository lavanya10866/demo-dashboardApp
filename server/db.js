const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

const envCandidates = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
];

envCandidates.forEach((envPath) => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
});

let poolPromise = null;

function canUseMySql() {
  return Boolean(process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME);
}

async function getPool() {
  if (!canUseMySql()) {
    return null;
  }

  if (!poolPromise) {
    poolPromise = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return poolPromise;
}

async function getDatabaseMode() {
  const pool = await getPool();

  if (!pool) {
    return 'mock';
  }

  try {
    await pool.query('SELECT 1');
    return 'mysql';
  } catch (error) {
    return 'mock';
  }
}

module.exports = {
  canUseMySql,
  getDatabaseMode,
  getPool,
};
