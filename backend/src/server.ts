import { createServer, IncomingMessage, ServerResponse } from "http";
import { verifyPassword, generateAccessToken } from "./User/login/login.service";
import { handleAuthMe } from "./User/auth";
import { handleLogout } from "./User/logout/logout.service";
import * as db from "./Database/db";
import bcrypt from "bcrypt";

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
  const url = req.url || "/";
  const method = req.method || "GET";

  console.log(`${method} ${url}`);
  
  // Route /api/auth/me
  if (req.url === "/api/auth/me") {
    return handleAuthMe(req, res);
  }
  

  // POST /api/auth -> Application d'authentification
  if (req.url === "/api/auth/login" && req.method === "POST") {
    try {
      const body = await getRequestBody(req);

      const { username, password } = body;

      if (!username || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Username and password are required" }));
      }

      const user = db.getUserByUsername(username);
      if (!user) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid credentials" }));
        return;
      }

      const passwordOk = await verifyPassword(password, user.password_hash);
      if (!passwordOk) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid credentials" }));
        return;
      }

      const token = generateAccessToken(user);

      // 🔒 Cookie HttpOnly + Secure + SameSite=Strict
      const cookie = [
        `access_token=${token}`,
        "HttpOnly",
        "Secure",          // OK même si le back est en HTTP derrière Nginx
        "SameSite=Strict", // ou Lax selon ton besoin
        "Path=/",
        `Max-Age=3600`,
      ].join("; ");

      // Pour l’instant on renvoie juste le token en JSON
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Set-Cookie", cookie);
      res.end(JSON.stringify({ ok: true }));
      return;
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
    }
  }

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
      const { username, password, mail } = body;
      const password_hash = await bcrypt.hash(password, 10);

      if (!username || !password_hash || !mail) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Missing username, password or mail" }));
        return;
      }

      // Vérifier si user existe
      if (db.getUserByUsername(username)) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Username already exists" }));
        return;
      }

      // Vérifier si le mail existe
      if (db.getUserByMail(mail)) {
        res.writeHead(409, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Mail already exists" }));
        return;
      }

      const user = db.createUser(username, password_hash, mail);

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
