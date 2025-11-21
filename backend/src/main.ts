import { createServer, IncomingMessage, ServerResponse } from "http";
import * as db from "./db";

const port = 4000;

// --- FONCTION POUR LIRE LE BODY JSON ---
function getRequestBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch (err) { reject(err); }
    });
  });
}

// --- SERVEUR HTTP ---
const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {

  // POST /api/hello -> Ajouter un message
  if (req.url === "/api/hello" && req.method === "POST") {
    try {
      const body = await getRequestBody(req);
      const content = body.content;

      if (!content || typeof content !== "string") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid content" }));
        return;
      }

      const saved = db.addMessage(content);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(saved));
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
    return;
  }

  // GET /api/messages -> Liste tous les messages
  if (req.url === "/api/messages" && req.method === "GET") {
    const rows = db.getAllMessages();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(rows));
    return;
  }

  if (req.url === "/api/users" && req.method === "POST") {
    try {
      const body = await getRequestBody(req);
      const { username, password } = body;

      if (!username || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing username or password" }));
        return;
      }

      // Vérifier si user existe
      if (db.getUserByUsername(username)) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Username already exists" }));
        return;
      }

      const user = db.createUser(username, password);

      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
    return;
  }

  if (req.url === "/api/users" && req.method === "GET") {
  const users = db.getAllUsers();
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(users));
  return;
}

  // ROUTE 404
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

// --- DÉMARRAGE ---
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
