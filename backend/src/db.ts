// db.ts
const Database = require("better-sqlite3");

// --- INITIALISATION DE LA BASE ---
const db = new Database("mydb.sqlite");

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
    username TEXT UNIQUE,
    password TEXT
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

export function createUser(username: string, password: string) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password)
    VALUES (?, ?)
  `);

  const info = stmt.run(username, password);

  return {
    id: info.lastInsertRowid,
    username
  };
}

export function getUserByUsername(username: string) {
  const stmt = db.prepare(`
    SELECT id, username, password
    FROM users
    WHERE username = ?
  `);

  return stmt.get(username);
}

export function getAllUsers() {
  const stmt = db.prepare(`
    SELECT id, username FROM users ORDER BY id ASC
  `);

  return stmt.all();
}
