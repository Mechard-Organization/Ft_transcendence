import Fastify from "fastify";
const app = Fastify({ logger: true });

const PORT = process.env.PORT || 3000;

app.get("/matchmaking/health", async () => ({ ok: true, svc: "matchmaking" }));

// Endpoints placeholder
app.post("/matchmaking/tournament", async (req) => {
  return { created: true, id: "tourn_123", aliasRequired: true };
});
app.get("/matchmaking/next", async () => ({ matchId: "m1", players: ["A","B"] }));

app.listen({ host: "0.0.0.0", port: PORT }).then(() => {
  app.log.info(`matchmaking up on ${PORT}`);
});
