import Fastify from "fastify";
import websocket from "@fastify/websocket";
const app = Fastify({ logger: true });
await app.register(websocket);

const PORT = process.env.PORT || 3000;

app.get("/health", async () => ({ ok: true, svc: "chat" }));

// Route WS : proxifiée par Nginx vers /ws/chat
app.get("/ws/chat", { websocket: true }, (conn/*, req*/) => {
  conn.socket.send("chat: connected");
  conn.socket.on("message", msg => {
    // Echo room simple
    conn.socket.send(`chat: ${msg}`);
  });
});

app.listen({ host: "0.0.0.0", port: PORT }).then(() => {
  app.log.info(`chat up on ${PORT}`);
});
