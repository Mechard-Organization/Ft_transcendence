// db.ts
const Database = require("better-sqlite3");

// --- INITIALISATION DE LA BASE ---
const db = new Database("data/mydb.sqlite");

// Création de la table si nécessaire
// --- TABLE MESSAGES ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )
`).run();

// --- TABLE USERS ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    mail TEXT UNIQUE NOT NULL
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// --- FONCTIONS EXPORTÉES ---

// --- MESSAGES FUNCTIONS ---

export function getAllMessages() {
  const stmt = db.prepare("SELECT id, content FROM messages ORDER BY id ASC");
  return stmt.all();
}

export function addMessage(content: string) {
  const stmt = db.prepare("INSERT INTO messages (content) VALUES (?)");
  const info = stmt.run(content);
  return {
    id: info.lastInsertRowid,
    content
  };
}

// --- USERS FUNCTIONS ---

export function createUser(username: string, password: string, mail: string) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password, mail)
    VALUES (?, ?, ?)
  `);

  const info = stmt.run(username, password, mail);

  return {
    id: info.lastInsertRowid,
    username
  };
}

export function getUserByUsername(username: string) {
  const stmt = db.prepare(`
    SELECT id, username, password, mail
    FROM users
    WHERE username = ?
  `);

  return stmt.get(username);
}

export function getUserByMail(mail: string) {
  const stmt = db.prepare(`
    SELECT id, username, password, mail
    FROM users
    WHERE mail = ?
  `);

  return stmt.get(mail);
}

export function getAllUsers() {
  const stmt = db.prepare(`
    SELECT * FROM users ORDER BY id ASC
  `);

  return stmt.all();
}

export type User = {
  id: number;
  username: string;
  password: string;
  mail: string;
  created_at: string;
};
