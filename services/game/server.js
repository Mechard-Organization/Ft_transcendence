import Fastify from "fastify";
import websocket from "@fastify/websocket";
const app = Fastify({ logger: true });
await app.register(websocket);

const PORT = process.env.PORT || 3000;

app.get("/health", async () => ({ ok: true, svc: "game" }));

// WS jeu : proxifié par Nginx vers /ws/game
app.get("/ws/game", { websocket: true }, (conn/*, req*/) => {
  conn.socket.send(JSON.stringify({ t: "welcome", tick: 0 }));
  let tick = 0;
  const id = setInterval(() => {
    // broadcast d’un état bidon pour tester l’upgrade WSS
    conn.socket.send(JSON.stringify({ t: "state", tick: ++tick }));
  }, 1000);
  conn.socket.on("close", () => clearInterval(id));
});

app.listen({ host: "0.0.0.0", port: PORT }).then(() => {
  app.log.info(`game up on ${PORT}`);
});

