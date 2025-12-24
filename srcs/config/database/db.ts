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
    id_author INTEGER NULL,
    FOREIGN KEY(id_author) REFERENCES users(id)
  )
`).run();

// --- TABLE FRIENDS ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS friends (
    id_user INTEGER,
    id_friend INTEGER,
    accept BOOL DEFAULT FALSE,
    id_sender INTEGER,
    FOREIGN KEY(id_user) REFERENCES users(id),
    FOREIGN KEY(id_sender) REFERENCES users(id),
    FOREIGN KEY(id_friend) REFERENCES users(id)
  )
`).run();

// --- FONCTIONS EXPORTÉES ---

// --- MESSAGES FUNCTIONS ---

export function getAllMessages() {
  const stmt = db.prepare(`
    SELECT
      messages.*,
      COALESCE(users.username, 'Anonyme') AS username
    FROM messages
    LEFT JOIN users
      ON messages.id_author = users.id
    ORDER BY messages.id ASC
  `);

  return stmt.all();
}

export function addMessage(content: string, id: any) {
  const authorId: string = id && !isNaN(Number(id)) ? String(Number(id)) : "0";

  const stmt = db.prepare("INSERT INTO messages (content, id_author) VALUES (?,?)");

  const info = stmt.run(content, id);

  return {
    id: info.lastInsertRowid,
    nb: info.id,
    content,
    username: authorId == "0" ? "Anonyme" : getUserById(authorId).username
  };
}

export function MessageAnonym(id_author: string) {
  const stmt = db.prepare(`
    UPDATE messages
    SET id_author = NULL
    WHERE id_author = ?
  `);

  return stmt.run(id_author);
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

export function getUserById(id: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail
    FROM users
    WHERE id = ?
  `);

  return stmt.get(id);
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

export function updateUserUsername(username: string, id: string) {
  const stmt = db.prepare(`
    UPDATE users
    SET username = ?
    WHERE id = ?
  `);

  return stmt.run(username, id);
}

export function updateUserPassword(password_hash: string, id: string) {
  const stmt = db.prepare(`
    UPDATE users
    SET password_hash = ?
    WHERE id = ?
  `);

  return stmt.run(password_hash, id);
}

export function updateUserMail(mail: string, id: string) {
  const stmt = db.prepare(`
    UPDATE users
    SET mail = ?
    WHERE id = ?
  `);

  return stmt.run(mail, id);
}

export function deleteUser(id: string) {
  const stmt = db.prepare(`
    DELETE FROM users
    WHERE id = ?
  `);

  return stmt.run(id);
}

export type User = {
  id: number;
  username: string;
  password_hash: string;
  mail: string;
  created_at: string;
};

// --- FIREND FUNCTIONS ---

export function createFriend(id_user: string, id_friend: string, id_sender: string) {
  const stmt = db.prepare(`
    INSERT INTO friends (id_user, id_friend, id_sender)
    VALUES (?, ?, ?)
  `);

  const info = stmt.run(id_user, id_friend, id_sender);
  const id1 = info.lastInsertRowid;

  const stmt2 = db.prepare(`
    INSERT INTO friends (id_user, id_friend, id_sender)
    VALUES (?, ?, ?)
  `);

  const info2 = stmt2.run(id_friend, id_user, id_sender);
  const id2 = info2.lastInsertRowid;

  return {
    id1,
    id2
  };
}

export function valideFriend(id_user: string, id_friend: string) {
  const stmt = db.prepare(`
    UPDATE friends
    SET accept = TRUE
    WHERE id_user = ? AND id_friend = ?
  `);

  const info = stmt.run(id_user, id_friend);

  const stmt2 = db.prepare(`
    UPDATE friends
    SET accept = TRUE
    WHERE id_user = ? AND id_friend = ?
  `);

  const info2 = stmt2.run(id_friend, id_user);

  return {
    info,
    info2
  };
}

export function getFriendValidate(id_user: string) {
  const stmt = db.prepare(`
    SELECT * FROM friends
    LEFT JOIN users
      ON friends.id_friend = users.id
    WHERE id_user = ? AND accept = TRUE
    ORDER BY id_friend ASC
  `);

  return stmt.all(id_user);
}


export function getFriendNValidate(id_user: string) {
  const stmt = db.prepare(`
    SELECT * FROM friends
    LEFT JOIN users
      ON friends.id_friend = users.id
    WHERE id_user = ? AND accept = FALSE
    ORDER BY id_friend ASC
  `);

  return stmt.all(id_user);
}

export function alreadyFriend(id_user: string, id_friend: string) {
  const stmt = db.prepare(`
    SELECT * FROM friends
    WHERE id_user = ? AND id_friend = ?
  `);

  return stmt.all(id_user, id_friend);
}

export function deleteFriend(id_user: string, id_friend: string) {
  const stmt = db.prepare(`
    DELETE FROM friends
    WHERE (id_user = ? AND id_friend = ?) OR (id_user = ? AND id_friend = ?)
  `);

  return stmt.run(id_user, id_friend, id_friend, id_user);
}

export function deleteUserFriend(id_user: string) {
  const stmt = db.prepare(`
    DELETE FROM friends
    WHERE id_user = ? OR id_friend = ?
  `);

  return stmt.run(id_user, id_user);
}
