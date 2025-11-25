import { createServer, IncomingMessage, ServerResponse } from "http";
import { findUserByUsername, verifyPassword, generateAccessToken } from "./User/login/login.service";
import { loginRoutes } from "./User/login/login.route"
import Fastify from "fastify";
import * as db from "./Database/db";

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

  //
  // async function bootstrap() {
  // const fastify = Fastify({
  //   logger: true,
  //   });

  //   // On peut préfixer toutes les routes d'auth
  //   fastify.register(loginRoutes, { prefix: "/api/auth" });

  //   try {
  //     await fastify.listen({ port: 3000, host: "0.0.0.0" });
  //     console.log("🚀 Backend started on http://localhost:3000");
  //   } catch (err) {
  //     fastify.log.error(err);
  //     process.exit(1);
  //   }
  // }
  // bootstrap();

  // POST /api/auth -> Ajouter un message
  if (req.url === "/api/auth" && req.method === "POST") {
    try {
      const body = await getRequestBody(req);

      const { username, password } = body;

      if (!username || !password) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Username and password are required" }));
      }

      const user = findUserByUsername(username);
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

      // Pour l’instant on renvoie juste le token en JSON
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ access_token: token }));
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

      if (!username || !password || !mail) {
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

      const user = db.createUser(username, password, mail);

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
