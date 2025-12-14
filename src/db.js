const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const dbFilePath = path.join(__dirname, '..', 'data', 'tracker.db');
let dbHandle;

async function ensureDataDirectory() {
  const dir = path.dirname(dbFilePath);
  await fs.promises.mkdir(dir, { recursive: true });
}

async function initialize() {
  if (dbHandle) {
    return dbHandle;
  }
  await ensureDataDirectory();
  dbHandle = await open({
    filename: dbFilePath,
    driver: sqlite3.Database
  });
  await dbHandle.run(
    `CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      due_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  );
  return dbHandle;
}

async function addAssignment(title, description, dueDate) {
  if (!dbHandle) {
    await initialize();
  }
  const createdAt = new Date().toISOString();
  const stmt = `INSERT INTO assignments (title, description, due_date, created_at) VALUES (?, ?, ?, ?)`;
  const result = await dbHandle.run(stmt, title, description, dueDate, createdAt);
  return result.lastID;
}

async function getAssignments() {
  if (!dbHandle) {
    await initialize();
  }
  const rows = await dbHandle.all(
    `SELECT id, title, description, due_date AS dueDate, created_at AS createdAt
     FROM assignments
     ORDER BY due_date ASC`
  );
  return rows;
}

async function close() {
  if (dbHandle) {
    await dbHandle.close();
    dbHandle = null;
  }
}

module.exports = {
  initialize,
  addAssignment,
  getAssignments,
  close,
  getDbPath() {
    return dbFilePath;
  }
};
