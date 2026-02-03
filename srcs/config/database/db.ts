import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
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
    google_sub TEXT UNIQUE,
    oauth_enabled INTEGER NOT NULL DEFAULT 0,
    admin BOOL DEFAULT FALSE,
    avatarUrl TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    twofa_enabled INTEGER NOT NULL DEFAULT 0,
    twofa_secret TEXT,
    twofa_temp_secret TEXT
  )
`).run();

// --- TABLE MESSAGES ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT,
    id_author INTEGER NULL,
    id_group INTEGER NULL,
    FOREIGN KEY(id_author) REFERENCES users(id),
    FOREIGN KEY(id_group) REFERENCES groupmsg(id)
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS groupmsg (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    groupname TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS laisonmsg (
    id_group INTEGER,
    id_user INTEGER NULL,
    FOREIGN KEY(id_group) REFERENCES groupmsg(id),
    FOREIGN KEY(id_user) REFERENCES users(id)
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

// --- TABLE BLOCK ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS block (
    id_user INTEGER,
    id_block INTEGER,
    FOREIGN KEY(id_user) REFERENCES users(id),
    FOREIGN KEY(id_block) REFERENCES users(id)
  )
`).run();

// --- TABLE MATCH ---
db.prepare(`
  CREATE TABLE IF NOT EXISTS match (
    id_match INTEGER PRIMARY KEY AUTOINCREMENT,
    name_player1 TEXT NULL,
    name_player2 TEXT NULL,
    score1 TEXT,
    score2 TEXT,
    date TEXT DEFAULT (datetime('now'))
  )
`).run();

// Création du user root
async function creatAdmin() {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  const ADMIN = process.env.ADMIN;
  const ADMIN_MAIL = process.env.ADMIN_MAIL;
  if (!ADMIN_PASSWORD || !ADMIN || !ADMIN_MAIL) return;
  if (getUserByUsername(ADMIN)) return;
  const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  db.prepare(` INSERT INTO users (username, password_hash, mail, admin)
      VALUES (?, ?, ?, TRUE)`).run(ADMIN, password_hash, ADMIN_MAIL);
}

creatAdmin();

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
    WHERE id_group IS NULL
    ORDER BY messages.id ASC
  `);

  return stmt.all();
}


export function getMessagesInGroup(id_group: string) {
  const stmt = db.prepare(`
    SELECT
      messages.*,
      COALESCE(users.username, 'Anonyme') AS username
    FROM messages
    LEFT JOIN users
      ON messages.id_author = users.id
    WHERE id_group = ?
    ORDER BY messages.id ASC
  `);

  return stmt.all(id_group);
}

export function addMessage(content: string, id: any, id_group: string) {
  const authorId: string = id && !isNaN(Number(id)) ? String(Number(id)) : "0";

  const stmt = db.prepare("INSERT INTO messages (content, id_author, id_group) VALUES (?,?,?)");

  const info = stmt.run(content, id, id_group);

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

export function createGroup(groupname: string) {
  const stmt = db.prepare(`
    INSERT INTO groupmsg groupname VALUES ?
  `);

  const info = stmt.run(groupname);

  return {
    id: info.lastInsertRowid
  };
}

export function addUserGroup(id_group: string, id_user: string) {
  const stmt = db.prepare(`
    INSERT INTO laisonmsg (id_group, id_user) VALUES (?,?)
  `);

  const info = stmt.run(id_group, id_user);

  return {
    id: info.lastInsertRowid
  };
}

export function userInGroup(id_group: string, id_user: string) {
  const stmt = db.prepare(`
    SELECT *
    FROM laisonmsg
    WHERE id_group = ? AND id_user = ?
  `);

  return stmt.get(id_group, id_user);
}

export function getAllUserGroup(id_user: string) {
  const stmt = db.prepare(`
    SELECT *
    FROM laisonmsg
    LEFT JOIN groupmsg
      ON laisonmsg.id_group = groupmsg.id
    WHERE id_user = ?
  `);

  return stmt.all(id_user);
}

export function oldGroup(id1: string, id2: string) {
  const stmt = db.prepare(`
    SELECT id_group
    FROM laisonmsg
    GROUP BY id_group
    HAVING
      COUNT(*) = 2
      AND SUM(CASE WHEN id_user IN (?, ?) THEN 1 ELSE 0 END) = 2
    LIMIT 1
  `);

  return stmt.get(id1, id2);
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

export function createOAuthUser(username: string, password_hash: string, mail: string, google_sub: string) {
  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, mail, google_sub, oauth_enabled)
    VALUES (?, ?, ?, ?, 1)
  `);

  const info = stmt.run(username, password_hash, mail, google_sub);

  return {
    id: info.lastInsertRowid,
    username
  };
}

export function getUserById(id: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail, admin, avatarUrl, twofa_enabled, twofa_secret, twofa_temp_secret, oauth_enabled
    FROM users
    WHERE id = ?
  `);

  return stmt.get(id);
}

export function getUserByUsername(username: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail, admin, avatarUrl, twofa_enabled, twofa_secret, twofa_temp_secret, oauth_enabled
    FROM users
    WHERE username = ?
  `);

  return stmt.get(username);
}

