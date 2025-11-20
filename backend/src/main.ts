import { createServer, IncomingMessage, ServerResponse } from "http";
const Database = require("better-sqlite3");

const port = 4000;

// --- INITIALISATION DE LA BASE ---
const db = new Database("mydb.sqlite");

// Crée la table si elle n'existe pas
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT
  )
`).run();

// --- FONCTION POUR LIRE LE BODY JSON ---
function getRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", err => reject(err));
  });
}

// --- FONCTION POUR DÉTECTER LE PROTOCOLE REEL ---
function getClientProtocol(req: IncomingMessage): "http" | "https" {
  const proto = req.headers["x-forwarded-proto"];
  if (proto === "https") return "https";
  return "http"; // défaut
}

// --- SERVEUR HTTP ---
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  const protocol = getClientProtocol(req);
  const host = req.headers.host || `localhost:${port}`;

  // GET /api/hello → dernier message + URL complète
  if (req.url === "/api/hello" && req.method === "GET") {
    const row = db.prepare("SELECT id, content FROM messages ORDER BY id DESC LIMIT 1").get();
    const message = row?.content || "Hello SQLite!";
    const fullUrl = `${protocol}://${host}/api/hello`;

    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message, url: fullUrl }));
    return;
  }

  // POST /api/hello → ajouter un message
  if (req.url === "/api/hello" && req.method === "POST") {
    try {
      const body = await getRequestBody(req);
      const content = body.content;

      if (!content || typeof content !== "string") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid content" }));
        return;
      }

      const stmt = db.prepare("INSERT INTO messages (content) VALUES (?)");
      const info = stmt.run(content);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ id: info.lastInsertRowid, content }));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
    return;
  }

  // GET /api/messages → liste tous les messages
  if (req.url === "/api/messages" && req.method === "GET") {
    const rows = db.prepare("SELECT id, content FROM messages ORDER BY id ASC").all();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
    return;
  }

  // ROUTE PAR DÉFAUT → 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// --- DÉMARRAGE DU SERVEUR ---
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
