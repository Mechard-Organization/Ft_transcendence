import fs from "fs";
import path from "path";
// db.ts
const Database = require("better-sqlite3");

// __dirname = /app/config/database (dans le conteneur, une fois lancé)
const DB_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DB_DIR, "mydb.sqlite");

// On s'assure que le dossier existe
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// --- INITIALISATION DE LA BASE ---
const db = new Database(DB_PATH);

// Création de la table si nécessaire

// --- TABLE USERS ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    mail TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// --- TABLE MESSAGES ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    id_author INTEGER,
    FOREIGN KEY(id_author) REFERENCES users(id)
  )
`).run();

// --- FONCTIONS EXPORTÉES ---

// --- MESSAGES FUNCTIONS ---

export function getAllMessages() {
  const stmt = db.prepare("SELECT id, id_author, content FROM messages ORDER BY id ASC");
  return stmt.all();
}

export function addMessage(content: string, id: any) {
  const stmt = db.prepare("INSERT INTO messages (content, id_author) VALUES (?,?)");
  console.log("content: ", content);
  console.log("id: ", id);
  const info = stmt.run(content, id);

  return {
    id: info.lastInsertRowid,
    nb: info.id,
    content
  };
}

// --- USERS FUNCTIONS ---

export function createUser(username: string, password_hash: string, mail: string) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, mail)
    VALUES (?, ?, ?)
  `);

  const info = stmt.run(username, password_hash, mail);

  return {
    id: info.lastInsertRowid,
    username
  };
}

export function getUserById(username: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail
    FROM users
    WHERE id = ?
  `);

  return stmt.get(username);
}

export function getUserByUsername(username: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail
    FROM users
    WHERE username = ?
  `);

  return stmt.get(username);
}

export function getUserByMail(mail: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail
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
  password_hash: string;
  mail: string;
  created_at: string;
};
