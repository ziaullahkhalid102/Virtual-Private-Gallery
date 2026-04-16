import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'gallery.db'));

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      dob TEXT NOT NULL,
      country TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      securityQuestion TEXT NOT NULL,
      securityAnswer TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active'
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      filename TEXT NOT NULL,
      originalName TEXT NOT NULL,
      mimetype TEXT NOT NULL,
      size INTEGER NOT NULL,
      uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Migration: Add role and status columns if they don't exist
  const tableInfo = db.prepare("PRAGMA table_info(users)").all() as any[];
  const hasRole = tableInfo.some(col => col.name === 'role');
  const hasStatus = tableInfo.some(col => col.name === 'status');

  if (!hasRole) {
    db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
  }
  if (!hasStatus) {
    db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
  }

  // Check if admin exists, if not insert default admin
  // Password for default admin: Admin@123
  const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('Admin@123', 10);
    db.prepare(`
      INSERT INTO users (firstName, lastName, dob, country, username, password, securityQuestion, securityAnswer, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run('System', 'Admin', '1990-01-01', 'Global', 'admin', hashedPassword, 'What is the system name?', 'VPG', 'admin');
  }
}

export default db;
