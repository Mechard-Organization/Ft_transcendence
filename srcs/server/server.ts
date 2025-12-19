// Bibliothéque extérieure
import { createServer, IncomingMessage, ServerResponse } from "http";
import { WebSocketServer } from "ws";
import bcrypt from "bcrypt";

// Bibliothéque intérieure
import { register, httpRequestCounter, httpRequestDuration, httpErrorCounter } from "./metrics";
import { verifyPassword, generateAccessToken } from "@services/login.service";
import { handleLogout } from "@services/logout.service";
import * as db from "@config/database/db";
import { handleAuthMe } from "./auth";

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

    const route = url.split("?")[0];

  // --- Instrumentation Prometheus ---
  if (route !== "/metrics") {
    const baseLabels = { method, route };

    // Timer d'Histogram (latence)
    const endTimer = httpRequestDuration.startTimer({
      ...baseLabels,
      status: "pending",
    });

    res.on("finish", () => {
      const status = String(res.statusCode);

      // Compteur de requêtes avec status final
      httpRequestCounter.inc({
        ...baseLabels,
        status,
      });

      // Fin du timer avec status final
      endTimer({
        ...baseLabels,
        status,
      });

      // Compteur d'erreurs HTTP
      if (res.statusCode >= 400) {
        httpErrorCounter.inc({
          method,
          route,
          type: status.startsWith("5") ? "5xx" : "4xx",
        });
      }
    });
  }

  try {
    // Route /api/auth/logout
    if (req.url === "/api/auth/logout") {
      return handleLogout(req, res);
    }

    // Route /api/auth/me
    if (req.url === "/api/auth/me" && req.method === "GET") {
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
        const id = body.id;

        if (!content || typeof content !== "string") {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid content" }));
          return;
        }

        const saved = db.addMessage(content, id);

        // 🔥 Broadcast WebSocket
        wss.clients.forEach(client => {
          if (client.readyState === 1) {
            client.send(JSON.stringify({ type: "new_message", data: saved }));
          }
        });

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(saved));
      } catch (err) {
        res.writeHead(403, { "Content-Type": "application/json" });
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

    // POST /api/users -> creer un user
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


    // GET /api/users -> récupère les user
    if (req.url === "/api/users" && req.method === "GET") {
      const users = db.getAllUsers();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(users));
      return;
    }


    // POST /api/getuser -> récupère un user
    if (req.url === "/api/getuser" && req.method === "POST") {
      const body = await getRequestBody(req);
      console.log("body: ", body);
      const id  = body.id;
      console.log("id: ", id);
      const user = id > 0 ? db.getUserById(id) : "Invité.e";
      console.log("user: ", user);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(user));
      return;
    }

    // POST /api/friend -> creer un friend
    if (req.url === "/api/friend" && req.method === "POST") {
      try {
        const body = await getRequestBody(req);
        const { id_user, id_friend } = body;

        if (!id_user || !id_friend) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "not log" }));
          return;
        }

        // Vérifier si user existe
        if (!db.getUserById(id_user)) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User doesn't exist" }));
          return;
        }

        // Vérifier si friend existe
        if (!db.getUserById(id_friend)) {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "User doesn't exist" }));
          return;
        }

        if (db.alreadyFriend(id_user, id_friend).length != 0)
        {
          res.writeHead(409, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Already your friend" }));
          return;
        }
        const user = db.createFriend(id_user, id_friend);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify(user));
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
      return;
    }

    // POST /api/getFriendV -> récupère la liste friend validé
    if (req.url === "/api/getFriendV" && req.method === "POST") {
      const body = await getRequestBody(req);
      const id  = body.id;
      if (!id) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "not log" }));
        return;
      }
      const friends = db.getFriendValidate(id)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(friends));
      return;
    }

    // POST /api/getFriendNV -> récupère la liste friend non validé
    if (req.url === "/api/getFriendNV" && req.method === "POST") {
      const body = await getRequestBody(req);
      const id  = body.id;
      if (!id) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "not log" }));
        return;
      }
      const friends = db.getFriendNValidate(id)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(friends));
      return;
    }

    // POST /api/acceptFriend -> récupère la liste friend non validé
    if (req.url === "/api/acceptFriend" && req.method === "POST") {
      const body = await getRequestBody(req);
      const { id_user, id_friend } = body;
      if (!id_user || !id_friend) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "not log" }));
          return;
        }
      const friends = db.valideFriend(id_user, id_friend)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(friends));
      return;
    }

    // POST /api/updateUserUsername -> Modifie un username
    if (req.url === "/api/updateUserUsername" && req.method === "POST") {
      const body = await getRequestBody(req);
      const id  = body.id;
      const username = body.username;

      if (!id || !username)
      {
        res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not log or missing username" }));
          return;
      }

      if (username == db.getUserById(id).username)
      {
        res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "already yours username" }));
          return;
      }
      db.updateUserUsername(username, id)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(username));
      return;
    }

    // POST /api/updateUserPassword -> Modifie un password_hash
    if (req.url === "/api/updateUserPassword" && req.method === "POST") {
      const body = await getRequestBody(req);
      const password = body.password;
      const id  = body.id;

      if (!id || !password)
      {
        res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not log or missing password" }));
          return;
      }

      const passwordOk = await verifyPassword(password, db.getUserById(id).password_hash);

      if (passwordOk) {
        res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "already yours password" }));
        return;
      }

      const password_hash = await bcrypt.hash(body.password, 10);

      db.updateUserPassword(password_hash, id)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(password_hash));
      return;
    }

    // POST /api/updateUserMail -> Modifie un mail
    if (req.url === "/api/updateUserMail" && req.method === "POST") {
      const body = await getRequestBody(req);
      const id  = body.id;
      const mail = body.mail;

      if (!id || !mail)
      {
        res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Not log or missing mail" }));
          return;
      }

      if (mail == db.getUserById(id).mail)
      {
        res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "already yours mail" }));
          return;
      }

      if (mail == db.getUserById(id).mail)
      {
        res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "already yours mail" }));
          return;
      }
      db.updateUserMail(mail, id)
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(mail));
      return;
    }

    // Route Prometheus /metrics
    if (url === "/metrics") {
      // Pas de compteur ici, pour éviter de compter les scrapes Prometheus
      register.metrics()
        .then((metrics) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", register.contentType);
          res.end(metrics);
        })
        .catch((err) => {
          console.error("Error generating metrics:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end("Error generating metrics");
        });
      return;
    }

    // ROUTE 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not Found" }));
  } catch (err) {
    console.error("Unhandled error:", err);
    httpErrorCounter.inc({ method, route: url.split("?")[0], type: "exception" });

    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Internal server error" }));
  }

});

// --- SERVEUR WEBSOCKET ---
const wss = new WebSocketServer({ server });

// Quand un client se connecte
wss.on("connection", ws => {
  console.log("Client connecté en WebSocket");

  ws.send(JSON.stringify({ type: "welcome", message: "Bienvenue en WebSocket !" }));

  ws.on("message", msg => {
    console.log("Message reçu :", msg.toString());

    // Exemple : broadcast à tous les autres clients
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "msg", payload: msg.toString() }));
      }
    });
  });

  ws.on("close", () => {
    console.log("Client déconnecté");
  });
});


// --- DÉMARRAGE ---
server.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