export function getUserByMail(mail: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail, admin, avatarUrl, twofa_enabled, twofa_secret, twofa_temp_secret, oauth_enabled
    FROM users
    WHERE mail = ?
  `);

  return stmt.get(mail);
}

export function getUserByGoogleSub(google_sub: string) {
  const stmt = db.prepare(`
    SELECT id, username, password_hash, mail, admin, avatarUrl, twofa_enabled, twofa_secret, twofa_temp_secret, oauth_enabled, google_sub
    FROM users
    WHERE google_sub = ?
  `);

  return stmt.get(google_sub);
}


// --- 2FA in USER FONCTIONS --- //

export function setTwofaTempSecret(userId: number, secret: string) {
  return db.prepare(`
    UPDATE users SET twofa_temp_secret = ? WHERE id = ?
  `).run(secret, userId);
}

export function enableTwofa(userId: number) {
  return db.prepare(`
    UPDATE users
    SET twofa_enabled = 1,
        twofa_secret = twofa_temp_secret,
        twofa_temp_secret = NULL
    WHERE id = ?
  `).run(userId);
}

export function disableTwofa(userId: number) {
  return db.prepare(`
    UPDATE users
    SET twofa_enabled = 0,
        twofa_secret = NULL,
        twofa_temp_secret = NULL
    WHERE id = ?
  `).run(userId);
}

export function getTwofaStatus(userId: number) {
  return db.prepare(`
    SELECT twofa_enabled FROM users WHERE id = ?
  `).get(userId);
}

// --------------------------- //

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

export function updateUserAdmin(status: boolean, id: string) {
  const stmt = db.prepare(`
    UPDATE users
    SET admin = ?
    WHERE id = ?
  `);

  return stmt.run(status ? 1 : 0, id);
}

export function updateUserPp(url: string | null, id: string) {
  const stmt = db.prepare(`
    UPDATE users
    SET avatarUrl = ?
    WHERE id = ?
  `);

  return stmt.run(url, id);
}

export function getUserPp(url: string | null, id: string) {
  const stmt = db.prepare(`
    SELECT avatarUrl FROM users
    WHERE id = ?
  `);

    const row = stmt.get(id);
  return row ? row.avatarUrl : null;
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
  oauth_enabled?: number;
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

export function deleteUserBlocks(id_user: string) {
  const stmt = db.prepare(`
    DELETE FROM block
    WHERE id_user = ? OR id_block = ?
  `);

  return stmt.run(id_user, id_user);
}

export function deleteUserFromGroups(id_user: string) {
  const stmt = db.prepare(`
    DELETE FROM laisonmsg
    WHERE id_user = ?
  `);

  return stmt.run(id_user);
}

// --- BLOCK FUNCTIONS ---

export function createBlock(id_user: string, id_block: string) {
  const stmt = db.prepare(`
    INSERT INTO block (id_user, id_block)
    VALUES (?, ?)
  `);

  const info = stmt.run(id_user, id_block);
  const id = info.lastInsertRowid;

  return id;
}

export function getBlock(id_user: string) {
  const stmt = db.prepare(`
    SELECT * FROM block
    WHERE id_user = ?
    ORDER BY id_block ASC
  `);

  return stmt.all(id_user);
}

export function ItIsBlock(id_user: string, id_block: string) {
  const stmt = db.prepare(`
    SELECT * FROM block
    WHERE id_user = ? AND id_block = ?
  `);

  return stmt.all(id_user, id_block);
}


export function deleteBlock(id_user: string, id_block: string) {
  const stmt = db.prepare(`
    DELETE FROM friends
    WHERE id_user = ? AND id_block = ?
  `);

  return stmt.run(id_user, id_block);
}

export function deleteAllBlock(id_user: string) {
  const stmt = db.prepare(`
    DELETE FROM friends
    WHERE id_user = ?
  `);

  return stmt.run(id_user);
}

// --- MATCH FUNCTIONS ---

export function createMatch(name_player1: string, name_player2: string, score1: string, score2: string) {
  const stmt = db.prepare(`
    INSERT INTO match (name_player1, name_player2, score1, score2)
    VALUES (?, ?, ?, ?)
  `);

  const info = stmt.run(name_player1, name_player2, score1, score2);
  const id = info.lastInsertRowid;

  return id;
}

export function getMatch(name_player: string) {
  const stmt = db.prepare(`
    SELECT * FROM match
    WHERE name_player1 = ? OR name_player2 = ?
    ORDER BY date DESC
  `);

  return stmt.all(name_player, name_player);
}

export function numWinMatch(name_player: string) {
  const stmt = db.prepare(`
    SELECT COUNT(*)
    FROM match
    WHERE (name_player1 = ? AND CAST(score1 AS INTEGER) > CAST(score2 AS INTEGER))
      OR (name_player2 = ? AND CAST(score2 AS INTEGER) > CAST(score1 AS INTEGER))
  `);

  return stmt.get(name_player, name_player);
}

export function numMatch(name_player: string) {
  const stmt = db.prepare(`
    SELECT COUNT(*)
    FROM match
    WHERE name_player1 = ? OR name_player2 = ?
  `);

  return stmt.get(name_player, name_player);
}

export function highScoreMatch(name_player: string) {
  const stmt = db.prepare(`
    SELECT MAX(GREATEST(
      CASE WHEN name_player1 = ? THEN CAST(score1 AS INTEGER) ELSE 0 END,
      CASE WHEN name_player2 = ? THEN CAST(score2 AS INTEGER) ELSE 0 END
    )) AS max_score
    FROM match;
  `);

  return stmt.get(name_player, name_player);
}

export function deleteMatch(name_user: string) {
  const stmt = db.prepare(`
    DELETE FROM match
    WHERE name_player1 = ? OR name_player2 = ?
  `);

  return stmt.run(name_user, name_user);
}
